#!/bin/bash
source /etc/environment
export NODE_ENV=production
BASEDIR=/opt/testing3
LOGS="${BASEDIR}/logs";
mkdir -p $LOGS
cd $BASEDIR
#node _scripts/vanguard.js
sudo forever start -e "${LOGS}/error.log" -o "${LOGS}/out.log" -a "bin/www"
