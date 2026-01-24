#!/bin/bash
# Path: stop.sh

APPNAME="web-push"

echo "🛑 Stopping web-push..."

pm2 delete $APPNAME 2>/dev/null

echo "✅ PM2 processes stopped."
