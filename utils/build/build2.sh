#!/bin/sh

python build.py --include common2 --include extras --output ../../build/three.js
python build.py --include common2 --include extras --minify --output ../../build/three.min.js
