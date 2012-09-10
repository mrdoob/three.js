python build.py --include common --include extras --output ../build/three.js
python build.py --include canvas --output ../build/three-canvas.js
python build.py --include webgl --output ../build/three-webgl.js
python build.py --include extras --externs externs_extras.js --output ../build/three-extras.js
