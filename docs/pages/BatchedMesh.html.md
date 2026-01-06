*Inheritance: EventDispatcher → Object3D → Mesh →*

# BatchedMesh

A special version of a mesh with multi draw batch rendering support. Use this class if you have to render a large number of objects with the same material but with different geometries or world transformations. The usage of `BatchedMesh` will help you to reduce the number of draw calls and thus improve the overall rendering performance in your application.

## Code Example

```js
const box = new THREE.BoxGeometry( 1, 1, 1 );
const sphere = new THREE.SphereGeometry( 1, 12, 12 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// initialize and add geometries into the batched mesh
const batchedMesh = new BatchedMesh( 10, 5000, 10000, material );
const boxGeometryId = batchedMesh.addGeometry( box );
const sphereGeometryId = batchedMesh.addGeometry( sphere );
// create instances of those geometries
const boxInstancedId1 = batchedMesh.addInstance( boxGeometryId );
const boxInstancedId2 = batchedMesh.addInstance( boxGeometryId );
const sphereInstancedId1 = batchedMesh.addInstance( sphereGeometryId );
const sphereInstancedId2 = batchedMesh.addInstance( sphereGeometryId );
// position the geometries
batchedMesh.setMatrixAt( boxInstancedId1, boxMatrix1 );
batchedMesh.setMatrixAt( boxInstancedId2, boxMatrix2 );
batchedMesh.setMatrixAt( sphereInstancedId1, sphereMatrix1 );
batchedMesh.setMatrixAt( sphereInstancedId2, sphereMatrix2 );
scene.add( batchedMesh );
```

## Constructor

### new BatchedMesh( maxInstanceCount : number, maxVertexCount : number, maxIndexCount : number, material : Material | Array.<Material> )

Constructs a new batched mesh.

**maxInstanceCount**

The maximum number of individual instances planned to be added and rendered.

**maxVertexCount**

The maximum number of vertices to be used by all unique geometries.

**maxIndexCount**

The maximum number of indices to be used by all unique geometries

Default is `maxVertexCount*2`.

**material**

The mesh material.

## Properties

### .boundingBox : Box3

