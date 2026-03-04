*Inheritance: EventDispatcher → Object3D → Mesh →*

# InstancedMesh

A special version of a mesh with instanced rendering support. Use this class if you have to render a large number of objects with the same geometry and material(s) but with different world transformations. The usage of 'InstancedMesh' will help you to reduce the number of draw calls and thus improve the overall rendering performance in your application.

## Constructor

### new InstancedMesh( geometry : BufferGeometry, material : Material | Array.<Material>, count : number )

Constructs a new instanced mesh.

**geometry**

The mesh geometry.

**material**

The mesh material.

**count**

The number of instances.

## Properties

### .boundingBox : Box3

The bounding box of the instanced mesh. Can be computed via [InstancedMesh#computeBoundingBox](InstancedMesh.html#computeBoundingBox).

Default is `null`.

### .boundingSphere : Sphere

The bounding sphere of the instanced mesh. Can be computed via [InstancedMesh#computeBoundingSphere](InstancedMesh.html#computeBoundingSphere).

Default is `null`.

### .count : number

The number of instances.

**Overrides:** [Mesh#count](Mesh.html#count)

### .instanceColor : InstancedBufferAttribute

Represents the color of all instances. You have to set its [BufferAttribute#needsUpdate](BufferAttribute.html#needsUpdate) flag to true if you modify instanced data via [InstancedMesh#setColorAt](InstancedMesh.html#setColorAt).

Default is `null`.

### .instanceMatrix : InstancedBufferAttribute

Represents the local transformation of all instances. You have to set its [BufferAttribute#needsUpdate](BufferAttribute.html#needsUpdate) flag to true if you modify instanced data via [InstancedMesh#setMatrixAt](InstancedMesh.html#setMatrixAt).

### .isInstancedMesh : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .morphTexture : DataTexture

Represents the morph target weights of all instances. You have to set its [Texture#needsUpdate](Texture.html#needsUpdate) flag to true if you modify instanced data via [InstancedMesh#setMorphAt](InstancedMesh.html#setMorphAt).

Default is `null`.

### .previousInstanceMatrix : InstancedBufferAttribute

Represents the local transformation of all instances of the previous frame. Required for computing velocity. Maintained in [InstanceNode](InstanceNode.html).

Default is `null`.

## Methods

### .computeBoundingBox()

Computes the bounding box of the instanced mesh, and updates [InstancedMesh#boundingBox](InstancedMesh.html#boundingBox). The bounding box is not automatically computed by the engine; this method must be called by your app. You may need to recompute the bounding box if an instance is transformed via [InstancedMesh#setMatrixAt](InstancedMesh.html#setMatrixAt).

### .computeBoundingSphere()

Computes the bounding sphere of the instanced mesh, and updates [InstancedMesh#boundingSphere](InstancedMesh.html#boundingSphere) The engine automatically computes the bounding sphere when it is needed, e.g., for ray casting or view frustum culling. You may need to recompute the bounding sphere if an instance is transformed via [InstancedMesh#setMatrixAt](InstancedMesh.html#setMatrixAt).

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .getColorAt( index : number, color : Color )

Gets the color of the defined instance.

**index**

The instance index.

**color**

The target object that is used to store the method's result.

### .getMatrixAt( index : number, matrix : Matrix4 )

Gets the local transformation matrix of the defined instance.

**index**

The instance index.

**matrix**

The target object that is used to store the method's result.

### .getMorphAt( index : number, object : Mesh )

Gets the morph target weights of the defined instance.

**index**

The instance index.

**object**

The target object that is used to store the method's result.

### .setColorAt( index : number, color : Color )

Sets the given color to the defined instance. Make sure you set the `needsUpdate` flag of [InstancedMesh#instanceColor](InstancedMesh.html#instanceColor) to `true` after updating all the colors.

**index**

The instance index.

**color**

The instance color.

### .setMatrixAt( index : number, matrix : Matrix4 )

Sets the given local transformation matrix to the defined instance. Make sure you set the `needsUpdate` flag of [InstancedMesh#instanceMatrix](InstancedMesh.html#instanceMatrix) to `true` after updating all the colors.

**index**

The instance index.

**matrix**

The local transformation.

### .setMorphAt( index : number, object : Mesh )

Sets the morph target weights to the defined instance. Make sure you set the `needsUpdate` flag of [InstancedMesh#morphTexture](InstancedMesh.html#morphTexture) to `true` after updating all the influences.

**index**

The instance index.

**object**

A mesh which `morphTargetInfluences` property containing the morph target weights of a single instance.

## Source

[src/objects/InstancedMesh.js](https://github.com/mrdoob/three.js/blob/master/src/objects/InstancedMesh.js)