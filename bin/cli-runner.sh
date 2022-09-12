#!/bin/sh
# cli-runner will exit every hour to prevent out of memory issues
# this script will automatically restart the runnen when exited after 1 minute

while true
do
	node bin/cli-runner.js
	sleep 60
	echo "Automatically restarting cli-runner"
done

