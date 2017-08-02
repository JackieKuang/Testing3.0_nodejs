#!/bin/bash

forever stop platformAPI > /dev/null 2>&1

npm install
export NODE_ENV=develop
cp /home/gitlab-runner/.api.env .env
LOGS="/home/gitlab-runner/logs";
forever start --spinSleepTime 5000 -e "${LOGS}/error.log" -o "${LOGS}/out.log" -a --uid "platformAPI" "server/server.js"
