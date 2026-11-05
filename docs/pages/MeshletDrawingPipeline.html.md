*Inheritance: StandardDrawingPipeline →*

# MeshletDrawingPipeline

A GPU-driven drawing pipeline that renders compatible meshes as meshlets. Geometries are processed once into clusters (meshlets) of 64 triangles with a chain of simplified levels of detail. Every frame, compute shaders select the level of detail per object and cull the objects and clusters against the frustum, and the visible clusters of all objects sharing geometry and material are drawn in one indirect draw through the hardware rasterizer.

The node graph of the material is evaluated on the pulled vertices (position, normal, model matrices and the attributes of the geometry), so custom nodes, lights, shadows and the environment work as usual. Supported are opaque and alpha-tested meshes using front side rendering whose material nodes don't change the geometry, the coverage or the output of the draw. All other objects, and all objects in render calls using a custom render object function like shadow passes, are drawn by the regular pipeline. Objects are drawn by the regular pipeline until their geometry is processed. Objects affected by clipping planes use the regular pipeline, including their depth-only passes. Material properties are read from the source material, so uniform changes do not require rebuilding the batches. Meshlets are regenerated when geometry attributes or indices are replaced or marked `needsUpdate`. Meshes with an array of materials are processed per geometry group, with separate meshlets and levels of detail for each index range. Compatible groups use the GPU-driven pipeline while the other groups use the regular pipeline. Meshlets of a group are shared by all meshes using the same geometry and range. The batches of the groups of the same objects share the transforms and instance data of the objects, which are uploaded once.

