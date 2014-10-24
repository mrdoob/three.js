#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/setup_test_env.bash"

blender --background $BLEND/scene_maps.blend --python $PYSCRIPT -- \
    $JSON --vertices --faces --scene --materials --maps \
    --uvs --embedGeometry --copyTextures
makereview $@ --tag $(tagname)
