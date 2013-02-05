#!/bin/sh

cd `dirname $0`/../../

ret=`python -c 'import sys; print("%i" % (sys.version_info[0]))'`
if [ $ret -eq 2 ]; then 
	# Python 2
    python -m SimpleHTTPServer
else 
	# Python 3
    python -m http.server
fi

