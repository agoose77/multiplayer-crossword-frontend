#!/usr/bin/env bash

# Kill launched jobs on exit: https://spin.atomicobject.com/2017/08/24/start-stop-bash-background-process/
trap "exit" INT TERM ERR
trap "kill 0" EXIT

# Check NPM is running this script
if [[ -z "$INIT_CWD" ]]; then
  echo "This script should be run by npm"
  exit 1
fi

# Run NGINX to expose backend under /api/ route and serve frontend content from build/
python3 "$PWD/backend/crossword.py" &
docker run --rm --name crossword -v "$PWD/production/nginx/:/etc/nginx:ro" -v "$PWD/build:/usr/share/nginx/html" --network=host nginx &

# Run ngrok, determine external URL for backend, and store on backend
ngrok start -log=stdout -config="$PWD/production/ngrok.conf" nginx > /tmp/ngrok.log &

# Search for server address
while true; do
  SERVER_ADDR=$(cat /tmp/ngrok.log | sed -nE 's/.*addr=[^ ]+8000 url=([^ ]+).*/\1/p')
  if [[ -n "$SERVER_ADDR" ]]; then
    break
  fi
  sleep 0.1
done

# Output server info and copy to clip
copy_result="didn't copy"
if command -v xclip; then
  echo $SERVER_ADDR | xclip -sel clip
  copy_result="copied"
fi
echo "Access server on $SERVER_ADDR, $copy_result to clipboard"

wait
