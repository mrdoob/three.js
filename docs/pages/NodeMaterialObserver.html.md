# NodeMaterialObserver

This class is used by [WebGPURenderer](WebGPURenderer.html) as management component. It's primary purpose is to determine whether render objects require a refresh right before they are going to be rendered or not.

## Constructor

### new NodeMaterialObserver( builder : NodeBuilder )

Constructs a new node material observer.

**builder**

The node builder.

## Properties

### .hasAnimation : boolean

Whether the node builder's 3D object is animated or not.

### .hasNode : boolean

Whether the material uses node objects or not.

### .refreshUniforms : Array.<string>

A list of all possible material uniforms

### .renderId : number

Holds the current render ID from the node frame.

Default is `0`.

### .renderObjects : WeakMap.<RenderObject, Object>

A node material can be used by more than one render object so the monitor must maintain a list of render objects.

## Methods

### .containsNode( builder : NodeBuilder ) : boolean

Returns `true` if the node builder's material uses node properties.

**builder**

The current node builder.

**Returns:** Whether the node builder's material uses node properties or not.

### .equals( renderObject : RenderObject, lightsData : Array.<Light>, renderId : number ) : boolean

Returns `true` if the given render object has not changed its state.

**renderObject**

The render object.

**lightsData**

The current material lights.

**renderId**

The current render ID.

**Returns:** Whether the given render object is equal to its cached state or not.

### .firstInitialization( renderObject : RenderObject ) : boolean

Returns `true` if the given render object is verified for the first time of this observer.

**renderObject**

The render object.

**Returns:** Whether the given render object is verified for the first time of this observer.

### .getAttributesData( attributes : Object ) : Object

Returns an attribute data structure holding the attributes versions for monitoring.

**attributes**

The geometry attributes.

**Returns:** An object for monitoring the versions of attributes.

### .getGeometryData( geometry : BufferGeometry ) : Object

Returns a geometry data structure holding the geometry property values for monitoring.

**geometry**

The geometry.

**Returns:** An object for monitoring geometry properties.

### .getLights( lightsNode : LightsNode, renderId : number ) : Array.<Object>

Returns the lights for the given lights node and render ID.

**lightsNode**

The lights node.

**renderId**

The render ID.

**Returns:** The lights for the given lights node and render ID.

### .getLightsData( materialLights : Array.<Light> ) : Array.<Object>

Returns the lights data for the given material lights.

**materialLights**

The material lights.

**Returns:** The lights data for the given material lights.

### .getMaterialData( material : Material ) : Object

Returns a material data structure holding the material property values for monitoring.

**material**

The material.

**Returns:** An object for monitoring material properties.

### .getRenderObjectData( renderObject : RenderObject ) : Object

Returns monitoring data for the given render object.

**renderObject**

The render object.

**Returns:** The monitoring data.

### .getTextureData( texture : Texture ) : Object

Returns a texture data structure holding the texture state for monitoring.

**texture**

The texture.

**Returns:** An object for monitoring the texture.

### .hasDynamicInstancing( object : Object3D ) : boolean

Returns `true` if the given 3D object uses instance buffers with dynamic draw usage. Such buffers must be uploaded once per render so the render object requires a full refresh.

**object**

The 3D object.

**Returns:** Whether the given 3D object uses instance buffers with dynamic draw usage or not.

### .needsRefresh( renderObject : RenderObject, nodeFrame : NodeFrame ) : number

Checks if the given render object requires a refresh.

**renderObject**

The render object.

**nodeFrame**

The current node frame.

**Returns:** The refresh type, see [RenderObjectRefreshType](global.html#RenderObjectRefreshType).

### .needsVelocity( renderer : Renderer ) : boolean

Returns `true` if the current rendering produces motion vectors.

**renderer**

The renderer.

**Returns:** Whether the current rendering produces motion vectors or not.

## Source

[src/materials/nodes/manager/NodeMaterialObserver.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/manager/NodeMaterialObserver.js)