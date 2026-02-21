# Info

This renderer module provides a series of statistical information about the GPU memory and the rendering process. Useful for debugging and monitoring.

## Constructor

### new Info()

Constructs a new info component.

## Properties

### .autoReset : boolean

Whether frame related metrics should automatically be resetted or not. This property should be set to `false` by apps which manage their own animation loop. They must then call `renderer.info.reset()` once per frame manually.

Default is `true`.

### .calls : number (readonly)

The number of render calls since the app has been started.

Default is `0`.

### .compute : Object (readonly)

Compute related metrics.

**calls**  
number

The number of compute calls since the app has been started.

**frameCalls**  
number

The number of compute calls of the current frame.

**timestamp**  
number

The timestamp of the frame when using `renderer.computeAsync()`.

### .frame : number (readonly)

The current frame ID. This ID is managed by `NodeFrame`.

Default is `0`.

### .memory : Object (readonly)

Memory related metrics.

**geometries**  
number

The number of active geometries.

**frameCalls**  
number

The number of active textures.

### .render : Object (readonly)

Render related metrics.

**calls**  
number

The number of render calls since the app has been started.

**frameCalls**  
number

The number of render calls of the current frame.

**drawCalls**  
number

The number of draw calls of the current frame.

**triangles**  
number

The number of rendered triangle primitives of the current frame.

**points**  
number

The number of rendered point primitives of the current frame.

**lines**  
number

The number of rendered line primitives of the current frame.

**timestamp**  
number

The timestamp of the frame.

## Methods

### .dispose()

Performs a complete reset of the object.

### .reset()

Resets frame related metrics.

### .update( object : Object3D, count : number, instanceCount : number )

This method should be executed per draw call and updates the corresponding metrics.

**object**

The 3D object that is going to be rendered.

**count**

The vertex or index count.

**instanceCount**

The instance count.

## Source

[src/renderers/common/Info.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/Info.js)