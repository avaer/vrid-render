#!/bin/bash

docker run -d \
  -p 80:80 \
  -p 443:443 \
  -e PORT=80 \
  -v ~/dotfiles/keys/servers/zeo:/certs:ro \
  -v /var/run/docker.sock:/var/run/docker.sock \
  modulesio/vrid-render
