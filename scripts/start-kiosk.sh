#!/usr/bin/env bash

# Launch Chromium in kiosk mode pointed at local app
export DISPLAY=:0
chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost >/tmp/kiosk.log 2>&1

