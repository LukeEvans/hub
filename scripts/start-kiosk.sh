#!/usr/bin/env bash

# Launch Chromium in kiosk mode pointed at local app
export DISPLAY=:0
chromium --noerrdialogs --disable-infobars --kiosk --app=http://localhost --touch-events=enabled --enable-pinch --enable-viewport --enable-threaded-scrolling --overscroll-history-navigation=0 --check-for-update-interval=31536000 >/tmp/kiosk.log 2>&1

