#!/usr/bin/env bash

# Run ngrok, determine external URL for backend, and store on backend
ngrok start -log=stdout -config=./ngrok.conf frontend backend > ngrok.log &

until grep "5000" ngrok.log
do
  sleep 0.2
done

curl --data "url=$(cat ngrok.log | sed -nE 's/.*addr=[^ ]+5000 url=http:\/\/([^ ]+).*/\1/p')" http://localhost:5000/external_url
SERVER_ADDR=$(cat ngrok.log | sed -nE 's/.*addr=[^ ]+3000 url=([^ ]+).*/\1/p')
echo $SERVER_ADDR | xclip -sel clip
echo $"\nServer on $SERVER_ADDR, copied to clipboard"
