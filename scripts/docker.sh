#!/bin/bash

docker run -ti \
  -p 80:80 \
  -e PORT=80 \
  modulesio/vrid-render
