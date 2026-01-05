#!/usr/bin/env bash

# Launch Chromium in kiosk mode pointed at local app
export DISPLAY=:0

# Path to maintenance file - if this exists, we don't start chromium
MAINTENANCE_FILE="data/maintenance_mode"
COMMAND_FILE="data/system_command"

# Ensure data directory exists
mkdir -p data

# If we are in maintenance mode, wait until the file is removed
if [ -f "$MAINTENANCE_FILE" ]; then
    echo "Maintenance mode active (delete $MAINTENANCE_FILE to resume kiosk). Sleeping..."
    while [ -f "$MAINTENANCE_FILE" ]; do
        sleep 5
    done
    echo "Maintenance mode cleared. Starting kiosk..."
fi

# Function to clean up on exit
cleanup() {
    echo "Cleaning up..."
    if [ -n "$CHROMIUM_PID" ]; then
        kill "$CHROMIUM_PID" 2>/dev/null
    fi
}
trap cleanup EXIT

# Start chromium in background
chromium --noerrdialogs --disable-infobars --kiosk --app=http://localhost --touch-events --enable-pinch --enable-viewport --enable-threaded-scrolling --enable-smooth-scrolling --overscroll-history-navigation=0 --check-for-update-interval=31536000 --autoplay-policy=no-user-gesture-required --user-agent="Mozilla/5.0 (Linux; Android 13; Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" >/tmp/kiosk.log 2>&1 &
CHROMIUM_PID=$!

echo "Chromium started with PID $CHROMIUM_PID"

while true; do
    if [ -f "$COMMAND_FILE" ]; then
        COMMAND=$(cat "$COMMAND_FILE")
        # Use sudo rm to ensure we can delete it regardless of container permissions
        sudo rm -f "$COMMAND_FILE"
        
        echo "Received system command: $COMMAND"
        
        case "$COMMAND" in
            "quit")
                echo "Quitting chromium and entering maintenance mode..."
                touch "$MAINTENANCE_FILE"
                kill "$CHROMIUM_PID" 2>/dev/null
                exit 0
                ;;
            "reboot")
                echo "Rebooting system..."
                sudo reboot
                ;;
            "shutdown")
                echo "Shutting down system..."
                sudo poweroff
                ;;
            *)
                echo "Unknown command: $COMMAND"
                ;;
        esac
    fi
    
    # Check if chromium died unexpectedly (and we aren't trying to quit)
    if ! kill -0 "$CHROMIUM_PID" 2>/dev/null; then
        echo "Chromium exited unexpectedly. Restarting in 5 seconds..."
        sleep 5
        chromium --noerrdialogs --disable-infobars --kiosk --app=http://localhost --touch-events --enable-pinch --enable-viewport --enable-threaded-scrolling --enable-smooth-scrolling --overscroll-history-navigation=0 --check-for-update-interval=31536000 --autoplay-policy=no-user-gesture-required --user-agent="Mozilla/5.0 (Linux; Android 13; Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" >/tmp/kiosk.log 2>&1 &
        CHROMIUM_PID=$!
    fi
    
    sleep 2
done
