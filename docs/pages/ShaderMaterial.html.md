*Inheritance: EventDispatcher → Material →*

# ShaderMaterial

A material rendered with custom shaders. A shader is a small program written in GLSL. that runs on the GPU. You may want to use a custom shader if you need to implement an effect not included with any of the built-in materials.

There are the following notes to bear in mind when using a `ShaderMaterial`:

*   `ShaderMaterial` can only be used with [WebGLRenderer](WebGLRenderer.html).
*   Built in attributes and uniforms are passed to the shaders along with your code. If you don't want that, use [RawShaderMaterial](RawShaderMaterial.html) instead.
*   You can use the directive `#pragma unroll_loop_start` and `#pragma unroll_loop_end` in order to unroll a `for` loop in GLSL by the shader preprocessor. The directive has to be placed right above the loop. The loop formatting has to correspond to a defined standard.
    *   The loop has to be [normalized](https://en.wikipedia.org/wiki/Normalized_loop).
    *   The loop variable has to be _i_.
    *   The value `UNROLLED_LOOP_INDEX` will be replaced with the explicitly value of _i_ for the given iteration and can be used in preprocessor statements.

## Code Example

```js
const material = new THREE.ShaderMaterial( {
	uniforms: {
		time: { value: 1.0 },
		resolution: { value: new THREE.Vector2() }
	},
	vertexShader: document.getElementById( 'vertexShader' ).textContent,
	fragmentShader: document.getElementById( 'fragmentShader' ).textContent
} );
```

## Constructor

### new ShaderMaterial( parameters : Object )

Constructs a new shader material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .clipping : boolean

Defines whether this material supports clipping; `true` to let the renderer pass the clippingPlanes uniform.

Default is `false`.

### .defaultAttributeValues : Object

When the rendered geometry doesn't include these attributes but the material does, these default values will be passed to the shaders. This avoids errors when buffer data is missing.

*   color: \[ 1, 1, 1 \]
*   uv: \[ 0, 0 \]
*   uv1: \[ 0, 0 \]

### .defines : Object

Defines custom constants using `#define` directives within the GLSL code for both the vertex shader and the fragment shader; each key/value pair yields another directive.

```js
defines: {
	FOO: 15,
	BAR: true
}
```

Yields the lines:

```js
#define FOO 15
#define BAR true
```

### .extensions : Object

This object allows to enable certain WebGL 2 extensions.

*   clipCullDistance: set to `true` to use vertex shader clipping
*   multiDraw: set to `true` to use vertex shader multi\_draw / enable gl\_DrawID

### .fog : boolean

Defines whether the material color is affected by global fog settings; `true` to pass fog uniforms to the shader.

Setting this property to `true` requires the definition of fog uniforms. It is recommended to use `UniformsUtils.merge()` to combine the custom shader uniforms with predefined fog uniforms.

```js
const material = new ShaderMaterial( {
    uniforms: UniformsUtils.merge( [ UniformsLib[ 'fog' ], shaderUniforms ] );
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    fog: true
} );
```

Default is `false`.

### .forceSinglePass : boolean

Overwritten and set to `true` by default.

Default is `true`.

**Overrides:** [Material#forceSinglePass](Material.html#forceSinglePass)

### .fragmentShader : string

Fragment shader GLSL code. This is the actual code for the shader.

### .glslVersion : GLSL1 | GLSL3

Defines the GLSL version of custom shader code.

Default is `null`.

### .index0AttributeName : string | undefined

If set, this calls [gl.bindAttribLocation](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindAttribLocation) to bind a generic vertex index to an attribute variable.

Default is `undefined`.

### .isShaderMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .lights : boolean

Defines whether this material uses lighting; `true` to pass uniform data related to lighting to this shader.

Default is `false`.

### .linewidth : number

Controls line thickness or lines.

WebGL and WebGPU ignore this setting and always render line primitives with a width of one pixel.

Default is `1`.

### .uniforms : Object

An object of the form:

```js
{
	"uniform1": { value: 1.0 },
	"uniform2": { value: 2 }
}
```

specifying the uniforms to be passed to the shader code; keys are uniform names, values are definitions of the form

```js
{
	value: 1.0
}
```

where `value` is the value of the uniform. Names must match the name of the uniform, as defined in the GLSL code. Note that uniforms are refreshed on every frame, so updating the value of the uniform will immediately update the value available to the GLSL code.

### .uniformsGroups : Array.<UniformsGroup>

An array holding uniforms groups for configuring UBOs.

### .uniformsNeedUpdate : boolean

Can be used to force a uniform update while changing uniforms in [Object3D#onBeforeRender](Object3D.html#onBeforeRender).

Default is `false`.

### .vertexShader : string

Vertex shader GLSL code. This is the actual code for the shader.

### .wireframe : boolean

Renders the geometry as a wireframe.

Default is `false`.

### .wireframeLinewidth : number

Controls the thickness of the wireframe.

WebGL and WebGPU ignore this property and always render 1 pixel wide lines.

Default is `1`.

## Type Definitions

### .Shader

This type represents the fields required to store and run the shader code.

**name**  
string

The name of the shader.

**uniforms**  
Object.<string, [Uniform](Uniform.html)\>

The uniforms of the shader.

**defines**  
Object.<string, [any](TSL.html#any)\>

The defines of the shader.

**vertexShader**  
string

The vertex shader code.

**fragmentShader**  
string

The fragment shader code.

## Source

[src/materials/ShaderMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/ShaderMaterial.js)