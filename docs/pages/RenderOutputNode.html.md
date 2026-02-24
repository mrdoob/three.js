*Inheritance: EventDispatcher → Node → TempNode →*

# RenderOutputNode

Normally, tone mapping and color conversion happens automatically before outputting pixel too the default (screen) framebuffer. In certain post processing setups this happens to late because certain effects require e.g. sRGB input. For such scenarios, `RenderOutputNode` can be used to apply tone mapping and color space conversion at an arbitrary point in the effect chain.

When applying tone mapping and color space conversion manually with this node, you have to set [RenderPipeline#outputColorTransform](RenderPipeline.html#outputColorTransform) to `false`.

## Code Example

```js
const postProcessing = new RenderPipeline( renderer );
postProcessing.outputColorTransform = false;
const scenePass = pass( scene, camera );
const outputPass = renderOutput( scenePass );
postProcessing.outputNode = outputPass;
```

## Constructor

### new RenderOutputNode( colorNode : Node, toneMapping : number, outputColorSpace : string )

Constructs a new render output node.

**colorNode**

The color node to process.

**toneMapping**

The tone mapping type.

**outputColorSpace**

The output color space.

## Properties

### .colorNode : Node

The color node to process.

### .isRenderOutputNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .outputColorSpace : string

The output color space.

## Methods

### .getToneMapping() : number

Gets the tone mapping type.

**Returns:** The tone mapping type.

### .setToneMapping( value : number ) : ToneMappingNode

Sets the tone mapping type.

**value**

The tone mapping type.

**Returns:** A reference to this node.

## Source

[src/nodes/display/RenderOutputNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/display/RenderOutputNode.js)