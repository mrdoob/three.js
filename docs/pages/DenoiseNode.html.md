*Inheritance: EventDispatcher → Node → TempNode →*

# DenoiseNode

Post processing node for denoising data like raw screen-space ambient occlusion output. Denoise can noticeably improve the quality of ambient occlusion but also add quite some overhead to the post processing setup. It's best to make its usage optional (e.g. via graphic settings).

Reference: [https://openaccess.thecvf.com/content/WACV2021/papers/Khademi\_Self-Supervised\_Poisson-Gaussian\_Denoising\_WACV\_2021\_paper.pdf](https://openaccess.thecvf.com/content/WACV2021/papers/Khademi_Self-Supervised_Poisson-Gaussian_Denoising_WACV_2021_paper.pdf).

## Import

DenoiseNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { denoise } from 'three/addons/tsl/display/DenoiseNode.js';
```

## Constructor

### new DenoiseNode( textureNode : TextureNode, depthNode : Node.<float>, normalNode : Node.<vec3>, camera : Camera )

Constructs a new denoise node.

**textureNode**

The texture node that represents the input of the effect (e.g. AO).

**depthNode**

A node that represents the scene's depth.

**normalNode**

A node that represents the scene's normals.

**camera**

The camera the scene is rendered with.

## Properties

### .depthNode : Node.<float>

A node that represents the scene's depth.

### .depthPhi : UniformNode.<float>

The depth Phi value.

### .index : UniformNode.<float>

The index.

### .lumaPhi : UniformNode.<float>

The luma Phi value.

### .noiseNode : TextureNode

The node represents the internal noise texture.

### .normalNode : Node.<vec3>

A node that represents the scene's normals. If no normals are passed to the constructor (because MRT is not available), normals can be automatically reconstructed from depth values in the shader.

### .normalPhi : UniformNode.<float>

The normal Phi value.

### .radius : UniformNode.<float>

The radius.

### .textureNode : TextureNode

The texture node that represents the input of the effect (e.g. AO).

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node updates its internal uniforms once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

## Methods

### .setup( builder : NodeBuilder ) : ShaderCallNodeInternal

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

### .updateBefore( frame : NodeFrame )

This method is used to update internal uniforms once per frame.

**frame**

The current node frame.

**Overrides:** [TempNode#updateBefore](TempNode.html#updateBefore)

## Source

[examples/jsm/tsl/display/DenoiseNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/DenoiseNode.js)