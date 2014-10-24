#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/setup_test_env.bash"

blender --background $BLEND/scene_point_light.blend \
    --python $PYSCRIPT -- $JSON --vertices --faces --scene \
    --lights --materials --embedGeometry
makereview $@ --tag $(tagname)
