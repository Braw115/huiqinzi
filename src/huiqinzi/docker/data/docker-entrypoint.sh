#!/bin/sh
set -e

pm2 start ecosystem.config.js

while :; do
    sleep 60
done