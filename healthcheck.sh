#!/bin/bash -e

[[ -n "$EXPRESS_HOST" ]] || EXPRESS_HOST=0.0.0.0
[[ -n "$EXPRESS_PORT" ]] || EXPRESS_PORT=8000

status=$(curl "http://${EXPRESS_HOST}:${EXPRESS_PORT}/status")

if [ "$status" = '{"status":"OK"}' ]; then
	exit 0
fi

exit 1
