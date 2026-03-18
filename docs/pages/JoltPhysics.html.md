# JoltPhysics

Can be used to include Jolt as a Physics engine into `three.js` apps. The API can be initialized via:

The component automatically imports Jolt from a CDN so make sure to use the component with an active Internet connection.

## Code Example

```js
const physics = await JoltPhysics();
```

## Import

JoltPhysics is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { JoltPhysics } from 'three/addons/physics/JoltPhysics.js';
```

## Methods

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

### .setMeshPosition( mesh : Mesh, position : Vector3, index : number )

Set the position of the given mesh which is part of the physics simulation. Calling this method will reset the current simulated velocity of the mesh.

**mesh**

The mesh to update the position for.

**position**

The new position.

**index**

If the mesh is instanced, the index represents the instanced ID.

Default is `0`.

## Source

[examples/jsm/physics/JoltPhysics.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/physics/JoltPhysics.js)