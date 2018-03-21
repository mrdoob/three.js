#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/setup_test_env.bash"

blender --background $BLEND/scene_children.blend \
    --python $PYSCRIPT -- $JSON --vertices --faces --scene \
    --cameras --materials --embedGeometry --lights --cameras --geometryType Geometry
makereview $@ --tag $(tagname)
