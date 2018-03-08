#!/bin/bash -e
# Apache Benchmark helper script
########################################################################
REQUEST=$1

[ -z "$REQUEST" ] && REQUEST=/status

# 200 concurrent over 10 seconds #
ab -c200 -t10 "http://0.0.0.0:8000$REQUEST"
