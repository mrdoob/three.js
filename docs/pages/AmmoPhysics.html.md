# AmmoPhysics

Can be used to include Ammo.js as a Physics engine into `three.js` apps. Make sure to include `ammo.wasm.js` first:

It is then possible to initialize the API via:

```js
const physics = await AmmoPhysics();
```

## Code Example

```js
<script src="jsm/libs/ammo.wasm.js"></script>
```

## Import

AmmoPhysics is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { AmmoPhysics } from 'three/addons/physics/AmmoPhysics.js';
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

Adds the given scene to this physics simulation. Only meshes with a `physics` object in their [Object3D#userData](Object3D.html#userData) field will be honored. The object can be used to store the mass of the mesh. E.g.:

```js
box.userData.physics = { mass: 1 };
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

[examples/jsm/physics/AmmoPhysics.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/physics/AmmoPhysics.js)