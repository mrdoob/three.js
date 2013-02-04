#!/bin/sh

node build.js --include common2 --include extras --output ../../build/three.js
node build.js --include common2 --include extras --minify --output ../../build/three.min.js
