

## Texture

| Name | Description | Type |
| -- | -- | -- |
| `texture( texture, uv = uv(), level = null )` | Retrieves texels from a texture. | `vec4` |
| `textureLoad( texture, uv, level = null )` | Fetches/loads texels without interpolation. | `vec4` |
| `textureStore( texture, uv, value )` | Stores a value into a storage texture. | `void` |
| `textureSize( texture, level = null )` | Returns the size of a texture. | `ivec2` |
| `textureBicubic( textureNode, strength = null )` | Applies mipped bicubic texture filtering. | `vec4` |
| `cubeTexture( texture, uvw = reflectVector, level = null )` | Retrieves texels from a cube texture. | `vec4` |
| `texture3D( texture, uvw = null, level = null )` | Retrieves texels from a 3D texture. | `vec4` |
| `triplanarTexture( textureX, textureY = null, textureZ = null, scale = float( 1 ), position = positionLocal, normal = normalLocal )` | Computes texture using triplanar mapping based on provided parameters. | `vec4` |

## Reflect

| Name | Description | Type |
| -- | -- | -- |
| `reflectView` | Computes reflection direction in view space. | `vec3` |
| `reflectVector` | Transforms the reflection direction to world space. | `vec3` |

## UV Utils

| Name | Description | Type |
| -- | -- | -- |
| `matcapUV` | UV coordinates for matcap texture. | `vec2` |
| `rotateUV( uv, rotation, centerNode = vec2( 0.5 ) )` | Rotates UV coordinates around a center point. | `vec2` |
| `spherizeUV( uv, strength, centerNode = vec2( 0.5 ) )` | Distorts UV coordinates with a spherical effect around a center point. | `vec2` |
| `spritesheetUV( count, uv = uv(), frame = float( 0 ) )` | Computes UV coordinates for a sprite sheet based on the number of frames, UV coordinates, and frame index. | `vec2` |
| `equirectUV( direction = positionWorldDirection )` | Computes UV coordinates for equirectangular mapping based on the direction vector. | `vec2` |
| `equirectDirection( uv = uv() )` | Computes a direction vector from the given equirectangular UV coordinates (inverse of `equirectUV`). | `vec3` |

```js
import { texture, matcapUV } from 'three/tsl';

const matcap = texture( matcapMap, matcapUV );
```

## Remap

| Variable | Description | Type |
| -- | -- | -- |
| `remap( node, inLow, inHigh, outLow = float( 0 ), outHigh = float( 1 ) )` | Remaps a value from one range to another. | `any` |
| `remapClamp( node, inLow, inHigh, outLow = float( 0 ), outHigh = float( 1 ) )` | Remaps a value from one range to another, with clamping. | `any` |

## Random

| Variable | Description | Type |
| -- | -- | -- |
| `hash( seed )` | Generates a hash value in the range [ 0, 1 ] from the given seed. | `float` |
| `range( min, max )` | Generates a range `attribute` of values between min and max. Attribute randomization is useful when you want to randomize values ​​between instances and not between pixels. | `any` |

## Rotate

| Name | Description | Type |
| -- | -- | -- |
| `rotate( position, rotation )` | Applies a rotation to the given position node. Depending on whether the position data are 2D or 3D, the rotation is expressed a single float value or an Euler value. | `vec2`, `vec3`

## Packing

| Variable | Description | Type |
| -- | -- | -- |
| `packNormalToRGB( value )` | Converts normal vector to color. | `color` |
| `unpackRGBToNormal( value )` | Converts color to normal vector. | `vec3` |

## Render Pipeline

The `RenderPipeline` provides full control over the rendering process. It enables developers to build complex multi-pass rendering pipelines entirely in JavaScript, combining scene rendering, post-processing, and compute operations in a unified, composable workflow.

#### Basic Usage

```js
import * as THREE from 'three/webgpu';
import { pass } from 'three/tsl';

// Create the render pipeline
const renderPipeline = new THREE.RenderPipeline( renderer );

// Create a scene pass
const scenePass = pass( scene, camera );

// Set the output
renderPipeline.outputNode = scenePass;

// In the animation loop
function animate() {

	renderPipeline.render();

}
```

### Multiple Render Targets (MRT)

MRT allows capturing multiple outputs from a single render pass. Instead of rendering the scene multiple times to get different data (color, normals, depth, velocity), MRT captures all of them in one draw call—significantly improving performance.

#### Setting up MRT

Use `setMRT()` with the `mrt()` function to define which outputs to capture:

