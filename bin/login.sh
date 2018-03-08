#!/bin/bash -e

curl -v -X PUT http://0.0.0.0:8000/token -H 'cache-control: no-cache' -H 'content-type: application/json' \
	--data-raw '{"username":"00000000-0000-0000-0000-000000000000","password":"012ABC"}'
