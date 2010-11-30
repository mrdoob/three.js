#!/bin/sh

python build.py --full 
python build.py --extras
python build.py --full --debug

# python build.py --help
