<page name="Introduction">

<page name="Welcome">

An Approach to Productive and Maintainable Shader Creation.

TSL (Three.js Shading Language) is the new shader standard for Three.js, built to support the rendering capabilities introduced by WebGPU. It allows shader logic to be written in JavaScript and structured through a flexible node-based system, enabling advanced rendering workflows, compute operations, improved GPU integration, and compatibility across different graphics backends.

- **Node-System Power**: Built entirely on top of Three.js's Node system, TSL creates a dynamic graph of operations. Going beyond a standard GPU program, nodes have direct control over the renderer itself, enabling CPU-side setup, dynamic render target allocations, and custom pipeline orchestration directly from the shading graph.

- **Improved Productivity**: Write modular, reusable shader functions, import them like regular JS modules, and enjoy full IDE autocomplete and instant feedback.

- **Easier Maintenance**: Instead of relying on fragile string concatenation, TSL provides structured, type-aware expressions that are easier to understand, reuse, and refactor.

- **Future-Proof Portability**: TSL is backend-agnostic, compiling automatically to WebGPU (WGSL) or WebGL (GLSL) behind the scenes, ensuring your visuals run everywhere.

### Some projects that uses TSL

https://www.youtube.com/watch?v=BE5JcpuWHG4

https://www.youtube.com/watch?v=oRx606IbIGo

https://www.youtube.com/watch?v=iklqjgIpVG8

### User Testimonials

https://x.com/mrdoob/status/1886416782673789317
https://x.com/mustache_dev/status/2010375315218944086
https://x.com/marcinignac/status/1805550271017144780&short
https://x.com/mamesoncom/status/1842812329484017950
https://x.com/onirenaud/status/1984863378284896377&short
https://x.com/shotamatsuda/status/1951453583117045775&short
https://x.com/MaximeHeckel/status/1978116334245302493&short
https://x.com/akella/status/1912614090377142317&short
https://x.com/makio64/status/1963160279795065084
https://x.com/SoundSafari_io/status/2015195333177872528&short
https://x.com/holtsetio/status/1932870179161321566
https://x.com/vg_head/status/1991611248559988749&short
https://x.com/Andersonmancini/status/1794348913660772505&short
https://x.com/thenoumenon/status/2010526571556475351&short
https://x.com/Ademola_4life/status/2012205043185762330&short

</page>

<page name="Why TSL?">

Creating shaders has always been an advanced step for most developers; many game developers have never created shader code from scratch. The shader graph solution adopted today by the industry has allowed developers more focused on dynamics to create the necessary graphic effects to meet the demands of their projects.

The aim of the project is to create an easy-to-use environment for shader creation. Even if for this we need to create complexity behind it, this happened initially with Renderer and now with the TSL.

Other benefits that TSL brings besides simplifying shading creation are keeping the **renderer agnostic**, while all the complexity of a material can be imported into different modules and use **tree shaking** without breaking during the process.

### Example

A **detail map** makes things look more real in games. It adds tiny details like cracks or bumps to surfaces. In this example we will scale uv to improve details when seen up close and multiply with a base texture.

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

Any simple change from this makes the code increasingly complicated using `.onBeforeCompile()`, the result we have today in the community are countless types of parametric materials that do not communicate with each other, and that need to be updated periodically to be operating, limiting the creativity to create unique materials reusing modules in a simple way.

#### New

With TSL the code would look like this:

```js
import { texture, uv } from 'three/tsl';

const detail = texture( detailMap, uv().mul( 10 ) );

const material = new THREE.MeshStandardNodeMaterial();
material.colorNode = texture( colorMap ).mul( detail );
```

TSL is also capable of encoding code into different outputs such as WGSL/GLSL - WebGPU/WebGL, in addition to optimizing the shader graph automatically and through codes that can be inserted within each Node. This allows the developer to focus on productivity and leave the graphical management part to the Node System.

Another important feature of a graph shader is that we will no longer need to care about the sequence in which components are created, because the Node System will only declare and include it once.

Let's say that you import positionWorld into your code, even if another component uses it, the calculations performed to obtain position world will only be performed once, as is the case with any other node such as: normalWorld, modelPosition, etc.

</page>

<page name="Architecture">

All TSL components are extended from Node class. The Node allows it to communicate with any other, value conversions can be automatic or manual, a Node can receive the output value expected by the parent Node and modify its own output snippet. It's possible to modulate them using tree shaking in the shader construction process, the Node will have important information such as geometry, material, renderer as well as the backend, which can influence the type and value of output.

The main class responsible for creating the code is NodeBuilder. This class can be extended to any output programming language, so you can use TSL for a third language if you wish. Currently NodeBuilder has two extended classes, the WGSLNodeBuilder aimed at WebGPU and GLSLNodeBuilder aimed at WebGL2.

The build process is based on three pillars: setup, analyze and generate.

| | |
| -- | -- |
| setup | Use TSL to create a completely customized code for the Node output. The Node can use many others within itself, have countless inputs, but there will always be a single output. |
| analyze | This proccess will check the nodes that were created in order to create useful information for generate the snippet, such as the need to create or not a cache/variable for optimizing a node. |
| generate | An output of string will be returned from each node. Any node will also be able to create code in the flow of shader, supporting multiple lines. |

Node also have a native update process invoked by the `update()` and `updateBefore()` function, these events be called by frame, render call and object draw.

It is also possible to serialize or deserialize a Node using `serialize()` and `deserialize()` functions.

</page>

<page name="Learning TSL">

TSL is a Node-based shader abstraction, written in JavaScript. TSL's functions are inspired by GLSL, but follow a very different concept. WGSL and GLSL are focused on creating GPU programs, in TSL this is one of the features.

<page name="Seamless Integration with JavaScript">

- Unified Code
  - Write shader logic directly in JS/TS, eliminating the need to manipulate strings.
  - Create and manipulate render objects just like any other JavaScript logic inside a TSL function.
  - Advanced events to control a Node before and after the object is rendered.
- JS Ecosystem
  - Use native **import/export**, **NPM**, and integrate **JS/TS** components directly into your shader logic.
