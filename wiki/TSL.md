## TSL Specification

An Approach to Productive and Maintainable Shader Creation.

- [Introduction](#introduction)
  - [Why TSL?](#why-tsl)
  - [Example](#example)
  - [Architecture](#architecture)
- [Learning TSL](#learning-tsl)
- [Constants and explicit conversions](#constants-and-explicit-conversions)
- [Conversions](#conversions)
- [Uniform](#uniform)
  - [onUpdate](#uniformonupdate)
- [Swizzle](#swizzle)
- [Operators](#operators)
- [Function](#function)
- [Variables](#variables)
- [Array](#array)
  - [Uniform](#array-uniform)
- [Varying](#varying)
- [Conditional](#conditional)
  - [If-else](#if-else)
  - [Switch-case](#switch-case)
  - [Ternary](#ternary)
- [Loop](#loop)
- [Math](#math)
- [Method chaining](#method-chaining)
- [Texture](#texture)
- [Attributes](#attributes)
- [Position](#position)
- [Normal](#normal)
- [Tangent](#tangent)
- [Bitangent](#bitangent)
- [Camera](#camera)
- [Model](#model)
- [Screen](#screen)
- [Viewport](#viewport)
- [Blend Modes](#blend-modes)
- [Reflect](#reflect)
- [UV Utils](#uv-utils)
- [Interpolation](#interpolation)
- [Random](#random)
- [Rotate](#rotate)
- [Oscillator](#oscillator)
- [Timer](#timer)
- [Packing](#packing)
- [Post-Processing](#post-processing)
- [Render Pass](#render-pass)
- [Compute](#compute)
- [Storage](#storage)
- [Struct](#struct)
- [Flow Control](#flow-control)
- [Fog](#fog)
- [Color Adjustments](#color-adjustments)
- [Utilities](#utilities)
- [NodeMaterial](#nodematerial)
  - [LineDashedNodeMaterial](#linedashednodematerial)
  - [MeshPhongNodeMaterial](#meshphongnodematerial)
  - [MeshStandardNodeMaterial](#meshstandardnodematerial)
    - [MeshPhysicalNodeMaterial](#meshphysicalnodematerial)
  - [SpriteNodeMaterial](#spritenodematerial)
- [Transitioning common GLSL properties to TSL](#transitioning-common-glsl-properties-to-tsl)

## Introduction

### Why TSL?

Creating shaders has always been an advanced step for most developers; many game developers have never created GLSL code from scratch. The shader graph solution adopted today by the industry has allowed developers more focused on dynamics to create the necessary graphic effects to meet the demands of their projects.

The aim of the project is to create an easy-to-use environment for shader creation. Even if for this we need to create complexity behind it, this happened initially with `Renderer` and now with the `TSL`.

Other benefits that TSL brings besides simplifying shading creation are keeping the `renderer agnostic`, while all the complexity of a material can be imported into different modules and use `tree shaking` without breaking during the process.

### Example

A `detail map` makes things look more real in games. It adds tiny details like cracks or bumps to surfaces. In this example we will scale uv to improve details when seen up close and multiply with a base texture.

#### Old

This is how we would achieve that using `.onBeforeCompile()`:

```js
const material = new THREE.MeshStandardMaterial();
material.map = colorMap;
material.onBeforeCompile = ( shader ) => {

	shader.uniforms.detailMap = { value: detailMap };

	let token = '#define STANDARD';

	let insert = /* glsl */`
		uniform sampler2D detailMap;
	`;

	shader.fragmentShader = shader.fragmentShader.replace( token, token + insert );

	token = '#include <map_fragment>';

	insert = /* glsl */`
		diffuseColor *= texture2D( detailMap, vMapUv * 10.0 );
	`;

	shader.fragmentShader = shader.fragmentShader.replace( token, token + insert );

};
```

Any simple change from this makes the code increasingly complicated using `.onBeforeCompile`, the result we have today in the community are countless types of parametric materials that do not communicate with each other, and that need to be updated periodically to be operating, limiting the creativity to create unique materials reusing modules in a simple way.

#### New

With `TSL` the code would look like this:

```js
import { texture, uv } from 'three/tsl';

const detail = texture( detailMap, uv().mul( 10 ) );

const material = new THREE.MeshStandardNodeMaterial();
material.colorNode = texture( colorMap ).mul( detail );
```

`TSL` is also capable of encoding code into different outputs such as `WGSL`/`GLSL` - `WebGPU`/`WebGL`, in addition to optimizing the shader graph automatically and through codes that can be inserted within each `Node`. This allows the developer to focus on productivity and leave the graphical management part to the `Node System`.

Another important feature of a graph shader is that we will no longer need to care about the sequence in which components are created, because the `Node System` will only declare and include it once.

Let's say that you import `positionWorld` into your code, even if another component uses it, the calculations performed to obtain `position world` will only be performed once, as is the case with any other node such as: `normalWorld`, `modelPosition`, etc.

### Architecture

All `TSL` components are extended from `Node` class. The `Node` allows it to communicate with any other, value conversions can be automatic or manual, a `Node` can receive the output value expected by the parent `Node` and modify its own output snippet. It's possible to modulate them using `tree shaking` in the shader construction process, the `Node` will have important information such as `geometry`, `material`, `renderer` as well as the `backend`, which can influence the type and value of output.

The main class responsible for creating the code is `NodeBuilder`. This class can be extended to any output programming language, so you can use TSL for a third language if you wish. Currently `NodeBuilder` has two extended classes, the `WGSLNodeBuilder` aimed at WebGPU and `GLSLNodeBuilder` aimed at WebGL2.

The build process is based on three pillars: `setup`, `analyze` and `generate`.

| | |
| -- | -- |
| `setup` | Use `TSL` to create a completely customized code for the `Node` output. The `Node` can use many others within itself, have countless inputs, but there will always be a single output. |
| `analyze` | This proccess will check the `nodes` that were created in order to create useful information for `generate` the snippet, such as the need to create or not a cache/variable for optimizing a node. |
| `generate` | An output of `string` will be returned from each `node`. Any node will also be able to create code in the flow of shader, supporting multiple lines. |

`Node` also have a native update process invoked by the `update()` function, these events be called by `frame`, `render call` and `object draw`.

It is also possible to serialize or deserialize a `Node` using `serialize()` and `deserialize()` functions.

## Learning TSL

TSL is a Node-based shader abstraction, written in JavaScript. TSL's functions are inspired by GLSL, but follow a very different concept. WGSL and GLSL are focused on creating GPU programs, in TSL this is one of the features.

### Seamless Integration with JavaScript/TypeScript

- Unified Code
  - Write shader logic directly in JS/TS, eliminating the need to manipulate strings.
  - Create and manipulate render objects just like any other JavaScript logic inside a TSL function.
  - Advanced events to control a Node before and after the object is rendered.
- JS Ecosystem
  - Use native **import/export**, **NPM**, and integrate **JS/TS** components directly into your shader logic.
- Typing
  - Benefit from better type checking (especially with **TypeScript** and **[@three-types](https://github.com/three-types/three-ts-types)**), increasing code robustness.

### Shader-Graph Inspired Structure

- Focus on Intent
  - Build materials by connecting nodes through: [positionWorld](#position), [normalWorld](#normal), [screenUV](#screen), [attribute()](#attributes), etc. 
More declarative("what") vs. imperative("how").
- Composition & High-Level Concepts
  - Work with high-level concepts for Node Material like [colorNode](#basic), [roughnessNode](#standard), [metalnessNode](#standard), [positionNode](#basic), etc. This preserves the integrity of the lighting model while allowing customizations, helping to avoid mistakes from incorrect setups.
- Keeping an eye on software exchange
  - Modern 3D authoring software uses Shader-Graph based material composition to exchange between other software. TSL already has its own MaterialX integration.
- Easier Migration
  - Many functions are directly inspired by GLSL to smooth the learning curve for those with prior experience.

### Rendering Manipulation

- Control rendering steps and create new render-passes per individual TSL functions.
  - Implement complex effects is easily with nodes using a single function call either in post-processing and in materials allowing the node itself to manage the rendering process as it needs.
    - `gaussianBlur()`: Double render-pass gaussian blur node. It can be used in the material or in post-processing through a single function.
  - Easy access to renderer buffers using TSL functions like: 
    - `viewportSharedTexture()`: Accesses the beauty what has already been rendered, preserving the render-order.
    - `viewportLinearDepth()`: Accesses the depth what has already been rendered, preserving the render-order.
  - Integrated Compute Shaders
    - Perform calculations on buffers using compute stage directly during an object's rendering.
  - TSL allows dynamic manipulation of renderer functions, which makes it more customizable than intermediate languages ​​that would have to use flags in fixed pipelines for this.
  - You just need to use the events of a Node for the renderer manipulations, without needing to modify the core.

### Automatic Optimization and Workarounds

- Your TSL code automatically benefits from optimizations and workarounds implemented in the Three.js compiler with each new version.
  - Simplifications
    - Automatic type conversions.
    - Execute a block of code in vertex-stage and get it in fragment-stage just using `vertexStage( node )`.
    - Automatically choose interpolation method for varyings depending on type.
    - Don't worry about collisions of global variables internally when using Nodes.
  - Polyfills
    - e.g: `textureSample()` function in the vertex shader (not natively supported in WGSL) is correctly transpiled to work.
    - e.g: Automatic correction for the `pow()` function, which didn't accept negative bases on Windows/DirectX using WGSL.
  - Optimizations
    - Repeated expressions: TSL can automatically create temporary variables to avoid redundant calculations.
    - Automatic reuse of uniforms and attributes.
    - Creating varying only if necessary. Otherwise they are replaced by simple variables.

### Target audience
  - Beginners users
    - You only need one line to create your first custom shader.
  - Advanced users
    - Makes creating shaders simple but not limited. Example: https://www.youtube.com/watch?v=C2gDL9Qk_vo
    - If you don't like fixed pipelines and low level, you'll love this.

### Share everything

#### TSL is based on Nodes, so don’t worry about sharing your **functions** and **uniforms** across materials and post-processing.

```js
// Shared the same uniform with various materials

const sharedColor = uniform( new THREE.Color() );

materialA.colorNode = sharedColor.div( 2 );
materialB.colorNode = sharedColor.mul( .5 );
materialC.colorNode = sharedColor.add( .5 );
```

#### Deferred Function: High level of customization, goodby **#defines**

Access **material**, **geometry**, **object**, **camera**, **scene**, **renderer** and more directly from a TSL function. Function calls are only performed at the time of building the shader allowing you to customize the function according to the object's setup.

```js
// Returns an uniform of the material's custom color if it exists 

const customColor = Fn( ( { material, geometry, object } ) => {

	if ( material.userData.customColor !== undefined ) {

		return uniform( material.userData.customColor );

	}

	return vec3( 0 );

} );

//

material.colorNode = customColor();

```

#### Load a texture-based matrix inside a TSL function

This can be used for any other JS and Three.js ecosystem needs. You can manipulate your assets according to the needs of a function. This can work for creating buffers, attributes, uniforms and any other JavaScript operation.

```js
let bayer16Texture = null;

export const bayer16 = Fn( ( [ uv ] ) => {

	if ( bayer16Texture === null ) {

		const bayer16Base64 = 'data:image/png;base64,...==';

		bayer16Texture = new TextureLoader().load( bayer16Base64 );

	}

	return textureLoad( bayer16Texture, ivec2( uv ).mod( int( 16 ) ) );

} );

//

material.colorNode = bayer16( screenCoordinate );

```

#### The node architecture allows the creation of instances of custom attributes and buffers through simple functions.

```js
// Range values node example

const randomColor = range( new THREE.Color( 0x000000 ), new THREE.Color( 0xFFFFFF ) );

material.colorNode = randomColor;

//...

const mesh = new THREE.InstancedMesh( geometry, material, count );
```

#### TSL loves JavaScript

TSL syntax follows JavaScript style because they are the same thing, so if you come from GLSL you can explore new possibilities.

```js
// A simple example of Function closure

const mainTask = Fn( () => {

	const task2 = Fn( ( [ a, b ] ) => {

		return a.add( b ).mul( 0.5 );

	} );


	return task2( color( 0x00ff00 ), color( 0x0000ff ) );

} );

//

material.colorNode = mainTask();
```

#### Simplification

Double render-pass `gaussianBlur()` node. It can be used in the material or in post-processing through a single function. 

```js
// Applies a double render-pass gaussianBlur and then a grayscale filter before the object with the material is rendered.

const myTexture = texture( map );

material.colorNode = grayscale( gaussianBlur( myTexture, 4 ) );
```

Accesses what has already been rendered, preserving the render-order for easy refraction effects, avoiding multiple render-pass and manual sorts.

```js
// Leaving the back in grayscale.

material.colorNode = grayscale( viewportSharedTexture( screenUV ) );
material.transparent = true;
```

#### Extend the TSL

You no longer need to create a Material for each desired effect, instead create Nodes. A Node can have access to the Material and can be used in many ways. Extend the TSL from Nodes and let the user use it in creative ways.

A great example of this is [TSL-Textures](https://boytchev.github.io/tsl-textures/).

```js
import * as THREE from 'three';
import { simplexNoise } from 'tsl-textures';

material.colorNode = simplexNoise ( {
	scale: 2,
	balance: 0,
	contrast: 0,
	color: new THREE.Color(16777215),
	background: new THREE.Color(0),
	seed: 0
} );

```

## Constants and explicit conversions

Input functions can be used to create contants and do explicit conversions.
> Conversions are also performed automatically if the output and input are of different types.

| Name | Returns a constant or convertion of type: |
| -- | -- |
| `float( node\|number )` | `float` |
| `int( node\|number )` | `int` |
| `uint( node\|number )` | `uint` |
| `bool( node\|value )` | `boolean` |
| `color( node\|hex\|r,g,b )` | `color` |
| `vec2( node\|Vector2\|x,y )` | `vec2` |
| `vec3( node\|Vector3\|x,y,z )` | `vec3` |
| `vec4( node\|Vector4\|x,y,z,w )` | `vec4` |
| `mat2( node\|Matrix2\|a,b,c,d )` | `mat2` |
| `mat3( node\|Matrix3\|a,b,c,d,e,f,g,h,i )` | `mat3` |
| `mat4( node\|Matrix4\|a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p )` | `mat4` |
| `ivec2( node\|x,y )` | `ivec2` |
| `ivec3( node\|x,y,z )` | `ivec3` |
| `ivec4( node\|x,y,z,w )` | `ivec4` |
| `uvec2( node\|x,y )` | `uvec2` |
| `uvec3( node\|x,y,z )` | `uvec3` |
| `uvec4( node\|x,y,z,w )` | `uvec4` |
| `bvec2( node\|x,y )` | `bvec2` |
| `bvec3( node\|x,y,z )` | `bvec3` |
| `bvec4( node\|x,y,z,w )` | `bvec4` |

Example:

```js
import { color, vec2, positionWorld } from 'three/tsl';

// constant
material.colorNode = color( 0x0066ff );

// conversion
material.colorNode = vec2( positionWorld ); // result positionWorld.xy
```

## Conversions

It is also possible to perform conversions using the `method chaining`:

| Name | Returns a constant or conversion of type: |
| -- | -- |
| `.toFloat()` | `float` |
| `.toInt()` | `int` |
| `.toUint()` | `uint` |
| `.toBool()` | `boolean` |
| `.toColor()` | `color` |
| `.toVec2()` | `vec2` |
| `.toVec3()` | `vec3` |
| `.toVec4()` | `vec4` |
| `.toMat2()` | `mat2` |
| `.toMat3()` | `mat3` |
| `.toMat4()` | `mat4` |
| | |
| `.toIVec2()` | `ivec2` |
| `.toIVec3()` | `ivec3` |
| `.toIVec4()` | `ivec4` |
| `.toUVec2()` | `uvec2` |
| `.toUVec3()` | `uvec3` |
| `.toUVec4()` | `uvec4` |
| `.toBVec2()` | `bvec2` |
| `.toBVec3()` | `bvec3` |
| `.toBVec4()` | `bvec4` |

Example:

```js
import { positionWorld } from 'three/tsl';

// conversion
material.colorNode = positionWorld.toVec2(); // result positionWorld.xy
```

## Uniform

Uniforms are useful to update values of variables like colors, lighting, or transformations without having to recreate the shader program. They are the true variables from a GPU's point of view.

| Name | Description |
| -- | -- |
| `uniform( boolean \| number \| Color \| Vector2 \| Vector3 \| Vector4 \| Matrix3 \| Matrix4, type = null )` | Dynamic values. |

Example:

```js
const myColor = uniform( new THREE.Color( 0x0066FF ) );

material.colorNode = myColor;
```

### `uniform.on*Update()`

It is also possible to create update events on `uniforms`, which can be defined by the user:

| Name | Description |
| -- | -- |
| `.onObjectUpdate( function )` | It will be updated every time an object like `Mesh` is rendered with this `node` in `Material`. |
| `.onRenderUpdate( function )` | It will be updated once per render, common and shared materials, fog, tone mapping, etc. |
| `.onFrameUpdate( function )` | It will be updated only once per frame, recommended for values ​​that will be updated only once per frame, regardless of when `render-pass` the frame has, cases like `time` for example. |

Example:

```js
const posY = uniform( 0 ); // it's possible use uniform( 'float' )

// or using event to be done automatically
// { object } will be the current rendering object
posY.onObjectUpdate( ( { object } ) => object.position.y );

// you can also update manually using the .value property
posY.value = object.position.y;

material.colorNode = posY;
```

## Swizzle

Swizzling is the technique that allows you to access, reorder, or duplicate the components of a vector using a specific notation within TSL. This is done by combining the identifiers:

```js
const original = vec3( 1.0, 2.0, 3.0 ); // (x, y, z)
const swizzled = original.zyx; // swizzled = (3.0, 2.0, 1.0)
```

It's possible use `xyzw`, `rgba` or `stpq`.

## Operators

| Name | Description |
| -- | -- |
| `.add( node \| value, ... )` | Return the addition of two or more value. |
| `.sub( node \| value )` | Return the subraction of two or more value. |
| `.mul( node \| value )` | Return the multiplication of two or more value. |
| `.div( node \| value )` | Return the division of two or more value. |
| `.mod( node \| value )` | Computes the remainder of dividing the first node by the second. |
| `.equal( node \| value )` | Checks if two nodes are equal. |
| `.notEqual( node \| value )` | Checks if two nodes are not equal. |
| `.lessThan( node \| value )` | Checks if the first node is less than the second. |
| `.greaterThan( node \| value )` | Checks if the first node is greater than the second. |
| `.lessThanEqual( node \| value )` | Checks if the first node is less than or equal to the second. |
| `.greaterThanEqual( node \| value )` | Checks if the first node is greater than or equal to the second. |
| `.and( node \| value )` | Performs logical AND on two nodes. |
| `.or( node \| value )` | Performs logical OR on two nodes. |
| `.not( node \| value )` | Performs logical NOT on a node. |
| `.xor( node \| value )` | Performs logical XOR on two nodes. |
| `.bitAnd( node \| value )` | Performs bitwise AND on two nodes. |
| `.bitNot( node \| value )` | Performs bitwise NOT on a node. |
| `.bitOr( node \| value )` | Performs bitwise OR on two nodes. |
| `.bitXor( node \| value )` | Performs bitwise XOR on two nodes. |
| `.shiftLeft( node \| value )` | Shifts a node to the left. |
| `.shiftRight( node \| value )` | Shifts a node to the right. |
| | |
| `.assign( node \| value )` | Assign one or more value to a and return the same. |
| `.addAssign( node \| value )` | Adds a value and assigns the result. |
| `.subAssign( node \| value )` | Subtracts a value and assigns the result. |
| `.mulAssign( node \| value )` | Multiplies a value and assigns the result. |
| `.divAssign( node \| value )` | Divides a value and assigns the result. |

```js
const a = float( 1 );
const b = float( 2 );

const result = a.add( b ); // output: 3
```

## Function

### `Fn( function, layout = null )`

It is possible to use classic JS functions or a `Fn()` interface. The main difference is that `Fn()` creates a controllable environment, allowing the use of `stack` where you can use `assign` and `conditional`, while the classic function only allows inline approaches.

Example:

```js
// tsl function
const oscSine = Fn( ( [ t = time ] ) => {

	return t.add( 0.75 ).mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 );

} );

// inline function
export const oscSine = ( t = time ) => t.add( 0.75 ).mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 );
```
> Both above can be called with `oscSin( value )`.

TSL allows the entry of parameters as object, this is useful in functions that have many optional arguments.

Example:

```js
const oscSine = Fn( ( { timer = time } ) => {

	return timer.add( 0.75 ).mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 );

} );

const value = oscSine( { timer: value } );
```

Parameters as object also allows traditional calls as an array, enabling different types of usage.

```js
const col = Fn( ( { r, g, b } ) => {

	return vec3( r, g, b );

} );


// Any of the options below will return a green color.

material.colorNode = col( 0, 1, 0 ); // option 1
material.colorNode = col( { r: 0, g: 1, b: 0 } ); // option 2
```

If you want to use an export function compatible with `tree shaking`, remember to use `/*@__PURE__*/`

```js
export const oscSawtooth = /*@__PURE__*/ Fn( ( [ timer = time ] ) => timer.fract() );
```

The second parameter of the function, if there are any parameters, will always be the first if there are none, and is dedicated to `NodeBuilder`. In `NodeBuilder` you can find out details about the current construction process and also obtain objects related to the shader construction, such as `material`, `geometry`, `object`, `camera`, etc.

[See an example](#deferred-function-high-level-of-customization-goodby-defines)

## Variables

Functions used to declare variables.

| Name | Description |
| -- | -- |
| `.toVar( node, name = null )` or `Var( node, name = null )` | Converts a node into a reusable variable in the shader. |
| `.toConst( node, name = null )` or `Const( node, name = null )` | Converts a node into an inline constant. |
| `property( type, name = null )` | Declares an property but does not assign an initial value. |

The name is optional; if set to `null`, the node system will generate one automatically.  
Creating a variable, constant, or property can help optimize the shader graph manually or assist in debugging.

```js
const uvScaled = uv().mul( 10 ).toVar();

material.colorNode = texture( map, uvScaled );
```

***

## Array

The array() function in TSL allows creating constant or dynamic value arrays; there are many ways to create arrays in TSL.

#### The standard way

```js
const colors = array( [
	vec3( 1, 0, 0 ),
	vec3( 0, 1, 0 ),
	vec3( 0, 0, 1 )
] );

const greenColor = colors.element( 1 );

// greenColor: vec3( 0, 1, 0 )
```

#### Fixed size

```js
const a = array( 'vec3', 2 );

// a: [ vec3( 0, 0, 0 ), vec3( 0, 0, 0 ) ]
```

#### Fill with a default value

```js
const a = vec3( 0, 0, 1 ).toArray( 2 ); 

// a: [ vec3( 0, 0, 1 ), vec3( 0, 0, 1 ) ]
```

#### Define a type explicitly

```js
const a = array( [ 0, 1, 2 ], 'uint' );
const value = a.element( 1 );

// value: 1u
```

### Array Uniform

It is possible to use the same array logic for uniforms using Three.js native components or primitive values.

```js
const tintColors = uniformArray( [
	new Color( 1, 0, 0 ),
	new Color( 0, 1, 0 ),
	new Color( 0, 0, 1 )
], 'color' );

const redColor = tintColors.element( 0 );
```

#### Accessing values

To access the values you can use `a[ 1 ]` or `a.element( 1 )`. The difference is that `a[ 1 ]` only allows constant values, while `a.element( 1 )` allows the use of dynamic values such as `a.element( index )` where index is a node.

### Array Storage

It is possible to create arrays that can be used in compute shaders and storage operations.

| Name | Description |
| -- | -- |
| `instancedArray( array, type )` | Creates an instanced buffer attribute array. |
| `attributeArray( array, type )` | Creates a buffer attribute array. |

## Varying

Functions used to declare varying.

| Name | Description |
| -- | -- |
| `vertexStage( node )` | Computes the node in the vertex stage. |
| `varying( node, name = null )` | Computes the node in the vertex stage and passes interpolated values to the fragment shader. |
| `varyingProperty( type, name = null )` | Declares an varying property but does not assign an initial value. |

Let's suppose you want to optimize some calculation in the `vertex stage` but are using it in a slot like `material.colorNode`.

For example:

```js
// multiplication will be executed in vertex stage
const normalView = vertexStage( modelNormalMatrix.mul( normalLocal ) );

// normalize will be computed in fragment stage while `normalView` is computed on vertex stage
material.colorNode = normalView.normalize();
```

The first parameter of `vertexStage()` `modelNormalMatrix.mul( normalLocal )` will be computed in `vertex stage`, and the return from `vertexStage()` will be a `varying` as we are used in WGSL/GLSL, this can optimize extra calculations in the `fragment stage`. The second parameter of `varying()` allows you to add a custom name in code generation.

If `varying()` is added only to `material.positionNode`, it will only return a simple variable and varying will not be created because `material.positionNode` is one of the only node material input that are computed at the vertex stage.

## Conditional

### If-else

`If-else` conditionals can be used within `Fn()`. Conditionals in `TSL` are built using the `If` function:

```js
If( conditional, function )
.ElseIf( conditional, function )
.Else( function )
```
> Notice here the `i` in `If` is capitalized.

Example:

In this example below, we will limit the y position of the geometry to 10.

```js
const limitPosition = Fn( ( { position } ) => {

	const limit = 10;

	const result = vec3( position );

	If( result.y.greaterThan( limit ), () => {

		result.y = limit;

	} );

	return result;

} );

material.positionNode = limitPosition( { position: positionLocal } );
```

Example using `elseif`:

```js
const limitPosition = Fn( ( { position } ) => {

	const limit = 10;

	const result = vec3( position );

	If( result.y.greaterThan( limit ), () => {

		result.y = limit;

	} ).ElseIf( result.y.lessThan( limit ), () => {

		result.y = limit;

	} );

	return result;

} );

material.positionNode = limitPosition( { position: positionLocal } );
```
### Switch-Case

A Switch-Case statement is an alternative way to express conditional logic compared to If-Else.

```js
const col = color();

Switch( 0 )
	.Case( 0, () => {

		col.assign( color( 1, 0, 0 ) );

	} ).Case( 1, () => {

		col.assign( color( 0, 1, 0 ) );

	} ).Case( 2, 3, () => {

		col.assign( color( 0, 0, 1 ) );

	} ).Default( () => {

		col.assign( color( 1, 1, 1 ) );

	} );
```
Notice that there are some rules when using this syntax which differentiate TSL from JavaScript:

- There is no fallthrough support. So each `Case()` statement has an implicit break.
- A `Case()` statement can hold multiple values (selectors) for testing. 

### Ternary

Different from `if-else`, a ternary conditional will return a value and can be used outside of `Fn()`.

```js
const result = select( value.greaterThan( 1 ), 1.0, value );
```
> Equivalent in JavaScript should be: `value > 1 ? 1.0 : value`

## Loop

This module offers a variety of ways to implement loops in TSL. In it's basic form it's:
```js
Loop( count, ( { i } ) => {

} );
```
However, it is also possible to define a start and end ranges, data types and loop conditions:
```js
Loop( { start: int( 0 ), end: int( 10 ), type: 'int', condition: '<', name: 'i' }, ( { i } ) => {

} );
```
Nested loops can be defined in a compacted form:
```js
Loop( 10, 5, ( { i, j } ) => {

} );
```
Loops that should run backwards can be defined like so:
```js
Loop( { start: 10 }, () => {} );
```
It is possible to execute with boolean values, similar to the `while` syntax.
```js
const value = float( 0 );

Loop( value.lessThan( 10 ), () => {

	value.addAssign( 1 );

} );
```
The module also provides `Break()` and `Continue()` TSL expression for loop control.

## Math

| Name | Description |
| -- | -- |
| `EPSILON` | A small value used to handle floating-point precision errors. |
| `INFINITY` | Represent infinity. |
| `PI` | The mathematical constant π (pi). |
| `TWO_PI` | Two times π (2π). |
| `HALF_PI` | Half of π (π/2). |
| | |
| `abs( x )` | Return the absolute value of the parameter. |
| `acos( x )` | Return the arccosine of the parameter. |
| `all( x )` | Return true if all components of x are true. |
| `any( x )` | Return true if any component of x is true. |
| `asin( x )` | Return the arcsine of the parameter. |
| `atan( y, x )` | Return the arc-tangent of the parameters. |
| `bitcast( x, y )` | Reinterpret the bits of a value as a different type. |
| `cbrt( x )` | Return the cube root of the parameter. |
| `ceil( x )` | Find the nearest integer that is greater than or equal to the parameter. |
| `clamp( x, min, max )` | Constrain a value to lie between two further values. |
| `cos( x )` | Return the cosine of the parameter. |
| `cross( x, y )` | Calculate the cross product of two vectors. |
| `dFdx( p )` | Return the partial derivative of an argument with respect to x. |
| `dFdy( p )` | Return the partial derivative of an argument with respect to y. |
| `degrees( radians )` | Convert a quantity in radians to degrees. |
| `difference( x, y )` | Calculate the absolute difference between two values. |
| `distance( x, y )` | Calculate the distance between two points. |
| `dot( x, y )` | Calculate the dot product of two vectors. |
| `equals( x, y )` | Return true if x equals y. |
| `exp( x )` | Return the natural exponentiation of the parameter. |
| `exp2( x )` | Return 2 raised to the power of the parameter. |
| `faceforward( N, I, Nref )` | Return a vector pointing in the same direction as another. |
| `floor( x )` | Find the nearest integer less than or equal to the parameter. |
| `fract( x )` | Compute the fractional part of the argument. |
| `fwidth( x )` | Return the sum of the absolute derivatives in x and y. |
| `inverseSqrt( x )` | Return the inverse of the square root of the parameter. |
| `length( x )` | Calculate the length of a vector. |
| `lengthSq( x )` | Calculate the squared length of a vector. |
| `log( x )` | Return the natural logarithm of the parameter. |
| `log2( x )` | Return the base 2 logarithm of the parameter. |
| `max( x, y )` | Return the greater of two values. |
| `min( x, y )` | Return the lesser of two values. |
| `mix( x, y, a )` | Linearly interpolate between two values. |
| `negate( x )` | Negate the value of the parameter ( -x ). |
| `normalize( x )` | Calculate the unit vector in the same direction as the original vector. |
| `oneMinus( x )` | Return 1 minus the parameter. |
| `pow( x, y )` | Return the value of the first parameter raised to the power of the second. |
| `pow2( x )` | Return the square of the parameter. |
| `pow3( x )` | Return the cube of the parameter. |
| `pow4( x )` | Return the fourth power of the parameter. |
| `radians( degrees )` | Convert a quantity in degrees to radians. |
| `reciprocal( x )` | Return the reciprocal of the parameter (1/x). |
| `reflect( I, N )` | Calculate the reflection direction for an incident vector. |
| `refract( I, N, eta )` | Calculate the refraction direction for an incident vector. |
| `round( x )` | Round the parameter to the nearest integer. |
| `saturate( x )` | Constrain a value between 0 and 1. |
| `sign( x )` | Extract the sign of the parameter. |
| `sin( x )` | Return the sine of the parameter. |
| `smoothstep( e0, e1, x )` | Perform Hermite interpolation between two values. |
| `sqrt( x )` | Return the square root of the parameter. |
| `step( edge, x )` | Generate a step function by comparing two values. |
| `tan( x )` | Return the tangent of the parameter. |
| `transformDirection( dir, matrix )` | Transform the direction of a vector by a matrix and then normalize the result. |
| `trunc( x )` | Truncate the parameter, removing the fractional part. |

```js
const value = float( -1 );

// It's possible use `value.abs()` too.
const positiveValue = abs( value ); // output: 1
```

## Method chaining

`Method chaining` will only be including operators, converters, math and some core functions. These functions, however, can be used on any `node`.

Example:

`oneMinus()` is a mathematical function like `abs()`, `sin()`. This example uses `.oneMinus()` as a built-in function in the class that returns a new node instead of classic C function like `oneMinus( texture( map ).rgb )`.

```js
// it will invert the texture color
material.colorNode = texture( map ).rgb.oneMinus();
```

You can use mathematical operators on any node, e.g:

```js
const contrast = .5;
const brightness = .5;

material.colorNode = texture( map ).mul( contrast ).add( brightness );
```

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

## Attributes

| Name | Description | Type |
| -- | -- | -- |
| `attribute( name, type = null )` | Getting geometry attribute using name and type. | `any` |
| `uv( index = 0 )` | UV attribute named `uv + index`. | `vec2` |
| `vertexColor( index = 0 )` | Vertex color node for the specified index. | `color` |
| `instanceIndex` | The index of the current instance. | `uint` |
| `vertexIndex` | The index of a vertex within a mesh. | `uint` |
| `drawIndex` | The draw index when using multi-draw. | `uint` |
| `batch( batchMesh )` | Creates a batch node for BatchedMesh. | `BatchNode` |
| `instance( instancedMesh )` | Creates an instance node for InstancedMesh. | `InstanceNode` |

## Position

The transformed term reflects the modifications applied by processes such as `skinning`, `morphing`, and similar techniques.

| Name | Description | Type |
| -- | -- | -- |
| `positionGeometry` | Position attribute of geometry. | `vec3` |
| `positionLocal` | Transformed local position. | `vec3` |
| `positionWorld` | Transformed world position. | `vec3` |
| `positionWorldDirection` | Normalized world direction. | `vec3` |
| `positionView` | View position. | `vec3` |
| `positionViewDirection` | Normalized view direction. | `vec3` |

## Normal

The term transformed here also includes following the correct orientation of the face, so that the normals are inverted inside the geometry.

| Name | Description | Type |
| -- | -- | -- |
| `normalGeometry` | Normal attribute of geometry. | `vec3` |
| `normalLocal` | Local variable for normal. | `vec3` |
| `normalView` | Normalized transformed view normal. | `vec3` |
| `normalViewGeometry` | Normalized view normal. | `vec3` |
| `normalWorld` | Normalized transformed world normal. | `vec3` |
| `normalWorldGeometry` | Normalized world normal. | `vec3` |

## Tangent

| Name | Description | Type |
| -- | -- | -- |
| `tangentGeometry` | Tangent attribute of geometry. | `vec4` |
| `tangentLocal` | Local variable for tangent. | `vec3` |
| `tangentView` | Normalized transformed view tangent. | `vec3` |
| `tangentWorld` | Normalized transformed world tangent. | `vec3` |

### Bitangent

| Name | Description | Type |
| -- | -- | -- |
| `bitangentGeometry` | Normalized bitangent in geometry space. | `vec3` |
| `bitangentLocal` | Normalized bitangent in local space. | `vec3` |
| `bitangentView` | Normalized transformed bitangent in view space. | `vec3` |
| `bitangentWorld` | Normalized transformed bitangent in world space. | `vec3` |

## Camera

| Name | Description | Type |
| -- | -- | -- |
| `cameraNear` | Near plane distance of the camera. | `float` |
| `cameraFar` | Far plane distance of the camera. | `float` |
| `cameraProjectionMatrix` | Projection matrix of the camera. | `mat4` |
| `cameraProjectionMatrixInverse` | Inverse projection matrix of the camera. | `mat4` |
| `cameraViewMatrix` | View matrix of the camera. | `mat4` |
| `cameraWorldMatrix` | World matrix of the camera. | `mat4` |
| `cameraNormalMatrix` | Normal matrix of the camera. | `mat3` |
| `cameraPosition` | World position of the camera. | `vec3` |

## Model

| Name | Description | Type |
| -- | -- | -- |
| `modelDirection` | Direction of the model. | `vec3` |
| `modelViewMatrix` | View-space matrix of the model. | `mat4` |
| `modelNormalMatrix` | View-space matrix of the model. | `mat3` |
| `modelWorldMatrix` | World-space matrix of the model. | `mat4` |
| `modelPosition` | Position of the model. | `vec3` |
| `modelScale` | Scale of the model. | `vec3` |
| `modelViewPosition` | View-space position of the model. | `vec3` |
| `modelWorldMatrixInverse` | Inverse world matrix of the model. | `mat4` |
| | |
| `highpModelViewMatrix` | View-space matrix of the model computed on CPU using 64-bit. | `mat4` |
| `highpModelNormalViewMatrix` | View-space normal matrix of the model computed on CPU using 64-bit. | `mat3` |

## Screen

Screen nodes will return the values related to the current `frame buffer`, either normalized or in `physical pixel units` considering the current `Pixel Ratio`.

| Variable | Description | Type |
| -- | -- | -- |
| `screenUV` | Returns the normalized frame buffer coordinate. | `vec2` |
| `screenCoordinate` | Returns the frame buffer coordinate in physical pixel units. | `vec2` |
| `screenSize` | Returns the frame buffer size in physical pixel units. | `vec2` |
| `screenDPR` | Returns the device pixel ratio (DPR). | `float` |

## Viewport

`viewport` is influenced by the area defined in `renderer.setViewport()`, different of the values ​​defined in the renderer that are `logical pixel units`, it use `physical pixel units` considering the current `Pixel Ratio`.

| Variable | Description | Type |
| -- | -- | -- |
| `viewportUV` | Returns the normalized viewport coordinate. | `vec2` |
| `viewport` | Returns the viewport dimension in physical pixel units. | `vec4` |
| `viewportCoordinate` | Returns the viewport coordinate in physical pixel units. | `vec2` |
| `viewportSize` | Returns the viewport size in physical pixel units. | `vec2` |
| `viewportSharedTexture( uvNode = screenUV, levelNode = null )` | Accesses what has already been rendered, preserving render-order. | `vec4` |
| `viewportDepthTexture( uvNode = screenUV, levelNode = null )` | Returns the depth texture of the viewport. | `float` |
| `viewportLinearDepth` | Returns the linear (orthographic) depth value of the current fragment. | `float` |
| `viewportMipTexture( uvNode = screenUV, levelNode = null, framebufferTexture = null )` | Returns a viewport texture with mipmap generation enabled. | `vec4` |
| `viewportSafeUV( uv = screenUV )` | Returns safe UV coordinates for refraction purposes. | `vec2` |

## Blend Modes

| Variable | Description | Type |
| -- | -- | -- |
| `blendBurn( a, b )` | Returns the burn blend mode. | `color` |
| `blendDodge( a, b )` | Returns the dodge blend mode. | `color` |
| `blendOverlay( a, b )` | Returns the overlay blend mode. | `color` |
| `blendScreen( a, b )` | Returns the screen blend mode. | `color` |
| `blendColor( a, b )` | Returns the (normal) color blend mode. | `color` |

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

```js
import { texture, matcapUV } from 'three/tsl';

const matcap = texture( matcapMap, matcapUV );
```

## Interpolation

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

## Oscillator

| Variable | Description | Type |
| -- | -- | -- |
| `oscSine( timer = time )` | Generates a sine wave oscillation based on a timer. | `float` |
| `oscSquare( timer = time )` | Generates a square wave oscillation based on a timer. | `float` |
| `oscTriangle( timer = time )` | Generates a triangle wave oscillation based on a timer. | `float` |
| `oscSawtooth( timer = time )` | Generates a sawtooth wave oscillation based on a timer. | `float` |

## Timer

| Variable | Description | Type |
| -- | -- | -- |
| `time` | Represents the elapsed time in seconds. | `float` |
| `deltaTime` | Represents the delta time in seconds. | `float` |

## Packing

| Variable | Description | Type |
| -- | -- | -- |
| `directionToColor( value )` | Converts direction vector to color. | `color` |
| `colorToDirection( value )` | Converts color to direction vector. | `vec3` |

## Post-Processing

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

Example:

```js
import { gaussianBlur, grayscale, pass } from 'three/tsl';

// Post-processing
const scenePass = pass( scene, camera );
const beauty = scenePass.getTextureNode();

postProcessing.outputNode = grayscale( gaussianBlur( beauty, 4 ) );
```

## Render Pass

Functions for creating and managing render passes.

| Name | Description |
| -- | -- |
| `pass( scene, camera, options = {} )` | Creates a pass node for rendering a scene. |
| `passTexture( pass, texture )` | Creates a pass texture node. |
| `depthPass( scene, camera, options = {} )` | Creates a depth pass node. |
| `mrt( outputNodes )` | Creates a Multiple Render Targets (MRT) node. |
| `renderOutput( node, targetColorSpace, targetToneMapping )` | Creates a render output node. |

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

## Compute

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

## Struct

Structs allow you to create custom data types with multiple members. They can be used to organize related data in shaders, define structures for attributes and uniforms.

| Name | Description |
| -- | -- |
| `struct( membersLayout, name = null )` | Creates a struct type with the specified member layout. |
| `outputStruct( ...members )` | Creates an output struct node for returning multiple values. |

Example:

```js
import { struct, vec3 } from 'three/tsl';

// Define a custom struct
const BoundingBox = struct( { min: 'vec3', max: 'vec3' } );

// Create a new instance of the struct
const bb = BoundingBox( vec3( 0 ), vec3( 1 ) ); // style 1
const bb2 = BoundingBox( { min: vec3( 0 ), max: vec3( 1 ) } ); // style 2

// Access the struct members
const min = bb.get( 'min' );

// Assign a new value to a member
min.assign( vec3( -1, -1, -1 ) );
```

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

## Fog

Functions for creating fog effects in the scene. Assign the fog node to `scene.fogNode`.

| Name | Description | Type |
| -- | -- | -- |
| `fog( color, factor )` | Creates a fog node with specified color and fog factor. | `FogNode` |
| `rangeFogFactor( near, far )` | Creates a linear fog factor based on distance from camera. | `float` |
| `densityFogFactor( density )` | Creates an exponential squared fog factor for denser fog. | `float` |

Example:

```js
import { fog, rangeFogFactor, densityFogFactor, color } from 'three/tsl';

// Linear fog (starts at 10 units, fully opaque at 100 units)
scene.fogNode = fog( color( 0x000000 ), rangeFogFactor( 10, 100 ) );

// Exponential fog (density-based)
scene.fogNode = fog( color( 0xcccccc ), densityFogFactor( 0.02 ) );
```

## Color Adjustments

Functions for adjusting and manipulating colors.

| Name | Description | Type |
| -- | -- | -- |
| `luminance( node )` | Calculates the luminance (perceived brightness) of a color. | `float` |
| `saturation( node, adjustment = 1 )` | Adjusts the saturation of a color. Values > 1 increase saturation, < 1 decrease. | `color` |
| `vibrance( node, adjustment = 1 )` | Selectively enhances less saturated colors while preserving already saturated ones. | `color` |
| `hue( node, adjustment = 0 )` | Rotates the hue of a color. Value is in radians. | `color` |
| `posterize( node, steps )` | Reduces the number of color levels, creating a poster-like effect. | `color` |

Example:

```js
import { texture, saturation, hue, posterize } from 'three/tsl';

// Increase saturation
material.colorNode = saturation( texture( map ), 1.5 );

// Rotate hue by 90 degrees
material.colorNode = hue( texture( map ), Math.PI / 2 );

// Posterize to 4 color levels
material.colorNode = posterize( texture( map ), 4 );
```

## Utilities

Utility functions for common shader tasks.

| Name | Description | Type |
| -- | -- | -- |
| `billboarding( { position, horizontal, vertical } )` | Orients flat meshes always towards the camera. `position`: vertex positions in world space (default: `null`). `horizontal`: follow camera horizontally (default: `true`). `vertical`: follow camera vertically (default: `false`). | `vec3` |
| `checker( coord )` | Creates a 2x2 checkerboard pattern. | `float` |

Example:

```js
import { billboarding } from 'three/tsl';

// Full billboarding (like particles) - faces camera in all directions
material.vertexNode = billboarding();

// Horizontal only (like trees) - rotates around Y axis only
material.vertexNode = billboarding( { horizontal: true, vertical: false } );
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
