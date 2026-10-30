*Inheritance: StandardDrawingPipeline → MeshletDrawingPipeline →*

# VisibilityBufferDrawingPipeline

A meshlet drawing pipeline with a hybrid rasterizer. Like [MeshletDrawingPipeline](MeshletDrawingPipeline.html), compute shaders select the level of detail and cull objects and clusters, but the visible clusters are rasterized into a visibility buffer: small triangles in software by a compute shader, large triangles by the hardware rasterizer. A resolve pass shades the visibility buffer with the material of the meshes: its node graph is evaluated on the reconstructed surface (position, normal, model matrices and the attributes of the geometry) with analytic derivatives, so custom nodes, lights, shadows and the environment work as usual and the meshes depth test against other objects.

The visibility buffer stores the triangle in 16 bits, so only the levels of detail whose triangles fit into this range are used. Geometries whose most detailed level doesn't fit are drawn by the hardware pipeline of [MeshletDrawingPipeline](MeshletDrawingPipeline.html). The resolve only writes the color, so render calls with MRT, like the velocity of TRAA, draw all clusters with the hardware pipeline. The position node of the material is evaluated per corner of the triangles by the software rasterizer and by the resolve.

This class is experimental and its interface might change.

## Code Example

```js
renderer.drawingPipeline = new VisibilityBufferDrawingPipeline();
```

## Constructor

### new VisibilityBufferDrawingPipeline( parameters : Object )

Constructs a new visibility buffer drawing pipeline.

**parameters**

The configuration parameter.

**lodThreshold**

The projected error in pixels below which a simpler level of detail is selected.

Default is `1`.

**shadowLodThreshold**

The projected error in shadow map texels below which a simpler level of detail is selected for shadow casters.

Default is `1`.

**maxRasterSize**

The maximum screen-space size in pixels of triangles rasterized in software.

Default is `8`.

**debug**

Whether the clusters should be shown with a flat color each instead of the material.

Default is `false`.

**occlusionCulling**

Whether the clusters hidden by other clusters should be culled.

Default is `true`.

## Properties

### .maxInstances : number (readonly)

The maximum number of objects per render list, limited by the instance index of the visibility buffer.

**Overrides:** [MeshletDrawingPipeline#maxInstances](MeshletDrawingPipeline.html#maxInstances)

### .maxRasterSize : number

The maximum screen-space size in pixels of triangles rasterized in software. Larger triangles are drawn by the hardware rasterizer. The software rasterizer loops over the pixels of a triangle in one thread, so it only pays off for small triangles.

Default is `8`.

## Methods

### ._getBatchKey( clusters : Object ) : Object

The batches of the software rasterizer index the triangles of one geometry, each geometry has its own batches.

**clusters**

The cluster data of the geometry.

**Overrides:** [MeshletDrawingPipeline#\_getBatchKey](MeshletDrawingPipeline.html#_getBatchKey)

**Returns:** The key.

## Source

[examples/jsm/pipelines/VisibilityBufferDrawingPipeline.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/pipelines/VisibilityBufferDrawingPipeline.js)