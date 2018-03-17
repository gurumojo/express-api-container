#!/bin/bash -e

REQUEST=$1

[ -z "$REQUEST" ] && REQUEST=/status

echo 200 concurrent over 10 seconds

ab -c 200 -t 10 "http://0.0.0.0:8000$REQUEST"
