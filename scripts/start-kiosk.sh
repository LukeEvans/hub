#!/usr/bin/env bash

# Launch Chromium in kiosk mode pointed at local app
export DISPLAY=:0
chromium --noerrdialogs --disable-infobars --kiosk --app=http://localhost --touch-events --enable-pinch --enable-viewport --enable-threaded-scrolling --enable-smooth-scrolling --overscroll-history-navigation=0 --check-for-update-interval=31536000 --user-agent="Mozilla/5.0 (Linux; Android 13; Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" >/tmp/kiosk.log 2>&1

