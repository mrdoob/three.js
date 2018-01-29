#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/setup_test_env.bash"

blender --background $BLEND/cubeC.blend --python $PYSCRIPT -- \
    $JSON --vertices --faces --faceMaterials --geometryType Geometry
makereview $@ --tag $(tagname)
