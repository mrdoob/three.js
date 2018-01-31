#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/setup_test_env.bash"

blender --background $BLEND/scene_instancing.blend --python $PYSCRIPT -- \
    $JSON --vertices --faces --scene --materials --enablePrecision \
    --precision 4 --geometryType Geometry
makereview $@ --tag $(tagname)
