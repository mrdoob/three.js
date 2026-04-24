import fs from 'fs';
import path from 'path';
import TurndownService from 'turndown';

// Read package.json to get current version
const packageJson = JSON.parse( fs.readFileSync( 'package.json', 'utf8' ) );
const version = packageJson.version;

// Read TSL specification
const tslSpec = fs.readFileSync( 'docs/TSL.md', 'utf8' );

// Setup Turndown for HTML to Markdown conversion
const turndown = new TurndownService( {
	headingStyle: 'atx',
	codeBlockStyle: 'fenced'
} );

// Code blocks - assume JavaScript
turndown.addRule( 'codeBlocks', {
	filter: [ 'pre' ],
	replacement: function ( content ) {

		return '\n```js\n' + content.trim() + '\n```\n';

	}
} );

// Simplify member/method headings: ".[name](#name)" -> ".name"
turndown.addRule( 'memberHeadings', {
	filter: function ( node ) {

		return node.tagName === 'H3' && node.classList.contains( 'name' );

	},
	replacement: function ( content, node ) {

		// Extract the clean signature without anchor links
		let text = node.textContent.trim();
		// Clean up extra whitespace
		text = text.replace( /\s+/g, ' ' );
		return '\n### ' + text + '\n';

	}
} );

// Simplify type signatures in spans
turndown.addRule( 'typeSignatures', {
	filter: function ( node ) {

		return node.tagName === 'SPAN' && node.classList.contains( 'type-signature' );

	},
	replacement: function ( content, node ) {

		// Just return the text content without links
		return ' : ' + node.textContent.trim();

	}
} );

// Clean up inheritance chain (p.inheritance)
turndown.addRule( 'inheritance', {
	filter: function ( node ) {

		return node.tagName === 'P' && node.classList.contains( 'inheritance' );

	},
	replacement: function ( content, node ) {

		// Convert to simple text chain
		const text = node.textContent.trim();
		if ( ! text ) return '';
		return '*Inheritance: ' + text + '*\n\n';

	}
} );

// Root llms.txt - simple pointer file
const rootLlms = `# Three.js

> Three.js is a cross-browser JavaScript library for creating 3D graphics using WebGL and WebGPU.

See the full documentation for LLMs at: https://threejs.org/docs/llms.txt

For complete inline documentation including TSL: https://threejs.org/docs/llms-full.txt
`;

