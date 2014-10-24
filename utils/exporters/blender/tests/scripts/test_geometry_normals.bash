#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

source setup_test_env.bash
blender --background $BLEND/torusA.blend --python $PYSCRIPT -- \
    $TMP_JSON --vertices --faces --normals
testjson $@ --tag $(tagname)
