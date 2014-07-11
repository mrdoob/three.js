THREE.WebGLProgram = ( function () {

	var programIdCount = 0;

	var generateDefines = function ( defines ) {

		var value, chunk, chunks = [];

		for ( var d in defines ) {

			value = defines[ d ];
			if ( value === false ) continue;

			chunk = "#define " + d + " " + value;
			chunks.push( chunk );

		}

		return chunks.join( "\n" );

	};

	var cacheUniformLocations = function ( gl, program, identifiers ) {

		var uniforms = {};

		for ( var i = 0, l = identifiers.length; i < l; i ++ ) {

			var id = identifiers[ i ];
			uniforms[ id ] = gl.getUniformLocation( program, id );

		}

		return uniforms;

	};

	var cacheAttributeLocations = function ( gl, program, identifiers ) {

		var attributes = {};

		for ( var i = 0, l = identifiers.length; i < l; i ++ ) {

			var id = identifiers[ i ];
			attributes[ id ] = gl.getAttribLocation( program, id );

		}

		return attributes;

	};

	return function ( renderer, code, material, parameters ) {

		var _this = renderer;
		var _gl = _this.context;

		var defines = material.defines;
		var uniforms = material.__webglShader.uniforms;
		var attributes = material.attributes;

		var vertexShader = material.__webglShader.vertexShader;
		var fragmentShader = material.__webglShader.fragmentShader;

		var index0AttributeName = material.index0AttributeName;

		if ( index0AttributeName === undefined && parameters.morphTargets === true ) {

			// programs with morphTargets displace position out of attribute 0

			index0AttributeName = 'position';

		}

		var shadowMapTypeDefine = "SHADOWMAP_TYPE_BASIC";

		if ( parameters.shadowMapType === THREE.PCFShadowMap ) {

			shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF";

		} else if ( parameters.shadowMapType === THREE.PCFSoftShadowMap ) {

			shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF_SOFT";

		}

		// console.log( "building new program " );

		//

		var customDefines = generateDefines( defines );

		//

		var program = _gl.createProgram();

		var prefix_vertex, prefix_fragment;

		if ( material instanceof THREE.RawShaderMaterial ) {

			prefix_vertex = '';
			prefix_fragment = '';

		} else {

			prefix_vertex = [

				"precision " + parameters.precision + " float;",
				"precision " + parameters.precision + " int;",

				customDefines,

				parameters.supportsVertexTextures ? "#define VERTEX_TEXTURES" : "",

				_this.gammaInput ? "#define GAMMA_INPUT" : "",
				_this.gammaOutput ? "#define GAMMA_OUTPUT" : "",

				"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
				"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,
				"#define MAX_SPOT_LIGHTS " + parameters.maxSpotLights,
				"#define MAX_HEMI_LIGHTS " + parameters.maxHemiLights,

				"#define MAX_SHADOWS " + parameters.maxShadows,

				"#define MAX_BONES " + parameters.maxBones,

				parameters.map ? "#define USE_MAP" : "",
				parameters.envMap ? "#define USE_ENVMAP" : "",
				parameters.lightMap ? "#define USE_LIGHTMAP" : "",
				parameters.bumpMap ? "#define USE_BUMPMAP" : "",
				parameters.normalMap ? "#define USE_NORMALMAP" : "",
				parameters.specularMap ? "#define USE_SPECULARMAP" : "",
				parameters.alphaMap ? "#define USE_ALPHAMAP" : "",
				parameters.vertexColors ? "#define USE_COLOR" : "",

				parameters.skinning ? "#define USE_SKINNING" : "",
				parameters.useVertexTexture ? "#define BONE_TEXTURE" : "",

				parameters.morphTargets ? "#define USE_MORPHTARGETS" : "",
				parameters.morphNormals ? "#define USE_MORPHNORMALS" : "",
				parameters.wrapAround ? "#define WRAP_AROUND" : "",
				parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
				parameters.flipSided ? "#define FLIP_SIDED" : "",

				parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
				parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
				parameters.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "",
				parameters.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "",

				parameters.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",

				parameters.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
				//_this._glExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "",


				"uniform mat4 modelMatrix;",
				"uniform mat4 modelViewMatrix;",
				"uniform mat4 projectionMatrix;",
				"uniform mat4 viewMatrix;",
				"uniform mat3 normalMatrix;",
				"uniform vec3 cameraPosition;",

				"attribute vec3 position;",
				"attribute vec3 normal;",
				"attribute vec2 uv;",
				"attribute vec2 uv2;",

				"#ifdef USE_COLOR",

				"	attribute vec3 color;",

				"#endif",

				"#ifdef USE_MORPHTARGETS",

				"	attribute vec3 morphTarget0;",
				"	attribute vec3 morphTarget1;",
				"	attribute vec3 morphTarget2;",
				"	attribute vec3 morphTarget3;",

				"	#ifdef USE_MORPHNORMALS",

				"		attribute vec3 morphNormal0;",
				"		attribute vec3 morphNormal1;",
				"		attribute vec3 morphNormal2;",
				"		attribute vec3 morphNormal3;",

				"	#else",

				"		attribute vec3 morphTarget4;",
				"		attribute vec3 morphTarget5;",
				"		attribute vec3 morphTarget6;",
				"		attribute vec3 morphTarget7;",

				"	#endif",

				"#endif",

				"#ifdef USE_SKINNING",

				"	attribute vec4 skinIndex;",
				"	attribute vec4 skinWeight;",

				"#endif",

				""

			].join( '\n' );

			prefix_fragment = [

				"precision " + parameters.precision + " float;",
				"precision " + parameters.precision + " int;",

				( parameters.bumpMap || parameters.normalMap ) ? "#extension GL_OES_standard_derivatives : enable" : "",

				customDefines,

				"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
				"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,
				"#define MAX_SPOT_LIGHTS " + parameters.maxSpotLights,
				"#define MAX_HEMI_LIGHTS " + parameters.maxHemiLights,

				"#define MAX_SHADOWS " + parameters.maxShadows,

				parameters.alphaTest ? "#define ALPHATEST " + parameters.alphaTest: "",

				_this.gammaInput ? "#define GAMMA_INPUT" : "",
				_this.gammaOutput ? "#define GAMMA_OUTPUT" : "",

				( parameters.useFog && parameters.fog ) ? "#define USE_FOG" : "",
				( parameters.useFog && parameters.fogExp ) ? "#define FOG_EXP2" : "",

				parameters.map ? "#define USE_MAP" : "",
				parameters.envMap ? "#define USE_ENVMAP" : "",
				parameters.lightMap ? "#define USE_LIGHTMAP" : "",
				parameters.bumpMap ? "#define USE_BUMPMAP" : "",
				parameters.normalMap ? "#define USE_NORMALMAP" : "",
				parameters.specularMap ? "#define USE_SPECULARMAP" : "",
				parameters.alphaMap ? "#define USE_ALPHAMAP" : "",
				parameters.vertexColors ? "#define USE_COLOR" : "",

				parameters.metal ? "#define METAL" : "",
				parameters.wrapAround ? "#define WRAP_AROUND" : "",
				parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
				parameters.flipSided ? "#define FLIP_SIDED" : "",

				parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
				parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
				parameters.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "",
				parameters.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "",

				parameters.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
				//_this._glExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "",

				"uniform mat4 viewMatrix;",
				"uniform vec3 cameraPosition;",
				""

			].join( '\n' );

		}

		var glVertexShader = new THREE.WebGLShader( _gl, _gl.VERTEX_SHADER, prefix_vertex + vertexShader );
		var glFragmentShader = new THREE.WebGLShader( _gl, _gl.FRAGMENT_SHADER, prefix_fragment + fragmentShader );

		_gl.attachShader( program, glVertexShader );
		_gl.attachShader( program, glFragmentShader );

		if ( index0AttributeName !== undefined ) {

			// Force a particular attribute to index 0.
			// because potentially expensive emulation is done by browser if attribute 0 is disabled.
			// And, color, for example is often automatically bound to index 0 so disabling it

			_gl.bindAttribLocation( program, 0, index0AttributeName );

		}

		_gl.linkProgram( program );

		if ( _gl.getProgramParameter( program, _gl.LINK_STATUS ) === false ) {

			console.error( 'THREE.WebGLProgram: Could not initialise shader.' );
			console.error( 'gl.VALIDATE_STATUS', _gl.getProgramParameter( program, _gl.VALIDATE_STATUS ) );
			console.error( 'gl.getError()', _gl.getError() );

		}

		if ( _gl.getProgramInfoLog( program ) !== '' ) {

			console.warn( 'THREE.WebGLProgram: gl.getProgramInfoLog()', _gl.getProgramInfoLog( program ) );

		}

		// clean up

		_gl.deleteShader( glVertexShader );
		_gl.deleteShader( glFragmentShader );

		// cache uniform locations

		var identifiers = [

			'viewMatrix', 'modelViewMatrix', 'projectionMatrix', 'normalMatrix', 'modelMatrix', 'cameraPosition', 'morphTargetInfluences', 'bindMatrix', 'bindMatrixInverse'

		];

		if ( parameters.useVertexTexture ) {

			identifiers.push( 'boneTexture' );
			identifiers.push( 'boneTextureWidth' );
			identifiers.push( 'boneTextureHeight' );

		} else {

			identifiers.push( 'boneGlobalMatrices' );

		}

		if ( parameters.logarithmicDepthBuffer ) {

			identifiers.push('logDepthBufFC');

		}


		for ( var u in uniforms ) {

			identifiers.push( u );

		}

		this.uniforms = cacheUniformLocations( _gl, program, identifiers );

		// cache attributes locations

		identifiers = [

			"position", "normal", "uv", "uv2", "tangent", "color",
			"skinIndex", "skinWeight", "lineDistance"

		];

		for ( var i = 0; i < parameters.maxMorphTargets; i ++ ) {

			identifiers.push( "morphTarget" + i );

		}

		for ( var i = 0; i < parameters.maxMorphNormals; i ++ ) {

			identifiers.push( "morphNormal" + i );

		}

		for ( var a in attributes ) {

			identifiers.push( a );

		}

		this.attributes = cacheAttributeLocations( _gl, program, identifiers );

		//

		this.id = programIdCount ++;
		this.code = code;
		this.usedTimes = 1;
		this.program = program;
		this.vertexShader = glVertexShader;
		this.fragmentShader = glFragmentShader;

		return this;

	};

} )();
