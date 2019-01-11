Utilities for converting model files to the Three.js JSON format.

## obj2three.js

Usage:

```
./obj2three.js model.obj
```

## fbx2three.js

Usage:

```
./fbx2three.js model.fbx
```

## legacythree2gltf.js

Converts legacy JSON models (created by three.js Blender exporter, for THREE.JSONLoader) to glTF 2.0. When original `.blend` files are available, prefer direct export from Blender 2.8+.

Installation:

```
npm install canvas vblob
```

Usage:

```
./legacythree2gltf.js model.json --optimize
```

Known issues:
- [ ] Creates `.gltf` files with embedded Data URIs. Optimize to `.glb` using glTF-Pipeline to reduce file size.
- [ ] Limited support for morph targets (https://github.com/mrdoob/three.js/pull/15011)
