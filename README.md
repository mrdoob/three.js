# 3editor Popsicle Stick 3D Editor

[![NPM Package][npm]][npm-url]
[![Build Size][build-size]][build-size-url]
[![NPM Downloads][npm-downloads]][npmtrends-url]
[![DeepScan][deepscan]][deepscan-url]
[![Discord][discord]][discord-url]

#### 3D Popsicle Stick Project Editor based on Three.js

The aim of this project is to create an easy-to-use, lightweight, cross-browser 3D editor specifically for popsicle stick crafts and models. It's built on top of the Three.js library, utilizing its WebGL renderer for high-performance 3D graphics.

### Usage

This code creates a scene with a 3D popsicle stick model. It sets up a camera, adds the popsicle stick model to the scene, and renders it using WebGL. The model can be rotated for a full 3D view.

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


### Cloning this repository

Cloning the repo with all its history results in a ~2 GB download. If you don't need the whole history you can use the `depth` parameter to significantly reduce download size.

```sh
git clone --depth=1 https://github.com/stiisk/3editor.git
```

### Change log

[Releases](https://github.com/stiisk/3editor/releases)



