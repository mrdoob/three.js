#!/bin/sh

cd "$(dirname "$0")"
node build.js --include common --include extras --output ../../build/three.min.js
