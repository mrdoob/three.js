#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

source setup_test_env.bash
blender --background $BLEND/scene_maps.blend --python $PYSCRIPT -- \
    $TMP_JSON --vertices --faces --scene --materials --maps \
    --uvs --embedGeometry --copyTextures
testjson $@ --tag $(tagname)
