*Inheritance: EventDispatcher → Node → TempNode →*

# PassNode

Represents a render pass (sometimes called beauty pass) in context of post processing. This pass produces a render for the given scene and camera and can provide multiple outputs via MRT for further processing.

## Code Example

```js
const postProcessing = new RenderPipeline( renderer );
const scenePass = pass( scene, camera );
postProcessing.outputNode = scenePass;
```

## Constructor

### new PassNode( scope : 'color' | 'depth', scene : Scene, camera : Camera, options : Object )

Constructs a new pass node.

**scope**

The scope of the pass. The scope determines whether the node outputs color or depth.

**scene**

A reference to the scene.

**camera**

A reference to the camera.

**options**

Options for the internal render target.

## Properties

### .camera : Camera

A reference to the camera.

### .contextNode : ContextNode | null

An optional global context for the pass.

### .global : boolean

This flag is used for global cache.

Default is `true`.

**Overrides:** [TempNode#global](TempNode.html#global)

### .isPassNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .opaque : boolean

Whether the pass is opaque.

Default is `true`.

### .options : Object

Options for the internal render target.

### .overrideMaterial : Material | null

An optional override material for the pass.

### .renderTarget : RenderTarget

The pass's render target.

### .scene : Scene

A reference to the scene.

### .scope : 'color' | 'depth'

The scope of the pass. The scope determines whether the node outputs color or depth.

### .transparent : boolean

Whether the pass is transparent.

Default is `false`.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders the scene once per frame in its [PassNode#updateBefore](PassNode.html#updateBefore) method.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

### .COLOR : 'color'

### .DEPTH : 'depth'

## Methods

### .compileAsync( renderer : Renderer ) : Promise (async)

Precompiles the pass.

Note that this method must be called after the pass configuration is complete. So calls like `setMRT()` and `getTextureNode()` must proceed the precompilation.

**renderer**

The renderer.

See:

*   [Renderer#compileAsync](Renderer.html#compileAsync)

**Returns:** A Promise that resolves when the compile has been finished.

### .dispose()

Frees internal resources. Should be called when the node is no longer in use.

**Overrides:** [TempNode#dispose](TempNode.html#dispose)

### .getLayers() : Layers

Gets the current layer configuration of the pass.

**Returns:** .

### .getLinearDepthNode( name : string ) : Node

Returns a linear depth node of this pass.

**name**

The output name to get the linear depth node for. In most cases the default `'depth'` can be used however the parameter exists for custom depth outputs.

Default is `'depth'`.

**Returns:** The linear depth node.

### .getMRT() : MRTNode

Returns the current MRT node.

**Returns:** The current MRT node.

### .getPreviousTexture( name : string ) : Texture

Returns the texture holding the data of the previous frame for the given output name.

**name**

The output name to get the texture for.

**Returns:** The texture holding the data of the previous frame.

### .getPreviousTextureNode( name : string ) : TextureNode

Returns the previous texture node for the given output name.

**name**

The output name to get the previous texture node for.

Default is `'output'`.

**Returns:** The previous texture node.

### .getResolution() : number

Gets the current resolution of the pass.

**Deprecated:** since r181. Use [\`getResolutionScale()\`](PassNode.html#getResolutionScale) instead.

**Returns:** The current resolution. A value of `1` means full resolution.

### .getResolutionScale() : number

Gets the current resolution scale of the pass.

**Returns:** The current resolution scale. A value of `1` means full resolution.

### .getTexture( name : string ) : Texture

Returns the texture for the given output name.

**name**

The output name to get the texture for.

**Returns:** The texture.

### .getTextureNode( name : string ) : TextureNode

Returns the texture node for the given output name.

**name**

The output name to get the texture node for.

Default is `'output'`.

**Returns:** The texture node.

### .getViewZNode( name : string ) : Node

Returns a viewZ node of this pass.

**name**

The output name to get the viewZ node for. In most cases the default `'depth'` can be used however the parameter exists for custom depth outputs.

Default is `'depth'`.

**Returns:** The viewZ node.

### .setLayers( layers : Layers ) : PassNode

Sets the layer configuration that should be used when rendering the pass.

**layers**

The layers object to set.

**Returns:** A reference to this pass.

### .setMRT( mrt : MRTNode ) : PassNode

Sets the given MRT node to setup MRT for this pass.

**mrt**

The MRT object.

**Returns:** A reference to this pass.

### .setPixelRatio( pixelRatio : number )

Sets the pixel ratio the pass's render target and updates the size.

**pixelRatio**

The pixel ratio to set.

### .setResolution( resolution : number ) : PassNode

Sets the resolution for the pass. The resolution is a factor that is multiplied with the renderer's width and height.

**resolution**

The resolution to set. A value of `1` means full resolution.

**Deprecated:** since r181. Use [\`setResolutionScale()\`](PassNode.html#setResolutionScale) instead.

**Returns:** A reference to this pass.

### .setResolutionScale( resolutionScale : number ) : PassNode

Sets the resolution scale for the pass. The resolution scale is a factor that is multiplied with the renderer's width and height.

**resolutionScale**

The resolution scale to set. A value of `1` means full resolution.

**Returns:** A reference to this pass.

### .setScissor( x : number | Vector4, y : number, width : number, height : number )

This method allows to define the pass's scissor rectangle. By default, the scissor rectangle is kept in sync with the pass's dimensions. To reverse the process and use auto-sizing again, call the method with `null` as the single argument.

**x**

The horizontal coordinate for the lower left corner of the box in logical pixel unit. Instead of passing four arguments, the method also works with a single four-dimensional vector.

**y**

The vertical coordinate for the lower left corner of the box in logical pixel unit.

**width**

The width of the scissor box in logical pixel unit.

**height**

The height of the scissor box in logical pixel unit.

### .setSize( width : number, height : number )

Sets the size of the pass's render target. Honors the pixel ratio.

**width**

The width to set.

**height**

The height to set.

### .setViewport( x : number | Vector4, y : number, width : number, height : number )

This method allows to define the pass's viewport. By default, the viewport is kept in sync with the pass's dimensions. To reverse the process and use auto-sizing again, call the method with `null` as the single argument.

**x**

The horizontal coordinate for the lower left corner of the viewport origin in logical pixel unit.

**y**

The vertical coordinate for the lower left corner of the viewport origin in logical pixel unit.

**width**

The width of the viewport in logical pixel unit.

**height**

The height of the viewport in logical pixel unit.

### .toggleTexture( name : string )

Switches current and previous textures for the given output name.

**name**

The output name.

## Source

[src/nodes/display/PassNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/display/PassNode.js)