The bounding box of the batched mesh. Can be computed via [BatchedMesh#computeBoundingBox](BatchedMesh.html#computeBoundingBox).

Default is `null`.

### .boundingSphere : Sphere

The bounding sphere of the batched mesh. Can be computed via [BatchedMesh#computeBoundingSphere](BatchedMesh.html#computeBoundingSphere).

Default is `null`.

### .customSort : function

Takes a sort a function that is run before render. The function takes a list of instances to sort and a camera. The objects in the list include a "z" field to perform a depth-ordered sort with.

Default is `null`.

### .instanceCount : number (readonly)

The instance count.

### .isBatchedMesh : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .maxInstanceCount : number (readonly)

The maximum number of individual instances that can be stored in the batch.

### .perObjectFrustumCulled : boolean

When set ot `true`, the individual objects of a batch are frustum culled.

Default is `true`.

### .sortObjects : boolean

When set to `true`, the individual objects of a batch are sorted to improve overdraw-related artifacts. If the material is marked as "transparent" objects are rendered back to front and if not then they are rendered front to back.

Default is `true`.

### .unusedIndexCount : number (readonly)

The number of unused indices.

### .unusedVertexCount : number (readonly)

The number of unused vertices.

## Methods

### .addGeometry( geometry : BufferGeometry, reservedVertexCount : number, reservedIndexCount : number ) : number

Adds the given geometry to the batch and returns the associated geometry id referring to it to be used in other functions.

**geometry**

The geometry to add.

**reservedVertexCount**

Optional parameter specifying the amount of vertex buffer space to reserve for the added geometry. This is necessary if it is planned to set a new geometry at this index at a later time that is larger than the original geometry. Defaults to the length of the given geometry vertex buffer.

Default is `-1`.

**reservedIndexCount**

Optional parameter specifying the amount of index buffer space to reserve for the added geometry. This is necessary if it is planned to set a new geometry at this index at a later time that is larger than the original geometry. Defaults to the length of the given geometry index buffer.

Default is `-1`.

**Returns:** The geometry ID.

### .addInstance( geometryId : number ) : number

Adds a new instance to the batch using the geometry of the given ID and returns a new id referring to the new instance to be used by other functions.

**geometryId**

The ID of a previously added geometry via [BatchedMesh#addGeometry](BatchedMesh.html#addGeometry).

**Returns:** The instance ID.

### .computeBoundingBox()

Computes the bounding box, updating [BatchedMesh#boundingBox](BatchedMesh.html#boundingBox). Bounding boxes aren't computed by default. They need to be explicitly computed, otherwise they are `null`.

### .computeBoundingSphere()

Computes the bounding sphere, updating [BatchedMesh#boundingSphere](BatchedMesh.html#boundingSphere). Bounding spheres aren't computed by default. They need to be explicitly computed, otherwise they are `null`.

### .deleteGeometry( geometryId : number ) : BatchedMesh

Deletes the geometry defined by the given ID from this batch. Any instances referencing this geometry will also be removed as a side effect.

**geometryId**

The ID of the geometry to remove from the batch.

**Returns:** A reference to this batched mesh.

### .deleteInstance( instanceId : number ) : BatchedMesh

Deletes an existing instance from the batch using the given ID.

**instanceId**

The ID of the instance to remove from the batch.

**Returns:** A reference to this batched mesh.

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .getBoundingBoxAt( geometryId : number, target : Box3 ) : Box3

Returns the bounding box for the given geometry.

**geometryId**

The ID of the geometry to return the bounding box for.

**target**

The target object that is used to store the method's result.

**Returns:** The geometry's bounding box. Returns `null` if no geometry has been found for the given ID.

### .getBoundingSphereAt( geometryId : number, target : Sphere ) : Sphere

Returns the bounding sphere for the given geometry.

**geometryId**

The ID of the geometry to return the bounding sphere for.

**target**

The target object that is used to store the method's result.

**Returns:** The geometry's bounding sphere. Returns `null` if no geometry has been found for the given ID.

### .getColorAt( instanceId : number, color : Color ) : Color

Returns the color of the defined instance.

**instanceId**

The ID of an instance to get the color of.

**color**

The target object that is used to store the method's result.

**Returns:** The instance's color.

### .getGeometryIdAt( instanceId : number ) : number

Returns the geometry ID of the defined instance.

**instanceId**

The ID of an instance to get the geometry ID of.

**Returns:** The instance's geometry ID.

### .getGeometryRangeAt( geometryId : number, target : Object ) : Object

Get the range representing the subset of triangles related to the attached geometry, indicating the starting offset and count, or `null` if invalid.

**geometryId**

The id of the geometry to get the range of.

**target**

The target object that is used to store the method's result.

**Returns:** The result object with range data.

### .getMatrixAt( instanceId : number, matrix : Matrix4 ) : Matrix4

Returns the local transformation matrix of the defined instance.

**instanceId**

The ID of an instance to get the matrix of.

**matrix**

The target object that is used to store the method's result.

**Returns:** The instance's local transformation matrix.

### .getVisibleAt( instanceId : number ) : boolean

Returns the visibility state of the defined instance.

**instanceId**

The ID of an instance to get the visibility state of.

**Returns:** Whether the instance is visible or not.

### .optimize() : BatchedMesh

Repacks the sub geometries in BatchedMesh to remove any unused space remaining from previously deleted geometry, freeing up space to add new geometry.

**Returns:** A reference to this batched mesh.

### .setColorAt( instanceId : number, color : Color ) : BatchedMesh

Sets the given color to the defined instance.

**instanceId**

The ID of an instance to set the color of.

**color**

The color to set the instance to.

**Returns:** A reference to this batched mesh.

### .setCustomSort( func : function ) : BatchedMesh

Takes a sort a function that is run before render. The function takes a list of instances to sort and a camera. The objects in the list include a "z" field to perform a depth-ordered sort with.

**func**

The custom sort function.

**Returns:** A reference to this batched mesh.

### .setGeometryAt( geometryId : number, geometry : BufferGeometry ) : number

Replaces the geometry at the given ID with the provided geometry. Throws an error if there is not enough space reserved for geometry. Calling this will change all instances that are rendering that geometry.

**geometryId**

The ID of the geometry that should be replaced with the given geometry.

**geometry**

The new geometry.

**Returns:** The geometry ID.

### .setGeometryIdAt( instanceId : number, geometryId : number ) : BatchedMesh

Sets the geometry ID of the instance at the given index.

**instanceId**

The ID of the instance to set the geometry ID of.

**geometryId**

The geometry ID to be use by the instance.

**Returns:** A reference to this batched mesh.

### .setGeometrySize( maxVertexCount : number, maxIndexCount : number )

Resizes the available space in the batch's vertex and index buffer attributes to the provided sizes. If the provided arguments shrink the geometry buffers but there is not enough unused space at the end of the geometry attributes then an error is thrown.

**maxVertexCount**

The maximum number of vertices to be used by all unique geometries to resize to.

**maxIndexCount**

The maximum number of indices to be used by all unique geometries to resize to.

### .setInstanceCount( maxInstanceCount : number )

Resizes the necessary buffers to support the provided number of instances. If the provided arguments shrink the number of instances but there are not enough unused Ids at the end of the list then an error is thrown.

**maxInstanceCount**

The max number of individual instances that can be added and rendered by the batch.

### .setMatrixAt( instanceId : number, matrix : Matrix4 ) : BatchedMesh

Sets the given local transformation matrix to the defined instance. Negatively scaled matrices are not supported.

**instanceId**

The ID of an instance to set the matrix of.

**matrix**

A 4x4 matrix representing the local transformation of a single instance.

**Returns:** A reference to this batched mesh.

### .setVisibleAt( instanceId : number, visible : boolean ) : BatchedMesh

Sets the visibility of the instance.

**instanceId**

The id of the instance to set the visibility of.

**visible**

Whether the instance is visible or not.

**Returns:** A reference to this batched mesh.

### .validateGeometryId( geometryId : number )

Validates the geometry defined by the given ID.

**geometryId**

The geometry to validate.

### .validateInstanceId( instanceId : number )

Validates the instance defined by the given ID.

**instanceId**

The instance to validate.

## Source

[src/objects/BatchedMesh.js](https://github.com/mrdoob/three.js/blob/master/src/objects/BatchedMesh.js)