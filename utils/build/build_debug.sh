#!/bin/sh

cd "$(dirname "$0")"
python build.py --include common --include extras --output ../../build/three.min.js
