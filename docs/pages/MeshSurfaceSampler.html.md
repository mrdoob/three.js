# MeshSurfaceSampler

Utility class for sampling weighted random points on the surface of a mesh.

Building the sampler is a one-time O(n) operation. Once built, any number of random samples may be selected in O(logn) time. Memory usage is O(n).

References:

*   [http://www.joesfer.com/?p=84](http://www.joesfer.com/?p=84)
*   [https://stackoverflow.com/a/4322940/1314762](https://stackoverflow.com/a/4322940/1314762)

## Code Example

```js
const sampler = new MeshSurfaceSampler( surfaceMesh )
	.setWeightAttribute( 'color' )
	.build();
const mesh = new THREE.InstancedMesh( sampleGeometry, sampleMaterial, 100 );
const position = new THREE.Vector3();
const matrix = new THREE.Matrix4();
// Sample randomly from the surface, creating an instance of the sample geometry at each sample point.
for ( let i = 0; i < 100; i ++ ) {
	sampler.sample( position );
	matrix.makeTranslation( position.x, position.y, position.z );
	mesh.setMatrixAt( i, matrix );
}
scene.add( mesh );
```

## Import

MeshSurfaceSampler is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
```

## Constructor

### new MeshSurfaceSampler( mesh : Mesh )

Constructs a mesh surface sampler.

**mesh**

Surface mesh from which to sample.

## Methods

### .build() : MeshSurfaceSampler

Processes the input geometry and prepares to return samples. Any configuration of the geometry or sampler must occur before this method is called. Time complexity is O(n) for a surface with n faces.

**Returns:** A reference to this sampler.

### .sample( targetPosition : Vector3, targetNormal : Vector3, targetColor : Color, targetUV : Vector2 ) : MeshSurfaceSampler

Selects a random point on the surface of the input geometry, returning the position and optionally the normal vector, color and UV Coordinate at that point. Time complexity is O(log n) for a surface with n faces.

**targetPosition**

The target object holding the sampled position.

**targetNormal**

The target object holding the sampled normal.

**targetColor**

The target object holding the sampled color.

**targetUV**

The target object holding the sampled uv coordinates.

**Returns:** A reference to this sampler.

### .setRandomGenerator( randomFunction : function ) : MeshSurfaceSampler

Allows to set a custom random number generator. Default is `Math.random()`.

**randomFunction**

A random number generator.

**Returns:** A reference to this sampler.

### .setWeightAttribute( name : string ) : MeshSurfaceSampler

Specifies a vertex attribute to be used as a weight when sampling from the surface. Faces with higher weights are more likely to be sampled, and those with weights of zero will not be sampled at all. For vector attributes, only .x is used in sampling.

If no weight attribute is selected, sampling is randomly distributed by area.

**name**

The attribute name.

**Returns:** A reference to this sampler.

## Source

[examples/jsm/math/MeshSurfaceSampler.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/math/MeshSurfaceSampler.js)