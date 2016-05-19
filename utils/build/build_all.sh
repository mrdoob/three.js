#!/bin/sh

cd "$(dirname "$0")"
node build.js --include common --include extras --output ../../build/three.js
node build.js --include common --include extras --minify --output ../../build/three.min.js
node build.js --include canvas --minify --output ../../build/three-canvas.min.js
node build.js --include css3d --minify --output ../../build/three-css3d.min.js
node build.js --include extras --externs externs/extras.js --minify --output ../../build/three-extras.min.js
node build.js --include math --output ../../build/three-math.js
node build.js --include math --minify --output ../../build/three-math.min.js
