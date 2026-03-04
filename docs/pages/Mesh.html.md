*Inheritance: EventDispatcher → Object3D →*

# Mesh

Class representing triangular polygon mesh based objects.

## Code Example

```js
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );
```

## Constructor

### new Mesh( geometry : BufferGeometry, material : Material | Array.<Material> )

Constructs a new mesh.

**geometry**

The mesh geometry.

**material**

The mesh material.

## Properties

### .count : number

The number of instances of this mesh. Can only be used with [WebGPURenderer](WebGPURenderer.html).

Default is `1`.

### .geometry : BufferGeometry

The mesh geometry.

### .isMesh : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .material : Material | Array.<Material>

The mesh material.

Default is `MeshBasicMaterial`.

### .morphTargetDictionary : Object.<string, number> | undefined

A dictionary representing the morph targets in the geometry. The key is the morph targets name, the value its attribute index. This member is `undefined` by default and only set when morph targets are detected in the geometry.

Default is `undefined`.

### .morphTargetInfluences : Array.<number> | undefined

An array of weights typically in the range `[0,1]` that specify how much of the morph is applied. This member is `undefined` by default and only set when morph targets are detected in the geometry.

Default is `undefined`.

## Methods

### .getVertexPosition( index : number, target : Vector3 ) : Vector3

Returns the local-space position of the vertex at the given index, taking into account the current animation state of both morph targets and skinning.

**index**

The vertex index.

**target**

The target object that is used to store the method's result.

**Returns:** The vertex position in local space.

### .raycast( raycaster : Raycaster, intersects : Array.<Object> )

Computes intersection points between a casted ray and this line.

**raycaster**

The raycaster.

**intersects**

The target array that holds the intersection points.

**Overrides:** [Object3D#raycast](Object3D.html#raycast)

### .updateMorphTargets()

Sets the values of [Mesh#morphTargetDictionary](Mesh.html#morphTargetDictionary) and [Mesh#morphTargetInfluences](Mesh.html#morphTargetInfluences) to make sure existing morph targets can influence this 3D object.

## Source

[src/objects/Mesh.js](https://github.com/mrdoob/three.js/blob/master/src/objects/Mesh.js)