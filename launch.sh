#!/usr/bin/env bash

# Run NGINX
python backend/crossword.py &
sudo docker run --rm --name crossword -v $PWD/nginx-conf/:/etc/nginx:ro -v $PWD/build:/usr/share/nginx/html --network=host -d nginx

# Run ngrok, determine external URL for backend, and store on backend
ngrok start -log=stdout -config=./ngrok.conf nginx > ngrok.log &

until grep "8000" ngrok.log
do
  sleep 0.2
done

SERVER_ADDR=$(cat ngrok.log | sed -nE 's/.*addr=[^ ]+8000 url=([^ ]+).*/\1/p')
echo $SERVER_ADDR | xclip -sel clip
echo $"\nServer on $SERVER_ADDR, copied to clipboard"
