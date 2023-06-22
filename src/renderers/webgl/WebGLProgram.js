import { WebGLUniforms } from './WebGLUniforms.js';
import { WebGLShader } from './WebGLShader.js';
import { ShaderChunk } from '../shaders/ShaderChunk.js';
import { NoToneMapping, AddOperation, MixOperation, MultiplyOperation, CubeRefractionMapping, CubeUVReflectionMapping, CubeReflectionMapping, PCFSoftShadowMap, PCFShadowMap, VSMShadowMap, ACESFilmicToneMapping, CineonToneMapping, CustomToneMapping, ReinhardToneMapping, LinearToneMapping, GLSL3, LinearSRGBColorSpace, SRGBColorSpace } from '../../constants.js';

let programIdCount = 0;

function handleSource( string, errorLine ) {

	const lines = string.split( '\n' );
	const lines2 = [];

	const from = Math.max( errorLine - 6, 0 );
	const to = Math.min( errorLine + 6, lines.length );

	for ( let i = from; i < to; i ++ ) {

		const line = i + 1;
		lines2.push( `${line === errorLine ? '>' : ' '} ${line}: ${lines[ i ]}` );

	}

	return lines2.join( '\n' );

}

function getEncodingComponents( colorSpace ) {

	switch ( colorSpace ) {

		case LinearSRGBColorSpace:
			return [ 'Linear', '( value )' ];
		case SRGBColorSpace:
			return [ 'sRGB', '( value )' ];
		default:
			console.warn( 'THREE.WebGLProgram: Unsupported color space:', colorSpace );
			return [ 'Linear', '( value )' ];

	}

}

function getShaderErrors( gl, shader, type ) {

	const status = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
	const errors = gl.getShaderInfoLog( shader ).trim();

	if ( status && errors === '' ) return '';

	const errorMatches = /ERROR: 0:(\d+)/.exec( errors );
	if ( errorMatches ) {

		// --enable-privileged-webgl-extension
		// console.log( '**' + type + '**', gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

		const errorLine = parseInt( errorMatches[ 1 ] );
		return type.toUpperCase() + '\n\n' + errors + '\n\n' + handleSource( gl.getShaderSource( shader ), errorLine );

	} else {

		return errors;

	}

}

function getTexelEncodingFunction( functionName, colorSpace ) {

	const components = getEncodingComponents( colorSpace );
	return 'vec4 ' + functionName + '( vec4 value ) { return LinearTo' + components[ 0 ] + components[ 1 ] + '; }';

}

function getToneMappingFunction( functionName, toneMapping ) {

	let toneMappingName;

	switch ( toneMapping ) {

		case LinearToneMapping:
			toneMappingName = 'Linear';
			break;

		case ReinhardToneMapping:
			toneMappingName = 'Reinhard';
			break;

		case CineonToneMapping:
			toneMappingName = 'OptimizedCineon';
			break;

		case ACESFilmicToneMapping:
			toneMappingName = 'ACESFilmic';
			break;

		case CustomToneMapping:
			toneMappingName = 'Custom';
			break;

		default:
			console.warn( 'THREE.WebGLProgram: Unsupported toneMapping:', toneMapping );
			toneMappingName = 'Linear';

	}

	return 'vec3 ' + functionName + '( vec3 color ) { return ' + toneMappingName + 'ToneMapping( color ); }';

}

function generateExtensions( parameters ) {

	const chunks = [
		( parameters.extensionDerivatives || !! parameters.envMapCubeUVHeight || parameters.bumpMap || parameters.normalMapTangentSpace || parameters.clearcoatNormalMap || parameters.flatShading || parameters.shaderID === 'physical' ) ? '#extension GL_OES_standard_derivatives : enable' : '',
		( parameters.extensionFragDepth || parameters.logarithmicDepthBuffer ) && parameters.rendererExtensionFragDepth ? '#extension GL_EXT_frag_depth : enable' : '',
		( parameters.extensionDrawBuffers && parameters.rendererExtensionDrawBuffers ) ? '#extension GL_EXT_draw_buffers : require' : '',
		( parameters.extensionShaderTextureLOD || parameters.envMap || parameters.transmission ) && parameters.rendererExtensionShaderTextureLod ? '#extension GL_EXT_shader_texture_lod : enable' : ''
	];

	return chunks.filter( line => line !== '' ).join( '\n' );

}

