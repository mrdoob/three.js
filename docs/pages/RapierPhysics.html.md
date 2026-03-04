# RapierPhysics

Can be used to include Rapier as a Physics engine into `three.js` apps. The API can be initialized via:

The component automatically imports Rapier from a CDN so make sure to use the component with an active Internet connection.

## Code Example

```js
const physics = await RapierPhysics();
```

## Import

RapierPhysics is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';
```

## Methods

### .addHeightfield( mesh : Mesh, width : number, depth : number, heights : Float32Array, scale : Object ) : RigidBody

Adds a heightfield terrain to the physics simulation.

**mesh**

The Three.js mesh representing the terrain.

**width**

The number of vertices along the width (x-axis) of the heightfield.

**depth**

The number of vertices along the depth (z-axis) of the heightfield.

**heights**

Array of height values for each vertex in the heightfield.

**scale**

Scale factors for the heightfield dimensions.

**x**

Scale factor for width.

**y**

Scale factor for height.

**z**

Scale factor for depth.

**Returns:** The created Rapier rigid body for the heightfield.

### .addMesh( mesh : Mesh, mass : number, restitution : number )

Adds the given mesh to this physics simulation.

**mesh**

The mesh to add.

**mass**

The mass in kg of the mesh.

Default is `0`.

**restitution**

The restitution of the mesh, usually from 0 to 1. Represents how "bouncy" objects are when they collide with each other.

Default is `0`.

### .addScene( scene : Object3D )

Adds the given scene to this physics simulation. Only meshes with a `physics` object in their [Object3D#userData](Object3D.html#userData) field will be honored. The object can be used to store the mass and restitution of the mesh. E.g.:

```js
box.userData.physics = { mass: 1, restitution: 0 };
```

**scene**

The scene or any type of 3D object to add.

### .removeMesh( mesh : Mesh )

Removes the given mesh from this physics simulation.

**mesh**

The mesh to remove.

### .setMeshPosition( mesh : Mesh, position : Vector3, index : number )

Set the position of the given mesh which is part of the physics simulation. Calling this method will reset the current simulated velocity of the mesh.

**mesh**

The mesh to update the position for.

**position**

The new position.

**index**

If the mesh is instanced, the index represents the instanced ID.

Default is `0`.

### .setMeshVelocity( mesh : Mesh, velocity : Vector3, index : number )

Set the velocity of the given mesh which is part of the physics simulation.

**mesh**

The mesh to update the velocity for.

**velocity**

The new velocity.

**index**

If the mesh is instanced, the index represents the instanced ID.

Default is `0`.

## Source

[examples/jsm/physics/RapierPhysics.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/physics/RapierPhysics.js)