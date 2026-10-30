# StandardDrawingPipeline

Decides which objects of a scene are rendered and how they are submitted to the render list. The default implementation performs frustum culling and pushes every renderable object as a separate render item. Subclasses can override the hooks [StandardDrawingPipeline#isCulled](StandardDrawingPipeline.html#isCulled) and [StandardDrawingPipeline#pushRenderItem](StandardDrawingPipeline.html#pushRenderItem) to implement other strategies like GPU-driven rendering.

This class is experimental and its interface might change.

## Constructor

### new StandardDrawingPipeline()

Constructs a new standard drawing pipeline.

## Properties

### ._bundleDepth : number (protected)

The number of render bundles being recorded in the current projection.

Default is `0`.

### ._frustum : Frustum (protected)

The frustum of the current camera.

### ._frustumArray : FrustumArray (protected)

The frustum array of the current array camera, kept by the render context.

Default is `null`.

### ._projScreenMatrix : Matrix4 (protected)

The view projection matrix of the current camera.

### .renderer : Renderer

The renderer this pipeline is assigned to. It is set when the pipeline is assigned via [Renderer#drawingPipeline](Renderer.html#drawingPipeline).

Default is `null`.

## Methods

### .begin( camera : Camera, renderContext : RenderContext )

Prepares the pipeline for projecting a scene with the given camera.

**camera**

The camera.

**renderContext**

The render context.

### .beginRenderList( renderList : RenderList )

Begins the projection into the given render list.

**renderList**

The render list.

### .dispose()

Frees the resources of the pipeline. Called by [Renderer#dispose](Renderer.html#dispose), subclasses holding GPU resources release them here.

### .finishRenderList( renderList : RenderList )

Finishes the projection into the given render list.

**renderList**

The render list.

### .isCulled( object : Object3D, camera : Camera ) : boolean

Returns `true` if the given object is culled by the camera and should not be rendered. Objects of render bundles are not culled, a bundle is recorded once and drawn with any camera.

**object**

The 3D object.

**camera**

The camera.

**Returns:** Whether the object is culled or not.

### .prepareAsync( scene : Object3D, camera : Camera ) : Promise | undefined

Prepares resources needed to precompile the given scene. Subclasses can use this hook to process geometry before the synchronous projection in `Renderer.compileAsync()`.

**scene**

The scene or object to precompile.

**camera**

The camera.

**Returns:** Resolves when the resources are ready.

### .project( object : Object3D, camera : Camera, groupOrder : number, renderList : RenderList, clippingContext : ClippingContext )

This method is used to traverse the scene graph and collect all renderable objects and lights into the given render list. Call [StandardDrawingPipeline#begin](StandardDrawingPipeline.html#begin) before.

**object**

The 3D object to process (usually a scene).

**camera**

The camera the object should be rendered with.

**groupOrder**

The group order is derived from the `renderOrder` of groups and is used to group 3D objects within groups.

**renderList**

The current render list.

**clippingContext**

The current clipping context.

### .pushRenderItem( renderList : RenderList, object : Object3D, geometry : BufferGeometry, material : Material, groupOrder : number, z : number, group : Object, clippingContext : ClippingContext )

Pushes a render item to the render list.

**renderList**

The current render list.

**object**

The 3D object.

**geometry**

The 3D object's geometry.

**material**

The 3D object's material.

**groupOrder**

The current group order.

**z**

The 3D object's depth value (z value in clip space).

**group**

Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.

**clippingContext**

The current clipping context.

## Source

[src/renderers/common/StandardDrawingPipeline.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/StandardDrawingPipeline.js)