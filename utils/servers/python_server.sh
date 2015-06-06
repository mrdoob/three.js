#!/bin/sh

cd `dirname $0`/../../

ret=`python -c 'import sys; print("%i" % (sys.version_info[0]))'`

if [ $ret -eq 2 ]; then
	python -m SimpleHTTPServer # Python 2
else
	python -m http.server # Python 3
fi
