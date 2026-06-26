*Inheritance: EventDispatcher →*

# BufferGeometry

A representation of mesh, line, or point geometry. Includes vertex positions, face indices, normals, colors, UVs, and custom attributes within buffers, reducing the cost of passing all this data to the GPU.

## Code Example

```js
const geometry = new THREE.BufferGeometry();
// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
const vertices = new Float32Array( [
	-1.0, -1.0,  1.0, // v0
	 1.0, -1.0,  1.0, // v1
	 1.0,  1.0,  1.0, // v2
	 1.0,  1.0,  1.0, // v3
	-1.0,  1.0,  1.0, // v4
	-1.0, -1.0,  1.0  // v5
] );
// itemSize = 3 because there are 3 values (components) per vertex
geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const mesh = new THREE.Mesh( geometry, material );
```

## Constructor

### new BufferGeometry()

Constructs a new geometry.

## Properties

### .attributes : Object.<string, (BufferAttribute|InterleavedBufferAttribute)>

This dictionary has as id the name of the attribute to be set and as value the buffer attribute to set it to. Rather than accessing this property directly, use `setAttribute()` and `getAttribute()` to access attributes of this geometry.

### .boundingBox : Box3

Bounding box for the geometry which can be calculated with `computeBoundingBox()`.

Default is `null`.

### .boundingSphere : Sphere

Bounding sphere for the geometry which can be calculated with `computeBoundingSphere()`.

Default is `null`.

### .drawRange : Object

Determines the part of the geometry to render. This should not be set directly, instead use `setDrawRange()`.

### .groups : Array.<Object>

Split the geometry into groups, each of which will be rendered in a separate draw call. This allows an array of materials to be used with the geometry.

Use `addGroup()` and `clearGroups()` to edit groups, rather than modifying this array directly.

Every vertex and index must belong to exactly one group — groups must not share vertices or indices, and must not leave vertices or indices unused.

### .id : number (readonly)

The ID of the geometry.

### .index : BufferAttribute

Allows for vertices to be re-used across multiple triangles; this is called using "indexed triangles". Each triangle is associated with the indices of three vertices. This attribute therefore stores the index of each vertex for each triangular face. If this attribute is not set, the renderer assumes that each three contiguous positions represent a single triangle.

Default is `null`.

### .indirect : BufferAttribute

A (storage) buffer attribute which was generated with a compute shader and now defines indirect draw calls.

Can only be used with [WebGPURenderer](WebGPURenderer.html) and a WebGPU backend.

Default is `null`.

### .indirectOffset : number | Array.<number>

The offset, in bytes, into the indirect drawing buffer where the value data begins. If an array is provided, multiple indirect draw calls will be made for each offset.

Can only be used with [WebGPURenderer](WebGPURenderer.html) and a WebGPU backend.

Default is `0`.

### .isBufferGeometry : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .morphAttributes : Object

This dictionary holds the morph targets of the geometry.

Note: Once the geometry has been rendered, the morph attribute data cannot be changed. You will have to call `dispose()`, and create a new geometry instance.

### .morphTargetsRelative : boolean

Used to control the morph target behavior; when set to `true`, the morph target data is treated as relative offsets, rather than as absolute positions/normals.

Default is `false`.

### .name : string

The name of the geometry.

### .userData : Object

An object that can be used to store custom data about the geometry. It should not hold references to functions as these will not be cloned.

### .uuid : string (readonly)

The UUID of the geometry.

## Methods

### .addGroup( start : number, count : number, materialIndex : number )

Adds a group to this geometry.

**start**

The first element in this draw call. That is the first vertex for non-indexed geometry, otherwise the first triangle index.

**count**

Specifies how many vertices (or indices) are part of this group.

**materialIndex**

The material array index to use.

Default is `0`.

### .applyMatrix4( matrix : Matrix4 ) : BufferGeometry

Applies the given 4x4 transformation matrix to the geometry.

**matrix**

The matrix to apply.

**Returns:** A reference to this instance.

### .applyQuaternion( q : Quaternion ) : BufferGeometry

Applies the rotation represented by the Quaternion to the geometry.

**q**

The Quaternion to apply.

**Returns:** A reference to this instance.

### .center() : BufferGeometry

Center the geometry based on its bounding box.

**Returns:** A reference to this instance.

### .clearGroups()

Clears all groups.

### .clone() : BufferGeometry

Returns a new geometry with copied values from this instance.

**Returns:** A clone of this instance.

### .computeBoundingBox()

Computes the bounding box of the geometry, and updates the `boundingBox` member. The bounding box is not computed by the engine; it must be computed by your app. You may need to recompute the bounding box if the geometry vertices are modified.

### .computeBoundingSphere()

Computes the bounding sphere of the geometry, and updates the `boundingSphere` member. The engine automatically computes the bounding sphere when it is needed, e.g., for ray casting or view frustum culling. You may need to recompute the bounding sphere if the geometry vertices are modified.

### .computeTangents()

Calculates and adds a tangent attribute to this geometry.

The computation is only supported for indexed geometries and if position, normal, and uv attributes are defined. When using a tangent space normal map, prefer the MikkTSpace algorithm provided by BufferGeometryUtils#computeMikkTSpaceTangents instead.

### .computeVertexNormals()

