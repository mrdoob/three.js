#!/bin/sh

cd utils
./build_all.sh
node ../test/unit/runner.js
