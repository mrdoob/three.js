#!/bin/sh

python build.py --include common2 --include extras2 --output ../../build/three2.js
python build.py --include common2 --include extras2 --minify --output ../../build/three2.min.js