function generateDefines( defines ) {

	const chunks = [];

	for ( const name in defines ) {

		const value = defines[ name ];

		if ( value === false ) continue;

		chunks.push( '#define ' + name + ' ' + value );

	}

	return chunks.join( '\n' );

}

function fetchAttributeLocations( gl, program ) {

	const attributes = {};

	const n = gl.getProgramParameter( program, gl.ACTIVE_ATTRIBUTES );

	for ( let i = 0; i < n; i ++ ) {

		const info = gl.getActiveAttrib( program, i );
		const name = info.name;

		let locationSize = 1;
		if ( info.type === gl.FLOAT_MAT2 ) locationSize = 2;
		if ( info.type === gl.FLOAT_MAT3 ) locationSize = 3;
		if ( info.type === gl.FLOAT_MAT4 ) locationSize = 4;

		// console.log( 'THREE.WebGLProgram: ACTIVE VERTEX ATTRIBUTE:', name, i );

		attributes[ name ] = {
			type: info.type,
			location: gl.getAttribLocation( program, name ),
			locationSize: locationSize
		};

	}

	return attributes;

}

function replaceLightNums( string, parameters ) {

	const numSpotLightCoords = parameters.numSpotLightShadows + parameters.numSpotLightMaps - parameters.numSpotLightShadowsWithMaps;

	return string
		.replace( /NUM_DIR_LIGHTS/g, parameters.numDirLights )
		.replace( /NUM_SPOT_LIGHTS/g, parameters.numSpotLights )
		.replace( /NUM_SPOT_LIGHT_MAPS/g, parameters.numSpotLightMaps )
		.replace( /NUM_SPOT_LIGHT_COORDS/g, numSpotLightCoords )
		.replace( /NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights )
		.replace( /NUM_POINT_LIGHTS/g, parameters.numPointLights )
		.replace( /NUM_HEMI_LIGHTS/g, parameters.numHemiLights )
		.replace( /NUM_DIR_LIGHT_SHADOWS/g, parameters.numDirLightShadows )
		.replace( /NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, parameters.numSpotLightShadowsWithMaps )
		.replace( /NUM_SPOT_LIGHT_SHADOWS/g, parameters.numSpotLightShadows )
		.replace( /NUM_POINT_LIGHT_SHADOWS/g, parameters.numPointLightShadows );

}

function replaceClippingPlaneNums( string, parameters ) {

	return string
		.replace( /NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes )
		.replace( /UNION_CLIPPING_PLANES/g, ( parameters.numClippingPlanes - parameters.numClipIntersection ) );

}

// Resolve Includes

const includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;

function resolveIncludes( string ) {

	return string.replace( includePattern, includeReplacer );

}

const shaderChunkMap = new Map( [
	[ 'encodings_fragment', 'colorspace_fragment' ], // @deprecated, r154
	[ 'encodings_pars_fragment', 'colorspace_pars_fragment' ], // @deprecated, r154
	[ 'output_fragment', 'opaque_fragment' ], // @deprecated, r154
] );

function includeReplacer( match, include ) {

	let string = ShaderChunk[ include ];

	if ( string === undefined ) {

		const newInclude = shaderChunkMap.get( include );

		if ( newInclude !== undefined ) {

			string = ShaderChunk[ newInclude ];
			console.warn( 'THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', include, newInclude );

		} else {

			throw new Error( 'Can not resolve #include <' + include + '>' );

		}

	}

	return resolveIncludes( string );

}

// Unroll Loops

const unrollLoopPattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;

function unrollLoops( string ) {

	return string.replace( unrollLoopPattern, loopReplacer );

}

function loopReplacer( match, start, end, snippet ) {

	let string = '';

	for ( let i = parseInt( start ); i < parseInt( end ); i ++ ) {

		string += snippet
			.replace( /\[\s*i\s*\]/g, '[ ' + i + ' ]' )
			.replace( /UNROLLED_LOOP_INDEX/g, i );

	}

	return string;

}

