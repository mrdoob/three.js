# InspectorBase

### new InspectorBase()

InspectorBase is the base class for all inspectors.

## Properties

### .currentFrame : Object

The current frame being processed.

### .nodeFrame

Returns the node frame for the current renderer.

## Methods

### .begin()

Called when a frame begins.

### .beginCompute( uid : string, computeNode : ComputeNode )

Called when a compute operation begins.

**uid**

A unique identifier for the render context.

**computeNode**

The compute node being executed.

### .beginRender( uid : string, scene : Scene, camera : Camera, renderTarget : WebGLRenderTarget )

Called when a render operation begins.

**uid**

A unique identifier for the render context.

**scene**

The scene being rendered.

**camera**

The camera being used for rendering.

**renderTarget**

The render target, if any.

### .computeAsync( computeNode : ComputeNode, dispatchSizeOrCount : number | Array.<number> )

When a compute operation is performed.

**computeNode**

The compute node being executed.

**dispatchSizeOrCount**

The dispatch size or count.

### .copyFramebufferToTexture( framebufferTexture : Texture )

Called when a framebuffer copy operation is performed.

**framebufferTexture**

The texture associated with the framebuffer.

### .copyTextureToTexture( srcTexture : Texture, dstTexture : Texture )

Called when a texture copy operation is performed.

**srcTexture**

The source texture.

**dstTexture**

The destination texture.

### .finish()

Called when a frame ends.

### .finishCompute( uid : string, computeNode : ComputeNode )

Called when a compute operation ends.

**uid**

A unique identifier for the render context.

**computeNode**

The compute node being executed.

### .finishRender( uid : string )

Called when an animation loop ends.

**uid**

A unique identifier for the render context.

### .getRenderer() : WebGLRenderer

Returns the renderer associated with this inspector.

**Returns:** The associated renderer.

### .init()

Initializes the inspector.

### .inspect( node : Node )

Inspects a node.

**node**

The node to inspect.

### .setRenderer( renderer : WebGLRenderer ) : InspectorBase

Sets the renderer for this inspector.

**renderer**

The renderer to associate with this inspector.

**Returns:** This inspector instance.

## Source

[src/renderers/common/InspectorBase.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/InspectorBase.js)

### new InspectorBase()

Creates a new InspectorBase.

## Properties

### .currentFrame : Object

The current frame being processed.

### .nodeFrame

Returns the node frame for the current renderer.

## Methods

### .begin()

Called when a frame begins.

### .beginCompute( uid : string, computeNode : ComputeNode )

Called when a compute operation begins.

**uid**

A unique identifier for the render context.

**computeNode**

The compute node being executed.

### .beginRender( uid : string, scene : Scene, camera : Camera, renderTarget : WebGLRenderTarget )

Called when a render operation begins.

**uid**

A unique identifier for the render context.

**scene**

The scene being rendered.

**camera**

The camera being used for rendering.

**renderTarget**

The render target, if any.

### .computeAsync( computeNode : ComputeNode, dispatchSizeOrCount : number | Array.<number> )

When a compute operation is performed.

**computeNode**

The compute node being executed.

**dispatchSizeOrCount**

The dispatch size or count.

### .copyFramebufferToTexture( framebufferTexture : Texture )

Called when a framebuffer copy operation is performed.

**framebufferTexture**

The texture associated with the framebuffer.

### .copyTextureToTexture( srcTexture : Texture, dstTexture : Texture )

Called when a texture copy operation is performed.

**srcTexture**

The source texture.

**dstTexture**

The destination texture.

### .finish()

Called when a frame ends.

### .finishCompute( uid : string, computeNode : ComputeNode )

Called when a compute operation ends.

**uid**

A unique identifier for the render context.

**computeNode**

The compute node being executed.

### .finishRender( uid : string )

Called when an animation loop ends.

**uid**

A unique identifier for the render context.

### .getRenderer() : WebGLRenderer

Returns the renderer associated with this inspector.

**Returns:** The associated renderer.

### .init()

Initializes the inspector.

### .inspect( node : Node )

Inspects a node.

**node**

The node to inspect.

### .setRenderer( renderer : WebGLRenderer ) : InspectorBase

Sets the renderer for this inspector.

**renderer**

The renderer to associate with this inspector.

**Returns:** This inspector instance.

## Source

[src/renderers/common/InspectorBase.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/InspectorBase.js)