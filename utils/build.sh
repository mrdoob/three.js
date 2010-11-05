#!/bin/sh

echo Compiling Three.js
python Builder.py

echo Compiling ThreeDebug.js
python BuilderDebug.py

# echo Compiling ThreeDOM.js
# python BuilderDOM.py

# echo Compiling ThreeCanvas.js
# python BuilderCanvas.py

# echo Compiling ThreeSVG.js
# python BuilderSVG.py

# echo Compiling ThreeWebGL.js
# python BuilderWebGL.py
