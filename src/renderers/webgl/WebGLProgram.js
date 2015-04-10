/**
 * @author mrdoob / http://mrdoob.com/
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.WebGLProgram = function ( renderer, code, material, parameters, shaderCache ) {

	var gl = renderer.context;

	this._gl = gl;
	this._state = THREE.WebGLShader.CompilingState;
	this._linkMessage = '';
	this._program = undefined;
	this._material = material;
	this._parameters = parameters;
	this._shaderCache = shaderCache;
	this.id = THREE.WebGLProgram._programIdCount++;
	this.code = code;
	this.usedTimes = 1;

	this._index0AttributeName = material.index0AttributeName;

	if ( this._index0AttributeName === undefined && parameters.morphTargets === true ) {

		// programs with morphTargets displace position out of attribute 0

		this._index0AttributeName = 'position';

	}

	this._generateSource( renderer, material, parameters );

	var cache;

	var vertexShader;
	cache = shaderCache.vertex;
	for ( var i = 0, ul = cache.length; i < ul; i++ ) {

		var shaderInfo = cache[i];

		if ( shaderInfo.source === this.vertexShaderSource ) {

			vertexShader = shaderInfo;
			vertexShader.usedTimes++;

			break;

		}

	}

	if ( vertexShader === undefined ) {

		vertexShader = new THREE.WebGLShader( gl, gl.VERTEX_SHADER, this.vertexShaderSource );
		cache.push( vertexShader );

	}

	var fragmentShader;

	cache = shaderCache.fragment;
	for ( var i = 0, ul = cache.length; i < ul; i++ ) {

		var shaderInfo = cache[i];

		if ( shaderInfo.source === this.fragmentShaderSource ) {

			fragmentShader = shaderInfo;
			fragmentShader.usedTimes++;

			break;

		}

	}

	if ( fragmentShader === undefined ) {

		fragmentShader = new THREE.WebGLShader( gl, gl.FRAGMENT_SHADER, this.fragmentShaderSource );
		cache.push( fragmentShader );

	}

	this.vertexShaderSource = undefined;
	this.fragmentShaderSource = undefined;

	this.vertexShader = vertexShader;
	this.fragmentShader = fragmentShader;

	// peek compile states, if complete move straight to link

	if ( vertexShader._state !== THREE.WebGLShader.CompilingState && fragmentShader._state !== THREE.WebGLShader.CompilingState ) {

		this._updateCompileState();

	}

};

THREE.WebGLProgram._programIdCount = 0;
THREE.WebGLProgram.CompilingState = 0;
THREE.WebGLProgram.CompileErrorState = 1;
THREE.WebGLProgram.LinkingState = 2;
THREE.WebGLProgram.LinkErrorState = 3;
THREE.WebGLProgram.LinkedState = 4;

THREE.WebGLProgram.prototype = {

	constructor: THREE.WebGLProgram,

	_generateSource: ( function () {

		function generateDefines( defines ) {

			var value, chunk, chunks = [];

			for ( var d in defines ) {

				value = defines[d];
				if ( value === false ) continue;

				chunk = '#define ' + d + ' ' + value;
				chunks.push( chunk );

			}

			return chunks.join( '\n' );

		}


		function programArrayToString( previousValue, currentValue, index, array ) {

			if ( currentValue !== '' && currentValue !== undefined && currentValue !== null ) {

				return previousValue + currentValue + '\n';

			}

			return previousValue;
		}

		return function ( renderer, material, parameters ) {

			var defines = material.defines;
			var uniforms = material.__webglShader.uniforms;
			var attributes = material.attributes;

			var vertexShaderSource = material.__webglShader.vertexShader;
			var fragmentShaderSource = material.__webglShader.fragmentShader;


			var shadowMapTypeDefine = 'SHADOWMAP_TYPE_BASIC';

			if ( parameters.shadowMapType === THREE.PCFShadowMap ) {

				shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF';

			} else if ( parameters.shadowMapType === THREE.PCFSoftShadowMap ) {

				shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF_SOFT';

			}

			var envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
			var envMapModeDefine = 'ENVMAP_MODE_REFLECTION';
			var envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';

			if ( parameters.envMap ) {

				switch ( material.envMap.mapping ) {

					case THREE.CubeReflectionMapping:
					case THREE.CubeRefractionMapping:
						envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
						break;

					case THREE.EquirectangularReflectionMapping:
					case THREE.EquirectangularRefractionMapping:
						envMapTypeDefine = 'ENVMAP_TYPE_EQUIREC';
						break;

					case THREE.SphericalReflectionMapping:
						envMapTypeDefine = 'ENVMAP_TYPE_SPHERE';
						break;

				}

				switch ( material.envMap.mapping ) {

					case THREE.CubeRefractionMapping:
					case THREE.EquirectangularRefractionMapping:
						envMapModeDefine = 'ENVMAP_MODE_REFRACTION';
						break;

				}

				switch ( material.combine ) {

					case THREE.MultiplyOperation:
						envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
						break;

					case THREE.MixOperation:
						envMapBlendingDefine = 'ENVMAP_BLENDING_MIX';
						break;

					case THREE.AddOperation:
						envMapBlendingDefine = 'ENVMAP_BLENDING_ADD';
						break;

				}

			}

			var gammaFactorDefine = ( renderer.gammaFactor > 0 ) ? renderer.gammaFactor : 1.0;

			var customDefines = generateDefines( defines );

			var prefix_vertex, prefix_fragment;

			if ( material instanceof THREE.RawShaderMaterial ) {

				prefix_vertex = '';
				prefix_fragment = '';

			} else {

				prefix_vertex = [

					'precision ' + parameters.precision + ' float;',
					'precision ' + parameters.precision + ' int;',

					customDefines,

					parameters.supportsVertexTextures ? '#define VERTEX_TEXTURES' : '',

					renderer.gammaInput ? '#define GAMMA_INPUT' : '',
					renderer.gammaOutput ? '#define GAMMA_OUTPUT' : '',
					'#define GAMMA_FACTOR ' + gammaFactorDefine,

					'#define MAX_DIR_LIGHTS ' + parameters.maxDirLights,
					'#define MAX_POINT_LIGHTS ' + parameters.maxPointLights,
					'#define MAX_SPOT_LIGHTS ' + parameters.maxSpotLights,
					'#define MAX_HEMI_LIGHTS ' + parameters.maxHemiLights,

					'#define MAX_SHADOWS ' + parameters.maxShadows,

					'#define MAX_BONES ' + parameters.maxBones,

					parameters.map ? '#define USE_MAP' : '',
					parameters.envMap ? '#define USE_ENVMAP' : '',
					parameters.envMap ? '#define ' + envMapModeDefine : '',
					parameters.lightMap ? '#define USE_LIGHTMAP' : '',
					parameters.aoMap ? '#define USE_AOMAP' : '',
					parameters.bumpMap ? '#define USE_BUMPMAP' : '',
					parameters.normalMap ? '#define USE_NORMALMAP' : '',
					parameters.specularMap ? '#define USE_SPECULARMAP' : '',
					parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
					parameters.vertexColors ? '#define USE_COLOR' : '',

					parameters.flatShading ? '#define FLAT_SHADED' : '',

					parameters.skinning ? '#define USE_SKINNING' : '',
					parameters.useVertexTexture ? '#define BONE_TEXTURE' : '',

					parameters.morphTargets ? '#define USE_MORPHTARGETS' : '',
					parameters.morphNormals ? '#define USE_MORPHNORMALS' : '',
					parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
					parameters.flipSided ? '#define FLIP_SIDED' : '',

					parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
					parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',
					parameters.shadowMapDebug ? '#define SHADOWMAP_DEBUG' : '',
					parameters.shadowMapCascade ? '#define SHADOWMAP_CASCADE' : '',

					parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',

					parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
					//renderer.glExtensionFragDepth ? '#define USE_LOGDEPTHBUF_EXT' : '',


					'uniform mat4 modelMatrix;',
					'uniform mat4 modelViewMatrix;',
					'uniform mat4 projectionMatrix;',
					'uniform mat4 viewMatrix;',
					'uniform mat3 normalMatrix;',
					'uniform vec3 cameraPosition;',

					'attribute vec3 position;',
					'attribute vec3 normal;',
					'attribute vec2 uv;',

					'#ifdef USE_COLOR',

					'	attribute vec3 color;',

					'#endif',

					'#ifdef USE_MORPHTARGETS',

					'	attribute vec3 morphTarget0;',
					'	attribute vec3 morphTarget1;',
					'	attribute vec3 morphTarget2;',
					'	attribute vec3 morphTarget3;',

					'	#ifdef USE_MORPHNORMALS',

					'		attribute vec3 morphNormal0;',
					'		attribute vec3 morphNormal1;',
					'		attribute vec3 morphNormal2;',
					'		attribute vec3 morphNormal3;',

					'	#else',

					'		attribute vec3 morphTarget4;',
					'		attribute vec3 morphTarget5;',
					'		attribute vec3 morphTarget6;',
					'		attribute vec3 morphTarget7;',

					'	#endif',

					'#endif',

					'#ifdef USE_SKINNING',

					'	attribute vec4 skinIndex;',
					'	attribute vec4 skinWeight;',

					'#endif',

					''

				].reduce( programArrayToString, '' );

				prefix_fragment = [

					'precision ' + parameters.precision + ' float;',
					'precision ' + parameters.precision + ' int;',

					( parameters.bumpMap || parameters.normalMap || parameters.flatShading ) ? '#extension GL_OES_standard_derivatives : enable' : '',

					customDefines,

					'#define MAX_DIR_LIGHTS ' + parameters.maxDirLights,
					'#define MAX_POINT_LIGHTS ' + parameters.maxPointLights,
					'#define MAX_SPOT_LIGHTS ' + parameters.maxSpotLights,
					'#define MAX_HEMI_LIGHTS ' + parameters.maxHemiLights,

					'#define MAX_SHADOWS ' + parameters.maxShadows,

					parameters.alphaTest ? '#define ALPHATEST ' + parameters.alphaTest : '',

					renderer.gammaInput ? '#define GAMMA_INPUT' : '',
					renderer.gammaOutput ? '#define GAMMA_OUTPUT' : '',
					'#define GAMMA_FACTOR ' + gammaFactorDefine,

					( parameters.useFog && parameters.fog ) ? '#define USE_FOG' : '',
					( parameters.useFog && parameters.fogExp ) ? '#define FOG_EXP2' : '',

					parameters.map ? '#define USE_MAP' : '',
					parameters.envMap ? '#define USE_ENVMAP' : '',
					parameters.envMap ? '#define ' + envMapTypeDefine : '',
					parameters.envMap ? '#define ' + envMapModeDefine : '',
					parameters.envMap ? '#define ' + envMapBlendingDefine : '',
					parameters.lightMap ? '#define USE_LIGHTMAP' : '',
					parameters.aoMap ? '#define USE_AOMAP' : '',
					parameters.bumpMap ? '#define USE_BUMPMAP' : '',
					parameters.normalMap ? '#define USE_NORMALMAP' : '',
					parameters.specularMap ? '#define USE_SPECULARMAP' : '',
					parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
					parameters.vertexColors ? '#define USE_COLOR' : '',

					parameters.flatShading ? '#define FLAT_SHADED' : '',

					parameters.metal ? '#define METAL' : '',
					parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
					parameters.flipSided ? '#define FLIP_SIDED' : '',

					parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
					parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',
					parameters.shadowMapDebug ? '#define SHADOWMAP_DEBUG' : '',
					parameters.shadowMapCascade ? '#define SHADOWMAP_CASCADE' : '',

					parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
					//renderer.glExtensionFragDepth ? '#define USE_LOGDEPTHBUF_EXT' : '',

					'uniform mat4 viewMatrix;',
					'uniform vec3 cameraPosition;',
					''

				].reduce( programArrayToString, '' );

			};

			this.vertexShaderSource = prefix_vertex + vertexShaderSource;
			this.fragmentShaderSource = prefix_fragment + fragmentShaderSource;

		};

	} )(),

	_linkProgram: function () {

		var gl = this._gl;
		var program = gl.createProgram();

		gl.attachShader( program, this.vertexShader.shader );
		gl.attachShader( program, this.fragmentShader.shader );

		if ( this._index0AttributeName !== undefined ) {

			// Force a particular attribute to index 0.
			// because potentially expensive emulation is done by browser if attribute 0 is disabled.
			// And, color, for example is often automatically bound to index 0 so disabling it

			gl.bindAttribLocation( program, 0, this._index0AttributeName );

		}

		gl.linkProgram( program );

		this._program = program;
		this._state = THREE.WebGLProgram.LinkingState;

	},

	_cacheLocations: ( function () {

		function cacheUniformLocations( gl, program, identifiers ) {

			var uniforms = {};

			for ( var i = 0, l = identifiers.length; i < l; i++ ) {

				var id = identifiers[i];
				uniforms[id] = gl.getUniformLocation( program, id );

			}

			return uniforms;

		}

		function cacheAttributeLocations( gl, program, identifiers ) {

			var attributes = {};

			for ( var i = 0, l = identifiers.length; i < l; i++ ) {

				var id = identifiers[i];
				attributes[id] = gl.getAttribLocation( program, id );

			}

			return attributes;

		}

		return function () {
			var gl = this._gl;
			var program = this._program;

			var uniforms = this._material.__webglShader.uniforms;
			var attributes = this._material.attributes;

			// cache uniform locations

			var identifiers = [

				'viewMatrix',
				'modelViewMatrix',
				'projectionMatrix',
				'normalMatrix',
				'modelMatrix',
				'cameraPosition',
				'morphTargetInfluences',
				'bindMatrix',
				'bindMatrixInverse'

			];

			if ( this._parameters.useVertexTexture ) {

				identifiers.push( 'boneTexture', 'boneTextureWidth', 'boneTextureHeight' );

			} else {

				identifiers.push( 'boneGlobalMatrices' );

			}

			if ( this._parameters.logarithmicDepthBuffer ) {

				identifiers.push( 'logDepthBufFC' );

			}

			for ( var u in uniforms ) {

				identifiers.push( u );

			}

			this.uniforms = cacheUniformLocations( gl, program, identifiers );

			// cache attributes locations

			identifiers = [

				'position',
				'normal',
				'uv',
				'uv2',
				'tangent',
				'color',
				'skinIndex',
				'skinWeight',
				'lineDistance'

			];

			for ( var i = 0; i < this._parameters.maxMorphTargets; i++ ) {

				identifiers.push( 'morphTarget' + i );

			}

			for ( var i = 0; i < this._parameters.maxMorphNormals; i++ ) {

				identifiers.push( 'morphNormal' + i );

			}

			for ( var a in attributes ) {

				identifiers.push( a );

			}

			this.attributes = cacheAttributeLocations( gl, program, identifiers );
			this.attributesKeys = Object.keys( this.attributes );

			this._material = undefined;
			this._parameters = undefined;

		};

	} )(),

	_updateLinkState: function () {

		var gl = this._gl;
		var program = this._program;

		// Post link
		var programLogInfo = gl.getProgramInfoLog( program );

		if ( gl.getProgramParameter( program, gl.LINK_STATUS ) === false ) {

			this._state = THREE.WebGLProgram.LinkErrorState;
			this._linkMessage = ['THREE.WebGLProgram: shader error: ', gl.getError(), 'gl.VALIDATE_STATUS', gl.getProgramParameter( program, gl.VALIDATE_STATUS )].join( '\n' );
			THREE.error( this._linkMessage );

			this.dispose();

		}

		if ( programLogInfo !== '' ) {

			var log = ['THREE.WebGLProgram: gl.getProgramInfoLog()', programLogInfo].join( '\n' );
			this._linkMessage += '\n' + log;
			THREE.warn( log );

		}

		if ( this._state !== THREE.WebGLProgram.LinkErrorState ) {

			this._state = THREE.WebGLProgram.LinkedState;
			this._cacheLocations();

		}

	},

	_updateCompileState: function () {

		var compileError = false;

		// check both before bail, as both may have compile messages to share
		if ( this.vertexShader.state === THREE.WebGLShader.CompileErrorState ) {

			compileError = true;

		}

		if ( this.fragmentShader.state === THREE.WebGLShader.CompileErrorState ) {

			compileError = true;

		}

		if ( compileError ) {

			this._state = THREE.WebGLProgram.CompileErrorState;

		} else {

			this._linkProgram();

		}

	},

	get program() {

		return this._program;

	},

	get state() {

		// async compile and link, check link before compile as compile moves to link
		// and checking link after would force a sync pause, rather than allow background linking

		if ( this._state === THREE.WebGLProgram.LinkingState ) {

			this._updateLinkState();

		}

		if ( this._state === THREE.WebGLProgram.CompilingState ) {

			this._updateCompileState();

		}

		return this._state
	},

	get linkMessage() {

		return this._linkMessage
	},

	dispose: function () {

		this.usedTimes--;
		this._material = undefined;
		this._parameters = undefined;

		if ( this.usedTimes === 0 ) {

			if ( this.vertexShader ) {

				this.vertexShader.dispose();


				if ( this.vertexShader.usedTimes === 0 ) {

					var id = this.vertexShader.id;
					var cache = this._shaderCache.vertex;
					var shaders = [];

					for ( var i = 0, ul = cache.length; i < ul; i++ ) {

						if ( cache[i].id !== id ) {

							shaders.push( cache[i] );

						}

					}

					this._shaderCache.vertex = shaders;

				}

				this.vertexShader = undefined;

			}

			if ( this.fragmentShader ) {

				this.fragmentShader.dispose();

				if ( this.fragmentShader.usedTimes === 0 ) {

					var id = this.fragmentShader.id;
					var cache = this._shaderCache.fragment;
					var shaders = [];

					for ( var i = 0, ul = cache.length; i < ul; i++ ) {

						if ( cache[i].id !== id ) {

							shaders.push( cache[i] );

						}

					}

					this._shaderCache.fragment = shaders;

				}

				this.fragmentShader = undefined;

			}

			if ( this._program ) {

				this._gl.deleteProgram( this._program );
				this._program = undefined;

			}

			this._shaderCache = undefined;
			this._gl = undefined;

		}

	}

};
