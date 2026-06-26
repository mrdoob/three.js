# Octree

An octree is a hierarchical tree data structure used to partition a three-dimensional space by recursively subdividing it into eight octants.

This particular implementation can have up to sixteen levels and stores up to eight triangles in leaf nodes.

`Octree` can be used in games to compute collision between the game world and colliders from the player or other dynamic 3D objects.

## Code Example

```js
const octree = new Octree().fromGraphNode( scene );
const result = octree.capsuleIntersect( playerCollider ); // collision detection
```

## Import

Octree is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { Octree } from 'three/addons/math/Octree.js';
```

## Constructor

### new Octree( box : Box3 )

Constructs a new Octree.

**box**

The base box with enclose the entire Octree.

## Properties

### .bounds : Box3

The bounds of the Octree. Compared to [Octree#box](Octree.html#box), no margin is applied.

### .box : Box3

The base box with enclose the entire Octree.

### .layers : Layers

Can by used for layers configuration for refine testing.

### .maxLevel : number

The maximum level of the Octree. It defines the maximum hierarchical depth of the data structure.

Default is `16`.

### .trianglesPerLeaf : number

The number of triangles a leaf can store before it is split.

Default is `8`.

## Methods

### .addTriangle( triangle : Triangle ) : Octree

Adds the given triangle to the Octree. The triangle vertices are clamped if they exceed the bounds of the Octree.

**triangle**

The triangle to add.

**Returns:** A reference to this Octree.

### .boxIntersect( box : Box3 ) : Object | boolean

Performs a bounding box intersection test with this Octree.

**box**

The bounding box to test.

**Returns:** The intersection object. If no intersection is detected, the method returns `false`.

### .build() : Octree

Builds the Octree.

**Returns:** A reference to this Octree.

### .calcBox() : Octree

Prepares [Octree#box](Octree.html#box) for the build.

**Returns:** A reference to this Octree.

### .capsuleIntersect( capsule : Capsule ) : Object | boolean

Performs a capsule intersection test with this Octree.

**capsule**

The capsule to test.

**Returns:** The intersection object. If no intersection is detected, the method returns `false`.

### .clear() : Octree

Clears the Octree by making it empty.

**Returns:** A reference to this Octree.

### .fromGraphNode( group : Object3D ) : Octree

Constructs the Octree from the given 3D object.

**group**

The scene graph node.

**Returns:** A reference to this Octree.

### .getBoxTriangles( box : Box3, triangles : Array.<Triangle> )

Computes the triangles that potentially intersect with the given bounding box.

**box**

The bounding box.

**triangles**

The target array that holds the triangles.

### .getCapsuleTriangles( capsule : Capsule, triangles : Array.<Triangle> )

Computes the triangles that potentially intersect with the given capsule.

**capsule**

The capsule to test.

**triangles**

The target array that holds the triangles.

### .getRayTriangles( ray : Ray, triangles : Array.<Triangle> )

Computes the triangles that potentially intersect with the given ray.

**ray**

The ray to test.

**triangles**

The target array that holds the triangles.

### .getSphereTriangles( sphere : Sphere, triangles : Array.<Triangle> )

Computes the triangles that potentially intersect with the given bounding sphere.

**sphere**

The sphere to test.

**triangles**

The target array that holds the triangles.

### .rayIntersect( ray : Ray ) : Object | boolean

Performs a ray intersection test with this Octree.

**ray**

The ray to test.

**Returns:** The nearest intersection object. If no intersection is detected, the method returns `false`.

### .sphereIntersect( sphere : Sphere ) : Object | boolean

Performs a bounding sphere intersection test with this Octree.

**sphere**

The bounding sphere to test.

**Returns:** The intersection object. If no intersection is detected, the method returns `false`.

### .split( level : number ) : Octree

Splits the Octree. This method is used recursively when building the Octree.

**level**

The current level.

**Returns:** A reference to this Octree.

### .triangleBoxIntersect( box : Box3, triangle : Triangle ) : Object | false

Computes the intersection between the given bounding box and triangle.

**box**

The bounding box to test.

**triangle**

The triangle to test.

**Returns:** The intersection object. If no intersection is detected, the method returns `false`.

### .triangleCapsuleIntersect( capsule : Capsule, triangle : Triangle ) : Object | false

Computes the intersection between the given capsule and triangle.

**capsule**

The capsule to test.

**triangle**

The triangle to test.

**Returns:** The intersection object. If no intersection is detected, the method returns `false`.

### .triangleSphereIntersect( sphere : Sphere, triangle : Triangle ) : Object | false

Computes the intersection between the given sphere and triangle.

**sphere**

The sphere to test.

**triangle**

The triangle to test.

**Returns:** The intersection object. If no intersection is detected, the method returns `false`.

## Source

[examples/jsm/math/Octree.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/math/Octree.js)