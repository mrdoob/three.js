#!/bin/sh

cd "$(dirname "$0")"
node build.js --include common --include extras --output ../../build/three.js
node build.js --include common --include extras --minify --output ../../build/three.min.js