```js
import { pass, mrt, output, normalView, velocity, packNormalToRGB } from 'three/tsl';

const scenePass = pass( scene, camera );

scenePass.setMRT( mrt( {
	output: output,                          // Final color output
	normal: packNormalToRGB( normalView ),   // View-space normals encoded as colors
	velocity: velocity                       // Motion vectors for temporal effects
} ) );
```

Each MRT entry accepts any TSL node, allowing you to customize outputs using formulas, encoders, or material accessors. For example, `packNormalToRGB( normalView )` encodes view-space normals into RGB values. You can use any TSL function to transform, combine, or encode data before writing to the render target.

Within a TSL function `Fn( ( { material, object } ) => { ... } )`, you have complete access to the current material and object being rendered, enabling full customization of outputs.

#### Accessing MRT Buffers

Each MRT output becomes available as a texture node via `getTextureNode()`:

```js
// Access individual buffers as texture nodes
const colorTexture = scenePass.getTextureNode( 'output' );
const normalTexture = scenePass.getTextureNode( 'normal' );
const velocityTexture = scenePass.getTextureNode( 'velocity' );

// Depth is always available, even without MRT
const depthTexture = scenePass.getTextureNode( 'depth' );
```

These texture nodes can be sampled, transformed, and passed to post-processing effects or other passes.

#### Optimizing MRT Textures

You can access the textures to optimize memory usage and bandwidth. Using smaller data types reduces GPU memory transfers, which is critical for performance on bandwidth-limited devices:

```js
// Use 8-bit format for encoded normals, default is 16-bit
const normalTexture = scenePass.getTexture( 'normal' );
normalTexture.type = THREE.UnsignedByteType;
```

#### Dynamic Pipeline Updates

The pipeline can be updated at runtime:

```js
if ( showNormals ) {

	renderPipeline.outputNode = prePass;

} else {

	renderPipeline.outputNode = traaPass;

}

renderPipeline.needsUpdate = true;
```

### Post-Processing

TSL utilities for post-processing effects. They can be used in materials or post-processing passes.

| Name | Description |
| -- | -- |
| `afterImage( node, damp = 0.96 )` | Creates an after image effect. |
| `anamorphic( node, threshold = 0.9, scale = 3, samples = 32 )` | Creates an anamorphic flare effect. |
| `bloom( node, strength = 1, radius = 0, threshold = 0 )` | Creates a bloom effect. |
| `boxBlur( textureNode, options = {} )` | Applies a box blur effect. |
| `chromaticAberration( node, strength = 1.0, center = null, scale = 1.1 )` | Creates a chromatic aberration effect. |
| `denoise( node, depthNode, normalNode, camera )` | Creates a denoise effect. |
| `dof( node, viewZNode, focusDistance, focalLength, bokehScale )` | Creates a depth-of-field effect. |
| `dotScreen( node, angle = 1.57, scale = 1 )` | Creates a dot-screen effect. |
| `film( inputNode, intensityNode = null, uvNode = null )` | Creates a film grain effect. |
| `fxaa( node )` | Creates a FXAA anti-aliasing effect. |
| `gaussianBlur( node, directionNode, sigma, options = {} )` | Creates a gaussian blur effect. |
| `grayscale( color )` | Converts color to grayscale. |
| `hashBlur( textureNode, bluramount = float( 0.1 ), options = {} )` | Applies a hash blur effect. |
| `lut3D( node, lut, size, intensity )` | Creates a LUT color grading effect. |
| `motionBlur( inputNode, velocity, numSamples = int( 16 ) )` | Creates a motion blur effect. |
| `outline( scene, camera, params )` | Creates an outline effect around selected objects. |
| `rgbShift( node, amount = 0.005, angle = 0 )` | Creates an RGB shift effect. |
| `sepia( color )` | Applies a sepia effect. |
| `smaa( node )` | Creates a SMAA anti-aliasing effect. |
| `sobel( node )` | Creates a sobel edge detection effect. |
| `ssr( colorNode, depthNode, normalNode, metalnessNode, roughnessNode = null, camera = null )` | Creates screen space reflections. |
| `ssgi( beautyNode, depthNode, normalNode, camera )` | Creates a SSGI effect. |
| `ao( depthNode, normalNode, camera )` | Creates a Ground Truth Ambient Occlusion (GTAO) effect. |
| `transition( nodeA, nodeB, mixTextureNode, mixRatio, threshold, useTexture )` | Creates a transition effect between two scenes. |
| `traa( beautyNode, depthNode, velocityNode, camera )` | Creates a TRAA temporal anti-aliasing effect. |
| `renderOutput( node, targetColorSpace, targetToneMapping )` | Apply the renderer output settings in the node. |

