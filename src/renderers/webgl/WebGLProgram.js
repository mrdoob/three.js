module.exports = _WebGLProgram;

var _WebGLShader = require( "./WebGLShader" ),
	Constants = require( "../../Constants" ),
	RawShaderMaterial = require( "../../materials/RawShaderMaterial" );

var programIdCount = 0;

function generateDefines( defines ) {

	var chunks = [];

	var name, value;

	for ( name in defines ) {

		value = defines[ name ];

		if ( value === false ) { continue; }

		chunks.push( "#define " + name + " " + value );

	}

	return chunks.join( "\n" );

}

function fetchUniformLocations( gl, program ) {

	var uniforms = {};

	var i, n = gl.getProgramParameter( program, gl.ACTIVE_UNIFORMS ),
		info, name, location, suffixPos;

	for ( i = 0; i < n; i ++ ) {

		info = gl.getActiveUniform( program, i );
		name = info.name;
		location = gl.getUniformLocation( program, name );

		// console.log( "WebGLProgram: ACTIVE UNIFORM:", name );

		suffixPos = name.lastIndexOf( "[0]" );
		if ( suffixPos !== - 1 && suffixPos === name.length - 3 ) {

			uniforms[ name.substr( 0, suffixPos ) ] = location;

		}

		uniforms[ name ] = location;

	}

	return uniforms;

}

function fetchAttributeLocations( gl, program ) {

	var attributes = {};

	var i, n = gl.getProgramParameter( program, gl.ACTIVE_ATTRIBUTES ),
		info, name;

	for ( i = 0; i < n; i ++ ) {

		info = gl.getActiveAttrib( program, i );
		name = info.name;

		// console.log( "WebGLProgram: ACTIVE VERTEX ATTRIBUTE:", name, i );

		attributes[ name ] = gl.getAttribLocation( program, name );

	}

	return attributes;

}

function filterEmptyLine( string ) {

	return string !== "";

}