Computes vertex normals for the given vertex data. For indexed geometries, the method sets each vertex normal to be the average of the face normals of the faces that share that vertex. For non-indexed geometries, vertices are not shared, and the method sets each vertex normal to be the same as the face normal.

### .copy( source : BufferGeometry ) : BufferGeometry

Copies the values of the given geometry to this instance.

**source**

The geometry to copy.

**Returns:** A reference to this instance.

### .deleteAttribute( name : string ) : BufferGeometry

Deletes the attribute for the given name.

**name**

The attribute name to delete.

**Returns:** A reference to this instance.

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

##### Fires:

*   BufferGeometry#event:dispose

### .getAttribute( name : string ) : BufferAttribute | InterleavedBufferAttribute | undefined

Returns the buffer attribute for the given name.

**name**

The attribute name.

**Returns:** The buffer attribute. Returns `undefined` if not attribute has been found.

### .getIndex() : BufferAttribute

Returns the index of this geometry.

**Returns:** The index. Returns `null` if no index is defined.

### .getIndirect() : BufferAttribute

Returns the indirect attribute of this geometry.

**Returns:** The indirect attribute. Returns `null` if no indirect attribute is defined.

### .hasAttribute( name : string ) : boolean

Returns `true` if this geometry has an attribute for the given name.

**name**

The attribute name.

**Returns:** Whether this geometry has an attribute for the given name or not.

### .lookAt( vector : Vector3 ) : BufferGeometry

Rotates the geometry to face a point in 3D space. This is typically done as a one time operation, and not during a loop. Use [Object3D#lookAt](Object3D.html#lookAt) for typical real-time mesh rotation.

**vector**

The target point.

**Returns:** A reference to this instance.

### .normalizeNormals()

Ensures every normal vector in a geometry will have a magnitude of `1`. This will correct lighting on the geometry surfaces.

### .rotateX( angle : number ) : BufferGeometry

Rotates the geometry about the X axis. This is typically done as a one time operation, and not during a loop. Use [Object3D#rotation](Object3D.html#rotation) for typical real-time mesh rotation.

**angle**

The angle in radians.

**Returns:** A reference to this instance.

### .rotateY( angle : number ) : BufferGeometry

Rotates the geometry about the Y axis. This is typically done as a one time operation, and not during a loop. Use [Object3D#rotation](Object3D.html#rotation) for typical real-time mesh rotation.

**angle**

The angle in radians.

**Returns:** A reference to this instance.

### .rotateZ( angle : number ) : BufferGeometry

Rotates the geometry about the Z axis. This is typically done as a one time operation, and not during a loop. Use [Object3D#rotation](Object3D.html#rotation) for typical real-time mesh rotation.

**angle**

The angle in radians.

**Returns:** A reference to this instance.

### .scale( x : number, y : number, z : number ) : BufferGeometry

Scales the geometry. This is typically done as a one time operation, and not during a loop. Use [Object3D#scale](Object3D.html#scale) for typical real-time mesh rotation.

**x**

The x scale.

**y**

The y scale.

**z**

The z scale.

**Returns:** A reference to this instance.

### .setAttribute( name : string, attribute : BufferAttribute | InterleavedBufferAttribute ) : BufferGeometry

Sets the given attribute for the given name.

**name**

The attribute name.

**attribute**

The attribute to set.

**Returns:** A reference to this instance.

### .setDrawRange( start : number, count : number )

Sets the draw range for this geometry.

**start**

The first vertex for non-indexed geometry, otherwise the first triangle index.

**count**

For non-indexed BufferGeometry, `count` is the number of vertices to render. For indexed BufferGeometry, `count` is the number of indices to render.

### .setFromPoints( points : Array.<Vector2> | Array.<Vector3> ) : BufferGeometry

Defines a geometry by creating a `position` attribute based on the given array of points. The array can hold 2D or 3D vectors. When using two-dimensional data, the `z` coordinate for all vertices is set to `0`.

If the method is used with an existing `position` attribute, the vertex data are overwritten with the data from the array. The length of the array must match the vertex count.

**points**

The points.

**Returns:** A reference to this instance.

### .setIndex( index : Array.<number> | BufferAttribute ) : BufferGeometry

Sets the given index to this geometry.

**index**

The index to set.

**Returns:** A reference to this instance.

### .setIndirect( indirect : BufferAttribute, indirectOffset : number | Array.<number> ) : BufferGeometry

Sets the given indirect attribute to this geometry.

**indirect**

The attribute holding indirect draw calls.

**indirectOffset**

The offset, in bytes, into the indirect drawing buffer where the value data begins. If an array is provided, multiple indirect draw calls will be made for each offset.

Default is `0`.

**Returns:** A reference to this instance.

### .toJSON() : Object

Serializes the geometry into JSON.

**Returns:** A JSON object representing the serialized geometry.

### .toNonIndexed() : BufferGeometry

Return a new non-index version of this indexed geometry. If the geometry is already non-indexed, the method is a NOOP.

**Returns:** The non-indexed version of this indexed geometry.

### .translate( x : number, y : number, z : number ) : BufferGeometry

Translates the geometry. This is typically done as a one time operation, and not during a loop. Use [Object3D#position](Object3D.html#position) for typical real-time mesh rotation.

**x**

The x offset.

**y**

The y offset.

**z**

The z offset.

**Returns:** A reference to this instance.

## Source

[src/core/BufferGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/core/BufferGeometry.js)