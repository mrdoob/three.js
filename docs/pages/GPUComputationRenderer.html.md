# GPUComputationRenderer

GPUComputationRenderer, based on SimulationRenderer by @zz85.

The GPUComputationRenderer uses the concept of variables. These variables are RGBA float textures that hold 4 floats for each compute element (texel).

Each variable has a fragment shader that defines the computation made to obtain the variable in question. You can use as many variables you need, and make dependencies so you can use textures of other variables in the shader (the sampler uniforms are added automatically) Most of the variables will need themselves as dependency.

The renderer has actually two render targets per variable, to make ping-pong. Textures from the current frame are used as inputs to render the textures of the next frame.

The render targets of the variables can be used as input textures for your visualization shaders.

Variable names should be valid identifiers and should not collide with THREE GLSL used identifiers. a common approach could be to use 'texture' prefixing the variable name; i.e texturePosition, textureVelocity...

The size of the computation (sizeX \* sizeY) is defined as 'resolution' automatically in the shader. For example:

Basic use:

```js
// Initialization...
// Create computation renderer
const gpuCompute = new GPUComputationRenderer( 1024, 1024, renderer );
// Create initial state float textures
const pos0 = gpuCompute.createTexture();
const vel0 = gpuCompute.createTexture();
// and fill in here the texture data...
// Add texture variables
const velVar = gpuCompute.addVariable( "textureVelocity", fragmentShaderVel, vel0 );
const posVar = gpuCompute.addVariable( "texturePosition", fragmentShaderPos, pos0 );
// Add variable dependencies
gpuCompute.setVariableDependencies( velVar, [ velVar, posVar ] );
gpuCompute.setVariableDependencies( posVar, [ velVar, posVar ] );
// Add custom uniforms
velVar.material.uniforms.time = { value: 0.0 };
// Check for completeness
const error = gpuCompute.init();
if ( error !== null ) {
		console.error( error );
}
// In each frame...
// Compute!
gpuCompute.compute();
// Update texture uniforms in your visualization materials with the gpu renderer output
myMaterial.uniforms.myTexture.value = gpuCompute.getCurrentRenderTarget( posVar ).texture;
// Do your rendering
renderer.render( myScene, myCamera );
```

Also, you can use utility functions to create ShaderMaterial and perform computations (rendering between textures) Note that the shaders can have multiple input textures.

```js
const myFilter1 = gpuCompute.createShaderMaterial( myFilterFragmentShader1, { theTexture: { value: null } } );
const myFilter2 = gpuCompute.createShaderMaterial( myFilterFragmentShader2, { theTexture: { value: null } } );
const inputTexture = gpuCompute.createTexture();
// Fill in here inputTexture...
myFilter1.uniforms.theTexture.value = inputTexture;
const myRenderTarget = gpuCompute.createRenderTarget();
myFilter2.uniforms.theTexture.value = myRenderTarget.texture;
const outputRenderTarget = gpuCompute.createRenderTarget();
// Now use the output texture where you want:
myMaterial.uniforms.map.value = outputRenderTarget.texture;
// And compute each frame, before rendering to screen:
gpuCompute.doRenderTarget( myFilter1, myRenderTarget );
gpuCompute.doRenderTarget( myFilter2, outputRenderTarget );
```

## Code Example

```js
#DEFINE resolution vec2( 1024.0, 1024.0 )
```

## Import

GPUComputationRenderer is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
```

## Constructor

### new GPUComputationRenderer( sizeX : number, sizeY : number, renderer : WebGLRenderer )

Constructs a new GPU computation renderer.

**sizeX**

Computation problem size is always 2d: sizeX \* sizeY elements.

**sizeY**

Computation problem size is always 2d: sizeX \* sizeY elements.

**renderer**

The renderer.

## Properties

### .addResolutionDefine

Adds a resolution defined for the given material shader.

## Methods

### .addVariable( variableName : string, computeFragmentShader : string, initialValueTexture : Texture ) : Object

Adds a compute variable to the renderer.

**variableName**

The variable name.

**computeFragmentShader**

The compute (fragment) shader source.

**initialValueTexture**

The initial value texture.

**Returns:** The compute variable.

### .compute()

Executes the compute. This method is usually called in the animation loop.

### .createRenderTarget( sizeXTexture : number, sizeYTexture : number, wrapS : number, wrapT : number, minFilter : number, magFilter : number ) : WebGLRenderTarget

Creates a new render target from the given parameters.

**sizeXTexture**

The width of the render target.

**sizeYTexture**

The height of the render target.

**wrapS**

The wrapS value.

**wrapT**

The wrapS value.

**minFilter**

The minFilter value.

**magFilter**

The magFilter value.

**Returns:** The new render target.

### .createTexture() : DataTexture

Creates a new data texture.

**Returns:** The new data texture.

### .dispose()

Frees all internal resources. Call this method if you don't need the renderer anymore.

### .doRenderTarget( material : Material, output : WebGLRenderTarget )

Renders the given material into the given render target with a full-screen pass.

**material**

The material.

**output**

The output.

### .getAlternateRenderTarget( variable : Object ) : WebGLRenderTarget

Returns the alternate render target for the given compute variable.

**variable**

The compute variable.

**Returns:** The alternate render target.

### .getCurrentRenderTarget( variable : Object ) : WebGLRenderTarget

Returns the current render target for the given compute variable.

**variable**

The compute variable.

**Returns:** The current render target.

### .init() : string

Initializes the renderer.

**Returns:** Returns `null` if no errors are detected. Otherwise returns the error message.

### .renderTexture( input : Texture, output : WebGLRenderTarget )

Renders the given texture into the given render target.

**input**

The input.

**output**

The output.

### .setDataType( type : FloatType | HalfFloatType ) : GPUComputationRenderer

Sets the data type of the internal textures.

**type**

The type to set.

**Returns:** A reference to this renderer.

### .setVariableDependencies( variable : Object, dependencies : Array.<Object> )

Sets variable dependencies.

**variable**

The compute variable.

**dependencies**

Other compute variables that represents the dependencies.

## Source

[examples/jsm/misc/GPUComputationRenderer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/misc/GPUComputationRenderer.js)