# BufferGeometryUtils

## Import

BufferGeometryUtils is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
```

## Methods

### .computeMikkTSpaceTangents( geometry : BufferGeometry, MikkTSpace : Object, negateSign : boolean ) : BufferGeometry (inner)

Computes vertex tangents using the MikkTSpace algorithm. MikkTSpace generates the same tangents consistently, and is used in most modelling tools and normal map bakers. Use MikkTSpace for materials with normal maps, because inconsistent tangents may lead to subtle visual issues in the normal map, particularly around mirrored UV seams.

In comparison to this method, [BufferGeometry#computeTangents](BufferGeometry.html#computeTangents) (a custom algorithm) generates tangents that probably will not match the tangents in other software. The custom algorithm is sufficient for general use with a custom material, and may be faster than MikkTSpace.

Returns the original BufferGeometry. Indexed geometries will be de-indexed. Requires position, normal, and uv attributes.

**geometry**

The geometry to compute tangents for.

**MikkTSpace**

Instance of `examples/jsm/libs/mikktspace.module.js`, or `mikktspace` npm package. Await `MikkTSpace.ready` before use.

**negateSign**

Whether to negate the sign component (.w) of each tangent. Required for normal map conventions in some formats, including glTF.

Default is `true`.

**Returns:** The updated geometry.

### .computeMorphedAttributes( object : Mesh | Line | Points ) : Object (inner)

Calculates the morphed attributes of a morphed/skinned BufferGeometry.

Helpful for Raytracing or Decals (i.e. a `DecalGeometry` applied to a morphed Object with a `BufferGeometry` will use the original `BufferGeometry`, not the morphed/skinned one, generating an incorrect result. Using this function to create a shadow `Object3`D the `DecalGeometry` can be correctly generated).

**object**

The 3D object to compute morph attributes for.

**Returns:** An object with original position/normal attributes and morphed ones.

### .deepCloneAttribute( attribute : BufferAttribute ) : BufferAttribute (inner)

Performs a deep clone of the given buffer attribute.

**attribute**

The attribute to clone.

**Returns:** The cloned attribute.

### .deinterleaveAttribute( attribute : InterleavedBufferAttribute ) : BufferAttribute (inner)

Returns a new, non-interleaved version of the given attribute.

**attribute**

The interleaved attribute.

**Returns:** The non-interleaved attribute.

### .deinterleaveGeometry( geometry : BufferGeometry ) (inner)

Deinterleaves all attributes on the given geometry.

**geometry**

The geometry to deinterleave.

### .estimateBytesUsed( geometry : BufferGeometry ) : number (inner)

Returns the amount of bytes used by all attributes to represent the geometry.

**geometry**

The geometry.

**Returns:** The estimate bytes used.

### .interleaveAttributes( attributes : Array.<BufferAttribute> ) : Array.<InterleavedBufferAttribute> (inner)

Interleaves a set of attributes and returns a new array of corresponding attributes that share a single [InterleavedBuffer](InterleavedBuffer.html) instance. All attributes must have compatible types.

**attributes**

The attributes to interleave.

**Returns:** An array of interleaved attributes. If interleave does not succeed, the method returns `null`.

### .mergeAttributes( attributes : Array.<BufferAttribute> ) : BufferAttribute (inner)

Merges a set of attributes into a single instance. All attributes must have compatible properties and types. Instances of [InterleavedBufferAttribute](InterleavedBufferAttribute.html) are not supported.

**attributes**

The attributes to merge.

**Returns:** The merged attribute. Returns `null` if the merge does not succeed.

### .mergeGeometries( geometries : Array.<BufferGeometry>, useGroups : boolean ) : BufferGeometry (inner)

Merges a set of geometries into a single instance. All geometries must have compatible attributes.

**geometries**

The geometries to merge.

**useGroups**

Whether to use groups or not.

Default is `false`.

**Returns:** The merged geometry. Returns `null` if the merge does not succeed.

### .mergeGroups( geometry : BufferGeometry ) : BufferGeometry (inner)

Merges the [BufferGeometry#groups](BufferGeometry.html#groups) for the given geometry.

**geometry**

The geometry to modify.

**Returns:**

*   The updated geometry

### .mergeVertices( geometry : BufferGeometry, tolerance : number ) : BufferGeometry (inner)

Returns a new geometry with vertices for which all similar vertex attributes (within tolerance) are merged.

**geometry**

The geometry to merge vertices for.

**tolerance**

The tolerance value.

Default is `1e-4`.

**Returns:**

*   The new geometry with merged vertices.

### .toCreasedNormals( geometry : BufferGeometry, creaseAngle : number ) : BufferGeometry (inner)

Modifies the supplied geometry if it is non-indexed, otherwise creates a new, non-indexed geometry. Returns the geometry with smooth normals everywhere except faces that meet at an angle greater than the crease angle.

**geometry**

The geometry to modify.

**creaseAngle**

The crease angle in radians.

Default is `Math.PI/3`.

**Returns:**

*   The updated geometry

### .toTrianglesDrawMode( geometry : BufferGeometry, drawMode : number ) : BufferGeometry (inner)

Returns a new indexed geometry based on `TrianglesDrawMode` draw mode. This mode corresponds to the `gl.TRIANGLES` primitive in WebGL.

**geometry**

The geometry to convert.

**drawMode**

The current draw mode.

**Returns:** The new geometry using `TrianglesDrawMode`.

## Source

[examples/jsm/utils/BufferGeometryUtils.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/utils/BufferGeometryUtils.js)