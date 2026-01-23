import {
	ClampToEdgeWrapping,
	DataTexture,
	FloatType,
	NearestFilter,
	RGBAFormat,
	ShaderMaterial,
	WebGLRenderTarget
} from 'three';

import { FullScreenQuad } from '../postprocessing/Pass.js';

/**
 * GPUComputationRenderer, based on SimulationRenderer by @zz85.
 *
 * The GPUComputationRenderer uses the concept of variables. These variables are RGBA float textures that hold 4 floats
 * for each compute element (texel).
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
 * ```
 * #DEFINE resolution vec2( 1024.0, 1024.0 )
 * ```
 * Basic use:
 * ```js
 * // Initialization...
 *
 * // Create computation renderer
 * const gpuCompute = new GPUComputationRenderer( 1024, 1024, renderer );
 *
 * // Create initial state float textures
 * const pos0 = gpuCompute.createTexture();
 * const vel0 = gpuCompute.createTexture();
 * // and fill in here the texture data...
 *
 * // Add texture variables
 * const velVar = gpuCompute.addVariable( "textureVelocity", fragmentShaderVel, vel0 );
 * const posVar = gpuCompute.addVariable( "texturePosition", fragmentShaderPos, pos0 );
 *
 * // Add variable dependencies
 * gpuCompute.setVariableDependencies( velVar, [ velVar, posVar ] );
 * gpuCompute.setVariableDependencies( posVar, [ velVar, posVar ] );
 *
 * // Add custom uniforms
 * velVar.material.uniforms.time = { value: 0.0 };
 *
 * // Check for completeness
 * const error = gpuCompute.init();
 * if ( error !== null ) {
 *		console.error( error );
  * }
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
 * ```
 *
 * Also, you can use utility functions to create ShaderMaterial and perform computations (rendering between textures)
 * Note that the shaders can have multiple input textures.
 *
 * ```js
 * const myFilter1 = gpuCompute.createShaderMaterial( myFilterFragmentShader1, { theTexture: { value: null } } );
 * const myFilter2 = gpuCompute.createShaderMaterial( myFilterFragmentShader2, { theTexture: { value: null } } );
 *
 * const inputTexture = gpuCompute.createTexture();
 *
 * // Fill in here inputTexture...
 *
 * myFilter1.uniforms.theTexture.value = inputTexture;
 *
 * const myRenderTarget = gpuCompute.createRenderTarget();
 * myFilter2.uniforms.theTexture.value = myRenderTarget.texture;
 *
 * const outputRenderTarget = gpuCompute.createRenderTarget();
 *
 * // Now use the output texture where you want:
 * myMaterial.uniforms.map.value = outputRenderTarget.texture;
 *
 * // And compute each frame, before rendering to screen:
 * gpuCompute.doRenderTarget( myFilter1, myRenderTarget );
 * gpuCompute.doRenderTarget( myFilter2, outputRenderTarget );
 * ```
 *
 * @three_import import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
 */
class GPUComputationRenderer {