//

function generatePrecision( parameters ) {

	let precisionstring = 'precision ' + parameters.precision + ' float;\nprecision ' + parameters.precision + ' int;';

	if ( parameters.precision === 'highp' ) {

		precisionstring += '\n#define HIGH_PRECISION';

	} else if ( parameters.precision === 'mediump' ) {

		precisionstring += '\n#define MEDIUM_PRECISION';

	} else if ( parameters.precision === 'lowp' ) {

		precisionstring += '\n#define LOW_PRECISION';

	}

	return precisionstring;

}

function generateShadowMapTypeDefine( parameters ) {

	let shadowMapTypeDefine = 'SHADOWMAP_TYPE_BASIC';

	if ( parameters.shadowMapType === PCFShadowMap ) {

		shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF';

	} else if ( parameters.shadowMapType === PCFSoftShadowMap ) {

		shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF_SOFT';

	} else if ( parameters.shadowMapType === VSMShadowMap ) {

		shadowMapTypeDefine = 'SHADOWMAP_TYPE_VSM';

	}

	return shadowMapTypeDefine;

}

function generateEnvMapTypeDefine( parameters ) {

	let envMapTypeDefine = 'ENVMAP_TYPE_CUBE';

	if ( parameters.envMap ) {

		switch ( parameters.envMapMode ) {

			case CubeReflectionMapping:
			case CubeRefractionMapping:
				envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
				break;

			case CubeUVReflectionMapping:
				envMapTypeDefine = 'ENVMAP_TYPE_CUBE_UV';
				break;

		}

	}

	return envMapTypeDefine;

}

function generateEnvMapModeDefine( parameters ) {

	let envMapModeDefine = 'ENVMAP_MODE_REFLECTION';

	if ( parameters.envMap ) {

		switch ( parameters.envMapMode ) {

			case CubeRefractionMapping:

				envMapModeDefine = 'ENVMAP_MODE_REFRACTION';
				break;

		}

	}

	return envMapModeDefine;

}

function generateEnvMapBlendingDefine( parameters ) {

	let envMapBlendingDefine = 'ENVMAP_BLENDING_NONE';

	if ( parameters.envMap ) {

		switch ( parameters.combine ) {

			case MultiplyOperation:
				envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
				break;

			case MixOperation:
				envMapBlendingDefine = 'ENVMAP_BLENDING_MIX';
				break;

			case AddOperation:
				envMapBlendingDefine = 'ENVMAP_BLENDING_ADD';
				break;

		}

	}

	return envMapBlendingDefine;

}

function generateCubeUVSize( parameters ) {

	const imageHeight = parameters.envMapCubeUVHeight;

	if ( imageHeight === null ) return false;

	const maxMip = Math.log2( imageHeight ) - 2;

	const texelHeight = 1.0 / imageHeight;

	const texelWidth = 1.0 / ( 3 * Math.max( Math.pow( 2, maxMip ), 7 * 16 ) );

	return { texelWidth, texelHeight, maxMip };

}

