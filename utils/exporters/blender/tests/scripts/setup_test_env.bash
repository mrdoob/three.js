#!/bin/bash

# you must have blender setup to run from the command line
if [[ `which blender` == "" ]]; then
    echo "No 'blender' executable found on the command line"
fi

export JSON=`python -c "import tempfile;print(tempfile.mktemp(prefix='$TAG.', suffix='.json'))"`

export BLENDER_USER_SCRIPTS=$(cd "$DIR/../../"; pwd)

# set the root for blend files
export BLEND=$(cd "$DIR/../blend"; pwd)

# set the python script to exec in batch
export PYSCRIPT="$DIR/exporter.py"

function makereview() {
    python3 "$DIR/review.py" $JSON $@
}

function tagname() {
    tag=`basename $0`
    tag=${tag#test_}
    tag=${tag%%.*}
    echo $tag
}
