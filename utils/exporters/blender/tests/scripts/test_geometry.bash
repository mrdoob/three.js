#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/setup_test_env.bash"

blender --background $BLEND/cubeA.blend --python $PYSCRIPT -- \
    $JSON --vertices --faces
makereview $@ --tag $(tagname)
