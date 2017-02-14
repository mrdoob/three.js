/**
 * @author yomboprime https://github.com/yomboprime
 *
 * GPUComputationRenderer, based on SimulationRenderer by zz85
 *
 * The GPUComputationRenderer uses the concept of variables. These variables are RGBA float textures that hold 4 floats
 * for each compute element (texel)
 *
 * Each variable has a fragment shader that defines the computation made to obtain the variable in question.
 * You can use as many variables you need, and make dependencies so you can use textures of other variables in the shader
 * (the sampler uniforms are added automatically) Most of the variables will need themselves as dependency.
 *
 * The renderer has actually two render targets per variable, to make ping-pong. Textures from the current frame are used
 * as inputs to render the textures of the next frame.
 *
 * The render targets of the variables can be used as input textures for your visualization shaders.
 *
 * Variable names should be valid identifiers and should not collide with THREE GLSL used identifiers.
 * a common approach could be to use 'texture' prefixing the variable name; i.e texturePosition, textureVelocity...
 *
 * The size of the computation (sizeX * sizeY) is defined as 'resolution' automatically in the shader. For example:
 * #DEFINE resolution vec2( 1024.0, 1024.0 )
 *
 * -------------
 *
 * Basic use:
 *
 * // Initialization...
 *
 * // Create computation renderer
 * var gpuCompute = new GPUComputationRenderer( 1024, 1024, renderer );
 *
 * // Create initial state float textures
 * var pos0 = gpuCompute.createTexture();
 * var vel0 = gpuCompute.createTexture();
 * // and fill in here the texture data...
 *
 * // Add texture variables
 * var velVar = gpuCompute.addVariable( "textureVelocity", fragmentShaderVel, pos0 );
 * var posVar = gpuCompute.addVariable( "texturePosition", fragmentShaderPos, vel0 );
 *
 * // Add variable dependencies
 * gpuCompute.setVariableDependencies( velVar, [ velVar, posVar ] );
 * gpuCompute.setVariableDependencies( posVar, [ velVar, posVar ] );
 *
 * // Add custom uniforms
 * velVar.material.uniforms.time = { value: 0.0 };
 *
 * // Check for completeness
 * var error = gpuCompute.init();
 * if ( error !== null ) {
 *		console.error( error );
  * }
 *
 *
 * // In each frame...
 *
 * // Compute!
 * gpuCompute.compute();
 *
 * // Update texture uniforms in your visualization materials with the gpu renderer output
 * myMaterial.uniforms.myTexture.value = gpuCompute.getCurrentRenderTarget( posVar ).texture;
 *
 * // Do your rendering
 * renderer.render( myScene, myCamera );
 *
 * -------------
 *
 * Also, you can use utility functions to create ShaderMaterial and perform computations (rendering between textures)
 * Note that the shaders can have multiple input textures.
 *
 * var myFilter1 = gpuCompute.createShaderMaterial( myFilterFragmentShader1, { theTexture: { value: null } } );
 * var myFilter2 = gpuCompute.createShaderMaterial( myFilterFragmentShader2, { theTexture: { value: null } } );
 *
 * var inputTexture = gpuCompute.createTexture();
 *
 * // Fill in here inputTexture...
 *
 * myFilter1.uniforms.theTexture.value = inputTexture;
 *
 * var myRenderTarget = gpuCompute.createRenderTarget();
 * myFilter2.uniforms.theTexture.value = myRenderTarget.texture;
 *
 * var outputRenderTarget = gpuCompute.createRenderTarget();
 *
 * // Now use the output texture where you want:
 * myMaterial.uniforms.map.value = outputRenderTarget.texture;
 *
 * // And compute each frame, before rendering to screen:
 * gpuCompute.doRenderTarget( myFilter1, myRenderTarget );
 * gpuCompute.doRenderTarget( myFilter2, outputRenderTarget );
 *
 *
 * @author Sam Stewart http://github.com/samstewart samstewart
 * Added a few improvements:
 * 1. Render variables individually instead of all at once.
 * 2. Different resolution textures for different variables (problem with textures of mixed resolution?)
 * 3. Initialize variables with shader.
 * @param {int} sizeX Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {int} sizeY Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {WebGLRenderer} renderer The renderer
  */

function GPUComputationRenderer( renderer ) {

	// check for basic support
	this.renderer = renderer;

	if ( ! renderer.extensions.get( "OES_texture_float" ) ) {

		return "No OES_texture_float support for float textures.";

	}

	if ( renderer.capabilities.maxVertexTextures === 0 ) {

		return "No support for vertex shader textures.";

	}

	// a list of the variables in the computation
	this.variables = [];

	// setup the scene for rendering
	var scene = new THREE.Scene();

	var camera = new THREE.Camera();
	camera.position.z = 1;

	// setup the initial shader for the mesh
	var passThruUniforms = {
		texture: { value: null }
	};

	var passThruShader = createShaderMaterial( getPassThroughFragmentShader( sizeX, sizeY ), passThruUniforms );

	// TODO: move this to use the first variables shader. No need for a default shader
	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), passThruShader );
	scene.add( mesh );


	// TODO: Move to the code that actually needs this kind of interpolation.
	if ( renderer.extensions.get( 'OES_texture_float_linear' ) ) {
		// use bilinear interpolation if it is available
		this.magFilter = THREE.LinearFilter;
	}

	this.addVariable = function(variable) {
		variable.computationRenderer = this;

		this.variables.push(variable);
	}

	this.computeVariable = function ( variable ) {


		// Performs the computation for this variable
		this.doRenderTarget( variable.material, variable.renderTargets[ nextTextureIndex ] );

		variable.currentTextureIndex = nextTextureIndex;

	};

	this.compute = function () {

		for ( var i = 0, il = this.variables.length; i < il; i ++ ) {

			this.computeVariable( this.variables[ i ] );
		}

	};

	this.createTexture = function ( sizeXTexture, sizeYTexture ) {

		sizeXTexture = sizeXTexture || sizeX;
		sizeYTexture = sizeYTexture || sizeY;

		var a 		= new Float32Array( sizeXTexture * sizeYTexture * 4 );
		var texture = new THREE.DataTexture(
			a,
			sizeXTexture,
			sizeYTexture,
			THREE.RGBAFormat,
			THREE.FloatType,
			THREE.UVMapping,
			THREE.ClampToEdgeWrapping,
			THREE.ClampToEdgeWrapping,
			this.magFilter,
			this.minFilter
			);

		texture.needsUpdate = true;


		return texture;

	};

	this.renderVariable = function ( variable ) {
		mesh.material = variable.material;
		this.renderer.render( scene, camera, variable.buffers[ variable.currentBufferIndex ]);
	};

	

}


