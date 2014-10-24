#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

source setup_test_env.bash
blender --background $BLEND/cubeB.blend --python $PYSCRIPT -- \
    $TMP_JSON --vertices --faces --colors --faceMaterials
testjson $@ --tag $(tagname)
