# Sculptor

Sculpts triangle meshes with adaptive topology.

Replaces `mesh.geometry` with a welded geometry containing positions, normals and indices. The source geometry is unchanged and is not disposed.

The mesh must use one material and a non-zero uniform world scale without shear. Skinned, instanced and batched meshes are not supported.

Sculptor manages bounds, draw range and spare buffer capacity. Geometry and attributes may be replaced as capacity changes; do not cache them. Use [Sculptor#getGeometry](Sculptor.html#getGeometry) for a compact copy for export or geometry processing.

## Code Example

```js
const sculptor = new Sculptor( mesh, camera )
	.setTool( 'inflate' )
	.setSize( 75 )
	.setStrength( 0.3 );
sculptor.connect( renderer.domElement );
```

## Import

Sculptor is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { Sculptor } from 'three/addons/misc/Sculptor.js';
```

## Constructor

### new Sculptor( mesh : Mesh, camera : Camera )

**mesh**

The mesh to sculpt.

**camera**

The camera used for pointer picking.

## Properties

### .camera : Camera

The camera used for pointer picking.

### .domElement : HTMLElement

The element receiving pointer events, or `null` while disconnected.

Default is `null`.

### .enabled : boolean

Whether pointer input is enabled. Does not affect programmatic strokes.

Default is `true`.

### .mesh : Mesh (readonly)

The mesh being sculpted.

## Methods

### .beginStroke() : Sculptor

Begins a stroke and fires `start`. Does nothing while a stroke is active. Called automatically by pointer input or the first successful ray stamp.

**Returns:** A reference to this sculptor.

### .connect( element : HTMLElement )

Connects pointer input to a DOM element.

**element**

The element receiving pointer events.

### .disconnect()

Disconnects pointer input and finishes the active stroke.

### .dispose()

Disconnects the sculptor. The mesh and its geometry are not disposed.

### .endStroke() : Sculptor

Releases pointer capture, balances the octree and updates exact bounds, then fires `end`. Does nothing while idle. Called automatically when a pointer stroke ends or is cancelled.

**Returns:** A reference to this sculptor.

### .getDetail() : number

Returns the adaptive-topology detail. `0` freezes topology.

**Returns:** The detail level.

### .getGeometry() : BufferGeometry

Returns an independent copy of the active vertices and triangles, without spare capacity. Suitable for export or geometry processing. The caller owns it.

**Returns:** A new geometry containing the active vertices and triangles.

### .getHitNormal( target : Vector3 ) : Vector3

Copies the current local-space unit surface normal into the target vector. Returns a zero vector when there is no hit.

**target**

The vector to receive the surface normal.

**Returns:** The target vector.

### .getHitPoint( target : Vector3 ) : Vector3

Copies the current local-space hit position into the target vector. Returns a zero vector when there is no hit.

**target**

The vector to receive the hit position.

**Returns:** The target vector.

### .getNegative() : boolean

Returns whether the active tool applies its inverse effect.

**Returns:** Whether the tool direction is inverted.

### .getSize() : number

Returns the pointer brush radius in CSS pixels.

**Returns:** The brush radius.

### .getStrength() : number

Returns the strength of the active tool.

**Returns:** The tool strength.

### .getTool() : 'clay' | 'brush' | 'inflate' | 'smooth' | 'flatten' | 'pinch' | 'crease' | 'drag' | 'scale'

Returns the active sculpting tool.

**Returns:** The tool name.

### .getWorldRadius() : number

Returns the brush radius in world units, or `0` without a hit.

**Returns:** The brush radius in world units.

### .hasHit() : boolean

Returns whether the latest pick or stroke ray hit the mesh.

**Returns:** Whether the latest ray hit the mesh.

### .isSculpting() : boolean

Returns whether a pointer or programmatic stroke is active.

**Returns:** Whether a stroke is active.

### .pickFromPointer( clientX : number, clientY : number ) : boolean

Updates the current hit from client coordinates without sculpting.

**clientX**

Horizontal client coordinate in CSS pixels.

**clientY**

Vertical client coordinate in CSS pixels.

**Returns:** Whether the pointer ray hit the mesh.

### .pickFromRay( ray : Ray, worldRadius : number ) : boolean

Updates the current hit from a world-space ray without sculpting.

**ray**

The world-space ray, with a non-zero direction.

**worldRadius**

The brush radius in world units.

**Returns:** Whether the ray hit the mesh.

### .setDetail( value : number ) : Sculptor

Sets the adaptive-topology detail. Higher values produce shorter edges relative to the brush radius; `0` freezes topology. Remeshing splits long edges and collapses short ones, and can alter the surface even at zero strength.

**value**

A value between 0 and 1.

**Returns:** A reference to this sculptor.

### .setNegative( value : boolean ) : Sculptor

Sets whether the active tool applies its inverse effect.

**value**

Whether the tool direction is inverted.

**Returns:** A reference to this sculptor.

### .setSize( value : number ) : Sculptor

Sets the pointer brush radius in CSS pixels.

**value**

A value between 5 and 500.

**Returns:** A reference to this sculptor.

### .setStrength( value : number ) : Sculptor

Sets the strength of the active tool. A value of `0` disables deformation, but not adaptive remeshing. Drag and Scale use pointer movement instead of this setting.

**value**

A value between 0 and 1.

**Returns:** A reference to this sculptor.

### .setTool( value : 'clay' | 'brush' | 'inflate' | 'smooth' | 'flatten' | 'pinch' | 'crease' | 'drag' | 'scale' ) : Sculptor

Selects a tool and restores its size, strength and negative setting.

**value**

The tool name.

**Returns:** A reference to this sculptor.

### .strokeFromRay( ray : Ray, worldRadius : number ) : boolean

Applies a ray stamp, starting a stroke on a hit. Call [Sculptor#endStroke](Sculptor.html#endStroke) after the last stamp.

Returns `false` without updating the hit during a pointer stroke. Drag and Scale require pointer input.

**ray**

The world-space ray, with a non-zero direction.

**worldRadius**

The brush radius in world units.

**Returns:** Whether the ray hit the mesh.

## Events

### .change

Fires after the sculpt geometry has been updated.

##### Type:

*   Object

### .end

Fires after the active stroke finishes and exact bounds are up to date.

##### Type:

*   Object

### .start

Fires when a pointer or programmatic stroke begins.

##### Type:

*   Object

## Source

[examples/jsm/misc/Sculptor.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/misc/Sculptor.js)