Example:

```js
import { grayscale, pass } from 'three/tsl';
import { gaussianBlur } from 'three/addons/tsl/display/GaussianBlurNode.js';

// Post-processing
const scenePass = pass( scene, camera );
const output = scenePass.getTextureNode(); // default parameter is 'output'

renderPipeline.outputNode = grayscale( gaussianBlur( output, 4 ) );
```

### Render Pass

Functions for creating and managing render passes.

| Name | Description |
| -- | -- |
| `pass( scene, camera, options = {} )` | Creates a pass node for rendering a scene. |
| `mrt( outputNodes )` | Creates a Multiple Render Targets (MRT) node. |

Example:

```js
import { pass, mrt, output, emissive } from 'three/tsl';

const scenePass = pass( scene, camera );

// Setup MRT
scenePass.setMRT( mrt( {
	output: output,
	emissive: emissive
} ) );

const outputNode = scenePass.getTextureNode( 'output' );
const emissiveNode = scenePass.getTextureNode( 'emissive' );
```

### Compute

Compute shaders allow general-purpose GPU computations. TSL provides functions for creating and managing compute operations.

| Name | Description |
| -- | -- |
| `compute( node, count = null, workgroupSize = [ 64 ] )` | Creates a compute node. |
| `atomicAdd( node, value )` | Performs an atomic addition. |
| `atomicSub( node, value )` | Performs an atomic subtraction. |
| `atomicMax( node, value )` | Performs an atomic max operation. |
| `atomicMin( node, value )` | Performs an atomic min operation. |
| `atomicAnd( node, value )` | Performs an atomic AND operation. |
| `atomicOr( node, value )` | Performs an atomic OR operation. |
| `atomicXor( node, value )` | Performs an atomic XOR operation. |
| `atomicStore( node, value )` | Stores a value atomically. |
| `atomicLoad( node )` | Loads a value atomically. |
| `workgroupBarrier()` | Creates a workgroup barrier. |
| `storageBarrier()` | Creates a storage barrier. |
| `textureBarrier()` | Creates a texture barrier. |
| `barrier()` | Creates a memory barrier. |
| `workgroupId` | The workgroup ID. |
| `localId` | The local invocation ID within the workgroup. |
| `globalId` | The global invocation ID. |
| `numWorkgroups` | The number of workgroups. |
| `subgroupSize` | The size of the subgroup. |

Example:

```js
import { Fn, instancedArray, instanceIndex, deltaTime } from 'three/tsl';

const count = 1000;
const positionArray = instancedArray( count, 'vec3' );

// create a compute function

const computeShader = Fn( () => {

	const position = positionArray.element( instanceIndex );

	position.x.addAssign( deltaTime );

} )().compute( count );

//

renderer.compute( computeShader );
```

## Storage

Storage functions allow reading and writing to GPU buffers.

| Name | Description |
| -- | -- |
| `storage( attribute, type, count )` | Creates a storage buffer. |
| `storageTexture( texture )` | Creates a storage texture for read/write operations. |

## Flow Control

Functions for controlling shader flow.

| Name | Description |
| -- | -- |
| `Discard()` | Discards the current fragment. |
| `Return()` | Returns from the current function. |
| `Break()` | Breaks out of a loop. |
| `Continue()` | Continues to the next iteration of a loop. |

Example:

```js
import { Fn, If, Discard, uv } from 'three/tsl';

const customFragment = Fn( () => {

	If( uv().x.lessThan( 0.5 ), () => {

		Discard();

	} );

	return vec4( 1, 0, 0, 1 );

} );

material.colorNode = customFragment();
```

## Override Node

Override nodes allow you to replace specific target nodes within a node sub-graph or flow dynamically during compilation, without having to reconstruct or duplicate the source nodes. This is useful, for example, to inject a custom `positionLocal` or normal into an existing flow through the material's `contextNode`.

| Name | Description |
| -- | -- |
| `overrideNode( targetNode, callback = null, flowNode = null )` | Overrides a single target node. `callback` returns the overriding node (receiving the builder as argument) or can be the overriding node itself. |
| `overrideNodes( overrides, flowNode = null )` | Overrides multiple target nodes at once using a `Map` or an array of `[ targetNode, callback \| node ]` pairs. |

Example:

