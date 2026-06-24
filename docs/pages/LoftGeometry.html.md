*Inheritance: EventDispatcher → BufferGeometry →*

# LoftGeometry

This class can be used to generate a geometry by lofting (skinning) a surface through a series of cross sections. Each section is an array of points in 3D space and all sections must have the same number of points.

`LoftGeometry` is the general case of geometries like [LatheGeometry](LatheGeometry.html) (which revolves a fixed profile around an axis) or [TubeGeometry](TubeGeometry.html) (which sweeps a circular section along a path): the sections can have any shape, and can change shape, size, position and orientation from one section to the next.

Sections wind around the loft so the resulting face normals point outwards when each section is ordered counterclockwise as seen from the end of the loft, looking back towards the start. If the surface appears inside out, reverse the point order of each section.

## Code Example

```js
const sections = [];
for ( let i = 0; i <= 10; i ++ ) {
	const points = [];
	const radius = 2 + Math.sin( i * 0.8 );
	for ( let j = 0; j < 32; j ++ ) {
		const angle = j / 32 * Math.PI * 2;
		points.push( new THREE.Vector3( Math.sin( angle ) * radius, i, Math.cos( angle ) * radius ) );
	}
	sections.push( points );
}
const geometry = new LoftGeometry( sections, { capStart: true, capEnd: true } );
const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );
```

## Import

LoftGeometry is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LoftGeometry } from 'three/addons/geometries/LoftGeometry.js';
```

## Constructor

### new LoftGeometry( sections : Array.<Array.<Vector3>>, options : Object )

Constructs a new loft geometry.

**sections**

The cross sections to skin. At least two sections are required and all sections must have the same number of points.

**options**

The loft options.

Default is `{}`.

**closed**

Whether each section is treated as a closed ring (e.g. a fuselage) or an open strip (e.g. a ribbon).

Default is `true`.

**capStart**

Whether the first section is closed with a cap or not.

Default is `false`.

**capEnd**

Whether the last section is closed with a cap or not.

Default is `false`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Source

[examples/jsm/geometries/LoftGeometry.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/geometries/LoftGeometry.js)