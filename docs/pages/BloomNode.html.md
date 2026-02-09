*Inheritance: EventDispatcher → Node → TempNode →*

# BloomNode

Post processing node for creating a bloom effect.

By default, the node affects the entire image. For a selective bloom, use the `emissive` material property to control which objects should contribute to bloom or not. This can be achieved via MRT.

```js
const postProcessing = new THREE.PostProcessing( renderer );
const scenePass = pass( scene, camera );
scenePass.setMRT( mrt( {
	output,
	emissive
} ) );
const scenePassColor = scenePass.getTextureNode( 'output' );
const emissivePass = scenePass.getTextureNode( 'emissive' );
const bloomPass = bloom( emissivePass );
postProcessing.outputNode = scenePassColor.add( bloomPass );
```

## Code Example

```js
const postProcessing = new THREE.PostProcessing( renderer );
const scenePass = pass( scene, camera );
const scenePassColor = scenePass.getTextureNode( 'output' );
const bloomPass = bloom( scenePassColor );
postProcessing.outputNode = scenePassColor.add( bloomPass );
```

## Import

BloomNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
```

## Constructor

### new BloomNode( inputNode : Node.<vec4>, strength : number, radius : number, threshold : number )

Constructs a new bloom node.

**inputNode**

The node that represents the input of the effect.

**strength**

The strength of the bloom.

Default is `1`.

**radius**

The radius of the bloom.

Default is `0`.

**threshold**

The luminance threshold limits which bright areas contribute to the bloom effect.

Default is `0`.

## Properties

### .inputNode : Node.<vec4>

The node that represents the input of the effect.

### .radius : UniformNode.<float>

The radius of the bloom. Must be in the range `[0,1]`.

### .smoothWidth : UniformNode.<float>

Can be used to tweak the extracted luminance from the scene.

### .strength : UniformNode.<float>

The strength of the bloom.

### .threshold : UniformNode.<float>

The luminance threshold limits which bright areas contribute to the bloom effect.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its effect once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

## Methods

### .dispose()

Frees internal resources. This method should be called when the effect is no longer required.

**Overrides:** [TempNode#dispose](TempNode.html#dispose)

### .getTextureNode() : PassTextureNode

Returns the result of the effect as a texture node.

**Returns:** A texture node that represents the result of the effect.

### .setSize( width : number, height : number )

Sets the size of the effect.

**width**

The width of the effect.

**height**

The height of the effect.

### .setup( builder : NodeBuilder ) : PassTextureNode

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

### .updateBefore( frame : NodeFrame )

This method is used to render the effect once per frame.

**frame**

The current node frame.

**Overrides:** [TempNode#updateBefore](TempNode.html#updateBefore)

## Source

[examples/jsm/tsl/display/BloomNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/BloomNode.js)