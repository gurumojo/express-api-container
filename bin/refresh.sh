#!/bin/bash -e

curl -v -X GET http://0.0.0.0:8000/token -H 'cache-control: no-cache' -H 'content-type: application/json' \
	-H "authorization: JWT $1"
