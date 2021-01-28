#!/bin/sh

docker build -t excessive-punching-loophole .
docker run -p 80:3000 -d --restart always excessive-punching-loophole:latest
