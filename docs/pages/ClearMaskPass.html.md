*Inheritance: Pass →*

# ClearMaskPass

This pass can be used to clear a mask previously defined with [MaskPass](MaskPass.html).

## Code Example

```js
const clearPass = new ClearMaskPass();
composer.addPass( clearPass );
```

## Constructor

### new ClearMaskPass()

Constructs a new clear mask pass.

## Properties

### .needsSwap : boolean

Overwritten to disable the swap.

Default is `false`.

**Overrides:** [Pass#needsSwap](Pass.html#needsSwap)

## Methods

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the clear of the currently defined mask.

**renderer**

The renderer.

**writeBuffer**

The write buffer. This buffer is intended as the rendering destination for the pass.

**readBuffer**

The read buffer. The pass can access the result from the previous pass from this buffer.

**deltaTime**

The delta time in seconds.

**maskActive**

Whether masking is active or not.

**Overrides:** [Pass#render](Pass.html#render)

## Source

[examples/jsm/postprocessing/MaskPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/MaskPass.js)