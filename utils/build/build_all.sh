#!/bin/sh

python build.py --include common --include extras --output ../../build/three.js
python build.py --include common --include extras --minify --output ../../build/three.min.js
python build.py --include canvas --minify --output ../../build/three-canvas.min.js
python build.py --include css3d --minify --output ../../build/three-css3d.min.js
python build.py --include webgl --minify --output ../../build/three-webgl.min.js
python build.py --include extras --externs externs/extras.js --minify --output ../../build/three-extras.min.js
python build.py --include math --output ../../build/three-math.js
python build.py --include math --minify --output ../../build/three-math.min.js
