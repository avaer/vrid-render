#!/bin/bash

docker run -ti \
  --rm \
  -p 80:80 \
  -e PORT=80 \
  modulesio/vrid-render