function constructShaderPrefixes( parameters ) {

	const defines = { ...parameters.defines };

	defines.SHADER_TYPE = parameters.shaderType;
	defines.SHADER_NAME = parameters.shaderName;

	if ( ! parameters.isRawShaderMaterial ) {

		defines.USE_MAP = parameters.map;

		defines.USE_ENVMAP = parameters.envMap;
		if ( parameters.envMap ) defines[ generateEnvMapModeDefine( parameters ) ] = true;

		defines.USE_NORMALMAP = parameters.normalMap;
		defines.USE_NORMALMAP_OBJECTSPACE = parameters.normalMapObjectSpace;
		defines.USE_NORMALMAP_TANGENTSPACE = parameters.normalMapTangentSpace;

		defines.USE_LIGHTMAP = parameters.lightMap;
		defines.USE_AOMAP = parameters.aoMap;
		defines.USE_BUMPMAP = parameters.bumpMap;
		defines.USE_EMISSIVEMAP = parameters.emissiveMap;

		defines.USE_ANISOTROPYMAP = parameters.anisotropyMap;

		defines.USE_CLEARCOATMAP = parameters.clearcoatMap;
		defines.USE_CLEARCOAT_ROUGHNESSMAP = parameters.clearcoatRoughnessMap;
		defines.USE_CLEARCOAT_NORMALMAP = parameters.clearcoatNormalMap;

		defines.USE_IRIDESCENCEMAP = parameters.iridescenceMap;
		defines.USE_IRIDESCENCE_THICKNESSMAP = parameters.iridescenceThicknessMap;

		defines.USE_SPECULARMAP = parameters.specularMap;
		defines.USE_SPECULAR_COLORMAP = parameters.specularColorMap;
		defines.USE_SPECULAR_INTENSITYMAP = parameters.specularIntensityMap;

		defines.USE_ROUGHNESSMAP = parameters.roughnessMap;
		defines.USE_METALNESSMAP = parameters.metalnessMap;

		defines.USE_ALPHAMAP = parameters.alphaMap;
		defines.USE_ALPHAHASH = parameters.alphaHash;

		defines.USE_TRANSMISSIONMAP = parameters.transmissionMap;
		defines.USE_THICKNESSMAP = parameters.thicknessMap;

		defines.USE_SHEEN_COLORMAP = parameters.sheenColorMap;
		defines.USE_SHEEN_ROUGHNESSMAP = parameters.sheenRoughnessMap;

		//

		defines.USE_FOG = parameters.useFog && parameters.fog;
		defines.FOG_EXP2 = parameters.useFog && parameters.fogExp2;

		defines.USE_TRANSMISSION = parameters.transmission;

		defines.USE_TANGENT = parameters.vertexTangents && parameters.flatShading === false;
		defines.USE_COLOR = parameters.vertexColors;
		defines.USE_COLOR_ALPHA = parameters.vertexAlphas;
		defines.USE_UV1 = parameters.vertexUv1s;
		defines.USE_UV2 = parameters.vertexUv2s;
		defines.USE_UV3 = parameters.vertexUv3s;

		defines.USE_POINTS_UV = parameters.pointsUvs;

		defines.FLAT_SHADED = parameters.flatShading;

		defines.DOUBLE_SIDED = parameters.doubleSided;
		defines.FLIP_SIDED = parameters.flipSided;

		defines.USE_SHADOWMAP = parameters.shadowMapEnabled;
		if ( parameters.shadowMapEnabled ) defines[ generateShadowMapTypeDefine( parameters ) ] = true;

		defines.LEGACY_LIGHTS = parameters.useLegacyLights;

		defines.USE_LOGDEPTHBUF = parameters.logarithmicDepthBuffer;
		defines.USE_LOGDEPTHBUF_EXT = parameters.logarithmicDepthBuffer && parameters.rendererExtensionFragDepth;

	}

	const vertexDefines = { ...defines };
	const fragmentDefines = { ...defines };

	if ( ! parameters.isRawShaderMaterial ) {

		vertexDefines.MAP_UV = parameters.mapUv;
		vertexDefines.ALPHAMAP_UV = parameters.alphaMapUv;
		vertexDefines.LIGHTMAP_UV = parameters.lightMapUv;
		vertexDefines.AOMAP_UV = parameters.aoMapUv;
		vertexDefines.EMISSIVEMAP_UV = parameters.emissiveMapUv;
		vertexDefines.BUMPMAP_UV = parameters.bumpMapUv;
		vertexDefines.NORMALMAP_UV = parameters.normalMapUv;
		vertexDefines.DISPLACEMENTMAP_UV = parameters.displacementMapUv;

		vertexDefines.METALNESSMAP_UV = parameters.metalnessMapUv;
		vertexDefines.ROUGHNESSMAP_UV = parameters.roughnessMapUv;

		vertexDefines.ANISOTROPYMAP_UV = parameters.anisotropyMapUv;

		vertexDefines.CLEARCOATMAP_UV = parameters.clearcoatMapUv;
		vertexDefines.CLEARCOAT_NORMALMAP_UV = parameters.clearcoatNormalMapUv;
		vertexDefines.CLEARCOAT_ROUGHNESSMAP_UV = parameters.clearcoatRoughnessMapUv;

		vertexDefines.IRIDESCENCEMAP_UV = parameters.iridescenceMapUv;
		vertexDefines.IRIDESCENCE_THICKNESSMAP_UV = parameters.iridescenceThicknessMapUv;

		vertexDefines.SHEEN_COLORMAP_UV = parameters.sheenColorMapUv;
		vertexDefines.SHEEN_ROUGHNESSMAP_UV = parameters.sheenRoughnessMapUv;

		vertexDefines.SPECULARMAP_UV = parameters.specularMapUv;
		vertexDefines.SPECULAR_COLORMAP_UV = parameters.specularColorMapUv;
		vertexDefines.SPECULAR_INTENSITYMAP_UV = parameters.specularIntensityMapUv;

		vertexDefines.TRANSMISSIONMAP_UV = parameters.transmissionMapUv;
		vertexDefines.THICKNESSMAP_UV = parameters.thicknessMapUv;

		//

		vertexDefines.USE_INSTANCING = parameters.instancing;
		vertexDefines.USE_INSTANCING_COLOR = parameters.instancingColor;

		vertexDefines.USE_DISPLACEMENTMAP = parameters.displacementMap;

		vertexDefines.USE_SKINNING = parameters.skinning;

		vertexDefines.USE_MORPHTARGETS = parameters.morphTargets;
		vertexDefines.USE_MORPHNORMALS = parameters.morphNormals && parameters.flatShading === false;
		vertexDefines.USE_MORPHCOLORS = parameters.morphColors && parameters.isWebGL2;
		vertexDefines.MORPHTARGETS_TEXTURE = parameters.morphTargetsCount > 0 && parameters.isWebGL2;
		vertexDefines.MORPHTARGETS_TEXTURE_STRIDE = parameters.morphTargetsCount > 0 && parameters.isWebGL2 && parameters.morphTextureStride;
		vertexDefines.MORPHTARGETS_COUNT = parameters.morphTargetsCount > 0 && parameters.isWebGL2 && parameters.morphTargetsCount;

		vertexDefines.USE_SIZEATTENUATION = parameters.sizeAttenuation;

		//

		fragmentDefines.USE_MATCAP = parameters.matcap;

		if ( parameters.envMap ) {

			fragmentDefines[ generateEnvMapTypeDefine( parameters ) ] = true;
			fragmentDefines[ generateEnvMapBlendingDefine( parameters ) ] = true;

		}

		const envMapCubeUVSize = generateCubeUVSize( parameters );
		fragmentDefines.CUBEUV_TEXEL_WIDTH = envMapCubeUVSize && envMapCubeUVSize.texelWidth;
		fragmentDefines.CUBEUV_TEXEL_HEIGHT = envMapCubeUVSize && envMapCubeUVSize.texelHeight;
		fragmentDefines.CUBEUV_MAX_MIP = envMapCubeUVSize && envMapCubeUVSize.maxMip + '.0';

		fragmentDefines.USE_ANISOTROPY = parameters.anisotropy;
		fragmentDefines.USE_CLEARCOAT = parameters.clearcoat;
		fragmentDefines.USE_IRIDESCENCE = parameters.iridescence;
		fragmentDefines.USE_ALPHATEST = parameters.alphaTest;
		fragmentDefines.USE_SHEEN = parameters.sheen;

		if ( parameters.instancingColor ) fragmentDefines.USE_COLOR = true; // this line can be removed just by making #USE_INSTANCING_COLOR a define in both shaders and checking it

		fragmentDefines.USE_GRADIENTMAP = parameters.gradientMap;

		fragmentDefines.PREMULTIPLIED_ALPHA = parameters.premultipliedAlpha;

		fragmentDefines.TONE_MAPPING = parameters.toneMapping !== NoToneMapping;

		fragmentDefines.DITHERING = parameters.dithering;
		fragmentDefines.OPAQUE = parameters.opaque;

		fragmentDefines.DEPTH_PACKING = parameters.useDepthPacking && parameters.depthPacking;

	}

	const precisionString = parameters.isRawShaderMaterial ? '' : generatePrecision( parameters ) + '\n';
	const extensionsString = parameters.isWebGL2 ? '' : generateExtensions( parameters ) + '\n';

	let prefixVertex = precisionString + generateDefines( vertexDefines );
	let prefixFragment = precisionString + extensionsString + generateDefines( fragmentDefines );

	if ( ! parameters.isRawShaderMaterial ) {

		prefixVertex += `

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;

#ifdef USE_INSTANCING
	attribute mat4 instanceMatrix;
#endif

#ifdef USE_INSTANCING_COLOR
	attribute vec3 instanceColor;
#endif

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

#ifdef USE_UV1
	attribute vec2 uv1;
#endif

#ifdef USE_UV2
	attribute vec2 uv2;
#endif

#ifdef USE_UV3
	attribute vec2 uv3;
#endif

#ifdef USE_TANGENT
	attribute vec4 tangent;
#endif

#if defined( USE_COLOR_ALPHA )
	attribute vec4 color;
#elif defined( USE_COLOR )
	attribute vec3 color;
#endif

#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )
	attribute vec3 morphTarget0;
	attribute vec3 morphTarget1;
	attribute vec3 morphTarget2;
	attribute vec3 morphTarget3;

	#ifdef USE_MORPHNORMALS
		attribute vec3 morphNormal0;
		attribute vec3 morphNormal1;
		attribute vec3 morphNormal2;
		attribute vec3 morphNormal3;
	#else
		attribute vec3 morphTarget4;
		attribute vec3 morphTarget5;
		attribute vec3 morphTarget6;
		attribute vec3 morphTarget7;
	#endif

#endif

#ifdef USE_SKINNING
	attribute vec4 skinIndex;
	attribute vec4 skinWeight;
#endif
`;

		prefixFragment += `

uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;

`;

		if ( parameters.toneMapping !== NoToneMapping ) { // or just use #ifdef TONE_MAPPING?

			prefixFragment += ShaderChunk[ 'tonemapping_pars_fragment' ] + '\n' + getToneMappingFunction( 'toneMapping', parameters.toneMapping ) + '\n\n'; // this code is required here because it is used by the toneMapping() function defined below

		}

		prefixFragment += ShaderChunk[ 'colorspace_pars_fragment' ] + '\n' + getTexelEncodingFunction( 'linearToOutputTexel', parameters.outputColorSpace ) + '\n'; // this code is required here because it is used by the various encoding/decoding function defined below

	}

	if ( prefixVertex.length > 0 ) {

		prefixVertex += '\n';

	}

	if ( prefixFragment.length > 0 ) {

		prefixFragment += '\n';

	}

	return { prefixVertex, prefixFragment };

}

