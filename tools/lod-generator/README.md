# LOD Generator Tool

A standalone Level of Detail (LOD) generator for Three.js meshes using Quadric Error Metric (QEM) simplification.

## Features

- **QEM Mesh Simplification** - High-quality mesh reduction algorithm
- **Multiple LOD Levels** - Configurable reduction ratios and distances
- **Live Preview** - Auto mode switches LODs based on camera distance
- **Drag & Drop** - Load models by dropping files
- **ZIP Export** - Export all LOD levels as separate GLB files
- **No Three.js Modifications** - Completely standalone tool

## Files

```
tools/lod-generator/
├── index.html          # Main tool interface
├── LODGenerator.js     # LOD generation API
├── QEMSimplifier.js    # QEM simplification algorithm
└── README.md           # This file
```

## Usage

### Running the Tool

Start a local web server from the Three.js root:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

Open: `http://localhost:8000/tools/lod-generator/`

### Using the Tool

1. **Load a Model** - Click "Load File" or drag-and-drop a GLB/GLTF/OBJ/FBX file
2. **Configure LODs** - Adjust reduction % and distance for each level
3. **Generate** - Click "Generate" to create simplified meshes
4. **Preview** - Use "Auto" mode or click individual LOD buttons
5. **Export** - Click "Export ZIP" to download all LOD levels

### Programmatic API

```javascript
import { LODGenerator } from './LODGenerator.js';

const generator = new LODGenerator();

const lod = generator.generate(mesh, {
    levels: [
        { ratio: 1.0, distance: 0 },
        { ratio: 0.5, distance: 50 },
        { ratio: 0.25, distance: 100 }
    ],
    preserveBoundary: true,
    preserveUVSeams: true
});

scene.add(lod);

// In render loop
lod.update(camera);
```

### QEM Simplifier API

```javascript
import { QEMSimplifier } from './QEMSimplifier.js';

const simplifier = new QEMSimplifier();
const simplified = simplifier.simplify(geometry, { ratio: 0.5 });
```

## Algorithm

Uses the **Quadric Error Metric** algorithm from:

> "Surface Simplification Using Quadric Error Metrics"  
> Michael Garland & Paul S. Heckbert, SIGGRAPH 1997

## Supported Formats

- GLB/GLTF
- OBJ
- FBX

## License

MIT (same as Three.js)