// Docs llms.txt - main documentation index with instructions
const docsLlms = `# Three.js

> Three.js is a cross-browser JavaScript library for creating 3D graphics using WebGL and WebGPU.

## Instructions for Large Language Models

When generating Three.js code, follow these guidelines:

### 1. Use Import Maps (Not Old CDN Patterns)

WRONG - outdated pattern:
\`\`\`html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
\`\`\`

CORRECT - modern pattern (always use latest version):
\`\`\`html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@${version}/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@${version}/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
</script>
\`\`\`

### 2. Choosing Between WebGLRenderer and WebGPURenderer

Three.js maintains both renderers:

**Use WebGLRenderer** (default, mature):
- Maximum browser compatibility
- Well-established, many years of development
- Most examples and tutorials use this

\`\`\`js
import * as THREE from 'three';
const renderer = new THREE.WebGLRenderer();
\`\`\`

**Use WebGPURenderer** when you need:
- Custom shaders/materials using TSL (Three.js Shading Language)
- Compute shaders
- Advanced node-based materials

\`\`\`js
import * as THREE from 'three/webgpu';
const renderer = new THREE.WebGPURenderer();
await renderer.init();
\`\`\`

### 3. TSL (Three.js Shading Language)

When using WebGPURenderer, use TSL instead of raw GLSL for custom materials:

\`\`\`js
import { texture, uv, color } from 'three/tsl';

const material = new THREE.MeshStandardNodeMaterial();
material.colorNode = texture( myTexture ).mul( color( 0xff0000 ) );
\`\`\`

TSL benefits:
- Works with both WebGL and WebGPU backends
- No string manipulation or onBeforeCompile hacks
- Type-safe, composable shader nodes
- Automatic optimization

### 4. NodeMaterial Classes (for WebGPU/TSL)

When using TSL, use node-based materials:
- MeshBasicNodeMaterial
- MeshStandardNodeMaterial
- MeshPhysicalNodeMaterial
- LineBasicNodeMaterial
- SpriteNodeMaterial

## Getting Started

- [Installation](https://threejs.org/manual/#en/installation)
- [Creating a Scene](https://threejs.org/manual/#en/creating-a-scene)
- [Fundamentals](https://threejs.org/manual/#en/fundamentals)
- [Responsive Design](https://threejs.org/manual/#en/responsive)

## Renderer Guides

- [WebGPURenderer](https://threejs.org/manual/#en/webgpurenderer)

## Core Concepts

- [TSL Specification](https://threejs.org/docs/#api/en/nodes/TSL): Complete shader language reference
- [Animation System](https://threejs.org/manual/#en/animation-system)
- [Loading 3D Models](https://threejs.org/manual/#en/loading-3d-models)
- [Scene Graph](https://threejs.org/manual/#en/scenegraph)
- [Materials](https://threejs.org/manual/#en/materials)
- [Textures](https://threejs.org/manual/#en/textures)
- [Lights](https://threejs.org/manual/#en/lights)
- [Cameras](https://threejs.org/manual/#en/cameras)
- [Shadows](https://threejs.org/manual/#en/shadows)

## Essential API

### Core
- [Object3D](https://threejs.org/docs/#api/en/core/Object3D)
- [BufferGeometry](https://threejs.org/docs/#api/en/core/BufferGeometry)
- [BufferAttribute](https://threejs.org/docs/#api/en/core/BufferAttribute)

### Scenes
- [Scene](https://threejs.org/docs/#api/en/scenes/Scene)

### Cameras
- [PerspectiveCamera](https://threejs.org/docs/#api/en/cameras/PerspectiveCamera)
- [OrthographicCamera](https://threejs.org/docs/#api/en/cameras/OrthographicCamera)

### Renderers
- [WebGLRenderer](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)
- [WebGPURenderer](https://threejs.org/docs/#api/en/renderers/webgpu/WebGPURenderer)

### Objects
- [Mesh](https://threejs.org/docs/#api/en/objects/Mesh)
- [InstancedMesh](https://threejs.org/docs/#api/en/objects/InstancedMesh)
- [Group](https://threejs.org/docs/#api/en/objects/Group)

### Materials
- [MeshBasicMaterial](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial)
- [MeshStandardMaterial](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)
- [MeshPhysicalMaterial](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial)

### Geometries
- [BoxGeometry](https://threejs.org/docs/#api/en/geometries/BoxGeometry)
- [SphereGeometry](https://threejs.org/docs/#api/en/geometries/SphereGeometry)
- [PlaneGeometry](https://threejs.org/docs/#api/en/geometries/PlaneGeometry)

### Lights
- [AmbientLight](https://threejs.org/docs/#api/en/lights/AmbientLight)
- [DirectionalLight](https://threejs.org/docs/#api/en/lights/DirectionalLight)
- [PointLight](https://threejs.org/docs/#api/en/lights/PointLight)
- [SpotLight](https://threejs.org/docs/#api/en/lights/SpotLight)

### Loaders
- [TextureLoader](https://threejs.org/docs/#api/en/loaders/TextureLoader)
- [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)

### Controls
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)
- [TransformControls](https://threejs.org/docs/#examples/en/controls/TransformControls)

### Math
- [Vector2](https://threejs.org/docs/#api/en/math/Vector2)
- [Vector3](https://threejs.org/docs/#api/en/math/Vector3)
- [Matrix4](https://threejs.org/docs/#api/en/math/Matrix4)
- [Quaternion](https://threejs.org/docs/#api/en/math/Quaternion)
- [Color](https://threejs.org/docs/#api/en/math/Color)
`;