function _WebGLProgram( renderer, code, material, parameters ) {

	var gl = renderer.context;

	var defines = material.defines;

	var vertexShader = material.__webglShader.vertexShader;
	var fragmentShader = material.__webglShader.fragmentShader;

	var shadowMapTypeDefine = "SHADOWMAP_TYPE_BASIC";

	if ( parameters.shadowMapType === Constants.PCFShadowMap ) {

		shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF";

	} else if ( parameters.shadowMapType === Constants.PCFSoftShadowMap ) {

		shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF_SOFT";

	}

	var envMapTypeDefine = "ENVMAP_TYPE_CUBE";
	var envMapModeDefine = "ENVMAP_MODE_REFLECTION";
	var envMapBlendingDefine = "ENVMAP_BLENDING_MULTIPLY";

	if ( parameters.envMap ) {

		switch ( material.envMap.mapping ) {

			case Constants.CubeReflectionMapping:
			case Constants.CubeRefractionMapping:
				envMapTypeDefine = "ENVMAP_TYPE_CUBE";
				break;

			case Constants.EquirectangularReflectionMapping:
			case Constants.EquirectangularRefractionMapping:
				envMapTypeDefine = "ENVMAP_TYPE_EQUIREC";
				break;

			case Constants.SphericalReflectionMapping:
				envMapTypeDefine = "ENVMAP_TYPE_SPHERE";
				break;

			case Constants.CubeRefractionMapping:
			case Constants.EquirectangularRefractionMapping:
				envMapModeDefine = "ENVMAP_MODE_REFRACTION";
				break;

		}

		switch ( material.combine ) {

			case Constants.MultiplyOperation:
				envMapBlendingDefine = "ENVMAP_BLENDING_MULTIPLY";
				break;

			case Constants.MixOperation:
				envMapBlendingDefine = "ENVMAP_BLENDING_MIX";
				break;

			case Constants.AddOperation:
				envMapBlendingDefine = "ENVMAP_BLENDING_ADD";
				break;

		}

	}

	var gammaFactorDefine = ( renderer.gammaFactor > 0 ) ? renderer.gammaFactor : 1.0;

	// console.log( "building new program " );

	//

	var customDefines = generateDefines( defines );

	//

	var program = gl.createProgram();

	var prefixVertex, prefixFragment;

	if ( material instanceof RawShaderMaterial ) {

		prefixVertex = "";
		prefixFragment = "";

	} else {

		prefixVertex = [

			"precision " + parameters.precision + " float;",
			"precision " + parameters.precision + " int;",

			"#define SHADER_NAME " + material.__webglShader.name,

			customDefines,

			parameters.supportsVertexTextures ? "#define VERTEX_TEXTURES" : "",

			renderer.gammaInput ? "#define GAMMA_INPUT" : "",
			renderer.gammaOutput ? "#define GAMMA_OUTPUT" : "",
			"#define GAMMA_FACTOR " + gammaFactorDefine,

			"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,
			"#define MAX_SPOT_LIGHTS " + parameters.maxSpotLights,
			"#define MAX_HEMI_LIGHTS " + parameters.maxHemiLights,

			"#define MAX_SHADOWS " + parameters.maxShadows,

			"#define MAX_BONES " + parameters.maxBones,

			parameters.map ? "#define USE_MAP" : "",
			parameters.envMap ? "#define USE_ENVMAP" : "",
			parameters.envMap ? "#define " + envMapModeDefine : "",
			parameters.lightMap ? "#define USE_LIGHTMAP" : "",
			parameters.aoMap ? "#define USE_AOMAP" : "",
			parameters.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
			parameters.bumpMap ? "#define USE_BUMPMAP" : "",
			parameters.normalMap ? "#define USE_NORMALMAP" : "",
			parameters.displacementMap && parameters.supportsVertexTextures ? "#define USE_DISPLACEMENTMAP" : "",
			parameters.specularMap ? "#define USE_SPECULARMAP" : "",
			parameters.alphaMap ? "#define USE_ALPHAMAP" : "",
			parameters.vertexColors ? "#define USE_COLOR" : "",

			parameters.flatShading ? "#define FLAT_SHADED" : "",

			parameters.skinning ? "#define USE_SKINNING" : "",
			parameters.useVertexTexture ? "#define BONE_TEXTURE" : "",

			parameters.morphTargets ? "#define USE_MORPHTARGETS" : "",
			parameters.morphNormals && parameters.flatShading === false ? "#define USE_MORPHNORMALS" : "",
			parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
			parameters.flipSided ? "#define FLIP_SIDED" : "",

			parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
			parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
			parameters.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "",

			parameters.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",

			parameters.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
			parameters.logarithmicDepthBuffer && renderer.extensions.get( "EXT_frag_depth" ) ? "#define USE_LOGDEPTHBUF_EXT" : "",

			"uniform mat4 modelMatrix;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat4 viewMatrix;",
			"uniform mat3 normalMatrix;",
			"uniform vec3 cameraPosition;",

			"attribute vec3 position;",
			"attribute vec3 normal;",
			"attribute vec2 uv;",

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

			"\n"

		].filter( filterEmptyLine ).join( "\n" );

		prefixFragment = [

			parameters.bumpMap || parameters.normalMap || parameters.flatShading || material.derivatives ? "#extension GL_OES_standard_derivatives : enable" : "",
			parameters.logarithmicDepthBuffer && renderer.extensions.get( "EXT_frag_depth" ) ? "#extension GL_EXT_frag_depth : enable" : "",

			"precision " + parameters.precision + " float;",
			"precision " + parameters.precision + " int;",

			"#define SHADER_NAME " + material.__webglShader.name,

			customDefines,

			"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,
			"#define MAX_SPOT_LIGHTS " + parameters.maxSpotLights,
			"#define MAX_HEMI_LIGHTS " + parameters.maxHemiLights,

			"#define MAX_SHADOWS " + parameters.maxShadows,

			parameters.alphaTest ? "#define ALPHATEST " + parameters.alphaTest : "",

			renderer.gammaInput ? "#define GAMMA_INPUT" : "",
			renderer.gammaOutput ? "#define GAMMA_OUTPUT" : "",
			"#define GAMMA_FACTOR " + gammaFactorDefine,

			( parameters.useFog && parameters.fog ) ? "#define USE_FOG" : "",
			( parameters.useFog && parameters.fogExp ) ? "#define FOG_EXP2" : "",

			parameters.map ? "#define USE_MAP" : "",
			parameters.envMap ? "#define USE_ENVMAP" : "",
			parameters.envMap ? "#define " + envMapTypeDefine : "",
			parameters.envMap ? "#define " + envMapModeDefine : "",
			parameters.envMap ? "#define " + envMapBlendingDefine : "",
			parameters.lightMap ? "#define USE_LIGHTMAP" : "",
			parameters.aoMap ? "#define USE_AOMAP" : "",
			parameters.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
			parameters.bumpMap ? "#define USE_BUMPMAP" : "",
			parameters.normalMap ? "#define USE_NORMALMAP" : "",
			parameters.specularMap ? "#define USE_SPECULARMAP" : "",
			parameters.alphaMap ? "#define USE_ALPHAMAP" : "",
			parameters.vertexColors ? "#define USE_COLOR" : "",

			parameters.flatShading ? "#define FLAT_SHADED" : "",

			parameters.metal ? "#define METAL" : "",
			parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
			parameters.flipSided ? "#define FLIP_SIDED" : "",

			parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
			parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
			parameters.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "",

			parameters.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
			parameters.logarithmicDepthBuffer && renderer.extensions.get( "EXT_frag_depth" ) ? "#define USE_LOGDEPTHBUF_EXT" : "",

			"uniform mat4 viewMatrix;",
			"uniform vec3 cameraPosition;",

			"\n"

		].filter( filterEmptyLine ).join( "\n" );

	}

	var vertexGlsl = prefixVertex + vertexShader;
	var fragmentGlsl = prefixFragment + fragmentShader;

	var glVertexShader = _WebGLShader.createShader( gl, gl.VERTEX_SHADER, vertexGlsl );
	var glFragmentShader = _WebGLShader.createShader( gl, gl.FRAGMENT_SHADER, fragmentGlsl );

	gl.attachShader( program, glVertexShader );
	gl.attachShader( program, glFragmentShader );

	// Force a particular attribute to index 0.

	if ( material.index0AttributeName !== undefined ) {

		gl.bindAttribLocation( program, 0, material.index0AttributeName );

	} else if ( parameters.morphTargets === true ) {

		// programs with morphTargets displace position out of attribute 0
		gl.bindAttribLocation( program, 0, "position" );

	}

	gl.linkProgram( program );

	var programLog = gl.getProgramInfoLog( program );
	var vertexLog = gl.getShaderInfoLog( glVertexShader );
	var fragmentLog = gl.getShaderInfoLog( glFragmentShader );

	var runnable = true;
	var haveDiagnostics = true;

	if ( gl.getProgramParameter( program, gl.LINK_STATUS ) === false ) {

		runnable = false;

		console.error( "WebGLProgram: shader error: ", gl.getError(), "gl.VALIDATE_STATUS", gl.getProgramParameter( program, gl.VALIDATE_STATUS ), "gl.getProgramInfoLog", programLog, vertexLog, fragmentLog );

	} else if ( programLog !== "" ) {

		console.warn( "WebGLProgram: gl.getProgramInfoLog()", programLog );

	} else if ( vertexLog === "" || fragmentLog === "" ) {

		haveDiagnostics = false;

	}

	if ( haveDiagnostics ) {

		this.diagnostics = {

			runnable: runnable,
			material: material,

			programLog: programLog,

			vertexShader: {

				log: vertexLog,
				prefix: prefixVertex

			},

			fragmentShader: {

				log: fragmentLog,
				prefix: prefixFragment

			}

		};

	}

	// clean up

	gl.deleteShader( glVertexShader );
	gl.deleteShader( glFragmentShader );

	// set up caching for uniform locations

	var cachedUniforms;

	this.getUniforms = function() {

		if ( cachedUniforms === undefined ) {

			cachedUniforms = fetchUniformLocations( gl, program );

		}

		return cachedUniforms;

	};

	// set up caching for attribute locations

	var cachedAttributes;

	this.getAttributes = function() {

		if ( cachedAttributes === undefined ) {

			cachedAttributes = fetchAttributeLocations( gl, program );

		}

		return cachedAttributes;

	};

	// DEPRECATED

	Object.defineProperties( this, {

		uniforms: {
			get: function() {

				console.warn( "WebGLProgram: .uniforms is now .getUniforms()." );
				return this.getUniforms();

			}
		},

		attributes: {
			get: function() {

				console.warn( "WebGLProgram: .attributes is now .getAttributes()." );
				return this.getAttributes();

			}
		}

	} );

	//

	this.id = programIdCount ++;
	this.code = code;
	this.usedTimes = 1;
	this.program = program;
	this.vertexShader = glVertexShader;
	this.fragmentShader = glFragmentShader;

	return this;

}