function prepareShader( shader, parameters ) {

	shader = resolveIncludes( shader );
	shader = replaceLightNums( shader, parameters );
	shader = replaceClippingPlaneNums( shader, parameters );
	shader = unrollLoops( shader );
	return shader;

}

function WebGLProgram( renderer, cacheKey, parameters, bindingStates ) {

	// TODO Send this event to Three.js DevTools
	// console.log( 'WebGLProgram', cacheKey );

	let { prefixVertex, prefixFragment } = constructShaderPrefixes( parameters );

	const vertexShader = prepareShader( parameters.vertexShader, parameters );
	const fragmentShader = prepareShader( parameters.fragmentShader, parameters );

	let versionString = parameters.glslVersion ? '#version ' + parameters.glslVersion + '\n' : '';

	if ( parameters.isWebGL2 && parameters.isRawShaderMaterial !== true ) {

		// GLSL 3.0 conversion for built-in materials and ShaderMaterial

		versionString = '#version 300 es';

		prefixVertex = `
precision mediump sampler2DArray;
#define attribute in
#define varying out
#define texture2D texture

` + prefixVertex;

		prefixFragment = `
#define varying in
${ parameters.glslVersion === GLSL3 ? '' : 'layout(location = 0) out highp vec4 pc_fragColor;\n#define gl_FragColor pc_fragColor' }
#define gl_FragDepthEXT gl_FragDepth
#define texture2D texture
#define textureCube texture
#define texture2DProj textureProj
#define texture2DLodEXT textureLod
#define texture2DProjLodEXT textureProjLod
#define textureCubeLodEXT textureLod
#define texture2DGradEXT textureGrad
#define texture2DProjGradEXT textureProjGrad
#define textureCubeGradEXT textureGrad

` + prefixFragment;

	}

	const vertexGlsl = versionString + prefixVertex + vertexShader;
	const fragmentGlsl = versionString + prefixFragment + fragmentShader;

	const gl = renderer.getContext();

	// console.log( '*VERTEX*', vertexGlsl );
	// console.log( '*FRAGMENT*', fragmentGlsl );

	const glVertexShader = WebGLShader( gl, gl.VERTEX_SHADER, vertexGlsl );
	const glFragmentShader = WebGLShader( gl, gl.FRAGMENT_SHADER, fragmentGlsl );

	const program = gl.createProgram();

	gl.attachShader( program, glVertexShader );
	gl.attachShader( program, glFragmentShader );

	// Force a particular attribute to index 0.

	if ( parameters.index0AttributeName !== undefined ) {

		gl.bindAttribLocation( program, 0, parameters.index0AttributeName );

	} else if ( parameters.morphTargets === true ) {

		// programs with morphTargets displace position out of attribute 0
		gl.bindAttribLocation( program, 0, 'position' );

	}

	gl.linkProgram( program );

	// check for link errors
	if ( renderer.debug.checkShaderErrors ) {

		const programLog = gl.getProgramInfoLog( program ).trim();
		const vertexLog = gl.getShaderInfoLog( glVertexShader ).trim();
		const fragmentLog = gl.getShaderInfoLog( glFragmentShader ).trim();

		let runnable = true;
		let haveDiagnostics = true;

		if ( gl.getProgramParameter( program, gl.LINK_STATUS ) === false ) {

			runnable = false;

			if ( typeof renderer.debug.onShaderError === 'function' ) {

				renderer.debug.onShaderError( gl, program, glVertexShader, glFragmentShader );

			} else {

				// default error reporting

				const vertexErrors = getShaderErrors( gl, glVertexShader, 'vertex' );
				const fragmentErrors = getShaderErrors( gl, glFragmentShader, 'fragment' );

				console.error(
					'THREE.WebGLProgram: Shader Error ' + gl.getError() + ' - ' +
					'VALIDATE_STATUS ' + gl.getProgramParameter( program, gl.VALIDATE_STATUS ) + '\n\n' +
					'Program Info Log: ' + programLog + '\n' +
					vertexErrors + '\n' +
					fragmentErrors
				);

			}

		} else if ( programLog !== '' ) {

			console.warn( 'THREE.WebGLProgram: Program Info Log:', programLog );

		} else if ( vertexLog === '' || fragmentLog === '' ) {

			haveDiagnostics = false;

		}

		if ( haveDiagnostics ) {

			this.diagnostics = {

				runnable: runnable,

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

	}

	// Clean up

	// Crashes in iOS9 and iOS10. #18402
	// gl.detachShader( program, glVertexShader );
	// gl.detachShader( program, glFragmentShader );

	gl.deleteShader( glVertexShader );
	gl.deleteShader( glFragmentShader );

	// set up caching for uniform locations

	let cachedUniforms;

	this.getUniforms = function () {

		if ( cachedUniforms === undefined ) {

			cachedUniforms = new WebGLUniforms( gl, program );

		}

		return cachedUniforms;

	};

	// set up caching for attribute locations

	let cachedAttributes;

	this.getAttributes = function () {

		if ( cachedAttributes === undefined ) {

			cachedAttributes = fetchAttributeLocations( gl, program );

		}

		return cachedAttributes;

	};

	// free resource

	this.destroy = function () {

		bindingStates.releaseStatesOfProgram( this );

		gl.deleteProgram( program );
		this.program = undefined;

	};

	//

	this.type = parameters.shaderType;
	this.name = parameters.shaderName;
	this.id = programIdCount ++;
	this.cacheKey = cacheKey;
	this.usedTimes = 1;
	this.program = program;
	this.vertexShader = glVertexShader;
	this.fragmentShader = glFragmentShader;

	return this;

}

export { WebGLProgram };
