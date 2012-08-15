#!/bin/sh

python build.py --include common --include extras --output ../build/three.js
python build.py --include common --include extras --minify --output ../build/three.min.js
