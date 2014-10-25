#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/setup_test_env.bash"

blender --background $BLEND/anim.blend --python $PYSCRIPT -- \
    $JSON --vertices --faces --morphTargets --embedAnimation
makereview $@ --tag $(tagname)