// Docs llms-full.txt - complete inline documentation
const docsLlmsFull = `# Three.js

> Three.js is a cross-browser JavaScript library for creating 3D graphics using WebGL and WebGPU.

## Instructions for Large Language Models

When generating Three.js code, follow these guidelines:

### 1. Use Import Maps (Not Old CDN Patterns)

WRONG - outdated pattern:
\`\`\`html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
\`\`\`

CORRECT - modern pattern (always use latest version):
\`\`\`html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@${version}/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@${version}/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
</script>
\`\`\`

### 2. Choosing Between WebGLRenderer and WebGPURenderer

Three.js maintains both renderers:

**Use WebGLRenderer** (default, mature):
- Maximum browser compatibility
- Well-established, many years of development
- Most examples and tutorials use this

\`\`\`js
import * as THREE from 'three';
const renderer = new THREE.WebGLRenderer();
\`\`\`

**Use WebGPURenderer** when you need:
- Custom shaders/materials using TSL (Three.js Shading Language)
- Compute shaders
- Advanced node-based materials

\`\`\`js
import * as THREE from 'three/webgpu';
const renderer = new THREE.WebGPURenderer();
await renderer.init();
\`\`\`

### 3. TSL (Three.js Shading Language)

When using WebGPURenderer, use TSL instead of raw GLSL for custom materials:

\`\`\`js
import { texture, uv, color } from 'three/tsl';

const material = new THREE.MeshStandardNodeMaterial();
material.colorNode = texture( myTexture ).mul( color( 0xff0000 ) );
\`\`\`

TSL benefits:
- Works with both WebGL and WebGPU backends
- No string manipulation or onBeforeCompile hacks
- Type-safe, composable shader nodes
- Automatic optimization

### 4. NodeMaterial Classes (for WebGPU/TSL)

When using TSL, use node-based materials:
- MeshBasicNodeMaterial
- MeshStandardNodeMaterial
- MeshPhysicalNodeMaterial
- LineBasicNodeMaterial
- SpriteNodeMaterial

---

## Complete Code Examples

### Basic Scene with WebGLRenderer

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Three.js Basic Scene</title>
  <style>
    body { margin: 0; }
  </style>
</head>
<body>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@${version}/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@${version}/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

// Controls
const controls = new OrbitControls( camera, renderer.domElement );

// Lighting
const ambientLight = new THREE.AmbientLight( 0x404040 );
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 5, 5, 5 );
scene.add( directionalLight );

// Mesh
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// Handle resize
window.addEventListener( 'resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
} );

// Animation loop
function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  controls.update();
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
</script>
</body>
</html>
\`\`\`

### Basic Scene with WebGPURenderer and TSL

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Three.js WebGPU Scene</title>
  <style>
    body { margin: 0; }
  </style>
</head>
<body>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@${version}/build/three.webgpu.js",
    "three/tsl": "https://cdn.jsdelivr.net/npm/three@${version}/build/three.tsl.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@${version}/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from 'three';
import { color, positionLocal, sin, time } from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGPURenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

await renderer.init();

// Controls
const controls = new OrbitControls( camera, renderer.domElement );

// Lighting
const ambientLight = new THREE.AmbientLight( 0x404040 );
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 5, 5, 5 );
scene.add( directionalLight );

// Custom TSL material
const material = new THREE.MeshStandardNodeMaterial();
material.colorNode = color( 0x00ff00 ).mul( sin( time ).mul( 0.5 ).add( 0.5 ) );
material.positionNode = positionLocal.add( sin( time.add( positionLocal.y ) ).mul( 0.1 ) );

// Mesh
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// Handle resize
window.addEventListener( 'resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
} );

// Animation loop
function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  controls.update();
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
</script>
</body>
</html>
\`\`\`

### Loading a GLTF Model

\`\`\`js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

loader.load(
  'model.glb',
  ( gltf ) => {
    scene.add( gltf.scene );
  },
  ( progress ) => {
    console.log( ( progress.loaded / progress.total * 100 ) + '% loaded' );
  },
  ( error ) => {
    console.error( 'Error loading model:', error );
  }
);
\`\`\`

---

# TSL (Three.js Shading Language) - Complete Reference

${tslSpec}
`;

// Generate .md versions of all HTML doc pages
const docsDir = 'docs/pages';

// Remove stale .md files from previous builds
const existingMdFiles = fs.readdirSync( docsDir ).filter( f => f.endsWith( '.html.md' ) );

for ( const file of existingMdFiles ) {

	fs.unlinkSync( path.join( docsDir, file ) );

}

