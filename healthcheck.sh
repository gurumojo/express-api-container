#!/bin/bash -e

status=$(curl "http://0.0.0.0:8000/status")

if [ "$status" = '{"status":"OK"}' ]; then
	exit 0
fi

exit 1
