/**
 * @author benaadams / https://twitter.com/ben_a_adams
*/

THREE.WebGLPrograms = function ( gl, renderer ) {
	var _this = this;

	var programCache = {};
	var vertexShaderCache = {};
	var fragmentShaderCache = {};

	var programCount = 0;

	function getMaxBones ( object, supportsBoneTextures ) {

		if ( supportsBoneTextures && object && object.skeleton && object.skeleton.useVertexTexture ) {

			return 1024;

		} else {

			// default for when object is not specified
			// ( for example when prebuilding shader to be used with multiple objects )
			//
			//  - leave some extra space for other uniforms
			//  - limit here is ANGLE's 254 max uniform vectors
			//    (up to 54 should be safe)

			var vertexUniforms = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );
			var maxBones = Math.floor( ( vertexUniforms - 20 ) / 4 );

			if ( object && object instanceof THREE.SkinnedMesh ) {

				maxBones = Math.min( object.skeleton.bones.length, maxBones );

				if ( maxBones < object.skeleton.bones.length ) {

					THREE.warn( 'WebGLRenderer: too many bones - ' + object.skeleton.bones.length + ', this GPU supports just ' + maxBones + ' (try OpenGL instead of ANGLE)' );

				}

			}

			return maxBones;

		}

	}

	function updateObjectParams( params, object ) {

		var maxBones = getMaxBones( object, params.supportsBoneTextures );

		params.maxBones = maxBones;
		params.useVertexTexture = params.supportsBoneTextures && object && object.skeleton && object.skeleton.useVertexTexture;
		params.shadowMapEnabled = params.shadowMapGoballyEnabled && object && object.receiveShadow && params.maxShadows > 0;

	}

	function onMaterialDispose( event ) {

		var material = event.target;

		material.removeEventListener( 'dispose', onMaterialDispose );

		var program = material.program;

		if ( program === undefined ) return;

		material.program = undefined;

		_this.release( program );

	}
	
	this.resolveProgramImmediate = function ( object, params ) {

		var material = object.material;

		if ( material.visible && material.needsUpdate ) {

			updateObjectParams( params, object );

			var prevProgram = material.program;

			if ( !material.program ) {

				material.addEventListener( 'dispose', onMaterialDispose );

			}

			var releaseProgram = initProgram( material, params );

			if ( releaseProgram ) {

				_this.release( prevProgram );

			}

			var programs = [material.program];

			_this.link( programs );
			_this.linkComplete( programs );

		}

	}

	this.resolvePrograms = function ( renderList, params, overrideMaterial ) {

		if ( !!overrideMaterial ) {

			if ( overrideMaterial.visible && overrideMaterial.needsUpdate ) {

				updateObjectParams( params, undefined );

				var prevProgram = overrideMaterial.program;

				if ( !overrideMaterial.program ) {

					overrideMaterial.addEventListener( 'dispose', onMaterialDispose );

				}

				var releaseProgram = initProgram( overrideMaterial, params );

				if ( releaseProgram ) {

					_this.release( prevProgram );

				}

				return [overrideMaterial.program];

			}

			return undefined;

		} 

		var programsToRelease, programsUpdated;

		for ( var i = 0, ul = renderList.length; i < ul; i++ ) {

			var object = renderList[i];
			var material = object.material;

			if ( material && material.visible && material.needsUpdate ) {

				updateObjectParams( params, object );

				var prevProgram = material.program;

				if ( !material.program ) {

					material.addEventListener( 'dispose', onMaterialDispose );

				}

				var releaseProgram = initProgram( material, params );

				if ( releaseProgram ) {

					programsToRelease = programsToRelease || [];
					programsToRelease.push( prevProgram );

				}

				programsUpdated = programsUpdated || [];
				programsUpdated.push( material.program );

			}

		}

		if ( programsToRelease !== undefined ) {

			for ( var i = 0, ul = programsToRelease.length; i < ul; i++ ) {

				_this.release( programsToRelease[i] );

			}

		}

		return programsUpdated;

	}

	this.link = function ( programs ) {

		if ( programs !== undefined ) {

			for ( var i = 0, ul = programs.length; i < ul; i++ ) {

				var program = programs[i];

				if ( program.state === THREE.WebGLProgram.CompilingState ) {

					updateProgramCompileState( program );

				}

			}

		}

	}

	this.linkComplete = function ( programs ) {

		if ( programs !== undefined ) {

			for ( var i = 0, ul = programs.length; i < ul; i++ ) {

				var program = programs[i];

				if ( program.state === THREE.WebGLProgram.LinkingState ) {

					updateLinkState( program );

				}

			}

		}

	}

	function initProgram ( material, params ) {

		var releasedProgram = false;

		var codeParams = generateCodeAndParams( material, params );

		var program = programCache[codeParams.code];

		if ( material.program !== undefined ) {

			if ( program === undefined || material.program.id !== program.id ) {

				releasedProgram = true;

				material.program = undefined;

			} else {

				// async compile and link, check link before compile as compile moves to link
				// and checking link after would force a sync pause, rather than allow background linking

				if ( program.state === THREE.WebGLProgram.LinkingState ) {

					updateLinkState( program );

				}

				if ( program.state === THREE.WebGLProgram.CompilingState ) {

					updateProgramCompileState( program );

				}

				return releasedProgram;

			}

		}

		if ( program !== undefined ) {

			program.usedTimes++;
			material.program = program;

			return releasedProgram;

		}

		var shaderSource = generateSource( material, codeParams.parameters );

		var vertexShader = getShader( gl.VERTEX_SHADER, shaderSource.vertex );
		var fragmentShader = getShader( gl.FRAGMENT_SHADER, shaderSource.fragment );

		program = new THREE.WebGLProgram( material, codeParams.parameters, vertexShader, fragmentShader );
		program.id = programCount;
		program.sourceUniforms = shaderSource.uniforms;

		// peek compile states, if complete move straight to link

		if ( vertexShader.state !== THREE.WebGLShader.CompilingState && fragmentShader.state !== THREE.WebGLShader.CompilingState ) {

			updateProgramCompileState( program );

		}

		program.code = codeParams.code;
		programCache[codeParams.code] = program;
		programCount++;

		material.program = program;

		return releasedProgram;

	};

	function deleteProgram( program ) {

		if ( program.vertexShader !== undefined ) {

			shaderRelease( program.vertexShader );
			program.vertexShader = undefined;

		}

		if ( program.fragmentShader !== undefined ) {

			shaderRelease( program.fragmentShader );
			program.fragmentShader = undefined;

		}

		if ( program.webglProgram !== undefined ) {

			gl.deleteProgram( program.webglProgram );

			program.webglProgram = undefined;
			renderer.info.memory.programs--;

		}
	}

	this.release = function ( program ) {

		program.usedTimes--;
		program.material = undefined;
		program.parameters = undefined;

		if ( program.usedTimes === 0 ) {

			deleteProgram( program );

			delete programCache[program.code];

		}

	}

	function shaderRelease( shader ) {

		shader.usedTimes--;

		if ( shader.usedTimes === 0 ) {

			if ( shader.type === gl.VERTEX_SHADER ) {

				delete vertexShaderCache[shader.source];

			} else {

				delete fragmentShaderCache[shader.source];

			}

			if ( shader.webglShader ) {

				gl.deleteShader( shader.webglShader );
				shader.webglShader = undefined;

				if ( shader.type === gl.VERTEX_SHADER ) {

					renderer.info.memory.vertexShaders--;

				} else {

					renderer.info.memory.fragmentShaders--;

				}

			}

		}

	}

	var shaderIDs = {
		MeshDepthMaterial: 'depth',
		MeshNormalMaterial: 'normal',
		MeshBasicMaterial: 'basic',
		MeshLambertMaterial: 'lambert',
		MeshPhongMaterial: 'phong',
		LineBasicMaterial: 'basic',
		LineDashedMaterial: 'dashed',
		PointCloudMaterial: 'particle_basic'
	};

	function generateCodeAndParams( material, params ) {

		var shaderID = shaderIDs[material.type];

		var parameters = {

			precision: params.precision,
			supportsVertexTextures: params.supportsVertexTextures,

			map: !!material.map,
			envMap: !!material.envMap,
			envMapMode: material.envMap && material.envMap.mapping,
			lightMap: !!material.lightMap,
			aoMap: !!material.aoMap,
			bumpMap: !!material.bumpMap,
			normalMap: !!material.normalMap,
			specularMap: !!material.specularMap,
			alphaMap: !!material.alphaMap,

			combine: material.combine,

			vertexColors: material.vertexColors,

			fog: params.fog,
			useFog: material.fog,
			fogExp: params.fog instanceof THREE.FogExp2,

			flatShading: material.shading === THREE.FlatShading,

			sizeAttenuation: material.sizeAttenuation,
			logarithmicDepthBuffer: params.logarithmicDepthBuffer,

			skinning: material.skinning,
			maxBones: params.maxBones,
			useVertexTexture: params.useVertexTexture,

			morphTargets: material.morphTargets,
			morphNormals: material.morphNormals,
			maxMorphTargets: params.maxMorphTargets,
			maxMorphNormals: params.maxMorphNormals,

			maxDirLights: params.maxDirLights,
			maxPointLights: params.maxPointLights,
			maxSpotLights: params.maxSpotLights,
			maxHemiLights: params.maxHemiLights,

			maxShadows: params.maxShadows,
			shadowMapEnabled: params.shadowMapEnabled,
			shadowMapType: params.shadowMapType,
			shadowMapDebug: params.shadowMapDebug,
			shadowMapCascade: params.shadowMapCascade,

			alphaTest: material.alphaTest,
			metal: material.metal,
			doubleSided: material.side === THREE.DoubleSide,
			flipSided: material.side === THREE.BackSide

		};

		// Generate code

		var chunks = [];

		if ( shaderID ) {

			chunks.push( shaderID );

		} else {

			chunks.push( material.fragmentShader );
			chunks.push( material.vertexShader );

		}

		if ( material.defines !== undefined ) {

			for ( var name in material.defines ) {

				chunks.push( name );
				chunks.push( material.defines[name] );

			}

		}

		for ( var name in parameters ) {

			chunks.push( name );
			chunks.push( parameters[name] );

		}

		var code = chunks.join();

		return { code: code, parameters: parameters };

	}

	function getShader( type, source ) {

		var cache = type === gl.VERTEX_SHADER ? vertexShaderCache : fragmentShaderCache;

		var shader = cache[source];

		if ( shader !== undefined ) return shader;

		var webglShader = gl.createShader( type );
		gl.shaderSource( webglShader, source );
		gl.compileShader( webglShader );

		shader = new THREE.WebGLShader( type, webglShader );
		shader.source = source;

		cache[source] = shader;

		if ( type === gl.VERTEX_SHADER ) {

			renderer.info.memory.vertexShaders++;

		} else {
	
			renderer.info.memory.fragmentShaders++;

		}

		return shader;

	};

	function linkProgram( program ) {

		var webglProgram = gl.createProgram();

		gl.attachShader( webglProgram, program.vertexShader.webglShader );
		gl.attachShader( webglProgram, program.fragmentShader.webglShader );

		// Force a particular attribute to index 0.
		// because potentially expensive emulation is done by browser if attribute 0 is disabled.
		// And, color, for example is often automatically bound to index 0 so disabling it

		gl.bindAttribLocation( webglProgram, 0, 'position' );

		gl.linkProgram( webglProgram );

		program.webglProgram = webglProgram;
		program.state = THREE.WebGLProgram.LinkingState;

		renderer.info.memory.programs++;

	}

	var cacheLocations = ( function () {

		function cacheUniformLocations( webglProgram, identifiers ) {

			var uniforms = {};

			for ( var i = 0, l = identifiers.length; i < l; i++ ) {

				var id = identifiers[i];
				uniforms[id] = gl.getUniformLocation( webglProgram, id );

			}

			return uniforms;

		}

		function cacheAttributeLocations( webglProgram, identifiers ) {

			var attributes = {};

			for ( var i = 0, l = identifiers.length; i < l; i++ ) {

				var id = identifiers[i];
				attributes[id] = gl.getAttribLocation( webglProgram, id );

			}

			return attributes;

		}

		return function cacheLocations( program ) {

			var webglProgram = program.webglProgram;

			var uniforms = program.sourceUniforms;
			var attributes = program.material.attributes;

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

			if ( program.parameters.useVertexTexture ) {

				identifiers.push( 'boneTexture', 'boneTextureWidth', 'boneTextureHeight' );

			} else {

				identifiers.push( 'boneGlobalMatrices' );

			}

			if ( program.parameters.logarithmicDepthBuffer ) {

				identifiers.push( 'logDepthBufFC' );

			}

			for ( var u in uniforms ) {

				identifiers.push( u );

			}

			program.webglUniforms = cacheUniformLocations( webglProgram, identifiers );

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

			for ( var i = 0; i < program.parameters.maxMorphTargets; i++ ) {

				identifiers.push( 'morphTarget' + i );

			}

			for ( var i = 0; i < program.parameters.maxMorphNormals; i++ ) {

				identifiers.push( 'morphNormal' + i );

			}

			for ( var a in attributes ) {

				identifiers.push( a );

			}

			program.attributes = cacheAttributeLocations( webglProgram, identifiers );
			program.attributesKeys = Object.keys( program.attributes );

			program.material = undefined;
			program.parameters = undefined;

		};

	} )();

	function updateLinkState( program ) {

		var webglProgram = program.webglProgram;

		// Post link
		var programLogInfo = gl.getProgramInfoLog( webglProgram );

		if ( gl.getProgramParameter( webglProgram, gl.LINK_STATUS ) === false ) {

			program.state = THREE.WebGLProgram.LinkErrorState;
			program.linkMessage = ['THREE.WebGLProgram: shader error: ', gl.getError(), 'gl.VALIDATE_STATUS', gl.getProgramParameter( webglProgram, gl.VALIDATE_STATUS )].join( ' ' );
			THREE.error( program.linkMessage );

			deleteProgram( program );

		}

		if ( programLogInfo !== '' ) {

			var log = ['THREE.WebGLProgram: gl.getProgramInfoLog()', programLogInfo].join( '\n' );
			program.linkMessage += '\n' + log;
			THREE.warn( log );

		}

		if ( program.state !== THREE.WebGLProgram.LinkErrorState ) {

			program.state = THREE.WebGLProgram.LinkedState;
			cacheLocations( program );

		}

	}

	function updateProgramCompileState( program ) {

		var compileError = false;
		var vertexShader = program.vertexShader;
		var fragmentShader = program.fragmentShader;

		if ( vertexShader.state === THREE.WebGLShader.CompilingState ) {

			updateShaderCompileState( vertexShader );

		}

		if ( vertexShader.state === THREE.WebGLShader.CompilingState ) {

			updateShaderCompileState( fragmentShader );

		}

		// check both before bail, as both may have compile messages to share
		if ( vertexShader.state === THREE.WebGLShader.CompileErrorState ) compileError = true;

		if ( fragmentShader.state === THREE.WebGLShader.CompileErrorState ) compileError = true;

		if ( compileError ) {

			program.state = THREE.WebGLProgram.CompileErrorState;

		} else {

			linkProgram( program );

		}

	}
	
	var updateShaderCompileState = ( function () {

		function addLineNumbers( source ) {

			var lines = source.split( '\n' );

			for ( var i = 0; i < lines.length; i++ ) {

				lines[i] = ( i + 1 ) + ': ' + lines[i];

			}

			return lines.join( '\n' );

		}

		return function updateShaderCompileState( shader ) {

			if ( shader.state !== THREE.WebGLShader.CompilingState ) return;

			if ( gl.getShaderParameter( shader.webglShader, gl.COMPILE_STATUS ) === false ) {

				shader.compileMessage = 'THREE.WebGLShader: Shader couldn\'t compile.';
				THREE.error( shader.compileMessage );
				shader.state = THREE.WebGLShader.CompileErrorState;

			} else {

				shader.state = THREE.WebGLShader.CompiledState;

			}

			var log = gl.getShaderInfoLog( shader.webglShader );

			if ( log !== '' ) {

				var detail = ['THREE.WebGLShader: gl.getShaderInfoLog()', shader.type === gl.VERTEX_SHADER ? 'vertex' : 'fragment', log, addLineNumbers( gl.getShaderSource( shader.webglShader ) )].join( '\n' );
				shader.compileMessage += '\n' + detail;
				THREE.warn( detail );

			}

			// --enable-privileged-webgl-extension
			// THREE.log( type, gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

			// Clean up

			if ( shader.state === THREE.WebGLShader.CompileErrorState ) {

				gl.deleteShader( shader.webglShader );
				shader.webglShader = undefined;

			}

		};

	} )();

	var generateSource = ( function () {

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

		return function generateSource( material, parameters ) {

			var shaderID = shaderIDs[material.type];

			var uniforms, vertexShaderSource, fragmentShaderSource;

			if ( shaderID ) {

				var shader = THREE.ShaderLib[shaderID];

				uniforms = THREE.UniformsUtils.clone( shader.uniforms );
				vertexShaderSource = shader.vertexShader;
				fragmentShaderSource = shader.fragmentShader;

			} else {

				uniforms = material.uniforms,
				vertexShaderSource = material.vertexShader,
				fragmentShaderSource = material.fragmentShader

			}

			var defines = material.defines;
			var attributes = material.attributes;

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

			return { vertex: prefix_vertex + vertexShaderSource, fragment: prefix_fragment + fragmentShaderSource, uniforms: uniforms };
		};

	} )();

};