```js
import { overrideNode, overrideNodes, positionLocal, positionView, vec3 } from 'three/tsl';

// Override a single node through the material context
material.contextNode = overrideNode( positionLocal, () => positionLocal.add( vec3( 1, 0, 0 ) ) );

// Override multiple nodes at once
material.contextNode = overrideNodes( [
	[ positionView, customPositionView ], // You can use a node directly like customPositionView.
	[ positionLocal, ( builder ) => positionLocal.add( vec3( 1, 0, 0 ) ) ]
] );

// Method chaining is also supported
node.overrideNode( positionLocal, () => positionLocal.add( vec3( 1, 0, 0 ) ) );
```

## Utilities

Utility functions for common shader tasks.

| Name | Description | Type |
| -- | -- | -- |
| `billboarding( { position, horizontal, vertical } )` | Orients flat meshes always towards the camera. `position`: vertex positions in world space (default: `null`). `horizontal`: follow camera horizontally (default: `true`). `vertical`: follow camera vertically (default: `false`). | `vec3` |
| `checker( coord )` | Creates a 2x2 checkerboard pattern. | `float` |
| `negateOnBackSide( vector )` | Negates a vector when rendering the back side of a face, according to the material's `side` configuration (`BackSide`, `DoubleSide` or `FrontSide`). | `vec3` |

Example:

```js
import { billboarding } from 'three/tsl';

// Default: Horizontal only (like trees) - rotates around Y axis only
material.vertexNode = billboarding();

// Full billboarding (like particles) - faces camera in all directions
material.vertexNode = billboarding( { horizontal: true, vertical: true } );
```

## NodeMaterial

Check below for more details about `NodeMaterial` inputs.

#### Core

| Name | Description | Type |
|--|--|--|
| `.fragmentNode` | Replaces the built-in material logic used in the fragment stage. | `vec4` |
| `.vertexNode` | Replaces the built-in material logic used in the vertex stage. | `vec4` |
| `.geometryNode` | Allows you to execute a TSL function to deal with Geometry. | `Fn()` |

#### Basic

| Name | Description | Reference | Type |
|--|--|--|--|
| `.colorNode` | Replace the logic of `material.color * material.map`. | `materialColor` | `vec4` |
| `.depthNode` | Customize the `depth` output. | `depth` | `float` |
| `.opacityNode` | Replace the logic of `material.opacity * material.alphaMap`. | `materialOpacity` | `float` |
| `.alphaTestNode` | Sets a threshold to discard pixels with low opacity. | `materialAlphaTest` | `float` |
| `.positionNode` | Represents the vertex positions in local-space. Replace the logic of `material.displacementMap * material.displacementScale + material.displacementBias`. | `positionLocal` | `vec3` |

#### Lighting

| Name | Description | Reference | Type |
|--|--|--|--|
| `.emissiveNode` | Replace the logic of `material.emissive * material.emissiveIntensity * material.emissiveMap`. | `materialEmissive` | `color` |
| `.normalNode` | Represents the normals direction in view-space. Replace the logic of `material.normalMap * material.normalScale` and `material.bumpMap * material.bumpScale`. | `materialNormal` | `vec3` |
| `.lightsNode` | Defines the lights and lighting model that will be used by the material. |  | `lights()` |
| `.envNode` | Replace the logic of `material.envMap * material.envMapRotation * material.envMapIntensity`. |  | `color` |

#### Backdrop

| Name | Description | Type |
|--|--|--|
| `.backdropNode` | Set the current render color to be used before applying `Specular`, useful for `transmission` and `refraction` effects. | `color` |
| `.backdropAlphaNode` | Define the alpha of `backdropNode`. | `float` |

#### Shadows

| Name | Description | Reference | Type |
|--|--|--|--|
| `.castShadowNode` | Control the `color` and `opacity` of the shadow that will be projected by the material. |  | `vec4` |
| `.maskShadowNode` | Define a custom mask for the shadow. |  | `bool` |
| `.receivedShadowNode` | Handle the shadow cast on the material. |  | `Fn()` |
| `.receivedShadowPositionNode` | Define the shadow projection position in world-space. | `shadowPositionWorld` | `vec3` |
| `.aoNode` | Replace the logic of `material.aoMap * aoMapIntensity`. | `materialAO` | `float` |

#### Output

| Name | Description | Reference | Type |
|--|--|--|--|
| `.maskNode` | Define the material's mask. Unlike opacity, it is discarded at the beginning of rendering, optimizing the process. |  | `bool` |
| `.mrtNode` | Define a different MRT than the one defined in `pass()`. |  | `mrt()` |
| `.outputNode` | Defines the material's final output. | `output` | `vec4` |

## LineDashedNodeMaterial