	/**
	 * Constructs a new GPU computation renderer.
	 *
	 * @param {number} sizeX - Computation problem size is always 2d: sizeX * sizeY elements.
 	 * @param {number} sizeY - Computation problem size is always 2d: sizeX * sizeY elements.
 	 * @param {WebGLRenderer} renderer - The renderer.
	 */
	constructor( sizeX, sizeY, renderer ) {

		this.variables = [];

		this.currentTextureIndex = 0;

		let dataType = FloatType;

		const passThruUniforms = {
			passThruTexture: { value: null }
		};

		const passThruShader = createShaderMaterial( getPassThroughFragmentShader(), passThruUniforms );

		const quad = new FullScreenQuad( passThruShader );

		/**
		 * Sets the data type of the internal textures.
		 *
		 * @param {(FloatType|HalfFloatType)} type - The type to set.
		 * @return {GPUComputationRenderer} A reference to this renderer.
		 */
		this.setDataType = function ( type ) {

			dataType = type;
			return this;

		};

		/**
		 * Adds a compute variable to the renderer.
		 *
		 * @param {string} variableName - The variable name.
		 * @param {string} computeFragmentShader - The compute (fragment) shader source.
		 * @param {Texture} initialValueTexture - The initial value texture.
		 * @return {Object} The compute variable.
		 */
		this.addVariable = function ( variableName, computeFragmentShader, initialValueTexture ) {

			const material = this.createShaderMaterial( computeFragmentShader );

			const variable = {
				name: variableName,
				initialValueTexture: initialValueTexture,
				material: material,
				dependencies: null,
				renderTargets: [],
				wrapS: null,
				wrapT: null,
				minFilter: NearestFilter,
				magFilter: NearestFilter
			};

			this.variables.push( variable );

			return variable;

		};

		/**
		 * Sets variable dependencies.
		 *
		 * @param {Object} variable - The compute variable.
		 * @param {Array<Object>} dependencies - Other compute variables that represents the dependencies.
		 */
		this.setVariableDependencies = function ( variable, dependencies ) {

			variable.dependencies = dependencies;

		};

		/**
		 * Initializes the renderer.
		 *
		 * @return {?string} Returns `null` if no errors are detected. Otherwise returns the error message.
		 */
		this.init = function () {

			if ( renderer.capabilities.maxVertexTextures === 0 ) {

				return 'No support for vertex shader textures.';

			}

			for ( let i = 0; i < this.variables.length; i ++ ) {

				const variable = this.variables[ i ];

				// Creates rendertargets and initialize them with input texture
				variable.renderTargets[ 0 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );
				variable.renderTargets[ 1 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );
				this.renderTexture( variable.initialValueTexture, variable.renderTargets[ 0 ] );
				this.renderTexture( variable.initialValueTexture, variable.renderTargets[ 1 ] );

				// Adds dependencies uniforms to the ShaderMaterial
				const material = variable.material;
				const uniforms = material.uniforms;

				if ( variable.dependencies !== null ) {

					for ( let d = 0; d < variable.dependencies.length; d ++ ) {

						const depVar = variable.dependencies[ d ];

						if ( depVar.name !== variable.name ) {

							// Checks if variable exists
							let found = false;

							for ( let j = 0; j < this.variables.length; j ++ ) {

								if ( depVar.name === this.variables[ j ].name ) {

									found = true;
									break;

								}

							}

							if ( ! found ) {

								return 'Variable dependency not found. Variable=' + variable.name + ', dependency=' + depVar.name;

							}

						}

						uniforms[ depVar.name ] = { value: null };

						material.fragmentShader = '\nuniform sampler2D ' + depVar.name + ';\n' + material.fragmentShader;

					}

				}

			}

			this.currentTextureIndex = 0;

			return null;

		};

		/**
		 * Executes the compute. This method is usually called in the animation loop.
		 */
		this.compute = function () {

			const currentTextureIndex = this.currentTextureIndex;
			const nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;

			for ( let i = 0, il = this.variables.length; i < il; i ++ ) {

				const variable = this.variables[ i ];

				// Sets texture dependencies uniforms
				if ( variable.dependencies !== null ) {

					const uniforms = variable.material.uniforms;

					for ( let d = 0, dl = variable.dependencies.length; d < dl; d ++ ) {

						const depVar = variable.dependencies[ d ];

						uniforms[ depVar.name ].value = depVar.renderTargets[ currentTextureIndex ].texture;

					}

				}

				// Performs the computation for this variable
				this.doRenderTarget( variable.material, variable.renderTargets[ nextTextureIndex ] );

			}

			this.currentTextureIndex = nextTextureIndex;

		};

		/**
		 * Returns the current render target for the given compute variable.
		 *
		 * @param {Object} variable - The compute variable.
		 * @return {WebGLRenderTarget} The current render target.
		 */
		this.getCurrentRenderTarget = function ( variable ) {

			return variable.renderTargets[ this.currentTextureIndex ];

		};

		/**
		 * Returns the alternate render target for the given compute variable.
		 *
		 * @param {Object} variable - The compute variable.
		 * @return {WebGLRenderTarget} The alternate render target.
		 */
		this.getAlternateRenderTarget = function ( variable ) {

			return variable.renderTargets[ this.currentTextureIndex === 0 ? 1 : 0 ];

		};

		/**
		 * Frees all internal resources. Call this method if you don't need the
		 * renderer anymore.
		 */
		this.dispose = function () {

			quad.dispose();

			const variables = this.variables;

			for ( let i = 0; i < variables.length; i ++ ) {

				const variable = variables[ i ];

				if ( variable.initialValueTexture ) variable.initialValueTexture.dispose();

				const renderTargets = variable.renderTargets;

				for ( let j = 0; j < renderTargets.length; j ++ ) {

					const renderTarget = renderTargets[ j ];
					renderTarget.dispose();

				}

			}

		};

		function addResolutionDefine( materialShader ) {

			materialShader.defines.resolution = 'vec2( ' + sizeX.toFixed( 1 ) + ', ' + sizeY.toFixed( 1 ) + ' )';

		}

		/**
		 * Adds a resolution defined for the given material shader.
		 *
		 * @param {Object} materialShader - The material shader.
		 */
		this.addResolutionDefine = addResolutionDefine;


		// The following functions can be used to compute things manually

		function createShaderMaterial( computeFragmentShader, uniforms ) {

			uniforms = uniforms || {};

			const material = new ShaderMaterial( {
				name: 'GPUComputationShader',
				uniforms: uniforms,
				vertexShader: getPassThroughVertexShader(),
				fragmentShader: computeFragmentShader
			} );

			addResolutionDefine( material );

			return material;

		}

		this.createShaderMaterial = createShaderMaterial;

		/**
		 * Creates a new render target from the given parameters.
		 *
		 * @param {number} sizeXTexture - The width of the render target.
		 * @param {number} sizeYTexture - The height of the render target.
		 * @param {number} wrapS - The wrapS value.
		 * @param {number} wrapT - The wrapS value.
		 * @param {number} minFilter - The minFilter value.
		 * @param {number} magFilter - The magFilter value.
		 * @return {WebGLRenderTarget} The new render target.
		 */
		this.createRenderTarget = function ( sizeXTexture, sizeYTexture, wrapS, wrapT, minFilter, magFilter ) {

			sizeXTexture = sizeXTexture || sizeX;
			sizeYTexture = sizeYTexture || sizeY;

			wrapS = wrapS || ClampToEdgeWrapping;
			wrapT = wrapT || ClampToEdgeWrapping;

			minFilter = minFilter || NearestFilter;
			magFilter = magFilter || NearestFilter;

			const renderTarget = new WebGLRenderTarget( sizeXTexture, sizeYTexture, {
				wrapS: wrapS,
				wrapT: wrapT,
				minFilter: minFilter,
				magFilter: magFilter,
				format: RGBAFormat,
				type: dataType,
				depthBuffer: false
			} );

			return renderTarget;

		};

		/**
		 * Creates a new data texture.
		 *
		 * @return {DataTexture} The new data texture.
		 */
		this.createTexture = function () {

			const data = new Float32Array( sizeX * sizeY * 4 );
			const texture = new DataTexture( data, sizeX, sizeY, RGBAFormat, FloatType );
			texture.needsUpdate = true;
			return texture;

		};

		/**
		 * Renders the given texture into the given render target.
		 *
		 * @param {Texture} input - The input.
		 * @param {WebGLRenderTarget} output - The output.
		 */
		this.renderTexture = function ( input, output ) {

			passThruUniforms.passThruTexture.value = input;

			this.doRenderTarget( passThruShader, output );

			passThruUniforms.passThruTexture.value = null;

		};


		/**
		 * Renders the given material into the given render target
		 * with a full-screen pass.
		 *
		 * @param {Material} material - The material.
		 * @param {WebGLRenderTarget} output - The output.
		 */
		this.doRenderTarget = function ( material, output ) {

			const currentRenderTarget = renderer.getRenderTarget();

			const currentXrEnabled = renderer.xr.enabled;
			const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

			renderer.xr.enabled = false; // Avoid camera modification
			renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows
			quad.material = material;
			renderer.setRenderTarget( output );
			quad.render( renderer );
			quad.material = passThruShader;

			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

			renderer.setRenderTarget( currentRenderTarget );

		};

		// Shaders

		function getPassThroughVertexShader() {

			return	'void main()	{\n' +
					'\n' +
					'	gl_Position = vec4( position, 1.0 );\n' +
					'\n' +
					'}\n';

		}

		function getPassThroughFragmentShader() {

			return	'uniform sampler2D passThruTexture;\n' +
					'\n' +
					'void main() {\n' +
					'\n' +
					'	vec2 uv = gl_FragCoord.xy / resolution.xy;\n' +
					'\n' +
					'	gl_FragColor = texture2D( passThruTexture, uv );\n' +
					'\n' +
					'}\n';

		}

	}

}

export { GPUComputationRenderer };
