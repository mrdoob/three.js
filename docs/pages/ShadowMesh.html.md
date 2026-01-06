*Inheritance: EventDispatcher → Object3D → Mesh →*

# ShadowMesh

A Shadow Mesh that follows a shadow-casting mesh in the scene, but is confined to a single plane. This technique can be used as a very performant alternative to classic shadow mapping. However, it has serious limitations like:

*   Shadows can only be casted on flat planes.
*   No soft shadows support.

## Code Example

```js
const cubeShadow = new ShadowMesh( cube );
scene.add( cubeShadow );
```

## Import

ShadowMesh is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ShadowMesh } from 'three/addons/objects/ShadowMesh.js';
```

## Constructor

### new ShadowMesh( mesh : Mesh )

Constructs a new shadow mesh.

**mesh**

The shadow-casting reference mesh.

## Properties

### .frustumCulled : boolean

Overwritten to disable view-frustum culling by default.

Default is `false`.

**Overrides:** [Mesh#frustumCulled](Mesh.html#frustumCulled)

### .isShadowMesh : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .matrixAutoUpdate : boolean

Overwritten to disable automatic matrix update. The local matrix is computed manually in [ShadowMesh#update](ShadowMesh.html#update).

Default is `false`.

**Overrides:** [Mesh#matrixAutoUpdate](Mesh.html#matrixAutoUpdate)

### .meshMatrix : Matrix4

Represent the world matrix of the reference mesh.

## Methods

### .update( plane : Plane, lightPosition4D : Vector4 )

Updates the shadow mesh so it follows its shadow-casting reference mesh.

**plane**

The plane onto the shadow mesh is projected.

**lightPosition4D**

The light position.

## Source

[examples/jsm/objects/ShadowMesh.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/ShadowMesh.js)