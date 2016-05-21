/**
 * @author yomboprime https://github.com/yomboprime
 *
 * Based on SimulationRenderer by zz85
 *
 * The GPUComputationRenderer uses the concept of variables. These variables are RGBA float textures that hold 4 floats
 * for each compute element (texel)
 *
 * Each variable has a fragment shader that defines the computation made to obtain the variable in question.
 * You can use as many variables you need, and make dependencies so you can use textures of other variables in the shader
 * (the sampler uniforms are added automatically)
 *
 * The render targets of the variables can be used as input textures for your visualization shaders.
 *
 * Variable names should be valid identifiers and should not collide with THREE GLSL used identifiers.
 * a common approach could be to use 'texture' prefixing the variable name; i.e texturePosition, textureVelocity...
 *
 * The size of the computation (sizeX * sizeY) is defined as 'resolution' automatically in the shader. For example:
 * #DEFINE resolution vec2( 1024.0, 1024.0 )
 *
 *
 * Basic use:
 *
 * // Initialization...
 *
 * // Create computation renderer
 * var compuRender = new THREE.GPUComputationRenderer( sizeX, sizeY, renderer );
 *
 * // Create initial state float textures
 * var pos0 = compuRender.createTexture();
 * var vel0 = compuRender.createTexture();
 * // and fill in the texture data...
 *
 * // Add texture variables
 * var velVar = compuRender.addVariable( "textureVelocity", fragmentShaderVel, pos0 );
 * var posVar = compuRender.addVariable( "texturePosition", fragmentShaderPos, vel0 );
 *
 * // Add variable dependencies
 * compuRender.setVariableDependencies( velVar, [ velVar, posVar ] );
 * compuRender.setVariableDependencies( posVar, [ velVar, posVar ] );
 *
 * // Add custom uniforms
 * velVar.material.uniforms.time = { type: "f", value: 0.0 };
 *
 * // Check for completeness
 * var error = compuRender.init();
 * if ( error != null ) {
 *		console.error( error );
  * }
 *
 *
 * // In each frame...
 *
 * // Compute!
 * compuRender.compute();
 *
 * // Update texture uniforms in your visualization materials
 * myMaterial.uniforms.myTexture.value = compuRender.getCurrentTexture( posVar );
 *
 * // Do your rendering
 * renderer.render( myScene, myCamera );
 *
 *
 *
 *
 *
 *
 * @param {int} sizeX Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {int} sizeY Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {WebGLRenderer} renderer The renderer
  */