The transforms of the objects are compared with the last upload, only the objects and instances which changed are uploaded. Objects exceeding [MeshletDrawingPipeline#maxInstances](MeshletDrawingPipeline.html#maxInstances) are drawn by the regular pipeline: static bundle groups and the objects drawn by the GPU-driven pipeline in the last frames have precedence.

Positions deformed by the context of the render call, like a curved world in the context of a pass, are culled by the bounds of the deformed positions which the context provides with a `getBoundingSphere( sphere, cameraPosition )` function: it receives the bounding sphere in world space ( `vec4` center and radius ) and returns the bounding sphere of the deformed positions. Cone culling is disabled, shadow passes use the real positions.

```js
scenePass.contextNode = overrideNodes( [ [ modelViewProjection, curvedProjection ] ], context( {
	getBoundingSphere: ( sphere, cameraPosition ) => curvedSphere( sphere, cameraPosition )
} ) );
```

MRT outputs of the render call and of the materials are evaluated like for the regular meshes. The matrices of the objects in the previous frame are kept on the GPU, so the velocity of temporal effects like TRAA includes the motion of the objects and the instances.

Objects are culled on the GPU, but the CPU still traverses the scene and uploads the transforms every frame. The content of a static [BundleGroup](BundleGroup.html) is kept on the GPU instead: the group is captured once, the transforms of its meshes are uploaded once and the group is not traversed again until `needsUpdate` is set. Changes inside of the group, like transforms or added objects, require `needsUpdate` as with render bundles.

```js
renderer.drawingPipeline = new MeshletDrawingPipeline();
const city = new BundleGroup();
city.add( ...buildings );
scene.add( city );
```

This class is experimental and its interface might change.

## Constructor

### new MeshletDrawingPipeline( parameters : Object )

Constructs a new meshlet drawing pipeline.

**parameters**

The configuration parameter.

**lodThreshold**

The projected error in pixels below which a simpler level of detail is selected.

Default is `1`.

**shadowLodThreshold**

The projected error in shadow map texels below which a simpler level of detail is selected for shadow casters.

Default is `1`.

**minScreenRadius**

The radius in pixels below which objects are not drawn, `0` draws all objects.

Default is `0`.

**coarseScreenRadius**

The radius in pixels below which objects are drawn with their simplest level of detail.

Default is `0`.

**debug**

Whether the clusters should be shown with a flat color each instead of the material.

Default is `false`.

**occlusionCulling**

Whether the clusters hidden by other clusters should be culled.

Default is `true`.

**depthPrepass**

Whether the depth of the clusters should be drawn before their material.

Default is `false`.

## Properties

### .coarseScreenRadius : number

The radius of the bounding sphere of objects on the screen in pixels, or in shadow map texels for shadow casters, below which they are drawn with their simplest level of detail, independent of the projected error. `0` selects the level by the projected error only.

Default is `0`.

### .debug : boolean

Whether the clusters (meshlets) of the objects drawn by the GPU-driven pipeline should be shown with a flat color each, instead of shading them with their material. Each object uses different colors, and the clusters of all levels of detail are distinct.

Default is `false`.

### .depthPrepass : boolean

Whether the depth of the clusters drawn by the hardware rasterizer should be drawn before their material, so the material is only evaluated once per pixel. Reduces the overdraw of expensive materials at the cost of drawing the clusters twice.

Default is `false`.

### .info : Object (readonly)

The clusters and triangles drawn by the GPU-driven pipeline in the main view, read from the counters of the culling without waiting for the GPU. The values are updated every interval of frames, the triangles include the degenerate triangles which pad the clusters.

### .isMeshletDrawingPipeline : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .lodThreshold : number

The projected error in pixels below which a simpler level of detail is selected.

Default is `1`.

### .maxInstances : number (readonly)

The maximum number of objects drawn by the GPU-driven pipeline per render list. The instances of instanced meshes count as objects, once per geometry group. Limited by the maximum size of a storage buffer binding: the world matrices of the objects and of the last frame use 128 bytes per object.

### .minScreenRadius : number

The radius of the bounding sphere of objects on the screen in pixels, or in shadow map texels for shadow casters, below which they are not drawn. Small objects contribute few pixels, culling them saves the work of their clusters. `0` draws all objects.

Default is `0`.

### .occlusionCulling : boolean

Whether the clusters hidden by other clusters of the GPU-driven pipeline should be culled. The clusters visible in the last frame are rendered into a depth buffer first, the other clusters are tested against its hierarchical depth. Shadow passes are not occlusion culled.

Default is `true`.

### .shadowLodThreshold : number

The projected error in shadow map texels below which a simpler level of detail is selected for the shadow casters. The level of detail of shadow passes doesn't depend on the camera, so shadow maps which are not updated every frame stay valid when the camera moves.

Default is `1`.

## Methods

### ._getBatchKey( clusters : Object ) : any

Returns the key of the batch drawing objects of the given geometry: the geometries with the same layout of the vertex data share the batches of a material, their vertices are read from the geometry pool.

**clusters**

The cluster data of the geometry.

**Returns:** The key.

### .createBatch( entry : Object, capacity : number, view : Object, culling : MeshletCulling ) : MeshletBatch

Creates the batch drawing the objects of the given entry.

**entry**

The objects sharing geometry, material and shadow state.

**capacity**

The maximum number of objects.

**view**

The view of the render list.

**culling**

The culling of the render list.

**Returns:** The batch.

### .createView( width : number, height : number, occlusion : boolean, shadow : boolean, clusterBudget : number ) : Object

Creates the view of a render list.

**width**

The width of the view in pixels.

**height**

The height of the view in pixels.

**occlusion**

Whether the clusters are occlusion culled.

**shadow**

Whether the culling draws a shadow map.

**clusterBudget**

The measured number of clusters of the visible objects.

Default is `0`.

**Returns:** The view, or `null` if the draw doesn't need one.

### .dispose()

Frees the GPU-related resources of the pipeline: the cullings, batches and views of all render lists and the geometry pool. Called by [Renderer#dispose](Renderer.html#dispose). The pipeline can be used again, the resources are created again.

**Overrides:** [StandardDrawingPipeline#dispose](StandardDrawingPipeline.html#dispose)

### .prepareAsync( scene : Object3D, camera : Camera ) : Promise (async)

Prepares the meshlets and geometry LODs before `Renderer.compileAsync()` projects the scene. Shared geometries are processed once, including meshes outside the frustum. Batches and their render and compute pipelines are then prepared by the renderer.

**scene**

The scene or object to precompile.

**camera**

The camera.

**Overrides:** [StandardDrawingPipeline#prepareAsync](StandardDrawingPipeline.html#prepareAsync)

**Returns:** Resolves when the meshlets are ready.

### .updateView( record : Object, width : number, height : number ) : Object

Prepares the view of the given render list, for pipelines using screen-space resources.

**record**

The record of the render list.

**width**

The width of the view in pixels.

**height**

The height of the view in pixels.

**Returns:** The view, or `null` if the draw doesn't need one.

## Source

[examples/jsm/pipelines/MeshletDrawingPipeline.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/pipelines/MeshletDrawingPipeline.js)