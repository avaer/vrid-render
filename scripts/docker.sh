#!/bin/bash

docker run -ti \
  -p 80:80 \
  -e PORT=80 \
  -v ~/dotfiles/keys/servers/zeo:/certs:ro \
  modulesio/vrid-render
