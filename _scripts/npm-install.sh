#!/bin/bash
source /etc/environment
cd /opt/testing3

sudo service mysqld stop

#npm install
npm run build

sudo service mysqld start

#npm uninstall gulp --save-dev
#npm install gulp --save-dev
#npm run gulp

cp /home/ec2-user/.env /opt/testing3/