function GPUComputationRenderer( sizeX, sizeY, renderer ) {

	this.variables = [];

	this.currentTextureIndex = 0;

	var scene = new THREE.Scene();

	var camera = new THREE.Camera();
	camera.position.z = 1;

	var passThruUniforms = {
		texture: { type: "t", value: null }
	};

	var passThruShader = new THREE.ShaderMaterial( {
		uniforms: passThruUniforms,
		vertexShader: document.getElementById( 'passThroughVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'passThroughFragmentShader' ).textContent
	} );

	addResolutionDefine( passThruShader );

	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), passThruShader );
	scene.add( mesh );


	this.addVariable = function( variableName, computeFragmentShader, initialValueTexture ) {

		var material = new THREE.ShaderMaterial( {
			uniforms: {},
			vertexShader: passThruShader.vertexShader,
			fragmentShader: computeFragmentShader
		} );

		addResolutionDefine( material );

		var variable = {
			name: variableName,
			initialValueTexture: initialValueTexture,
			material: material,
			dependencies: null,
			renderTargets: []
		};

		this.variables.push( variable );

		return variable;
		
	};

	this.setVariableDependencies = function( variable, dependencies ) {

		variable.dependencies = dependencies;

	};

	this.init = function() {

		if ( ! renderer.extensions.get( "OES_texture_float" ) ) {

			return "No OES_texture_float support for float textures.";

		}

		if ( renderer.capabilities.maxVertexTextures === 0 ) {

			return "No support for vertex shader textures.";

		}

		for ( var i = 0; i < this.variables.length; i++ ) {

			var variable = this.variables[ i ];

			// Creates rendertargets and initialize them with input texture
			variable.renderTargets[ 0 ] = createRenderTarget();
			variable.renderTargets[ 1 ] = createRenderTarget();
			renderTexture( variable.initialValueTexture, variable.renderTargets[ 0 ] );
			renderTexture( variable.initialValueTexture, variable.renderTargets[ 1 ] );

			// Adds dependencies uniforms to the ShaderMaterial
			var material = variable.material;
			var uniforms = material.uniforms;
			for ( var d = 0; d < variable.dependencies.length; d++ ) {

				var depVar = variable.dependencies[ d ];

				if ( depVar.name !== variable.name ) {

					// Checks if variable exists
					var found = false;
					for ( var j = 0; j < this.variables.length; j++ ) {

						if ( depVar.name === this.variables.name ) {
							found = true;
							break;
						}

					}
					if ( ! found ) {
						return "Variable dependency not found. Variable=" + variable.name + ", dependency=" + depVar.name;
					}

				}

				uniforms[ depVar.name ] = { type: "t", value: null };

				material.fragmentShader = "\nuniform sampler2D " + depVar.name + ";\n" + variable.material.fragmentShader;

			}

		}

		this.currentTextureIndex = 0;

		return null;

	};

	this.compute = function() {

		var currentTextureIndex = this.currentTextureIndex;
		var nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;

		for ( var i = 0; i < this.variables.length; i++ ) {

			var variable = this.variables[ i ];

			// Sets texture dependencies uniforms
			var uniforms = variable.material.uniforms;
			for ( var d = 0; d < variable.dependencies.length; d++ ) {

				var depVar = variable.dependencies[ d ];

				uniforms[ depVar.name ].value = depVar.renderTargets[ currentTextureIndex ].texture;

			}

			// Makes the computation for this variable
			this.doRenderTarget( variable.material, variable.renderTargets[ nextTextureIndex ] );

		}

		this.currentTextureIndex = nextTextureIndex;
	};

	this.getCurrentTexture = function( variable ) {

		return variable.renderTargets[ this.currentTextureIndex ];

	}

	this.addResolutionDefine = function( materialShader ) {

		materialShader.defines.resolution = 'vec2( ' + sizeX.toFixed( 1 ) + ', ' + sizeY.toFixed( 1 ) + " )";

	};

	this.createRenderTarget = function() {

		var renderTarget = new THREE.WebGLRenderTarget( sizeX, sizeY, {
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.RepeatWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			stencilBuffer: false
		} );

		return renderTarget;

	};

    this.createTexture = function() {

		var a = new Float32Array( sizeX * sizeY * 4 );
		var texture = new THREE.DataTexture( a, sizeX, sizeY, THREE.RGBAFormat, THREE.FloatType );
		texture.needsUpdate = true;

		return texture;

	};


	// Takes a texture, and render out as another texture
	this.renderTexture = function( input, output ) {

		passThruUniforms.texture.value = input;

		doRenderTarget( passThruShader, output);

	};

	this.doRenderTarget = function( material, output ) {

		mesh.material = material;
		renderer.render( scene, camera, output );

	};


	this.renderPosition = function( position, velocity, output, delta ) {

		mesh.material = positionShader;
		positionShader.uniforms.texturePosition.value = position;
		positionShader.uniforms.textureVelocity.value = velocity;
		positionShader.uniforms.time.value = performance.now();
		positionShader.uniforms.delta.value = delta;
		renderer.render( scene, camera, output );
		this.currentPosition = output.texture;

	};

	this.renderVelocity = function( position, velocity, output, delta ) {

		mesh.material = velocityShader;
		velocityShader.uniforms.texturePosition.value = position;
		velocityShader.uniforms.textureVelocity.value = velocity;
		velocityShader.uniforms.time.value = performance.now();
		velocityShader.uniforms.delta.value = delta;
		renderer.render( scene, camera, output );
		this.currentVelocity = output.texture;

	};

	this.simulate = function( delta ) {

		if ( flipflop ) {

			simulator.renderVelocity( rtPosition1.texture, rtVelocity1.texture, rtVelocity2, delta );
			simulator.renderPosition( rtPosition1.texture, rtVelocity2.texture, rtPosition2, delta );

		} else {

			simulator.renderVelocity( rtPosition2.texture, rtVelocity2.texture, rtVelocity1, delta );
			simulator.renderPosition( rtPosition2.texture, rtVelocity1.texture, rtPosition1, delta );

		}

		flipflop = ! flipflop;

	};

}