| Name | Description | Reference | Type |
|--|--|--|--|
| `.dashScaleNode` | Replace the logic of `material.scale`. | `materialLineScale` | `float` |
| `.dashSizeNode` | Replace the logic of `material.dashSize`. | `materialLineDashSize` | `float` |
| `.gapSizeNode` | Replace the logic of `material.gapSize`. | `materialLineGapSize` | `float` |
| `.offsetNode` | Replace the logic of `material.dashOffset`. | `materialLineDashOffset` | `float` |

## MeshPhongNodeMaterial

| Name | Description | Reference | Type |
|--|--|--|--|
| `.shininessNode` | Replace the logic of `material.shininess`. | `materialShininess` | `float` |
| `.specularNode` | Replace the logic of `material.specular`. | `materialSpecular` | `color` |

## MeshStandardNodeMaterial

| Name | Description | Reference | Type |
|--|--|--|--|
| `.metalnessNode` | Replace the logic of `material.metalness * material.metalnessMap`. | `materialMetalness` | `float` |
| `.roughnessNode` | Replace the logic of `material.roughness * material.roughnessMap`. | `materialRoughness` | `float` |

## MeshPhysicalNodeMaterial

| Name | Description | Reference | Type |
|--|--|--|--|
| `.clearcoatNode` | Replace the logic of `material.clearcoat * material.clearcoatMap`. | `materialClearcoat` | `float` |
| `.clearcoatRoughnessNode` | Replace the logic of `material.clearcoatRoughness * material.clearcoatRoughnessMap`. | `materialClearcoatRoughness` | `float` |
| `.clearcoatNormalNode` | Replace the logic of `material.clearcoatNormalMap * material.clearcoatNormalMapScale`. | `materialClearcoatNormal` | `vec3` |
| `.sheenNode` | Replace the logic of `material.sheenColor * material.sheenColorMap`. | `materialSheen` | `color` |
| `.iridescenceNode` | Replace the logic of `material.iridescence`. | `materialIridescence` | `float` |
| `.iridescenceIORNode` | Replace the logic of `material.iridescenceIOR`. | `materialIridescenceIOR` | `float` |
| `.iridescenceThicknessNode` | Replace the logic of `material.iridescenceThicknessRange * material.iridescenceThicknessMap`. | `materialIridescenceThickness` | `float` |
| `.specularIntensityNode` | Replace the logic of `material.specularIntensity * material.specularIntensityMap`. | `materialSpecularIntensity` | `float` |
| `.specularColorNode` | Replace the logic of `material.specularColor * material.specularColorMap`. | `materialSpecularColor` | `color` |
| `.iorNode` | Replace the logic of `material.ior`. | `materialIOR` | `float` |
| `.transmissionNode` | Replace the logic of `material.transmission * material.transmissionMap`. | `materialTransmission` | `color` |
| `.thicknessNode` | Replace the logic of `material.thickness * material.thicknessMap`. | `materialTransmission` | `float` |
| `.attenuationDistanceNode` | Replace the logic of `material.attenuationDistance`. | `materialAttenuationDistance` | `float` |
| `.attenuationColorNode` | Replace the logic of `material.attenuationColor`. | `materialAttenuationColor` | `color` |
| `.dispersionNode` | Replace the logic of `material.dispersion`. | `materialDispersion` | `float` |
| `.anisotropyNode` | Replace the logic of `material.anisotropy * material.anisotropyMap`. | `materialAnisotropy` | `vec2` |

## SpriteNodeMaterial

| Name | Description | Type |
|--|--|--|
| `.positionNode` | Defines the position. | `vec3` |
| `.rotationNode` | Defines the rotation. | `float` |
| `.scaleNode` | Defines the scale. | `vec2` |

## Transitioning common GLSL properties to TSL

| GLSL | TSL | Type |
| -- | -- | -- |
| `position` | `positionGeometry` | `vec3` |
| `transformed` | `positionLocal` | `vec3` |
| `transformedNormal` | `normalLocal` | `vec3` |
| `vWorldPosition` | `positionWorld` | `vec3` |
| `vColor` | `vertexColor()` | `vec3` |
| `vUv` \| `uv` | `uv()` | `vec2` |
| `vNormal` | `normalView` | `vec3` |
| `viewMatrix` | `cameraViewMatrix` | `mat4` |
| `modelMatrix` | `modelWorldMatrix` | `mat4` |
| `modelViewMatrix` | `modelViewMatrix` | `mat4` |
| `projectionMatrix` | `cameraProjectionMatrix` | `mat4` |
| `diffuseColor` | `material.colorNode` | `vec4` |
| `gl_FragColor` | `material.fragmentNode` | `vec4` |
