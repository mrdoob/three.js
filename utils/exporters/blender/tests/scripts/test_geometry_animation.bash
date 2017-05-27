#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/setup_test_env.bash"

blender --background $BLEND/anim.blend --python $PYSCRIPT -- \
    $JSON --vertices --faces --animation rest --bones --skinning \
    --embedAnimation --geometryType Geometry
makereview $@ --tag $(tagname)
