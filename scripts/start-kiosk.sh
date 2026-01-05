#!/usr/bin/env bash

# Launch Chromium in kiosk mode pointed at local app
export DISPLAY=:0

# Function to clean up on exit
cleanup() {
    echo "Cleaning up..."
    # Kill chromium if it's still running
    if [ -n "$CHROMIUM_PID" ]; then
        kill "$CHROMIUM_PID" 2>/dev/null
    fi
}
trap cleanup EXIT

# Start chromium in background
chromium --noerrdialogs --disable-infobars --kiosk --app=http://localhost --touch-events --enable-pinch --enable-viewport --enable-threaded-scrolling --enable-smooth-scrolling --overscroll-history-navigation=0 --check-for-update-interval=31536000 --autoplay-policy=no-user-gesture-required --user-agent="Mozilla/5.0 (Linux; Android 13; Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" >/tmp/kiosk.log 2>&1 &
CHROMIUM_PID=$!

echo "Chromium started with PID $CHROMIUM_PID"

# Watch for commands from the app via the shared data volume
COMMAND_FILE="data/system_command"

# Ensure data directory exists so we don't fail the loop
mkdir -p data

while true; do
    if [ -f "$COMMAND_FILE" ]; then
        COMMAND=$(cat "$COMMAND_FILE")
        rm "$COMMAND_FILE"
        
        echo "Received system command: $COMMAND"
        
        case "$COMMAND" in
            "quit")
                echo "Quitting chromium..."
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
    
    # Check if chromium died unexpectedly
    if ! kill -0 "$CHROMIUM_PID" 2>/dev/null; then
        echo "Chromium exited unexpectedly. Restarting in 5 seconds..."
        sleep 5
        chromium --noerrdialogs --disable-infobars --kiosk --app=http://localhost --touch-events --enable-pinch --enable-viewport --enable-threaded-scrolling --enable-smooth-scrolling --overscroll-history-navigation=0 --check-for-update-interval=31536000 --autoplay-policy=no-user-gesture-required --user-agent="Mozilla/5.0 (Linux; Android 13; Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" >/tmp/kiosk.log 2>&1 &
        CHROMIUM_PID=$!
    fi
    
    sleep 2
done