const htmlFiles = fs.readdirSync( docsDir ).filter( f => f.endsWith( '.html' ) );

const mdFiles = [];

for ( const file of htmlFiles ) {

	const htmlPath = path.join( docsDir, file );
	const html = fs.readFileSync( htmlPath, 'utf8' );

	// Extract just the body content
	const bodyMatch = html.match( /<body[^>]*>([\s\S]*)<\/body>/i );
	if ( ! bodyMatch ) continue;

	const bodyHtml = bodyMatch[ 1 ];
	const markdown = turndown.turndown( bodyHtml );

	// Write .md file alongside HTML
	const mdPath = htmlPath + '.md';
	fs.writeFileSync( mdPath, markdown );

	// Track for listing
	const name = file.replace( '.html', '' );
	mdFiles.push( name );

}

// Categorize files by naming patterns
function categorize( name ) {

	// Skip internal/index files
	if ( name === 'index' || name === 'global' ) return null;

	// Specific patterns (order matters - more specific first)
	if ( /Loader$/.test( name ) ) return 'Loaders';
	if ( /Geometry$/.test( name ) ) return 'Geometries';
	if ( /Material$/.test( name ) ) return 'Materials';
	if ( /NodeMaterial$/.test( name ) ) return 'Materials';
	if ( /Light$/.test( name ) ) return 'Lights';
	if ( /Camera$/.test( name ) ) return 'Cameras';
	if ( /Controls$/.test( name ) ) return 'Controls';
	if ( /Helper$/.test( name ) ) return 'Helpers';
	if ( /Curve/.test( name ) ) return 'Curves';
	if ( /Pass$/.test( name ) || /PassNode$/.test( name ) ) return 'Post-Processing';
	if ( /Node$/.test( name ) ) return 'Nodes (TSL)';
	if ( /Texture$/.test( name ) ) return 'Textures';
	if ( /Animation/.test( name ) ) return 'Animation';
	if ( /Audio/.test( name ) ) return 'Audio';
	if ( /XR/.test( name ) ) return 'WebXR';
	if ( /Effect$/.test( name ) ) return 'Effects';
	if ( /^Vector|^Matrix|^Quaternion|^Euler|^Color$|^Box|^Sphere|^Ray|^Plane|^Frustum|^Triangle/.test( name ) ) return 'Math';
	if ( /^module-/.test( name ) ) return 'Shader Modules';

	return 'Core';

}

const categories = {};

for ( const name of mdFiles ) {

	const category = categorize( name );
	if ( ! category ) continue;

	if ( ! categories[ category ] ) categories[ category ] = [];
	categories[ category ].push( name );

}

// Sort categories and items within each
const categoryOrder = [
	'Core', 'Cameras', 'Lights', 'Materials', 'Geometries', 'Textures',
	'Loaders', 'Controls', 'Helpers', 'Animation', 'Audio', 'Math',
	'Curves', 'Effects', 'Post-Processing', 'Nodes (TSL)', 'WebXR', 'Shader Modules'
];

let categorizedList = '';

for ( const category of categoryOrder ) {

	if ( ! categories[ category ] ) continue;

	categories[ category ].sort();
	categorizedList += `\n### ${category}\n\n`;
	categorizedList += categories[ category ]
		.map( name => `- [${name}](https://threejs.org/docs/pages/${name}.html.md)` )
		.join( '\n' );
	categorizedList += '\n';

}

// Build documentation list for llms-full.txt
const docsList = `

---

## Available Documentation

The following documentation pages are available in markdown format at \`https://threejs.org/docs/pages/{Name}.html.md\`:
${categorizedList}`;

// Write files
fs.writeFileSync( 'llms.txt', rootLlms );
fs.writeFileSync( 'docs/llms.txt', docsLlms );
fs.writeFileSync( 'docs/llms-full.txt', docsLlmsFull + docsList );

console.log( `Generated llms.txt files for Three.js v${version}` );
console.log( '  - llms.txt (root)' );
console.log( '  - docs/llms.txt' );
console.log( '  - docs/llms-full.txt' );
console.log( `  - ${mdFiles.length} doc pages converted to .md` );
