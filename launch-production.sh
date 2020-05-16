#!/usr/bin/env bash

# Kill launched jobs on exit: https://spin.atomicobject.com/2017/08/24/start-stop-bash-background-process/
trap "exit" INT TERM ERR
trap "kill 0" EXIT

PIDS=()

# Launch services
docker-compose up &
PIDS+=($!)

# Run ngrok, determine external URL for backend, and store on backend
ngrok start -log=stdout -config="$PWD/ngrok.conf" nginx > /tmp/ngrok.log &
PIDS+=($!)

copy_server_info() {
	# Search for server address
	while true; do
	  SERVER_ADDR=$(cat /tmp/ngrok.log | sed -nE 's/.*addr=[^ ]+8080 url=([^ ]+).*/\1/p')
	  if [[ -n "$SERVER_ADDR" ]]; then
	    break
	  fi
	  sleep 0.1
	done

	# Output server info and copy to clip
	copy_result="didn't copy"
	if command -v xclip > /dev/null; then
	  echo $SERVER_ADDR | xclip -sel clip
	  copy_result="copied"
	fi
	echo "Access server on $SERVER_ADDR, $copy_result to clipboard"
}

copy_server_info&
PIDS+=($!)

# Exit if any commands failed
for pid in "${PIDS[@]}"; do
  wait -n "${PIDS[@]}" || { RETCODE=$?; echo "Program failed: $RETCODE, exiting..."; exit $? ;}
done
