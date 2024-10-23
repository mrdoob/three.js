# three.js

[![NPM Package][npm]][npm-url]
[![Build Size][build-size]][build-size-url]
[![NPM Downloads][npm-downloads]][npmtrends-url]
[![DeepScan][deepscan]][deepscan-url]
[![Discord][discord]][discord-url]

#### JavaScript 3D library

The aim of the project is to create an easy-to-use, lightweight, cross-browser, general-purpose 3D library. The current builds only include a WebGL renderer but WebGPU (experimental), SVG and CSS3D renderers are also available as addons.

[Examples](https://threejs.org/examples/) &mdash;
[Docs](https://threejs.org/docs/) &mdash;
[Manual](https://threejs.org/manual/) &mdash;
[Wiki](https://github.com/mrdoob/three.js/wiki) &mdash;
[Migrating](https://github.com/mrdoob/three.js/wiki/Migration-Guide) &mdash;
[Questions](https://stackoverflow.com/questions/tagged/three.js) &mdash;
[Forum](https://discourse.threejs.org/) &mdash;
[Discord](https://discord.gg/56GBJwAnUS)

### Usage

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

If everything goes well, you should see [this](https://jsfiddle.net/v98k6oze/).

### Cloning this repository

Cloning the repo with all its history results in a ~2 GB download. If you don't need the whole history you can use the `depth` parameter to significantly reduce download size.

```sh
git clone --depth=1 https://github.com/mrdoob/three.js.git
```

### Change log

[Releases](https://github.com/mrdoob/three.js/releases)


[npm]: https://img.shields.io/npm/v/three
[npm-url]: https://www.npmjs.com/package/three
[build-size]: https://badgen.net/bundlephobia/minzip/three
[build-size-url]: https://bundlephobia.com/result?p=three
[npm-downloads]: https://img.shields.io/npm/dw/three
[npmtrends-url]: https://www.npmtrends.com/three
[deepscan]: https://deepscan.io/api/teams/16600/projects/19901/branches/525701/badge/grade.svg
[deepscan-url]: https://deepscan.io/dashboard#view=project&tid=16600&pid=19901&bid=525701
[discord]: https://img.shields.io/discord/685241246557667386
[discord-url]: https://discord.gg/56GBJwAnUS

- https://github.com/orgs/Make-America-Healthy-Again/discussions/32
- https://github.com/orgs/Make-America-Healthy-Again/discussions/33
- https://github.com/orgs/Make-America-Healthy-Again/discussions/34
- https://github.com/orgs/Make-America-Healthy-Again/discussions/35
- https://github.com/orgs/Make-America-Healthy-Again/discussions/36
- https://github.com/orgs/Make-America-Healthy-Again/discussions/37
- https://github.com/orgs/Make-America-Healthy-Again/discussions/38
- https://github.com/orgs/Make-America-Healthy-Again/discussions/39
- https://github.com/orgs/Make-America-Healthy-Again/discussions/40
- https://github.com/orgs/Make-America-Healthy-Again/discussions/41
- https://github.com/orgs/Make-America-Healthy-Again/discussions/42
- https://github.com/orgs/Make-America-Healthy-Again/discussions/43
- https://github.com/orgs/Make-America-Healthy-Again/discussions/44
- https://github.com/orgs/Make-America-Healthy-Again/discussions/45
- https://github.com/orgs/Make-America-Healthy-Again/discussions/46
- https://github.com/orgs/Make-America-Healthy-Again/discussions/47
- https://github.com/orgs/Make-America-Healthy-Again/discussions/48
- https://github.com/orgs/Make-America-Healthy-Again/discussions/49
- https://github.com/orgs/Make-America-Healthy-Again/discussions/50
- https://github.com/orgs/Make-America-Healthy-Again/discussions/51
- https://github.com/orgs/Make-America-Healthy-Again/discussions/52
- https://github.com/orgs/Make-America-Healthy-Again/discussions/53
- https://github.com/orgs/Make-America-Healthy-Again/discussions/54
- https://github.com/orgs/Make-America-Healthy-Again/discussions/55
- https://github.com/orgs/Make-America-Healthy-Again/discussions/56
- https://github.com/orgs/Make-America-Healthy-Again/discussions/57
- https://github.com/orgs/Make-America-Healthy-Again/discussions/58
- https://github.com/orgs/Make-America-Healthy-Again/discussions/59
- https://github.com/orgs/Make-America-Healthy-Again/discussions/60
- https://github.com/orgs/Make-America-Healthy-Again/discussions/61
- https://github.com/orgs/Make-America-Healthy-Again/discussions/62
- https://github.com/orgs/Make-America-Healthy-Again/discussions/63
- https://github.com/orgs/Make-America-Healthy-Again/discussions/64
- https://github.com/orgs/Make-America-Healthy-Again/discussions/65
- https://github.com/orgs/Make-America-Healthy-Again/discussions/66
- https://github.com/orgs/Make-America-Healthy-Again/discussions/67
- https://github.com/orgs/Make-America-Healthy-Again/discussions/68
- https://github.com/orgs/Make-America-Healthy-Again/discussions/69
- https://github.com/orgs/Make-America-Healthy-Again/discussions/70
- https://github.com/orgs/Make-America-Healthy-Again/discussions/71
- https://github.com/orgs/Make-America-Healthy-Again/discussions/72
- https://github.com/orgs/Make-America-Healthy-Again/discussions/73
- https://github.com/orgs/Make-America-Healthy-Again/discussions/74
- https://github.com/orgs/Make-America-Healthy-Again/discussions/75
- https://github.com/orgs/Make-America-Healthy-Again/discussions/76
- https://github.com/orgs/Make-America-Healthy-Again/discussions/77
- https://github.com/orgs/Make-America-Healthy-Again/discussions/78
- https://github.com/orgs/Make-America-Healthy-Again/discussions/79
- https://github.com/orgs/Make-America-Healthy-Again/discussions/80
- https://github.com/orgs/Make-America-Healthy-Again/discussions/81
- https://github.com/orgs/Make-America-Healthy-Again/discussions/82
- https://github.com/orgs/Make-America-Healthy-Again/discussions/83
- https://github.com/orgs/Make-America-Healthy-Again/discussions/84
- https://github.com/orgs/Make-America-Healthy-Again/discussions/85
- https://github.com/orgs/Make-America-Healthy-Again/discussions/86
- https://github.com/orgs/Make-America-Healthy-Again/discussions/87
- https://github.com/orgs/Make-America-Healthy-Again/discussions/88
- https://github.com/orgs/Make-America-Healthy-Again/discussions/89
- https://github.com/orgs/Make-America-Healthy-Again/discussions/90
- https://github.com/orgs/Make-America-Healthy-Again/discussions/91
- https://github.com/orgs/Make-America-Healthy-Again/discussions/92
- https://github.com/orgs/Make-America-Healthy-Again/discussions/93
- https://github.com/orgs/Make-America-Healthy-Again/discussions/94
- https://github.com/orgs/Make-America-Healthy-Again/discussions/95
- https://github.com/orgs/Make-America-Healthy-Again/discussions/96
- https://github.com/orgs/Make-America-Healthy-Again/discussions/97
- https://github.com/orgs/Make-America-Healthy-Again/discussions/98
- https://github.com/orgs/Make-America-Healthy-Again/discussions/99
