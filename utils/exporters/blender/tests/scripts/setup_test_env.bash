#!/bin/bash

# you must have blender setup to run from the command line
command -v blender >/dev/null 2>&1 || { echo >&2 "Blender is not accessible from the command line. Aborting."; exit 1; }

export JSON=`python -c "import tempfile;print(tempfile.mktemp(prefix='$TAG.', suffix='.json'))"`

export BLENDER_USER_SCRIPTS=$(cd "$DIR/../../"; pwd)

# set the root for blend files
export BLEND=$(cd "$DIR/../blend"; pwd)

# set the python script to exec in batch
export PYSCRIPT="$DIR/exporter.py"

function makereview() {
    if [ ! -f "$JSON" ]; then
        echo "no json, export error suspected"
        exit 1
    fi
    python3 "$DIR/review.py" $JSON $@
}

function tagname() {
    tag=`basename $0`
    tag=${tag#test_}
    tag=${tag%%.*}
    echo $tag
}
