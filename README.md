# Rob's Enhanced Three.js Fork

[![NPM Package][npm]][npm-url]
[![Build Size][build-size]][build-size-url]
[![NPM Downloads][npm-downloads]][npmtrends-url]
[![Discord][discord]][discord-url]
[![DeepWiki][deepwiki]][deepwiki-url]

#### JavaScript 3D library with Enhanced Scene Editor

This is **Rob Higgins' fork** of the open-source [three.js](https://github.com/mrdoob/three.js) project, featuring significant enhancements to the built-in scene editor and new functionality for interactive 3D scene development.

**Original three.js project:** The aim of the original project is to create an easy-to-use, lightweight, cross-browser, general-purpose 3D library. The current builds only include WebGL and WebGPU renderers but SVG and CSS3D renderers are also available as addons.

## 🎯 Key Enhancements in This Fork

### Enhanced Scene Editor (`/editor/`)
- **Enhanced Scene Runtime Environment**: Configure and populate any scene you create in the three.js editor through URL parameters durning scene load (after pressing play button in editor). Published scenes are self contained web apps that can also be configured from query string. This allows you to build, experiement, share and link to scenes with a simple URL, and in advanced use cases you can write scritps to automate the rendering of 3D scenes into images and videos.
- **Remote GLB Loading Support**: Load multiple GLB/GLTF files into the scene with individual transforms (`target_0_glb`, `target_1_glb`, etc.), configured through URL parameters
- **Advanced Camera Targeting**: Automatic camera centering on objects
- **Interactive Drag Controls**: Y-axis constrained dragging with animated ground snapping
- **Ground Plane System**: Dynamic ground plane with 38+ PBR material textures
- **Save & Share Features**: 
  - Screenshot export with timestamp
  - QR code generation for scene sharing
  - URL parameter encoding for all settings
- **Control Systems**: 
  - Orbit controls with object targeting
  - FirstPerson mode with Y-position locking
  - Drag controls with object filtering
- **Asset Management**: Organized texture library under `/assets/textures/`

### Technical Improvements
- **Async Loading**: Proper handling of GLB loading with retry mechanisms
- **URL Parameters**: Complete scene state encoding in query strings
- **Form Integration**: Real-time settings synchronization
- **Mobile Support**: Touch-friendly controls and responsive design

## 🚀 Getting Started

### 🌐 Live Demo
Experience the enhanced editor online: **[https://higginsrob.github.io/three.js/editor/](https://higginsrob.github.io/three.js/editor/)**

### Quick Start - Local Development
```bash
npm ci                    # Install dependencies
npm start                 # Start development server
```

Navigate to `http://localhost:8080/editor/` to access the enhanced scene editor locally.

### Editor URL Parameters
The editor supports comprehensive URL parameter configuration:
```
?target=Target_0&controls=orbit&ground_material=GroundSand005&ground_texture_repeat=2
```

### Core Three.js Usage

This code creates a scene, a camera, and a geometric cube, and it adds the cube to the scene. It then creates a `WebGL` renderer for the scene and camera, and it adds that viewport to the `document.body` element. Finally, it animates the cube within the scene for the camera.

```javascript
import * as THREE from 'three';

const width = window.innerWidth, height = window.innerHeight;

// init

const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
camera.position.z = 1;

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
const material = new THREE.MeshNormalMaterial();

const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( width, height );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// animation

function animate( time ) {

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;

	renderer.render( scene, camera );

}
```

If everything goes well, you should see [this](https://jsfiddle.net/w43x5Lgh/).

## 📁 Project Structure

```
three.js/
├── editor/                     # Enhanced Scene Editor
│   ├── assets/
│   │   └── textures/          # 38+ PBR material textures
│   ├── js/libs/
│   │   ├── scene.js           # Scene configuration & GLB loading
│   │   └── app.js             # Camera controls & targeting
│   └── index.html             # Editor entry point
├── examples/                   # Three.js examples
├── src/                       # Core Three.js source
├── build/                     # Generated builds
└── docs/                      # API documentation
```

## 🔧 Development

### Building
```bash
npm run build                  # Full production build
npm run build-module          # ES6 module only
```

### Testing
```bash
npm test                       # Run all tests
npm run test-e2e              # End-to-end testing
npm run lint                  # Code linting
```

### Editor Development
The enhanced editor includes:
- Multi-target GLB loading system
- Camera targeting with bounding box calculations
- Drag controls with Y-axis constraints
- Ground plane with material textures
- QR code sharing functionality

### CI/CD & Deployment
This fork uses GitHub Actions for continuous integration and deployment:
- **Automatic deployment** to GitHub Pages on push to `experiment` branch
- **Automated testing** on pull requests
- **Manual workflow** for comprehensive testing with E2E options

See [.github/workflows/README.md](.github/workflows/README.md) for detailed workflow documentation.

## 🌐 Links & Resources

**Original Three.js:**
[Examples](https://threejs.org/examples/) &mdash;
[Docs](https://threejs.org/docs/) &mdash;
[Manual](https://threejs.org/manual/) &mdash;
[Wiki](https://github.com/mrdoob/three.js/wiki) &mdash;
[Migrating](https://github.com/mrdoob/three.js/wiki/Migration-Guide) &mdash;
[Questions](https://stackoverflow.com/questions/tagged/three.js) &mdash;
[Forum](https://discourse.threejs.org/) &mdash;
[Discord](https://discord.gg/56GBJwAnUS)

**This Fork:**
- 🌐 **Live Demo**: [https://higginsrob.github.io/three.js/](https://higginsrob.github.io/three.js/)
- 🎬 **Enhanced Editor**: [https://higginsrob.github.io/three.js/editor/](https://higginsrob.github.io/three.js/editor/)
- 📚 **Examples**: [https://higginsrob.github.io/three.js/examples/](https://higginsrob.github.io/three.js/examples/)
- 💻 **Repository**: [github.com/higginsrob/three.js](https://github.com/higginsrob/three.js)
- 📖 **Original**: [mrdoob/three.js](https://github.com/mrdoob/three.js)

### Cloning this repository

Cloning the repo with all its history results in a ~2 GB download. If you don't need the whole history you can use the `depth` parameter to significantly reduce download size.

```sh
git clone --depth=1 https://github.com/higginsrob/three.js.git
```

### Change log

**Fork Changes:**
- Enhanced scene editor with multi-target support
- Advanced camera targeting system
- Interactive drag controls with constraints
- Ground plane with PBR material library
- Save/share functionality with QR codes
- Comprehensive URL parameter system

**Original Three.js:** [Releases](https://github.com/mrdoob/three.js/releases)


[npm]: https://img.shields.io/npm/v/three
[npm-url]: https://www.npmjs.com/package/three
[build-size]: https://badgen.net/bundlephobia/minzip/three
[build-size-url]: https://bundlephobia.com/result?p=three
[npm-downloads]: https://img.shields.io/npm/dw/three
[npmtrends-url]: https://www.npmtrends.com/three
[discord]: https://img.shields.io/discord/685241246557667386
[discord-url]: https://discord.gg/56GBJwAnUS
[deepwiki]: https://deepwiki.com/badge.svg
[deepwiki-url]: https://deepwiki.com/mrdoob/three.js

