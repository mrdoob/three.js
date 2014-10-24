#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

source setup_test_env.bash
blender --background $BLEND/planeA.blend --python $PYSCRIPT -- \
    $TMP_JSON --vertices --faces --faceMaterials --uvs --maps
testjson $@ --tag $(tagname)