- Typing
  - Benefit from better type checking (**TypeScript** and **[@three-types](https://github.com/three-types/three-ts-types)**), increasing code robustness.

</page>

<page name="Shader-Graph Inspired">

- Focus on Intent
  - Build materials by connecting nodes through: [position](#position), [normal](#normal), [screen](#screen), [attribute](#attributes), etc. 
  - More **declarative**('what') rather than **imperative**('how').
- Composition & High-Level Concepts
  - Work with high-level concepts for Node Material like [colorNode](#basic), [roughnessNode](#standard), [metalnessNode](#standard), [positionNode](#basic), etc. This preserves the integrity of the lighting model while allowing customizations, helping to avoid mistakes from incorrect setups.
- Keeping an eye on software exchange
  - Modern 3D authoring software uses Shader-Graph based material composition to exchange between other software. TSL already has its own MaterialX integration.
- Easier Migration
  - Many functions are directly inspired by GLSL to smooth the learning curve for those with prior experience.

</page>

<page name="Rendering Manipulation">

Control rendering steps and create new render-passes per individual TSL functions.

- Implement complex effects is easily with nodes using a single function call either in post-processing and in materials allowing the node itself to manage the rendering process as it needs.
  - `gaussianBlur()`: Double render-pass gaussian blur node. It can be used in the material or in post-processing through a single function.
- Easy access to renderer buffers using TSL functions like: 
  - `viewportSharedTexture()`: Accesses the beauty what has already been rendered, preserving the render-order.
  - `viewportLinearDepth()`: Accesses the depth what has already been rendered, preserving the render-order.
 - Integrated Compute Shaders
   - Perform calculations on buffers using compute stage directly during an object's rendering.
 - TSL allows dynamic manipulation of renderer functions, which makes it more customizable than intermediate languages ​​that would have to use flags in fixed pipelines for this.
 - You just need to use the events of a Node for the renderer manipulations, without needing to modify the core.

</page>

<page name="JavaScript Synergy">

TSL is based on Nodes, so don’t worry about sharing your **functions** and **uniforms** across materials and post-processing.

```js
// Shared the same uniform with various materials

const sharedColor = uniform( new THREE.Color() );

materialA.colorNode = sharedColor.div( 2 );
materialB.colorNode = sharedColor.mul( .5 );
materialC.colorNode = sharedColor.add( .5 );
```

#### Deferred Function: High level of customization, goodby `#defines`

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

#### Simplified rendering tree

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

A great example of this is [TSL-Textures](https://boytchev.github.io/tsl-textures/):

```tsl:embed
import 'scenes/shaderball';
import * as THREE from 'three';
import { caustics } from 'tsl-textures';

model.material.colorNode = caustics( {
	scale: 2,
	speed: 0,
	color: new THREE.Color( 0x1ca3ec ),
	seed: 0
} );
```

</page>

<page name="TSL Extensions">

### TSL Textures

https://github.com/boytchev/tsl-textures

A collection of Three.js Shading Language (TSL) textures – these are online real-time procedural generators of 3D textures.

```tsl:embed
import 'scenes/shaderball';
import * as THREE from 'three';
import { positionLocal, time } from 'three/tsl';
import { clouds } from 'tsl-textures';

const position = positionLocal.add( time.mul( 0.1 ) );

model.material.colorNode = clouds ( {
	position,
	scale: 2,
	density: 0.5,
	opacity: 1,
	color: new THREE.Color(16777215),
	subcolor: new THREE.Color(10526896),
	seed: 0
} );

model.material.transparent = true;
model.material.side = THREE.DoubleSide;
model.material.opacityNode = clouds.opacity ( {
	position,
	scale: 2,
	density: 0.5,
	opacity: 1,
	color: new THREE.Color(16777215),
	subcolor: new THREE.Color(10526896),
	seed: 0
} );

```

### Vite TSL Operator

https://github.com/Makio64/vite-plugin-tsl-operator

Use normal JavaScript operators like `+`, `-`, `*`, `/`, `%`, `**`, `+=`, `>`, `&&`, and `!` directly inside Three.js TSL `Fn()` blocks.

`vite-plugin-tsl-operator` is a plug-and-play Vite plugin for Three.js Shading Language (TSL), WebGPU, and shader node projects. It rewrites readable operator syntax to TSL node methods during Vite transforms, so you can write shader logic naturally without hand-chaining `.add()`, `.mul()`, `.greaterThan()`, and friends.

```js
import { uniform, Fn } from "three/tsl";

const myFn = Fn( () => {

	let alpha = uniform( 1 );
	let color = uniform( new THREE.Color() );

	let x = 1 - alpha * color.r;
	x = x * 4;

	return x;

} );

model.material.colorNode = myFn();
```

### TSL Sandbox

https://github.com/brunosimon/three.js-tsl-sandbox

A collection of interactive experiments and shaders created by [Bruno Simon](https://bruno-simon.com/) (creator of Three.js Journey) as a playground to learn and demonstrate the capabilities of TSL (Three.js Shading Language) and WebGPU.

</page>

<page name="Target Audience">

- Beginners users
  - You only need one line to create your first custom shader.
- Advanced users
  - Makes creating shaders simple but not limited. 
  - If you don't like fixed pipelines and low level, you'll love this.

https://www.youtube.com/watch?v=C2gDL9Qk_vo

</page>


</page>

</page>

<page name="Syntax">

<page name="Method Chaining">

Method chaining will only be including operators, converters, math and some core functions. These functions, however, can be used on any __Node__.

Example:

`oneMinus()` is a mathematical function like `abs()`, `sin()`, `cos()`, etc..

This example uses `.oneMinus()` as a built-in function in the class that returns a new node instead of classic C function like `oneMinus( node.x )`, you can use `node.x.oneMinus()` too.

```tsl
import 'scenes/shaderball';
import * as THREE from 'three';
import { texture, uniform } from 'three/tsl';

// Load texture
const map = new THREE.TextureLoader().load( '../examples/textures/uv_grid_opengl.jpg' );
map.wrapS = THREE.RepeatWrapping;
map.wrapT = THREE.RepeatWrapping;

const contrast = uniform( 1.5 );
const brightness = uniform( 0.0 );

model.material.colorNode = texture( map ).mul( contrast ).add( brightness );
```

</page>

<page name="Swizzle">

Swizzling is the technique that allows you to access, reorder, or duplicate the components of a vector using a specific notation within TSL. This is done by combining the identifiers:

```js
const original = vec3( 1.0, 2.0, 3.0 ); // (x, y, z)
const swizzled = original.zyx; // swizzled = (3.0, 2.0, 1.0)
```

It's possible use `xyzw`, `rgba` or `stpq`.

```tsl
import 'scenes/shaderball';
import { vec3 } from 'three/tsl';

const color = vec3( 0.0, 0.0, 1.0 ); // blue

// swizzle to color the sphere
model.material.colorNode = color.bgr; // turns blue into red!
```

</page>

<page name="Constants and Conversions">

Input functions can be used to create contants and do explicit conversions.

> Important: Conversions are also performed automatically if the output and input are of different types.

::: api float( value: Node | Number ) - Convert or create a float node. :::

::: api int( value: Node | Number ) - Convert or create an integer node. :::

::: api uint( value: Node | Number ) - Convert or create an unsigned integer node. :::

::: api bool( value: Node | boolean ) - Convert or create a boolean node. :::

::: api color( ...value: Node | Color | String | Number ) - Convert or create a color node. :::

::: api vec2( ...value: Node | Vector2 | Number ) - Convert or create a Vector2 node. :::

::: api vec3( ...value: Node | Vector3 | Number ) - Convert or create a Vector3 node. :::

::: api vec4( ...value: Node | Vector4 | Number ) - Convert or create a Vector4 node. :::

::: api mat2( ...value: Node | Matrix2 | Number ) - Convert or create a Matrix2 node. :::

::: api mat3( ...value: Node | Matrix3 | Number ) - Convert or create a Matrix3 node. :::

::: api mat4( ...value: Node | Matrix4 | Number ) - Convert or create a Matrix4 node. :::

::: api ivec2( ...value: Node | Number ) - Convert or create an integer Vector2 node. :::

::: api ivec3( ...value: Node | Number ) - Convert or create an integer Vector3 node. :::

::: api ivec4( ...value: Node | Number ) - Convert or create an integer Vector4 node. :::

::: api uvec2( ...value: Node | Number ) - Convert or create an unsigned integer Vector2 node. :::

::: api uvec3( ...value: Node | Number ) - Convert or create an unsigned integer Vector3 node. :::

::: api uvec4( ...value: Node | Number ) - Convert or create an unsigned integer Vector4 node. :::

::: api bvec2( ...value: Node | boolean ) - Convert or create a boolean Vector2 node. :::

::: api bvec3( ...value: Node | boolean ) - Convert or create a boolean Vector3 node. :::

::: api bvec4( ...value: Node | boolean ) - Convert or create a boolean Vector4 node. :::

Example:

```js
import { vec2, positionWorld } from 'three/tsl';

// constant
material.colorNode = vec2( 0.5, 0.5 );

// three.js object
material.colorNode = vec2( new THREE.Vector2( 0.5, 0.5 ) );

// conversion
material.colorNode = vec2( positionWorld ); // result positionWorld.xy
```

### Method chaining conversions

It is also possible to perform conversions using the **method chaining**:

::: api .toFloat() - Convert the node value to float. :::

::: api .toInt() - Convert the node value to integer. :::

::: api .toUint() - Convert the node value to unsigned integer. :::

::: api .toBool() - Convert the node value to boolean. :::

::: api .toColor() - Convert the node value to color. :::

::: api .toVec2() - Convert the node value to Vector2. :::

::: api .toVec3() - Convert the node value to Vector3. :::

::: api .toVec4() - Convert the node value to Vector4. :::

::: api .toMat2() - Convert the node value to Matrix2. :::

::: api .toMat3() - Convert the node value to Matrix3. :::

::: api .toMat4() - Convert the node value to Matrix4. :::

::: api .toIVec2() - Convert the node value to integer Vector2. :::

::: api .toIVec3() - Convert the node value to integer Vector3. :::

::: api .toIVec4() - Convert the node value to integer Vector4. :::

::: api .toUVec2() - Convert the node value to unsigned integer Vector2. :::

::: api .toUVec3() - Convert the node value to unsigned integer Vector3. :::

::: api .toUVec4() - Convert the node value to unsigned integer Vector4. :::

::: api .toBVec2() - Convert the node value to boolean Vector2. :::

::: api .toBVec3() - Convert the node value to boolean Vector3. :::

::: api .toBVec4() - Convert the node value to boolean Vector4. :::

Example:

```js
import { positionWorld } from 'three/tsl';

// conversion
material.colorNode = positionWorld.toVec2(); // result positionWorld.xy
```tsl
import 'scenes/shaderball';
import { color } from 'three/tsl';

// cornflower blue
model.material.colorNode = color( 0x1e90ff );
```

</page>


<page name="Operators">

TSL nodes support all standard mathematical, logical, and bitwise operators as chainable methods:

::: api .add( ...value: Node | Number ) - Return the addition of two or more values. :::

::: api .sub( value: Node | Number ) - Return the subtraction of two or more values. :::

::: api .mul( value: Node | Number ) - Return the multiplication of two or more values. :::

::: api .div( value: Node | Number ) - Return the division of two or more values. :::

::: api .mod( value: Node | Number ) - Computes the remainder of dividing the first node by the second. :::

::: api .equal( value: Node | Number | Boolean ) - Checks if two nodes are equal. :::

::: api .notEqual( value: Node | Number | Boolean ) - Checks if two nodes are not equal. :::

::: api .lessThan( value: Node | Number | Boolean ) - Checks if the first node is less than the second. :::

::: api .greaterThan( value: Node | Number | Boolean ) - Checks if the first node is greater than the second. :::

::: api .lessThanEqual( value: Node | Number | Boolean ) - Checks if the first node is less than or equal to the second. :::

::: api .greaterThanEqual( value: Node | Number | Boolean ) - Checks if the first node is greater than or equal to the second. :::

::: api .and( value: Node | Boolean ) - Performs logical AND on two nodes. :::

::: api .or( value: Node | Boolean ) - Performs logical OR on two nodes. :::

::: api .not( value: Node | Boolean ) - Performs logical NOT on a node. :::

::: api .xor( value: Node | Boolean ) - Performs logical XOR on two nodes. :::

::: api .bitAnd( value: Node | Number ) - Performs bitwise AND on two nodes. :::

::: api .bitNot( value: Node | Number ) - Performs bitwise NOT on a node. :::

::: api .bitOr( value: Node | Number ) - Performs bitwise OR on two nodes. :::

::: api .bitXor( value: Node | Number ) - Performs bitwise XOR on two nodes. :::

::: api .shiftLeft( value: Node | Number ) - Shifts a node to the left. :::

::: api .shiftRight( value: Node | Number ) - Shifts a node to the right. :::

```tsl
import 'scenes/shaderball';
import { color } from 'three/tsl';

// simple color manipulation using operators
const red = color( 1.0, 0.0, 0.0 );
const blue = color( 0.0, 0.0, 1.0 );

// Mix the two colors using add and mul operators
const mixedColor = red.mul( 0.5 ).add( blue.mul( 0.5 ) ); // results in purple!

model.material.colorNode = mixedColor;
```

</page>

<page name="Math">

TSL provides all standard mathematical constants and functions as both direct functions and chainable methods:

### Constants

::: api EPSILON - Small floating-point precision value (`1e-6`). Returns `float`. :::

::: api INFINITY - Represents positive infinity. Returns `float`. :::

::: api PI - Mathematical constant π (`3.141592653589793`). Returns `float`. :::

::: api TWO_PI - Two times π (`6.283185307179586`). Returns `float`. :::

::: api HALF_PI - Half of π (`1.5707963267948966`). Returns `float`. :::

### Functions

::: api abs( x ) - Computes the absolute value of `x`. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api acos( x ) - Computes the arccosine of `x` in radians. Returns `Node`.
- **x**: `Node | Number` — Input value or node in range `[-1, 1]`.
:::

::: api all( x ) - Returns `true` if all components of `x` are non-zero or true. Returns `boolean`.
- **x**: `Node` — Vector node.
:::

::: api any( x ) - Returns `true` if any component of `x` is non-zero or true. Returns `boolean`.
- **x**: `Node` — Vector node.
:::

::: api asin( x ) - Computes the arcsine of `x` in radians. Returns `Node`.
- **x**: `Node | Number` — Input value or node in range `[-1, 1]`.
:::

::: api atan( y, x? ) - Computes the arc-tangent of `y` or `y / x` in radians. Returns `Node`.
- **y**: `Node | Number` — Y coordinate or single tangent ratio.
- **x**: `Node | Number` — (Optional) X coordinate for two-argument arc-tangent (`atan2`).
:::

::: api bitcast( x, type ) - Reinterprets the bit pattern of `x` as a different type without type conversion. Returns `Node`.
- **x**: `Node` — Input node.
- **type**: `string` — Target primitive type name (e.g. `'float'`, `'int'`, `'uint'`).
:::

::: api cbrt( x ) - Computes the cube root of `x`. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api ceil( x ) - Rounds `x` up to the nearest integer. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api clamp( x, min, max ) - Constrains `x` to lie between `min` and `max`. Returns `Node`.
- **x**: `Node | Number` — Value to constrain.
- **min**: `Node | Number` — Lower bound.
- **max**: `Node | Number` — Upper bound.
:::

::: api cos( x ) - Computes the cosine of `x`. Returns `Node`.
- **x**: `Node | Number` — Angle in radians.
:::

::: api cross( a, b ) - Computes the cross product of 3D vectors `a` and `b`. Returns `vec3`.
- **a**: `vec3` — First 3D vector.
- **b**: `vec3` — Second 3D vector.
:::

::: api dFdx( p ) - Computes the partial derivative of `p` with respect to screen X axis. Returns `Node`.
- **p**: `Node` — Input expression node.
:::

::: api dFdy( p ) - Computes the partial derivative of `p` with respect to screen Y axis. Returns `Node`.
- **p**: `Node` — Input expression node.
:::

::: api degrees( radians ) - Converts an angle from radians to degrees. Returns `Node`.
- **radians**: `Node | Number` — Angle in radians.
:::

::: api difference( a, b ) - Computes the absolute difference `|a - b|`. Returns `Node`.
- **a**: `Node | Number` — First value or node.
- **b**: `Node | Number` — Second value or node.
:::

::: api distance( a, b ) - Computes the Euclidean distance between two points (`length(a - b)`). Returns `float`.
- **a**: `Node` — First point or vector node.
- **b**: `Node` — Second point or vector node.
:::

::: api dot( a, b ) - Computes the dot product of vectors `a` and `b`. Returns `float`.
- **a**: `Node` — First vector node.
- **b**: `Node` — Second vector node.
:::

::: api equals( a, b ) - Returns `true` if `a` equals `b`. Returns `boolean`.
- **a**: `Node | Number` — First value or node.
- **b**: `Node | Number` — Second value or node.
:::

::: api exp( x ) - Computes the natural exponential e^`x`. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api exp2( x ) - Computes `2` raised to the power of `x`. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api faceforward( N, I, Nref ) - Orients a normal vector to point away from a surface. Returns `vec3`.
- **N**: `vec3` — Surface normal vector.
- **I**: `vec3` — Incident vector.
- **Nref**: `vec3` — Reference normal vector.
:::

::: api floor( x ) - Rounds `x` down to the nearest integer. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api fract( x ) - Computes the fractional part of `x` (`x - floor(x)`). Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api fwidth( p ) - Computes the sum of absolute partial derivatives `|dFdx(p)| + |dFdy(p)|`. Returns `Node`.
- **p**: `Node` — Input expression node.
:::

::: api inverseSqrt( x ) - Computes the reciprocal of the square root `1 / sqrt(x)`. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api length( x ) - Computes the Euclidean length of vector `x`. Returns `float`.
- **x**: `Node` — Vector node.
:::

::: api lengthSq( x ) - Computes the squared length of vector `x` (`dot(x, x)`). Returns `float`.
- **x**: `Node` — Vector node.
:::

::: api log( x ) - Computes the natural logarithm ln(`x`). Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api log2( x ) - Computes the base-2 logarithm log₂(`x`). Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api max( a, b ) - Returns the greater of two values. Returns `Node`.
- **a**: `Node | Number` — First value or node.
- **b**: `Node | Number` — Second value or node.
:::

::: api min( a, b ) - Returns the lesser of two values. Returns `Node`.
- **a**: `Node | Number` — First value or node.
- **b**: `Node | Number` — Second value or node.
:::

::: api mix( a, b, t ) - Linearly interpolates between `a` and `b`. Returns `Node`.
- **a**: `Node | Number` — Start value or node (returned when `t = 0`).
- **b**: `Node | Number` — End value or node (returned when `t = 1`).
- **t**: `Node | Number` — Interpolation factor between `0` and `1`.
:::

::: api negate( x ) - Negates the value of `x` (`-x`). Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api normalize( x ) - Computes the unit vector in the same direction as vector `x`. Returns `Node`.
- **x**: `Node` — Vector node.
:::

::: api oneMinus( x ) - Computes `1 - x`. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api pow( x, y ) - Computes `x` raised to power `y` (`x^y`). Returns `Node`.
- **x**: `Node | Number` — Base value or node.
- **y**: `Node | Number` — Exponent value or node.
:::

::: api pow2( x ) - Computes the square of `x` (`x * x`). Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api pow3( x ) - Computes the cube of `x` (`x * x * x`). Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api pow4( x ) - Computes the fourth power of `x`. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api radians( degrees ) - Converts an angle from degrees to radians. Returns `Node`.
- **degrees**: `Node | Number` — Angle in degrees.
:::

::: api reciprocal( x ) - Computes the reciprocal `1 / x`. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api reflect( I, N ) - Computes the reflection direction for an incident vector. Returns `vec3`.
- **I**: `vec3` — Incident vector pointing towards the surface.
- **N**: `vec3` — Normalized surface normal vector.
:::

::: api refract( I, N, eta ) - Computes the refraction direction for an incident vector. Returns `vec3`.
- **I**: `vec3` — Incident vector pointing towards the surface.
- **N**: `vec3` — Normalized surface normal vector.
- **eta**: `float | Number` — Ratio of indices of refraction.
:::

::: api round( x ) - Rounds `x` to the nearest integer. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api saturate( x ) - Constrains `x` to range `[0, 1]`. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api sign( x ) - Extracts the sign of `x` (`-1.0`, `0.0`, or `1.0`). Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api sin( x ) - Computes the sine of `x`. Returns `Node`.
- **x**: `Node | Number` — Angle in radians.
:::

::: api smoothstep( low, high, x ) - Performs smooth Hermite interpolation between `low` and `high` edges. Returns `Node`.
- **low**: `Node | Number` — Lower edge threshold.
- **high**: `Node | Number` — Upper edge threshold.
- **x**: `Node | Number` — Source value to evaluate.
:::

::: api sqrt( x ) - Computes the square root of `x`. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

::: api step( edge, x ) - Generates a step function, returning `0.0` if `x < edge`, else `1.0`. Returns `Node`.
- **edge**: `Node | Number` — Threshold edge.
- **x**: `Node | Number` — Source value.
:::

::: api tan( x ) - Computes the tangent of `x`. Returns `Node`.
- **x**: `Node | Number` — Angle in radians.
:::

::: api transformDirection( dir, matrix ) - Transforms direction vector `dir` by `matrix` and normalizes the result. Returns `vec3`.
- **dir**: `vec3` — Direction vector node.
- **matrix**: `mat4` — Transformation matrix node.
:::

::: api transformNormalByViewMatrix( normal, viewMatrix? ) - Transforms a normal vector from world space to view space and normalizes the result. Returns `vec3`.
- **normal**: `vec3` — World-space normal vector.
- **viewMatrix**: `mat4` — (Optional) View matrix node. Defaults to camera view matrix.
:::

::: api transformNormalByInverseViewMatrix( normal, viewMatrix? ) - Transforms a normal vector from view space to world space and normalizes the result. Returns `vec3`.
- **normal**: `vec3` — View-space normal vector.
- **viewMatrix**: `mat4` — (Optional) View matrix node. Defaults to camera view matrix.
:::

::: api trunc( x ) - Truncates `x` towards zero, removing its fractional part. Returns `Node`.
- **x**: `Node | Number` — Input value or node.
:::

> Important: Method Chaining Exceptions: In TSL method chaining `node.method(...)`, functions that accept interpolation or comparison factors use the calling node as the **last parameter** (the evaluation factor or source value):

::: api t.mix( a, b ) - Method chaining form of `mix( a, b, t )`. Calling node `t` is the interpolation factor (0 to 1). Returns `Node`.
- **a**: `Node` — Start value node (returned when `t = 0`).
- **b**: `Node` — End value node (returned when `t = 1`).
:::

::: api x.smoothstep( low, high ) - Method chaining form of `smoothstep( low, high, x )`. Calling node `x` is the source value evaluated between `low` and `high`. Returns `Node`.
- **low**: `Node` — Lower edge threshold.
- **high**: `Node` — Upper edge threshold.
:::

::: api x.step( edge ) - Method chaining form of `step( edge, x )`. Calling node `x` is the source value compared against `edge`. Returns `Node`.
- **edge**: `Node` — Threshold edge node.
:::

```tsl
import 'scenes/shaderball';
import { abs, float } from 'three/tsl';

const value = float( - 1 );

// It's possible to use `value.abs()` too.
const positiveValue = abs( value ); // output: 1

model.material.colorNode = positiveValue;
```

</page>

<page name="Assignments">

TSL variables and parameters inside a custom function `Fn` can be updated dynamically using assignment methods:
::: api .assign( value: Node | Number ) - Assign one or more value to a and return the same. :::

::: api .addAssign( value: Node | Number ) - Adds a value and assigns the result. :::

::: api .subAssign( value: Node | Number ) - Subtracts a value and assigns the result. :::

::: api .mulAssign( value: Node | Number ) - Multiplies a value and assigns the result. :::

::: api .divAssign( value: Node | Number ) - Divides a value and assigns the result. :::

::: api .modAssign( value: Node | Number ) - Computes the remainder and assigns the result. :::

::: api .bitAndAssign( value: Node | Number ) - Performs bitwise AND and assigns the result. :::

::: api .bitOrAssign( value: Node | Number ) - Performs bitwise OR and assigns the result. :::

::: api .bitXorAssign( value: Node | Number ) - Performs bitwise XOR and assigns the result. :::

::: api .shiftLeftAssign( value: Node | Number ) - Shifts left and assigns the result. :::

::: api .shiftRightAssign( value: Node | Number ) - Shifts right and assigns the result. :::

```tsl
import 'scenes/shaderball';
import { Fn, vec3 } from 'three/tsl';

// A TSL Fn where arguments act as mutable variables
const modifyColor = Fn( ( [ color ] ) => {

	// Add blue to the incoming color node directly
	color.addAssign( vec3( 0.0, 0.0, 1.0 ) );

	return color;

} );

const baseColor = vec3( 0.0, 1.0, 0.0 ); // Green

model.material.colorNode = modifyColor( baseColor ); // Becomes Cyan
```

</page>

<page name="Function">

It is possible to use classic JS functions or a `Fn()` interface. The main difference is that `Fn()` creates a controllable environment, allowing the use of **stack** where you can use **assign** and **conditional**, while the classic function only allows inline approaches.

Example:

```js
// tsl function
const oscSine = Fn( ( [ t = time ] ) => {

	return t.add( 0.75 ).mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 );

} );

// inline function
export const oscSine = ( t = time ) => t.add( 0.75 ).mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 );
```
> Both above can be called with `oscSine( value )`.

TSL allows the entry of parameters as object, this is useful in functions that have many optional arguments.

<code name="oscSine">oscSine example</code>

Parameters as object also allows traditional calls as an array, enabling different types of usage.

```js
const col = Fn( ( { r, g, b } ) => {

	return vec3( r, g, b );

} );


// Any of the options below will return a green color.

material.colorNode = col( 0, 1, 0 ); // option 1
material.colorNode = col( { r: 0, g: 1, b: 0 } ); // option 2
```

If you want to use an export function compatible with **tree shaking**, remember to use `/*@__PURE__*/`

```js
export const oscSawtooth = /*@__PURE__*/ Fn( ( [ timer = time ] ) => timer.fract() );
```

The second parameter of the function, if there are any parameters, will always be the first if there are none, and is dedicated to __NodeBuilder__. In __NodeBuilder__ you can find out details about the current construction process and also obtain objects related to the shader construction, such as **material**, **geometry**, **object**, **camera**, etc.

<code name="accessingMaterial">Accessing Material example</code>

```tsl oscSine
import 'scenes/shaderball';
import { Fn, time } from 'three/tsl';

// Define a custom TSL Fn to animate the color
const oscSine = Fn( ( { t = time } ) => {

	return t.add( 0.75 ).mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 );

} );

// Assign it to the red component of the material color
model.material.colorNode = oscSine();
```

```tsl accessingMaterial
import 'scenes/shaderball';
import * as THREE from 'three';
import { Fn, color } from 'three/tsl';

// Store color
model.material.userData.customColor = new THREE.Color( 0x0066ff );

// Retrieve the color from builder
const getMaterialColor = Fn( ( { material } ) => {

	return color( material.userData.customColor );

} );

// Assign color
model.material.colorNode = getMaterialColor();
```

#### Related
  - [See JavaScript Synergy](#javascript-synergy)


</page>

<page name="Variables">

TSL allows creating explicit shader variables and constants to store intermediate calculation results, assist in debugging, or optimize shader graphs manually.

### Chainable Methods

::: api .toVar( name? )
- **name**: `string` — (Optional) Name of the variable in the shader. Defaults to `null`.
:::

::: api .toConst( name? )
- **name**: `string` — (Optional) Name of the constant in the shader. Defaults to `null`.
:::

### Var and Const

Direct functions create variables or constants explicitly by taking a TSL node as their first argument.

> Important: Notice here `Var` and `Const` are capitalized.

::: api Var( node, name? )
- **node**: `Node` — TSL node or expression to initialize the variable with.
- **name**: `string` — (Optional) Name of the variable in the shader. Defaults to `null`.
:::

::: api Const( node, name? )
- **node**: `Node` — TSL node or expression to initialize the constant with.
- **name**: `string` — (Optional) Name of the constant in the shader. Defaults to `null`.
:::

The name is optional; if set to `null`, the node system will generate one automatically.

Creating a variable or constant can help optimize the shader graph manually or assist in debugging.

```tsl
import 'scenes/shaderball';
import * as THREE from 'three';
import { texture, uv } from 'three/tsl';

// Load texture
const map = new THREE.TextureLoader().load( '../examples/textures/uv_grid_opengl.jpg' );
map.wrapS = THREE.RepeatWrapping;
map.wrapT = THREE.RepeatWrapping;

// Create a variable in TSL
// .debug() will show the node in the console
const uvScaled = uv().mul( 5 ).toVar( 'myVar' ).debug();

// Sample the texture using the scaled UV variable
model.material.colorNode = texture( map, uvScaled );
```

</page>

<page name="Properties">

Properties serve as reference nodes in the shader graph. They can be created and accessed at any point during shader construction to assign or retrieve values dynamically.

::: api property( type, name? ) - Declares a reference property node in the shader scope.
- **type**: `string` — TSL type name (e.g. `'float'`, `'vec3'`, `'vec4'`).
- **name**: `string` — (Optional) Name of the property in the shader. Defaults to `null`.
:::

<code name="propertiesExample" default="true">Properties Showcase</code>

```tsl propertiesExample
import 'scenes/shaderball';
import * as THREE from 'three';
import { diffuseColor, grayscale } from 'three/tsl';

// 1. Load texture and set it on the material map
const map = new THREE.TextureLoader().load( '../examples/textures/uv_grid_opengl.jpg' );
model.material.map = map;

// 2. Read diffuseColor property and convert it to grayscale on outputNode
model.material.outputNode = grayscale( diffuseColor );
```

</page>

<page name="Array">

The `array()` function in TSL allows creating constant or dynamic value arrays; there are many ways to create arrays in TSL.

To access the values you can use `a[ 1 ]` or `a.element( 1 )`. The difference is that `a[ 1 ]` only allows constant values, while `a.element( 1 )` allows the use of dynamic values such as `a.element( index )` where index is a node.

```js
const colors = array( [
	vec3( 1, 0, 0 ),
	vec3( 0, 1, 0 ),
	vec3( 0, 0, 1 )
] );

const greenColor = colors.element( 1 ); // vec3( 0, 1, 0 )
```

Array fixed size:

```js
const a = array( 'vec3', 2 ); // [ vec3( 0, 0, 0 ), vec3( 0, 0, 0 ) ]
```

Fill an array with a default value:

```js
const a = vec3( 0, 0, 1 ).toArray( 2 ); // [ vec3( 0, 0, 1 ), vec3( 0, 0, 1 ) ]
```

Define an array type explicitly:

```js
const a = array( [ 0, 1, 2 ], 'uint' );
const value = a.element( 1 ); // 1u
```

```tsl
import 'scenes/shaderball';
import { array, vec3, int, time } from 'three/tsl';

// Define a constant array of colors in TSL
const colors = array( [
	vec3( 1, 0, 0 ), // Red
	vec3( 0, 1, 0 ), // Green
	vec3( 0, 0, 1 )  // Blue
] );

// Dynamically cycle the index from 0 to 2 using time
const index = int( time.mul( 1.5 ).mod( 3 ) );

// Select the color from the array
const activeColor = colors.element( index );

model.material.colorNode = activeColor;
```

</page>

<page name="Struct">

Structs allow you to create custom data types with multiple members. They can be used to organize related data in shaders, define structures for attributes and uniforms.

::: api struct( membersLayout, name? ) : Function — Creates a struct type with the specified member layout.
- **membersLayout**: `object` — An object defining the fields and their type strings (e.g., `{ min: 'vec3', max: 'vec3' }`). Members can also be declared as objects to enable WebGPU atomic operations (e.g., `{ x: { type: 'int', atomic: true } }`).
- **name**: `string` — (Optional) The name of the struct type in the generated WGSL/GLSL shader source code. Defaults to `null`.
:::

::: api outputStruct( ...members ) : Node — Creates an output struct node for returning multiple values.
- **members**: `...Node` — The nodes to return as members of the output structure (commonly used in MRT).
:::

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

// Define a custom struct with atomic fields
const Cell = struct( {
	x: { type: 'int', atomic: true },
	y: { type: 'int', atomic: true },
	mass: { type: 'int', atomic: true }
} );
```

```tsl structExample
import 'scenes/shaderball';
import { struct, vec3 } from 'three/tsl';

// Define a custom struct type
const CustomColor = struct( { r: 'float', g: 'float', b: 'float' } );

// Instantiate the struct
const myColor = CustomColor( 0.1, 0.5, 0.9 );

// Retrieve the components and construct a vec3 color node
const finalColor = vec3( myColor.get( 'r' ), myColor.get( 'g' ), myColor.get( 'b' ) );

model.material.colorNode = finalColor;
```

</page>

<page name="Control Flow">

<page name="If-Else">

TSL's `If` builds dynamic conditional branches that execute directly on the GPU (per-vertex or per-pixel). This differs from standard JavaScript `if` statements, which only run once on the CPU during the shader construction phase.

> Important: TSL conditionals must be defined inside a TSL function `Fn()` because they rely on the function's execution stack to build 
conditional shader branches.

> Important: Notice here `If`, `ElseIf`, `Else` are capitalized.

```js

Fn( () => {

	If( conditional, function )
	.ElseIf( conditional, function )
	.Else( function )

} );
```

```tsl
import 'scenes/shaderball';
import { Fn, float, color, vec3, time, positionLocal, If } from 'three/tsl';

const limitPosition = Fn( ( { position } ) => {

	const limit = float( time.sin().abs() );
	const result = vec3( position );

	If( result.y.greaterThan( limit ), () => {

		result.y = limit;

	} ).ElseIf( result.y.lessThan( limit.negate() ), () => {

		result.y = limit.negate();

	} );

	return result;

} );

model.material.colorNode = color( 0x1e90ff );
model.material.positionNode = limitPosition( positionLocal );
```

</page>

<page name="Switch-Case">

A Switch-Case statement is an alternative way to express conditional logic compared to [If-Else](#if-else).

> Important: TSL conditionals must be defined inside a TSL function `Fn()` because they rely on the function's execution stack to build 
conditional shader branches.

> Important: Notice here `Switch`, `Case` and `Default` are capitalized.

```js
const col = color();

Switch( selector )
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

```tsl
import 'scenes/shaderball';
import { Fn, color, time, int, Switch } from 'three/tsl';

const selectColor = Fn( () => {

	const col = color();

	// Cycle selector 0, 1, 2, 3 based on elapsed time
	const selector = int( time.mul( 1.5 ).mod( 4 ) );

	Switch( selector )
		.Case( 0, () => {

			col.assign( color( 1, 0, 0 ) ); // Red

		} )
		.Case( 1, () => {

			col.assign( color( 0, 1, 0 ) ); // Green

		} )
		.Case( 2, 3, () => {

			col.assign( color( 0, 0, 1 ) ); // Blue

		} )
		.Default( () => {

			col.assign( color( 1, 1, 1 ) ); // White

		} );

	return col;

} );

model.material.colorNode = selectColor();
```

</page>

<page name="Ternary">

Different from [If-Else](#if-else), a ternary conditional will return a value and can be used outside of `Fn()`.

::: api select( conditionNode, trueNode, falseNode )
- **conditionNode**: `Node` — TSL condition expression.
- **trueNode**: `Node` — Node or value returned if the condition is true.
- **falseNode**: `Node` — Node or value returned if the condition is false.
:::

```js
const result = select( value.greaterThan( 1 ), 1.0, value );
```
> Equivalent in JavaScript should be: `value > 1 ? 1.0 : value`

<code name="ternaryExample" default="true">Ternary Example</code>

```tsl ternaryExample
import 'scenes/shaderball';
import { select, time, color } from 'three/tsl';

// Alternate color based on time.sin() being greater than 0
const isPositive = time.sin().greaterThan( 0.0 );
const chromaColor = select( isPositive, color( 0x3b82f6 ), color( 0x10b981 ) );

model.material.colorNode = chromaColor;
```

</page>

<page name="Loop">

This module offers a variety of ways to implement loops in TSL.

::: api Loop( count/config, callback )
- **count/config**: `number | object` — Either the iteration count (e.g. `5`), or a configuration object (e.g. `{ start, end, type, condition, name }`).
- **callback**: `Function` — Loop body callback function, receiving index variables destructured (e.g. `( { i } ) => {}`).
:::

In its basic form:

```js
Loop( count, ( { i } ) => {

} );
```

However, it is also possible to define start and end ranges, data types, and loop conditions:

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

It is possible to execute with boolean values, similar to the `while` syntax:

```js
const value = float( 0 );

Loop( value.lessThan( 10 ), () => {

	value.addAssign( 1 );

} );
```

The module also provides `Break()` and `Continue()` TSL expressions for loop control.

<code name="fractalExample" default="true">Fractal Loop Example</code>

```tsl fractalExample
import 'scenes/quad';
import { Fn, float, Loop, uv, color, time, vec2, If, Break } from 'three/tsl';

const julia = Fn( () => {

	// Scale and center UV coordinates
	const z = uv().sub( 0.5 ).mul( 3.0 );

	// Animate the complex constant c over time
	const c = vec2( time.cos().mul( 0.3 ).sub( 0.7 ), time.sin().mul( 0.2 ).add( 0.27015 ) );
	const iterations = float( 0.0 );

	// Loop 32 times to calculate the fractal escape depth
	Loop( 32, ( { i } ) => {

		// Complex number square: z = z^2 + c
		const x = z.x.mul( z.x ).sub( z.y.mul( z.y ) );
		const y = z.x.mul( z.y ).mul( 2.0 );
		z.assign( vec2( x, y ).add( c ) );

		// Break early if the point escapes the threshold
		If( z.length().greaterThan( 2.0 ), () => {

			iterations.assign( i.toFloat() );
			Break();

		} );

	} );

	// Return normalized value based on loop iterations
	return iterations.div( 32.0 );

} );


const fractalVal = julia();

// Create a color gradient based on the loop escape depth
model.material.colorNode = fractalVal.mix( color( 0x050510 ), color( 0x3b82f6 ) ).add( fractalVal.pow( 2.0 ).mul( color( 0x10b981 ) ) );
```

</page>

</page>

<page name="Context Flow">

<page name="Context">
</page>

<page name="Override Node">
</page>

<page name="Isolate">
</page>

</page>

<page name="Events">
</page>

<page name="Compute">

<page name="Subgroup">
</page>

<page name="Workgroup">
</page>

</page>

<page name="Atomic">

Atomic operations in TSL allow performing synchronization-safe read-modify-write operations on GPU memory. In WebGPU, atomic operations are performed on elements of storage buffers or workgroup memory declared as atomic variables.

To create an atomic storage buffer in TSL, you declare a `storage()` node and chain the `.toAtomic()` method on it.

Example:

```js
import * as THREE from 'three';
import { storage, atomicAdd } from 'three/tsl';

// 1. Create a storage buffer attribute (e.g., 1 unsigned integer for a counter)
const counterAttr = new THREE.StorageBufferAttribute( new Uint32Array( [ 0 ] ), 1 );

// 2. Define the storage buffer in TSL and mark it as atomic
const counter = storage( counterAttr, 'uint', 1 ).toAtomic();

// 3. Perform an atomic add operation in your shader (increments the counter and returns the previous value)
const previousValue = atomicAdd( counter.element( 0 ), 1 );
```

</page>

<page name="Shader Stages">

<page name="Vertex Stage and Varying">

Functions and methods used to optimize computations by moving them to the vertex shader stage and passing them as interpolated variables to the fragment shader stage.

### Vertex Stage

::: api vertexStage( node )
- **node**: `Node` — TSL expression to compute on the vertex stage.
:::

::: api .toVertexStage() - Chainable method to convert any existing node or expression directly into a vertex-stage calculation. :::

The `vertexStage()` function forces a calculation to be performed in the vertex stage of the GPU pipeline, rather than in the fragment stage. This is useful for optimizing expensive operations by performing them per-vertex and interpolating the results.

Example:

```js
// Multiplication will be executed in vertex stage
const normalView = modelNormalMatrix.mul( normalLocal ).toVertexStage();

// Normalize will be computed in fragment stage
material.colorNode = normalView.normalize();
```

<code name="vertexStageExample" default="true">Vertex stage example</code>

```tsl vertexStageExample
import 'scenes/shaderball';
import { modelNormalMatrix, normalLocal } from 'three/tsl';

// Using .toVertexStage() chainable method syntax
const normalView = modelNormalMatrix.mul( normalLocal ).toVertexStage();

// Normalization is interpolated and computed in the fragment stage
model.material.colorNode = normalView.normalize();
```

### Varying

Similarly to `vertexStage()`, `varying()` function forces a calculation to be performed in the vertex stage of the GPU pipeline, but it also declares a named varying variable.

::: api varying( node, name? )
- **node**: `Node` — TSL expression to compute in the vertex stage and pass to the fragment stage.
- **name**: `string` — (Optional) Custom name for the varying variable. Defaults to `null`.
:::

::: api .toVarying( name? ) - Chainable method to convert any existing node or expression directly into a varying variable.
- **name**: `string` — (Optional) Custom name for the varying variable. Defaults to `null`.
:::

If `varying()` is added only to `material.positionNode`, it will only return a simple variable and a varying will not be created because `material.positionNode` is computed at the vertex stage.

<code name="varyingExample">Varying example</code>

```tsl varyingExample
import 'scenes/shaderball';
import { uv } from 'three/tsl';

// Using .toVarying() chainable method syntax
const myVaryingUv = uv().mul( 10.0 ).toVarying( 'vScaledUv' );

// Sample colors in the fragment shader using sine wave of the varying UV
model.material.colorNode = myVaryingUv.sin();
```

### Varying Property

The `varyingProperty()` function declares a varying property placeholder in the shader without initializing it immediately. This is useful when you need to write to the varying inside a custom TSL function.

::: api varyingProperty( type, name? )
- **type**: `string` — TSL type name (e.g. `'float'`, `'vec3'`, etc.).
- **name**: `string` — (Optional) Custom name for the varying variable. Defaults to `null`.
:::

<code name="varyingPropertyExample">Varying property example</code>

```tsl varyingPropertyExample
import 'scenes/shaderball';
import { Fn, varyingProperty, positionLocal, vertexStage, time, vec3 } from 'three/tsl';

// Declare a varying property placeholder
const myVarying = varyingProperty( 'vec3', 'vCustomColor' );

const mainVertex = Fn( () => {

	// Animate/offset position in the vertex stage
	const offsetPosition = positionLocal.add( vec3( 0, time.sin().mul( 0.2 ), 0 ) );

	// Assign the animated position to our varying property
	myVarying.assign( offsetPosition );

	return offsetPosition;

} );

// Link the vertex function to positionNode to execute it on the vertex stage
model.material.positionNode = vertexStage( mainVertex() );

// Read from the varying property in the fragment stage
model.material.colorNode = myVarying;
```

</page>

<page name="Compute Stage">

The **Compute Stage** allows you to perform general-purpose parallel computations (GPGPU) directly on the GPU using compute shaders. This is useful for complex physics simulations, particle updates, procedural geometry deformations, etc.

TSL provides the `compute()` function to wrap TSL functions into `ComputeNode`s, which can be executed either automatically by the rendering pipeline or manually using `renderer.compute()`.

::: api compute( node, count, workgroupSize? )
- **node**: `Node` — TSL function call containing the logic for the compute shader.
- **count**: `number` — Total number of dispatches (threads/instances).
- **workgroupSize**: `Array<number>` — (Optional) The size of the workgroup threads. Defaults to `[ 64 ]`.
:::

::: api .compute( count, workgroupSize? )
- **count**: `number` — Total number of dispatches (threads/instances).
- **workgroupSize**: `Array<number>` — (Optional) The size of the workgroup threads. Defaults to `[ 64 ]`.
:::

<code name="computeParticleSystem" default="true">Particle example</code>

<code name="computeGeometry">Compute geometry example</code>

```tsl computeGeometry
import 'scenes/shaderball';
import { Fn, instancedArray, storage, instanceIndex, time, vertexIndex, OnBeforeMaterialUpdate, varying } from 'three/tsl';

// Get total vertex count from the model geometry
const count = model.geometry.attributes.position.count;

// Create storage arrays for base and computed positions
const basePositions = storage( model.geometry.attributes.position, 'vec3', count );
const currentPositions = instancedArray( count, 'vec3' );

// Define a compute shader that deforms the mesh vertices over time
const computeWave = Fn( () => {

	const basePos = basePositions.element( instanceIndex );
	const currentPos = currentPositions.element( instanceIndex );

	// Calculate a waving displacement
	const waveOffset = basePos.y.add( time ).sin().mul( 0.15 );
	const displacedPos = basePos.add( basePos.normalize().mul( waveOffset ) );

	currentPos.assign( displacedPos );

} )().compute( count );

// Declare a varying to pass the computed position from the vertex stage to the fragment stage
const vDisplacedPos = currentPositions.element( vertexIndex ).toVarying();

// Map the computed buffer to the positionNode
model.material.positionNode = Fn( () => {

	OnBeforeMaterialUpdate( ( { renderer } ) => {

		renderer.compute( computeWave );

	} );

	return vDisplacedPos;

} )();

// Set animated colors based on computed positions using the varying
model.material.colorNode = vDisplacedPos.add( 0.5 );
```

```tsl computeParticleSystem
import 'scenes/empty';
import * as THREE from 'three';
import { Fn, instancedArray, instanceIndex, time, OnBeforeMaterialUpdate, hash, If, color, OnMaterialInit } from 'three/tsl';

const particleCount = 1024;

// 1. Declare Storage Buffers and Spawn Area Config
const area = { width: 7.0, height: 10.0, depth: 7.0 };

const positions = instancedArray( particleCount, 'vec3' );
const velocities = instancedArray( particleCount, 'vec3' );

// 2. Define the Initialization Compute Shader
const computeInit = Fn( () => {

	const pos = positions.element( instanceIndex );
	const vel = velocities.element( instanceIndex );

	// Stagger Y heights to distribute the starts
	pos.x = hash( instanceIndex ).sub( 0.5 ).mul( area.width );
	pos.y = hash( instanceIndex.add( 1.0 ) ).mul( area.height + 2.0 ).sub( 2.0 ); // Staggered height
	pos.z = hash( instanceIndex.add( 2.0 ) ).sub( 0.5 ).mul( area.depth );

	// Small downward starting velocity
	vel.x = hash( instanceIndex.add( 3.0 ) ).sub( 0.5 ).mul( 0.02 );
	vel.y = hash( instanceIndex.add( 4.0 ) ).mul( -0.02 );
	vel.z = hash( instanceIndex.add( 5.0 ) ).sub( 0.5 ).mul( 0.02 );

} )().compute( particleCount );

// 3. Define the Update Compute Shader
const computeUpdate = Fn( () => {

	const pos = positions.element( instanceIndex );
	const vel = velocities.element( instanceIndex );

	// Apply gravity
	vel.y.subAssign( 0.002 );

	// Update position
	pos.addAssign( vel );

	// Floor collision (grid helper height in scenes/empty is -2)
	const floorLevel = -2.0;
	If( pos.y.lessThan( floorLevel ), () => {

		pos.y = floorLevel;

		// Bounce with randomized damping (between 0.4 and 0.7)
		const bounceDamping = hash( instanceIndex.add( time ) ).mul( 0.3 ).add( 0.4 );
		vel.y = vel.y.negate().mul( bounceDamping );

		// Friction
		vel.x = vel.x.mul( 0.9 );
		vel.z = vel.z.mul( 0.9 );

		// Reset particle when it comes to rest on the floor to loop the animation
		If( vel.y.abs().lessThan( 0.02 ), () => {

			pos.x = hash( instanceIndex.add( time ) ).sub( 0.5 ).mul( area.width );
			pos.y = area.height; // Reset to the top spawn height
			pos.z = hash( instanceIndex.add( time.add( 1.0 ) ) ).sub( 0.5 ).mul( area.depth );

			vel.x = hash( instanceIndex.add( time.add( 2.0 ) ) ).sub( 0.5 ).mul( 0.02 );
			vel.y = hash( instanceIndex.add( time.add( 3.0 ) ) ).mul( -0.02 ); // Falling start
			vel.z = hash( instanceIndex.add( time.add( 4.0 ) ) ).sub( 0.5 ).mul( 0.02 );

		} );

	} );

} )().compute( particleCount );

// 4. Create a sprite material and link positions storage buffer
const material = new THREE.SpriteNodeMaterial();
material.positionNode = positions.toAttribute();

// Set particle color based on velocity direction (RGB chroma)
const velDir = velocities.toAttribute().normalize();
material.colorNode = velDir.mul( 0.5 ).add( 0.5 );
material.scaleNode = 0.12;

// 5. Register automatic compute updates
material.positionNode = Fn( () => {

	OnMaterialInit( ( { renderer } ) => {

		renderer.compute( computeInit );

	} );

	OnBeforeMaterialUpdate( ( { renderer } ) => {

		renderer.compute( computeUpdate );

	} );

	return positions.element( instanceIndex );

} )();

// 6. Create sprite object and add to scene
const particles = new THREE.Sprite( material );
particles.count = particleCount;
particles.frustumCulled = false;
scene.add( particles );
```

</page>

</page>

</page>

<page name="Inputs">

<page name="Attributes">

Attributes are inputs that are defined per-vertex or per-instance in the geometry of a mesh.

<code name="vertexIndexExample" default="true">Vertex index example</code>

<code name="attributesExample">Attributes example</code>

### Constants

::: api instanceIndex : `uint` - The index of the current instance. :::

::: api vertexIndex : `uint` - The index of a vertex within a mesh. :::

::: api drawIndex : `uint` - The draw index when using multi-draw. :::

### Functions

::: api attribute( name, type? )
- **name**: `string` — Name of the geometry attribute.
- **type**: `string` — (Optional) Explicit TSL type name. Defaults to `null`.
:::

::: api uv( index? )
- **index**: `number` — (Optional) The UV coordinate set index. Defaults to `0`.
:::

::: api vertexColor( index? )
- **index**: `number` — (Optional) The vertex color set index. Defaults to `0`.
:::

::: api batch( batchMesh )
- **batchMesh**: `BatchedMesh` — Creates a batch node for BatchedMesh.
:::

::: api instance( instancedMesh )
- **instancedMesh**: `InstancedMesh` — Creates an instance node for InstancedMesh.
:::

```tsl attributesExample
import 'scenes/shaderball';
import { uv } from 'three/tsl';

// Map the UV coordinate attribute directly to colorNode
model.material.colorNode = uv();
```

```tsl vertexIndexExample
import 'scenes/shaderball';
import { vec3, vertexIndex, hash, positionLocal, time, color } from 'three/tsl';

// Oscillate explosion factor between 0.0 (assembled) and 1.0 (fully exploded)
const factor = time.mul( 0.8 ).sin().mul( 0.5 ).add( 0.5 );

// Group vertices by triangle (3 vertices per face) to move faces as rigid bodies
const faceIndex = vertexIndex.div( 3 );

// Generate a random explosion direction for each face using hash and faceIndex
const randomDir = vec3(
	hash( faceIndex.add( 11.0 ) ).sub( 0.5 ),
	hash( faceIndex.add( 22.0 ) ).sub( 0.5 ),
	hash( faceIndex.add( 33.0 ) ).sub( 0.5 )
).normalize();

// Randomize explosion speed for each face
const speed = hash( faceIndex ).add( 0.5 );

// Displace vertices outward (each face flies away as a flat triangle)
const displacement = randomDir.mul( factor.mul( speed ).mul( 1.5 ) );
model.material.positionNode = positionLocal.add( displacement );

// Transition color from blue (stable/cold) to orange (exploded/hot gas)
model.material.colorNode = factor.mix( color( 0x3b82f6 ), color( 0xffaa76 ) );
```

</page>

<page name="Uniform">

Uniforms are useful to update values of variables like colors, lighting, or transformations without having to recreate the shader program. They are the true variables from a GPU.

::: api uniform( value, type? )
- **value**: `boolean | Number | Color | Vector2 | Vector3 | Vector4 | Matrix3 | Matrix4` — Dynamic value to initialize the uniform with.
- **type**: `string` — (Optional) Explicit TSL type name (e.g. `'float'`, `'vec3'`, etc.). Defaults to `null`.
:::

<code name="uniformEventUpdate">Uniform material update example</code>

It is also possible to create update events on `uniforms`, which can be defined by the user:

::: api .onObjectUpdate( callback: Function ) - It will be updated every time an object like `Mesh` is rendered with this `Node` in `Material`. :::

::: api .onRenderUpdate( callback: Function ) - It will be updated once per render, common and shared materials, fog, tone mapping, etc. :::

::: api .onFrameUpdate( callback: Function ) - It will be updated only once per frame, regardless of when `render-pass` the frame has, cases like `time` for example. :::

<code name="uniformInlineUpdate">Uniform inline update example</code>

```tsl uniformEventUpdate
import 'scenes/shaderball';
import { uniform, Fn, OnMaterialUpdate } from 'three/tsl';

const main = Fn( () => {

	const ramp = uniform( 0 );

	OnMaterialUpdate( ( { time } ) => {

		// update uniform value
		ramp.value = Math.abs( Math.sin( time ) );

	} );

	return ramp;

} );

model.material.colorNode = main();
```

```tsl uniformInlineUpdate
import 'scenes/shaderball';
import { uniform, color } from 'three/tsl';

// Inline update using onFrameUpdate event
const ramp = uniform( 0 ).onFrameUpdate( ( { time } ) => time % 1.0 );

// Assign to colorNode
model.material.colorNode = ramp.mul( color( 0x1e90ff ) );
```

</page>

<page name="Uniform Array">

It is possible to use the same [Array](#array) logic for uniforms using Three.js native components or primitive values.

::: api uniformArray( values, type? )
- **values**: `Array` — Array of initial values (e.g. `Color`, `Vector3`, numbers, etc.).
- **type**: `string` — (Optional) Explicit TSL type name (e.g. `'color'`, `'vec3'`, etc.). Defaults to `null`.
:::

```js
const tintColors = uniformArray( [
	new Color( 1, 0, 0 ),
	new Color( 0, 1, 0 ),
	new Color( 0, 0, 1 )
] );

const redColor = tintColors.element( 0 );
```

```tsl
import 'scenes/shaderball';
import * as THREE from 'three';
import { uniformArray, int, time } from 'three/tsl';

// Define a uniform array of Colors using THREE.Color
const tintColors = uniformArray( [
	new THREE.Color( 1, 0, 0 ), // Red
	new THREE.Color( 0, 1, 0 ), // Green
	new THREE.Color( 0, 0, 1 )  // Blue
] );

// Dynamically select the element index based on time
const index = int( time.mul( 1.5 ).mod( 3 ) );

// Apply the selected color to the sphere
model.material.colorNode = tintColors.element( index );
```

</page>

<page name="Storage">
</page>

<page name="Storage Array">

It is possible to create arrays that can be used in compute shaders and storage operations.

Under the hood, `instancedArray` creates a `StorageInstancedBufferAttribute`:

::: api instancedArray( array, type )
- **array**: `TypedArray | Array` — Primitive values or typed arrays to initialize the buffer.
- **type**: `string` — TSL type name (e.g. `'float'`, `'vec3'`, etc.).
:::

Under the hood, `attributeArray` creates a `StorageBufferAttribute`:

::: api attributeArray( array, type )
- **array**: `TypedArray | Array` — Primitive values or typed arrays to initialize the buffer.
- **type**: `string` — TSL type name (e.g. `'float'`, `'vec3'`, etc.).
:::

Example:

```js
const myArray = attributeArray( new Float32Array( [ 0.05, 0.1, 0.15 ] ), 'float' )
```

```tsl
import 'scenes/shaderball';
import { attributeArray, positionLocal, normalLocal, time, int, vec3 } from 'three/tsl';

// Define a palette of 6 colors in a Float32Array (r, g, b components)
const colorPalette = attributeArray( new Float32Array( [
	0.95, 0.15, 0.15, // Hot Red
	0.95, 0.45, 0.00, // Vivid Orange
	0.95, 0.85, 0.00, // Neon Yellow
	0.05, 0.85, 0.45, // Teal Green
	0.05, 0.45, 0.95, // Bright Blue
	0.75, 0.05, 0.95  // Electric Purple
] ), 'vec3' );

// Calculate the 3D distance from the center of the preview sphere (0, 1, 0)
const sphereCenter = vec3( 0.0, 1.0, 0.0 );
const distance = positionLocal.sub( sphereCenter ).length().mul( 4.0 );

// Animate concentric rings expanding outwards over time
const scroll = distance.sub( time.mul( 1.5 ) ).fract();

// Index into the color palette based on the scroll factor
const index = int( scroll.mul( 5.9 ) );
const stripeColor = colorPalette.element( index );

// Generate physical concentric ridges matching the color wave
const wave = scroll.mul( 3.14159 ).sin().pow( 4.0 ).mul( 0.025 );
model.material.positionNode = positionLocal.add( normalLocal.mul( wave ) );

// Apply the scrolling palette colors to the shaderball material
model.material.colorNode = stripeColor;
```

</page>

</page>

<page name="Acessors">

<page name="Coordinate Spaces">

TSL provides various nodes to access geometric properties, such as positions, normals, tangents, and bitangents, at different stages of the shader transformation pipeline. Understanding these coordinate spaces is essential for operations like lighting calculations, normal mapping, and procedural texturing.

- **Geometry Space**: Accesses raw, unmodified attributes directly from the geometry buffers before any transformations. In TSL, these nodes are referenced using the `*Geometry` pattern (such as `positionGeometry` or `normalGeometry`).
- **Local Space**: Coordinates are relative to the object's origin. In TSL, these nodes are referenced using the `*Local` pattern (such as `positionLocal` or `normalLocal`) and reflect the transformed local geometry after applying GPU-side deformations like skeletal skinning or morph targets.
- **World Space**: Coordinates are transformed relative to the absolute origin of the global scene. In TSL, these nodes are referenced using the `*World` pattern (such as `positionWorld` or `normalWorld`). They are essential for calculating global lighting, world-space reflections, and interactions between different meshes.
- **View Space**: Coordinates are transformed relative to the active camera. In TSL, these nodes are referenced using the `*View` pattern (such as `positionView` or `normalView`). They are commonly used for camera-dependent calculations, including Fresnel edge-glow outlines, specular highlights, and screen-space effects.

</page>

<page name="Position">

Position nodes provide access to the coordinates of vertices or fragments at different transformation stages. In TSL, these values are mapped to specific [Coordinate Spaces](#coordinate-spaces) (Geometry, Local, World, or View) to allow precise control over vertex displacement, morphing, and view-dependent effects.

::: api positionGeometry : vec3 - Position attribute of geometry. :::

::: api positionLocal : vec3 - Transformed local position. :::

::: api positionWorld : vec3 - Transformed world position. :::

::: api positionWorldDirection : vec3 - Normalized world direction. :::

::: api positionView : vec3 - View position. :::

::: api positionViewDirection : vec3 - Normalized view direction. :::

> Important: The transformed term reflects the modifications applied by processes such as **skinning**, **morphing**, and similar techniques.

<code name="positionExample" default="true">Local vs World Space</code>

```tsl positionExample
import 'scenes/shaderball';
import { positionLocal, positionWorld, Fn, float, fract, abs, fwidth, max, saturate, color } from 'three/tsl';

// Simple 3D grid generator
const grid = Fn( ( [ pos ] ) => {

	const scale = pos.mul( 8.0 );
	const g = fract( scale );
	const fw = fwidth( scale );
	const dist = abs( g.sub( 0.5 ) );
	const line = saturate( float( 0.05 ).sub( dist ).div( fw ).add( 0.5 ) );
	return max( line.x, line.y, line.z );

} );

// Split the model: Left side uses positionLocal, Right side uses positionWorld
const isRightSide = positionWorld.x.greaterThan( 0.0 );
const coords = isRightSide.select( positionWorld, positionLocal );

// Render the grid: the left side rotates, the right side stays static in space!
const gridLines = grid( coords );
const stripeColor = isRightSide.select( color( 0x06b6d4 ), color( 0xec4899 ) ); // Cyan (World) vs Pink (Local)

model.material.colorNode = gridLines.mix( color( 0x1f2937 ), stripeColor );
```

</page>

<page name="Normal">

Normal nodes provide access to surface direction vectors at different transformation stages. In TSL, these values are mapped to specific [Coordinate Spaces](#coordinate-spaces) (Geometry, Local, World, or View) to allow precise control over lighting, reflections, and normal mapping.

::: api normalGeometry : vec3 - Normal attribute of geometry. :::

::: api normalLocal : vec3 - Local variable for normal. :::

::: api normalView : vec3 - Normalized transformed view normal. :::

::: api normalViewGeometry : vec3 - Normalized view normal. :::

::: api normalWorld : vec3 - Normalized transformed world normal. :::

::: api normalWorldGeometry : vec3 - Normalized world normal. :::

> Important: The transformed term here also includes following the correct orientation of the face, so that the normals are inverted inside the geometry.

```tsl
import 'scenes/shaderball';
import * as THREE from 'three';
import { normalView, positionViewDirection, color } from 'three/tsl';

// Calculate X-ray factor (opaque at edges, transparent in the center)
const viewDot = normalView.dot( positionViewDirection ).clamp();
const xray = viewDot.oneMinus().pow( 2.0 );

// Assign glowing cyan color and map the X-ray factor to the opacity
model.material.colorNode = color( 0x00f3ff );
model.material.opacityNode = xray;
model.material.transparent = true;
model.material.side = THREE.DoubleSide;
```

</page>

<page name="Tangent">

Tangent nodes provide access to surface tangent vectors at different transformation stages. In TSL, these values are mapped to specific [Coordinate Spaces](#coordinate-spaces) (Geometry, Local, World, or View) to allow precise control over normal mapping, anisotropic reflections, and local coordinate orientation.

::: api tangentGeometry : vec4 - Tangent attribute of geometry. :::

::: api tangentLocal : vec3 - Local variable for tangent. :::

::: api tangentView : vec3 - Normalized transformed view tangent. :::

::: api tangentWorld : vec3 - Normalized transformed world tangent. :::

<code name="tangentExample" default="true">Anisotropic Directional Glow</code>

```tsl tangentExample
import 'scenes/shaderball';
import * as THREE from 'three';
import { tangentView, positionViewDirection, color } from 'three/tsl';

// Calculate alignment between view-space tangents and view direction
const alignment = tangentView.dot( positionViewDirection ).abs();
const edgeGlow = alignment.pow( 4.0 ); // Concentrated highlight on the left and right edges

// Mix a dark background with a glowing neon purple directional highlight
model.material = new THREE.NodeMaterial();
model.material.colorNode = edgeGlow.mix( color( 0x070c1b ), color( 0xbd00ff ) );
```

</page>

<page name="Bitangent">

Bitangent nodes provide access to surface bitangent vectors at different transformation stages. In TSL, these values are mapped to specific [Coordinate Spaces](#coordinate-spaces) (Geometry, Local, World, or View). Together with normals and tangents, they complete the three-dimensional local coordinate basis (TBN) at the surface of the geometry.

::: api bitangentGeometry : vec3 - Normalized bitangent in geometry space. :::

::: api bitangentLocal : vec3 - Normalized bitangent in local space. :::

::: api bitangentView : vec3 - Normalized transformed bitangent in view space. :::

::: api bitangentWorld : vec3 - Normalized transformed bitangent in world space. :::

<code name="bitangentExample" default="true">Vertical Anisotropic Glow</code>

```tsl bitangentExample
import 'scenes/shaderball';
import * as THREE from 'three';
import { bitangentView, positionViewDirection, color } from 'three/tsl';

// Calculate alignment between view-space bitangents and view direction
const alignment = bitangentView.dot( positionViewDirection ).abs();
const edgeGlow = alignment.pow( 4.0 ); // Concentrated highlight on the top and bottom edges

// Mix a dark background with a glowing warm gold directional highlight
model.material = new THREE.NodeMaterial();
model.material.colorNode = edgeGlow.mix( color( 0x0a0603 ), color( 0xffaa00 ) );
```

</page>

<page name="Camera">

Camera nodes provide access to the active camera's parameters, transformation matrices, and spatial orientation properties. These are crucial for depth-based calculations, projection transformations, and screen-space coordinates.

::: api cameraNear : float - Near plane distance of the camera. :::

::: api cameraFar : float - Far plane distance of the camera. :::

::: api cameraProjectionMatrix : mat4 - Projection matrix of the camera. :::

::: api cameraProjectionMatrixInverse : mat4 - Inverse projection matrix of the camera. :::

::: api cameraViewMatrix : mat4 - View matrix of the camera. :::

::: api cameraWorldMatrix : mat4 - World matrix of the camera. :::

::: api cameraNormalMatrix : mat3 - Normal matrix of the camera. :::

::: api cameraPosition : vec3 - World position of the camera. :::

<code name="cameraExample" default="true">Dithering Dissolve</code>

```tsl cameraExample
import 'scenes/shaderball';
import { cameraPosition, positionWorld, viewportCoordinate, color, float } from 'three/tsl';

// 1. Calculate the distance from the camera to the surface
const distanceToCamera = cameraPosition.distance( positionWorld );

// 2. Define a dissolve threshold that increases (from 0 to 1) as the camera gets closer
// It starts dissolving at 5.0 units away, and is completely dissolved at 1.5 units.
const dissolveStart = float( 5.0 );
const dissolveEnd = float( 1.5 );
const threshold = dissolveStart.sub( distanceToCamera ).div( dissolveStart.sub( dissolveEnd ) ).clamp( 0.0, 1.0 );

// 3. Generate a screen-space pseudo-random dither threshold based on pixel coordinates
const pixelCoords = viewportCoordinate.floor();
const ditherVal = pixelCoords.x.mul( 12.9898 ).add( pixelCoords.y.mul( 78.233 ) ).sin().mul( 43758.5453 ).fract();

// 4. Assign the dither comparison as the material's maskNode (true to keep, false to discard)
model.material.maskNode = ditherVal.greaterThanEqual( threshold );

// Set a glowing orange color
model.material.colorNode = color( 0xff5500 );
```

</page>

<page name="Model">

Model nodes provide access to the object's transformation matrices, scale, position, and orientation properties. These are crucial for converting coordinates from local to world space, and adjusting material properties dynamically based on the object's physical transform in the scene.

<code name="modelExample" default="true">Pulsing Energy Ripples</code>

::: api modelDirection : vec3 - Direction of the model. :::

::: api modelViewMatrix : mat4 - View-space matrix of the model. :::

::: api modelNormalMatrix : mat3 - View-space matrix of the model. :::

::: api modelWorldMatrix : mat4 - World-space matrix of the model. :::

::: api modelPosition : vec3 - Position of the model. :::

::: api modelScale : vec3 - Scale of the model. :::

::: api modelViewPosition : vec3 - View-space position of the model. :::

::: api modelWorldMatrixInverse : mat4 - Inverse world matrix of the model. :::

::: api highpModelViewMatrix : mat4 - View-space matrix of the model computed on CPU using 64-bit. :::

::: api highpModelNormalViewMatrix : mat3 - View-space normal matrix of the model computed on CPU using 64-bit. :::

```tsl modelExample
import 'scenes/shaderball';
import { positionWorld, modelPosition, time, color } from 'three/tsl';

// Calculate the world-space vector from the model's center pivot
const localOffset = positionWorld.sub( modelPosition );

// Get the distance from the center of the model
const distance = localOffset.length();

// Create animated concentric wave ripples expanding from the model's center
const wave = distance.sub( time.mul( .3 ) ).mul( 7.0 );
const ripple = wave.sin().abs().oneMinus().pow( 3.0 ); // Soft, high-contrast glow bands

// Mix a sleek dark metallic blue with glowing neon energy ripples
model.material.colorNode = ripple.mix( color( 0x050c18 ), color( 0xffaa00 ) );
```

</page>

<page name="Screen">

Screen nodes return values related to the current frame buffer, either normalized or in physical pixel units considering the current device pixel ratio (DPR).

<code name="screenExample" default="true">Screen-Space Projection</code>

::: api screenUV : vec2 - Returns the normalized frame buffer coordinate. :::

::: api screenCoordinate : vec2 - Returns the frame buffer coordinate in physical pixel units. :::

::: api screenSize : vec2 - Returns the frame buffer size in physical pixel units. :::

::: api screenDPR : float - Returns the device pixel ratio (DPR). :::

```tsl screenExample
import 'scenes/shaderball';
import * as THREE from 'three';
import { screenUV, texture } from 'three/tsl';

// Load a test grid texture and disable flipY on the texture instance
const map = new THREE.TextureLoader().load( '../examples/textures/uv_grid_opengl.jpg' );
map.flipY = false;

// Project the texture directly onto screen-space coordinates
// The texture will appear completely fixed to the 2D screen as you orbit or pan the camera!
model.material.colorNode = texture( map, screenUV );
```

</page>

<page name="Viewport">

Viewport nodes return values and textures representing the screen-space viewport area. They are relative to the active viewport region and support physical pixel units, enabling advanced screen-space effects like refraction, depth testing, and volumetric rendering.

<code name="refractionExample" default="true">Glass Refraction</code>

<code name="depthVolumeExample">Depth Refraction</code>

<code name="privateGlassExample">Private Glass</code>

<code name="invertExample">Invert Glass</code>

::: api viewport : vec4 - Returns the viewport dimension in physical pixel units. :::

::: api viewportUV : vec2 - Returns the normalized viewport coordinate. :::

::: api viewportCoordinate : vec2 - Returns the viewport coordinate in physical pixel units. :::

::: api viewportSize : vec2 - Returns the viewport size in physical pixel units. :::

### Texture

::: api viewportSharedTexture( uv?, level? ) - Accesses the screen framebuffer texture already rendered in the current scene, sharing a single texture instance across all calls for optimal performance while preserving render order.
- **uv**: `Node` — (Optional) Coordinate node used for sampling the shared viewport texture. Defaults to `screenUV`.
- **level**: `Node` — (Optional) Mipmap level node to sample from. Defaults to `null`.
:::

::: api viewportMipTexture( uv?, level?, framebufferTexture? ) - Returns a viewport texture with mipmap generation enabled for blurred or LOD screen-space effects.
- **uv**: `Node` — (Optional) Coordinate node used for sampling the viewport texture. Defaults to `screenUV`.
- **level**: `Node` — (Optional) Mipmap level node to sample from. Defaults to `null`.
- **framebufferTexture**: `FramebufferTexture` — (Optional) Custom framebuffer texture instance. Defaults to `null`.
:::

### Depth

::: api viewportLinearDepth : float - Returns the linear (orthographic) depth value of the current fragment. :::

::: api viewportDepthTexture( uv?, level? ) - Returns the depth texture of the current viewport for screen-space depth evaluation and volume effects.
- **uv**: `Node` — (Optional) Coordinate node used for sampling the depth texture. Defaults to `screenUV`.
- **level**: `Node` — (Optional) Mipmap level node to sample from. Defaults to `null`.
:::

### Utils

::: api viewportSafeUV( uv? ) - Generates depth-aware safe UV coordinates for screen-space refraction. Performs depth testing to prevent foreground objects located in front of the refractive surface from leaking into the refraction sample. Returns `vec2`.
- **uv**: `vec2` — (Optional) Refracted UV coordinate node to evaluate. Defaults to `screenUV`.
:::

```tsl refractionExample
import 'scenes/shaderball';
import { color, normalLocal, positionLocal, modelNormalMatrix, viewportUV, viewportSharedTexture, positionView, positionViewDirection } from 'three/tsl';

// 1. Isolate high-frequency surface details by subtracting
// the smooth base normal from the actual geometry normal
const smoothNormal = positionLocal.normalize();
const detailNormal = normalLocal.sub( smoothNormal );

// 2. Transform the detail normal to view-space
const detailNormalView = modelNormalMatrix.mul( detailNormal );

// 3. Calculate a refracted UV coordinate using only the details normal (scaled by camera distance)
const distance = positionView.negate().dot( positionViewDirection );
const refractedUV = viewportUV.add( detailNormalView.xy.mul( 0.4 ).div( distance ) );

// 4. Sample the background scene using the refracted UV
model.material.backdropNode = viewportSharedTexture( refractedUV ).mul( color( 0x7dd3fc ) );
model.material.transparent = true;
```

```tsl depthVolumeExample
import 'scenes/shaderball';
import { color, normalLocal, positionLocal, modelNormalMatrix, viewportUV, viewportSharedTexture, positionView, positionViewDirection, viewportLinearDepth, linearDepth, cameraNear, cameraFar } from 'three/tsl';
import { hashBlur } from 'three/addons/tsl/display/hashBlur.js';

// 1. Isolate high-frequency surface details by subtracting
// the smooth base normal from the actual geometry normal
const smoothNormal = positionLocal.normalize();
const detailNormal = normalLocal.sub( smoothNormal );

// 2. Transform the detail normal to view-space
const detailNormalView = modelNormalMatrix.mul( detailNormal );

// 3. Calculate a refracted UV coordinate using only the details normal (scaled by camera distance)
const distance = positionView.negate().dot( positionViewDirection );
const refractedUV = viewportUV.add( detailNormalView.xy.mul( 0.4 ).div( distance ) );

// 4. Calculate the distance (thickness) between the surface and the background in actual scene units
const thickness = viewportLinearDepth.sub( linearDepth() ).mul( cameraFar.sub( cameraNear ) );

// 5. Compute the blur amount based on depth (objects further behind look blurrier)
const blurAmount = thickness.mul( 0.025 ).clamp( 0.0, 0.12 );

// 6. Sample the background scene with hash-blur at the refracted coordinates
model.material.backdropNode = hashBlur( viewportSharedTexture( refractedUV ), blurAmount ).mul( color( 0x7dd3fc ) );
model.material.transparent = true;
```

```tsl privateGlassExample
import 'scenes/shaderball';
import { viewportSharedTexture, viewportUV, viewportSize, vec2 } from 'three/tsl';

// 1. Correct for screen aspect ratio to keep the mosaic cells perfectly square
const blocksY = 40.0;
const blocksX = viewportSize.x.div( viewportSize.y ).mul( blocksY );
const blocks = vec2( blocksX, blocksY );

// 2. Quantize the screen coordinates into a grid (pixelation effect)
const pixelGrid = viewportSharedTexture( viewportUV.mul( blocks ).floor().div( blocks ) );

// 3. Sample the standard texture at the quantized screen coordinates
model.material.colorNode = pixelGrid;
model.material.transparent = true;
```

```tsl invertExample
import 'scenes/shaderball';
import * as THREE from 'three';
import { viewportSharedTexture } from 'three/tsl';

// Replace the material with a transparent NodeMaterial
model.material = new THREE.NodeMaterial();
model.material.colorNode = viewportSharedTexture().rgb.oneMinus();
model.material.transparent = true;
```

</page>

</page>

<page name="Scene">

<page name="Fog">

Functions for creating fog effects in the scene. Assign the fog node to `scene.fogNode`.

::: api scene.fogNode : Node - Assign a node to control the scene's fog effect. :::

::: api fog( color, factor ) : FogNode - Creates a fog node with specified color and fog factor. :::

::: api rangeFogFactor( near, far ) : float - Creates a linear fog factor based on distance from camera. :::

::: api densityFogFactor( density ) : float - Creates an exponential squared fog factor for denser fog. :::

::: api exponentialHeightFogFactor( density, height ) : float - Creates an exponential height fog factor below a specified world height. :::

<code name="volumetricFog" default="true">Volumetric Fog</code>

```tsl volumetricFog
import 'scenes/shaderball';
import { fog, positionWorld, cameraPosition, float, color } from 'three/tsl';

// Volumetric Fog Parameters (Beer-Lambert Law)
const groundDensity = float( 1.00 );   // Base ground fog density (m⁻¹)
const heightFalloff = float( 1.25 );   // Exponential height scale
const fogGroundHeight = float( 0.0 );  // Ground height Y
const atmosphericHaze = float( 0.02 ); // Uniform background haze density

// 1. Ray vector from camera to fragment
const ray = positionWorld.sub( cameraPosition );
const rayLength = ray.length();
const dy = ray.y; // Vertical delta (P_y - C_y)

// 2. Camera-level ground fog density: g0 * exp( -heightFalloff * (C_y - fogGroundHeight) )
const cameraHeightOffset = cameraPosition.y.sub( fogGroundHeight );
const cameraDensity = groundDensity.mul( heightFalloff.negate().mul( cameraHeightOffset ).exp() );

// 3. Analytical integration of optical depth along the ray path
const x = dy.mul( heightFalloff );
const safeX = x.abs().lessThan( 0.001 ).select( float( 1.0 ), x );
const expr = float( 1.0 ).sub( x.negate().exp() ).div( safeX );
const integratedHeight = x.abs().lessThan( 0.001 ).select( float( 1.0 ).sub( x.mul( 0.5 ) ), expr );

// Ground fog optical depth + uniform atmospheric haze optical depth
const groundOpticalDepth = cameraDensity.mul( integratedHeight ).mul( rayLength ).max( 0.0 );
const atmosphericOpticalDepth = atmosphericHaze.mul( rayLength );
const totalOpticalDepth = groundOpticalDepth.add( atmosphericOpticalDepth );

// 4. Transmittance & fog factor according to Beer-Lambert Law: F = 1 - exp( -totalOpticalDepth )
const fogFactor = totalOpticalDepth.negate().exp().oneMinus();

const fogColor = color( 0x06b6d4 );
scene.fogNode = fog( fogColor, fogFactor );
scene.backgroundNode = fogColor.mul( 6.7 );

model.material.colorNode = color( 0xffaa00 );
```

</page>

<page name="Background">

Custom procedural backgrounds and skyboxes assigned directly to `scene.backgroundNode`.

::: api scene.backgroundNode : Node - Assign a node to control the scene's background color or texture graph. :::

<code name="iblSky" default="true">IBL Atmosphere & Clouds</code>

<code name="auroraSky">3D Aurora & Stars</code>

```tsl iblSky
import 'scenes/empty';
import { positionWorldDirection, pmremTexture, color, float, vec3, time, smoothstep, mx_noise_float, Fn } from 'three/tsl';

// 1. Ray Direction Vector & Corrected IBL Sampling Direction
const dir = positionWorldDirection;
const iblDir = vec3( dir.x, dir.y.negate(), dir.z );
const horizonFade = smoothstep( 0.01, 0.2, dir.y );

// 2. Single Completely Blurred PMREM Environment Texture (blur level = 1.0 for smooth ambient sky)
const iblSky = pmremTexture( scene.environment, iblDir, float( 1.0 ) );
const groundColor = iblSky.mul( 0.2 );

// 3. Perspective Sky Ceiling Projection (Perspective Foreshortening)
const skyY = dir.y.clamp( 0.001, 1.0 ).pow( 0.7 ).max( 0.08 );
const perspectivePos = vec3( dir.x.div( skyY ), float( 1.0 ), dir.z.div( skyY ) );

// 4. Volumetric FBM Cloud Noise
const cloudNoise = Fn( ( [ p ] ) => {

	const wind = vec3( time.mul( 0.1 ), 0.0, time.mul( 0.015 ) );
	const animatedP = p.mul( 0.3 ).add( wind );

	const n1 = mx_noise_float( animatedP ).mul( 0.5 ).add( 0.5 ).mul( 0.50 );
	const n2 = mx_noise_float( animatedP.mul( 2.0 ) ).mul( 0.5 ).add( 0.5 ).mul( 0.25 );
	const n3 = mx_noise_float( animatedP.mul( 4.0 ) ).mul( 0.5 ).add( 0.5 ).mul( 0.125 );
	const n4 = mx_noise_float( animatedP.mul( 8.0 ) ).mul( 0.5 ).add( 0.5 ).mul( 0.0625 );

	return n1.add( n2 ).add( n3 ).add( n4 );
} );

// Smooth anti-aliased cloud density
const fbmVal = cloudNoise( perspectivePos );
const cloudDensity = smoothstep( 0.25, 0.55, fbmVal ).mul( horizonFade ).clamp( 0.0, 1.0 );

// 5. Cloud Normal Gradient & Color Derived 100% from iblSky
const fbmDx = cloudNoise( perspectivePos.add( vec3( 0.05, 0.0, 0.0 ) ) );
const fbmDz = cloudNoise( perspectivePos.add( vec3( 0.0, 0.0, 0.05 ) ) );
const rawNormal = vec3( fbmVal.sub( fbmDx ), float( 0.35 ), fbmVal.sub( fbmDz ) ).normalize();

// Cloud Lit & Shadow colors derived directly from iblSky (NO second pmremTexture call!)
const cloudLitColor = iblSky.mul( 1.5 ).add( color( 0xffffff ).mul( 0.35 ) );
const cloudShadowColor = iblSky.mul( 0.45 );

// In TSL method chaining: t.mix( a, b ) interpolates from a to b by factor t
const lightFactor = rawNormal.y.clamp( 0.0, 1.0 ).pow( 0.5 );
const cloudColor = lightFactor.mix( cloudShadowColor, cloudLitColor );

// 6. Smooth Horizon Transition & Composite into scene.backgroundNode
const cloudAlpha = cloudDensity.mul( 0.85 );
const finalSky = cloudAlpha.mix( iblSky, cloudColor );

const horizonBlend = smoothstep( - 0.15, 0.15, dir.y );
const finalBackground = horizonBlend.mix( groundColor, finalSky );

// Assign to scene.backgroundNode
scene.backgroundNode = finalBackground;

// Adjust camera angle and floor visibility for a better view of the sky and clouds
camera.position.set( 4, 1, 4 );
```

```tsl auroraSky
import 'scenes/empty';
import { positionWorldDirection, color, float, vec3, time, smoothstep } from 'three/tsl';

// 1. Continuous 3D Direction Vector
const dir = positionWorldDirection;

// 2. 3D Celestial Twinkling Stars Field (using 3D spatial hashing, NO wrap seams)
const starGrid = dir.mul( 30.0 );
const starId = starGrid.floor();
const starUv = starGrid.fract().sub( 0.5 );

// Pseudo-random 3D star hash & twinkling animation
const starHash = starId.x.mul( 12.9898 ).add( starId.y.mul( 78.233 ) ).add( starId.z.mul( 37.719 ) ).sin().mul( 43758.5453 ).fract();
const twinkleSpeed = starHash.mul( 6.0 ).add( 2.0 );
const twinklePhase = starHash.mul( 62.8 );
const twinkle = time.mul( twinkleSpeed ).add( twinklePhase ).sin().mul( 0.5 ).add( 0.5 );

// Smooth horizon fade for stars
const starFade = smoothstep( 0.0, 0.2, dir.y );
const isStar = starHash.greaterThan( 0.85 ).and( dir.y.greaterThan( 0.05 ) );

// Sharp 4-Pointed Star Flare Sparkle (Pontuda & Bounded without distortion)
const starDist = starUv.length();
const absUv = starUv.abs();
const sparkArm = float( 0.0015 ).div( absUv.x.mul( absUv.y ).add( 0.0015 ) );
const starSpark = sparkArm.mul( smoothstep( 0.35, 0.0, starDist ) ).clamp( 0.0, 4.0 );

const stars = isStar.select( starSpark.mul( twinkle ).mul( starFade ), float( 0.0 ) );

// 3. 3D Organic Volumetric Aurora Waves
const w1 = dir.x.mul( 2.5 ).add( time.mul( 0.4 ) ).sin().mul( 0.15 );
const w2 = dir.z.mul( 5.0 ).sub( time.mul( 0.7 ) ).cos().mul( 0.08 );
const totalWave = w1.add( w2 );

const auroraPos = dir.y.sub( 0.2 ).add( totalWave );
const auroraMask = smoothstep( 0.0, 0.12, auroraPos ).mul( smoothstep( 0.55, 0.2, auroraPos ) );

const colorShift = dir.x.mul( 1.5 ).add( time.mul( 0.3 ) ).sin().mul( 0.5 ).add( 0.5 );
const greenCyan = colorShift.mix( color( 0x059669 ), color( 0x06b6d4 ) );
const violetPink = colorShift.mix( color( 0xa855f7 ), color( 0xec4899 ) );

const auroraColor = auroraPos.mix( greenCyan, violetPink );
const aurora = auroraColor.mul( auroraMask ).mul( 1.2 );

// 4. Smooth 3D Deep Space Skybox Gradient (100% continuous from Zenith to Nadir)
const spaceBg = dir.y.mul( 0.5 ).add( 0.5 ).clamp( 0.0, 1.0 ).pow( 0.6 ).mix( color( 0x03020c ), color( 0x0d0722 ) );

// Assign to scene.backgroundNode
scene.backgroundNode = spaceBg.add( color( 0xffffff ).mul( stars ) ).add( aurora );

// Adjust camera angle for a better view of the sky and clouds
camera.position.set( 4, .1, 6 );
```

</page>

</page>

<page name="Render Pipeline">

<page name="MRT">
</page>

<page name="Pipeline Context">
</page>

</page>

<page name="Utilities">

<page name="RTT">
</page>

<page name="Timer">

Timer nodes allow accessing the elapsed time and the delta time of the current frame in seconds. These nodes are useful for driving procedural animations, physics simulations in compute shaders, and dynamic visual effects.

::: api time : float - Represents the elapsed time in seconds. :::

::: api deltaTime : float - Represents the delta time in seconds. :::

<code name="timerExample" default="true">Energy Wave & Flicker</code>

```tsl timerExample
import 'scenes/shaderball';
import { positionLocal, normalLocal, time, color } from 'three/tsl';

// 1. Liquid morphing displacement using time
// Calculate waves based on local position and time
const waveInput = positionLocal.y.mul( 4.0 ).add( time.mul( 2.5 ) );
const displacement = waveInput.sin().mul( 0.05 );

// Displace the vertices outward along the surface normals
model.material.positionNode = positionLocal.add( normalLocal.mul( displacement ) );

// 2. Base obsidian color mixed with glowing energy waves
// Calculate a glowing intensity factor from the wave input
const pulse = waveInput.sin().abs().pow( 4.0 );

// Combine base obsidian black-blue with animated glowing orange veins and rapid electrical jitter
const glowColor = color( 0xff3b00 ).mul( pulse );
const baseColor = color( 0x0af00 );

model.material.colorNode = baseColor.add( glowColor );
model.material.roughness = 0.5;
model.material.metalness = 0.5;
```

</page>

<page name="Oscillator">

The oscillator functions generate periodic waveforms in the range `[0, 1]` based on a timer node (which defaults to `time`). They are useful for creating cycles, fading transitions, flashing effects, and driving procedural math animations.

::: api oscSine( timer? ) : float - Generates a sine wave oscillation based on a timer (defaults to `time`). :::

::: api oscSquare( timer? ) : float - Generates a square wave oscillation based on a timer (defaults to `time`). :::

::: api oscTriangle( timer? ) : float - Generates a triangle wave oscillation based on a timer (defaults to `time`). :::

::: api oscSawtooth( timer? ) : float - Generates a sawtooth wave oscillation based on a timer (defaults to `time`). :::

<code name="oscillatorExample" default="true">Oscilloscope Waves</code>

```tsl oscillatorExample
import 'scenes/quad';
import { uv, color, float, time, smoothstep, min, max, oscSine, oscSquare, oscTriangle, oscSawtooth } from 'three/tsl';

const x = uv().x;
const y = uv().y;
const speed = time.mul( 0.5 );

// Helper function to draw a continuous wave line in its track
const drawWave = ( waveFunc, offset ) => {

	// Sample the wave at x - dx and x + dx to connect vertical jumps
	const dx = float( 0.0015 );
	const tLeft = x.sub( dx ).mul( 8.0 ).sub( speed );
	const tRight = x.add( dx ).mul( 8.0 ).sub( speed );

	const valLeft = waveFunc( tLeft );
	const valRight = waveFunc( tRight );

	const valMin = min( valLeft, valRight );
	const valMax = max( valLeft, valRight );

	// Scale wave range [0, 1] to track height (0.16) and apply vertical offset
	const targetMin = valMin.mul( 0.16 ).add( offset ).sub( 0.003 );
	const targetMax = valMax.mul( 0.16 ).add( offset ).add( 0.003 );

	// Draw a smooth line between targetMin and targetMax
	const d1 = y.sub( targetMin );
	const d2 = targetMax.sub( y );

	return smoothstep( 0.0, 0.002, d1 ).mul( smoothstep( 0.0, 0.002, d2 ) );

};

// 1. Color-code each wave in its respective vertical track (each 0.25 high)
const color0 = color( 0x00ffcc ).mul( drawWave( oscSine, 0.045 ) );     // Track 0: Sine (bottom)
const color1 = color( 0xffaa00 ).mul( drawWave( oscSquare, 0.295 ) );   // Track 1: Square
const color2 = color( 0xff00bb ).mul( drawWave( oscTriangle, 0.545 ) ); // Track 2: Triangle
const color3 = color( 0x00aaff ).mul( drawWave( oscSawtooth, 0.795 ) ); // Track 3: Sawtooth (top)

// Combine wave colors
const wavesColor = color0.add( color1 ).add( color2 ).add( color3 );

// 2. Draw oscilloscope grid lines
const gridX = x.mul( 10.0 ).fract().sub( 0.5 ).abs().div( 10.0 );
const gridY = y.mul( 4.0 ).fract().sub( 0.5 ).abs().div( 4.0 );

const gridLineX = float( 1.0 ).sub( smoothstep( 0.0, 0.0015, gridX ) );
const gridLineY = float( 1.0 ).sub( smoothstep( 0.0, 0.0015, gridY ) );
const gridColor = color( 0x002211 );

// Dark green screen background with faint grid
const bgColor = color( 0x000804 );
const bg = bgColor.add( gridLineX.add( gridLineY ).clamp( 0.0, 1.0 ).mul( gridColor ) );

// Final output color is screen background + waves
model.material.colorNode = bg.add( wavesColor );
```

</page>

<page name="Rotate">
</page>

<page name="Random">
</page>

<page name="Remap">
</page>

<page name="Packing">
</page>

<page name="Debug">
</page>

</page>

<page name="Display">

<page name="Blend Modes">

Functions for blending colors and layers together using standard blend mode algorithms.

::: api blendColor( base, blend )
- **base**: `vec4` — The base color (non-premultiplied alpha).
- **blend**: `vec4` — The blend color (non-premultiplied alpha).
- Blends two colors based on their alpha values by replicating normal alpha blending. Returns `vec4`.
:::

::: api blendScreen( base, blend ) - Lightens the base layer's colors based on the color of the blend layer. Returns `vec3`.
- **base**: `vec3` — The base color.
- **blend**: `vec3` — The blend color. A black `#000000` blend color does not alter the base color.
:::

::: api blendOverlay( base, blend ) - Increases contrast of the base layer by combining Multiply and Screen blend modes based on base lightness. Returns `vec3`.
- **base**: `vec3` — The base color.
- **blend**: `vec3` — The blend color.
:::

::: api blendDodge( base, blend ) - Significantly increases brightness and contrast of the base layer based on the blend layer. Returns `vec3`.
- **base**: `vec3` — The base color.
- **blend**: `vec3` — The blend color. A black `#000000` blend color does not alter the base color.
:::

::: api blendBurn( base, blend ) - Darkens the base layer's colors and increases contrast based on the blend layer. Returns `vec3`.
- **base**: `vec3` — The base color.
- **blend**: `vec3` — The blend color. A white `#ffffff` blend color does not alter the base color.
:::

<code name="blendModesExample" default="true">Blend Modes Showcase</code>

```tsl blendModesExample
import 'scenes/shaderball';
import { screenUV, normalWorld, vec3, float, sin, step, mix, blendScreen, blendOverlay, blendDodge, blendBurn } from 'three/tsl';

// Set vibrant normal vectors as the material color for the 3D ShaderBall
model.material.colorNode = normalWorld;

// Split screen showing 5 columns side by side on defaultPass:
// 1. Gradient (colorful vertical gradient blend layer)
// 2. Screen (lightens scene with gradient)
// 3. Overlay (enhances contrast)
// 4. Dodge (brightens highlights)
// 5. Burn (darkens shadows)

// Get screen coordinates for panel division
const u = screenUV;

// Base 3D scene render
const base = defaultPass.rgb;

// Import sin for smooth color wave spectrum
// Define a smooth, vibrant multi-color vertical spectrum gradient
const t = u.y.mul( 5.0 );
const r = sin( t ).mul( 0.5 ).add( 0.5 );
const g = sin( t.add( 2.094 ) ).mul( 0.5 ).add( 0.5 );
const b = sin( t.add( 4.188 ) ).mul( 0.5 ).add( 0.5 );
const blendLayer = vec3( r, g, b ).pow( 0.85 ).mul( 1.2 );

// Column 0: Gradient (unblended colorful gradient layer)
const col0 = blendLayer;

// Column 1: Screen (lightens base with gradient)
const col1 = blendScreen( base, blendLayer.mul( 0.6 ) );

// Column 2: Overlay (enhances contrast)
const col2 = blendOverlay( base, blendLayer );

// Column 3: Dodge (brightens highlights)
const col3 = blendDodge( base, blendLayer.mul( 0.6 ) );

// Column 4: Burn (darkens shadows)
const col4 = blendBurn( base, blendLayer );

// Combine 5 vertical columns across screen X (0.0 to 1.0)
let panelColor = col0;
panelColor = mix( panelColor, col1, step( 0.2, u.x ) );
panelColor = mix( panelColor, col2, step( 0.4, u.x ) );
panelColor = mix( panelColor, col3, step( 0.6, u.x ) );
panelColor = mix( panelColor, col4, step( 0.8, u.x ) );

// Sleek dark vertical grid lines between columns
const numColumns = float( 5.0 );
const lineCoord = u.x.mul( numColumns ).fract();
const divider = step( 0.97, lineCoord );
const finalColor = mix( panelColor, vec3( 0.0 ), divider.mul( 0.6 ) );

// Assign the split-screen post-processing result to renderPipeline
renderPipeline.outputNode = finalColor;
```

</page>

<page name="Color Adjustments">

Functions for adjusting and manipulating colors.

::: api grayscale( color ) - Computes a grayscale color value for the given RGB color based on luminance. Returns `vec3`.
- **color**: `vec3` — Input RGB color value.
:::

::: api luminance( color, luminanceCoefficients? ) - Calculates the luminance (perceived brightness) of an RGB color. Returns `float`.
- **color**: `vec3` — Input RGB color value.
- **luminanceCoefficients**: `vec3` — (Optional) Luminance coefficients node. Defaults to current working color space coefficients.
:::

::: api saturation( color, adjustment? ) - Adjusts the saturation of an RGB color. Returns `vec3`.
- **color**: `vec3` — Input RGB color value.
- **adjustment**: `float` — (Optional) Conversion factor. Values `< 1` desaturate, values `> 1` super-saturate. Defaults to `float( 1 )`.
:::

::: api vibrance( color, adjustment? ) - Selectively enhances the intensity of less saturated RGB colors while preserving saturated ones. Returns `vec3`.
- **color**: `vec3` — Input RGB color value.
- **adjustment**: `float` — (Optional) Intensity factor for vibrance effect. Defaults to `float( 0 )`.
:::

::: api hue( color, adjustment? ) - Rotates the hue of an RGB color while preserving its luminance and saturation. Returns `vec3`.
- **color**: `vec3` — Input RGB color value.
- **adjustment**: `float` — (Optional) Hue rotation angle in radians (positive = clockwise, negative = counterclockwise). Defaults to `float( 1 )`.
:::

::: api posterize( source, steps ) - Reduces the number of color levels, creating a poster-like effect. Returns `Node`.
- **source**: `Node` — Input color value.
- **steps**: `Node` — Number of color levels. Lower values produce a more blocky, stylized effect.
:::

::: api cdl( color, slope?, offset?, power?, saturation?, luminanceCoefficients? ) - Compact representation of ASC Color Decision List (CDL) v1.2 color grading information. Returns `vec4`.
- **color**: `vec4` — Input color (typically in a log color space such as LogC, ACEScc, or AgX Log).
- **slope**: `vec3` — (Optional) Slope adjustment multiplier for RGB channels. Defaults to `vec3( 1 )`.
- **offset**: `vec3` — (Optional) Offset adjustment added to RGB channels. Defaults to `vec3( 0 )`.
- **power**: `vec3` — (Optional) Power gamma exponent applied to RGB channels. Defaults to `vec3( 1 )`.
- **saturation**: `float` — (Optional) Overall saturation adjustment factor. Defaults to `float( 1 )`.
- **luminanceCoefficients**: `vec3` — (Optional) Luminance coefficients used for saturation calculation (defaults to Rec. 709).
:::

<code name="colorAdjustmentsExample" default="true">Color Adjustments Showcase</code>

```tsl colorAdjustmentsExample
import 'scenes/shaderball';
import { screenUV, normalWorld, vec3, float, step, mix, hue, saturation, vibrance, posterize } from 'three/tsl';

// Set vibrant normal vectors as the material color for the 3D ShaderBall
model.material.colorNode = normalWorld;

// Split screen showing 5 color adjustments side by side on defaultPass:
// 1. Original (unadjusted base scene)
// 2. Hue (fixed hue rotation of 1.5 rad)
// 3. Saturation (desaturated to 0)
// 4. Vibrance (fixed 3.0 vibrance boost)
// 5. Posterize (fixed 4 color levels)

// Get screen coordinates for panel division
const u = screenUV;

// Column 0: Original (unadjusted base scene)
const col0 = defaultPass.rgb;

// Column 1: Hue (fixed hue rotation of 1.5 radians)
const col1 = hue( defaultPass, 1.5 );

// Column 2: Saturation (desaturated to 0)
const col2 = saturation( defaultPass, 0.0 );

// Column 3: Vibrance (fixed 3.0 vibrance boost)
const col3 = vibrance( defaultPass, 3.0 );

// Column 4: Posterize (fixed 4 color levels)
const col4 = posterize( defaultPass, 4.0 );

// Combine 5 vertical columns across screen X (0.0 to 1.0)
let panelColor = col0;
panelColor = mix( panelColor, col1, step( 0.2, u.x ) );
panelColor = mix( panelColor, col2, step( 0.4, u.x ) );
panelColor = mix( panelColor, col3, step( 0.6, u.x ) );
panelColor = mix( panelColor, col4, step( 0.8, u.x ) );

// Sleek dark vertical grid lines between columns
const numColumns = float( 5.0 );
const lineCoord = u.x.mul( numColumns ).fract();
const divider = step( 0.97, lineCoord );
const finalColor = mix( panelColor, vec3( 0.0 ), divider.mul( 0.6 ) );

// Assign the split-screen post-processing result to renderPipeline
renderPipeline.outputNode = finalColor;
```

</page>


</page>

<page name="Material">

<page name="Material Properties">
</page>

<page name="Material Inputs">
</page>

</page>

<page name="Material-X">
</page>

<page name="Native">

<page name="Transpiler">
</page>

<page name="WGSL">
</page>

<page name="GLSL">
</page>

<page name="GLSL Migration">
</page>

</page>

