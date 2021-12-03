import { BackSide, DoubleSide, CubeUVRefractionMapping, CubeUVReflectionMapping, LinearEncoding, ObjectSpaceNormalMap, TangentSpaceNormalMap, NoToneMapping } from '../../constants.js';
import { WebGLProgram } from './WebGLProgram.js';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { UniformsUtils } from '../shaders/UniformsUtils.js';
import { hashString } from '../../utils.js';

function WebGLPrograms( renderer, cubemaps, cubeuvmaps, extensions, capabilities, bindingStates, clipping ) {

	const programs = [];

	const isWebGL2 = capabilities.isWebGL2;
	const logarithmicDepthBuffer = capabilities.logarithmicDepthBuffer;
	const floatVertexTextures = capabilities.floatVertexTextures;
	const maxVertexUniforms = capabilities.maxVertexUniforms;
	const vertexTextures = capabilities.vertexTextures;

	let precision = capabilities.precision;

	const shaderIDs = {
		MeshDepthMaterial: 'depth',
		MeshDistanceMaterial: 'distanceRGBA',
		MeshNormalMaterial: 'normal',
		MeshBasicMaterial: 'basic',
		MeshLambertMaterial: 'lambert',
		MeshPhongMaterial: 'phong',
		MeshToonMaterial: 'toon',
		MeshStandardMaterial: 'physical',
		MeshPhysicalMaterial: 'physical',
		MeshMatcapMaterial: 'matcap',
		LineBasicMaterial: 'basic',
		LineDashedMaterial: 'dashed',
		PointsMaterial: 'points',
		ShadowMaterial: 'shadow',
		SpriteMaterial: 'sprite'
	};

	const booleanParameterNames = [
		'isWebGL2', 'supportsVertexTextures', 'instancing', 'instancingColor', 'map', 'matcap', 'envMap',
		'envMapCubeUV', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap', 'normalMap', 'objectSpaceNormalMap',
		'tangentSpaceNormalMap', 'clearcoat', 'clearcoatMap', 'clearcoatRoughnessMap', 'clearcoatNormalMap',
		'displacementMap', 'specularMap', 'roughnessMap', 'metalnessMap', 'gradientMap', 'alphaMap', 'alphaTest',
		'vertexColors', 'vertexAlphas', 'vertexTangents', 'uvsVertexOnly', 'fog', 'useFog', 'flatShading',
		'logarithmicDepthBuffer', 'skinning', 'useVertexTexture', 'morphTargets', 'morphNormals',
		'premultipliedAlpha', 'shadowMapEnabled', 'physicallyCorrectLights', 'doubleSided', 'flipSided',
		'depthPacking', 'dithering', 'specularIntensityMap', 'specularColorMap', 'transmission',
		'transmissionMap', 'thicknessMap', 'sheen', 'sheenColorMap', 'sheenRoughnessMap' ];

	const parameterNames = [
		'precision', 'outputEncoding',
		'mapEncoding', 'matcapEncoding', 'envMapMode', 'envMapEncoding',
		'lightMapEncoding', 'emissiveMapEncoding',
		'combine', 'fogExp2',
		'sizeAttenuation',
		'maxBones', 'morphTargetsCount',
		'numDirLights', 'numPointLights', 'numSpotLights', 'numHemiLights', 'numRectAreaLights',
		'numDirLightShadows', 'numPointLightShadows', 'numSpotLightShadows',
		'shadowMapType', 'toneMapping',
		'numClippingPlanes', 'numClipIntersection', 'format',
		'specularColorMapEncoding', 'sheenColorMapEncoding'
	];

	function getMaxBones( object ) {

		const skeleton = object.skeleton;
		const bones = skeleton.bones;

		if ( floatVertexTextures ) {

			return 1024;

		} else {

			// default for when object is not specified
			// ( for example when prebuilding shader to be used with multiple objects )
			//
			//  - leave some extra space for other uniforms
			//  - limit here is ANGLE's 254 max uniform vectors
			//    (up to 54 should be safe)

			const nVertexUniforms = maxVertexUniforms;
			const nVertexMatrices = Math.floor( ( nVertexUniforms - 20 ) / 4 );

			const maxBones = Math.min( nVertexMatrices, bones.length );

			if ( maxBones < bones.length ) {

				console.warn( 'THREE.WebGLRenderer: Skeleton has ' + bones.length + ' bones. This GPU supports ' + maxBones + '.' );
				return 0;

			}

			return maxBones;

		}

	}

	function getTextureEncodingFromMap( map ) {

		let encoding;

		if ( map && map.isTexture ) {

			encoding = map.encoding;

		} else if ( map && map.isWebGLRenderTarget ) {

			console.warn( 'THREE.WebGLPrograms.getTextureEncodingFromMap: don\'t use render targets as textures. Use their .texture property instead.' );
			encoding = map.texture.encoding;

		} else {

			encoding = LinearEncoding;

		}

		/* if ( isWebGL2 && map && map.isTexture && map.format === RGBAFormat && map.type === UnsignedByteType && map.encoding === sRGBEncoding ) {

			encoding = LinearEncoding; // disable inline decode for sRGB textures in WebGL 2

		} */

		return encoding;

	}

	function getParameters( material, lights, shadows, scene, object ) {

		const fog = scene.fog;
		const environment = material.isMeshStandardMaterial ? scene.environment : null;

		const envMap = ( material.isMeshStandardMaterial ? cubeuvmaps : cubemaps ).get( material.envMap || environment );

		const shaderID = shaderIDs[ material.type ];

		// heuristics to create shader parameters according to lights in the scene
		// (not to blow over maxLights budget)

		const maxBones = object.isSkinnedMesh ? getMaxBones( object ) : 0;

		if ( material.precision !== null ) {

			precision = capabilities.getMaxPrecision( material.precision );

			if ( precision !== material.precision ) {

				console.warn( 'THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', precision, 'instead.' );

			}

		}

		let vertexShader, fragmentShader;

		if ( shaderID ) {

			const shader = ShaderLib[ shaderID ];

			vertexShader = shader.vertexShader;
			fragmentShader = shader.fragmentShader;

		} else {

			vertexShader = material.vertexShader;
			fragmentShader = material.fragmentShader;

		}

		const currentRenderTarget = renderer.getRenderTarget();

		const useAlphaTest = material.alphaTest > 0;
		const useClearcoat = material.clearcoat > 0;

		const parameters = {

			isWebGL2: isWebGL2,

			shaderID: shaderID,
			shaderName: material.type,

			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			defines: material.defines,

			isRawShaderMaterial: material.isRawShaderMaterial === true,
			glslVersion: material.glslVersion,

			precision: precision,

			instancing: object.isInstancedMesh === true,
			instancingColor: object.isInstancedMesh === true && object.instanceColor !== null,

			supportsVertexTextures: vertexTextures,
			outputEncoding: ( currentRenderTarget !== null ) ? getTextureEncodingFromMap( currentRenderTarget.texture ) : renderer.outputEncoding,
			map: !! material.map,
			mapEncoding: getTextureEncodingFromMap( material.map ),
			matcap: !! material.matcap,
			matcapEncoding: getTextureEncodingFromMap( material.matcap ),
			envMap: !! envMap,
			envMapMode: envMap && envMap.mapping,
			envMapEncoding: getTextureEncodingFromMap( envMap ),
			envMapCubeUV: ( !! envMap ) && ( ( envMap.mapping === CubeUVReflectionMapping ) || ( envMap.mapping === CubeUVRefractionMapping ) ),
			lightMap: !! material.lightMap,
			lightMapEncoding: getTextureEncodingFromMap( material.lightMap ),
			aoMap: !! material.aoMap,
			emissiveMap: !! material.emissiveMap,
			emissiveMapEncoding: getTextureEncodingFromMap( material.emissiveMap ),
			bumpMap: !! material.bumpMap,
			normalMap: !! material.normalMap,
			objectSpaceNormalMap: material.normalMapType === ObjectSpaceNormalMap,
			tangentSpaceNormalMap: material.normalMapType === TangentSpaceNormalMap,

			clearcoat: useClearcoat,
			clearcoatMap: useClearcoat && !! material.clearcoatMap,
			clearcoatRoughnessMap: useClearcoat && !! material.clearcoatRoughnessMap,
			clearcoatNormalMap: useClearcoat && !! material.clearcoatNormalMap,

			displacementMap: !! material.displacementMap,
			roughnessMap: !! material.roughnessMap,
			metalnessMap: !! material.metalnessMap,
			specularMap: !! material.specularMap,
			specularIntensityMap: !! material.specularIntensityMap,
			specularColorMap: !! material.specularColorMap,
			specularColorMapEncoding: getTextureEncodingFromMap( material.specularColorMap ),

			alphaMap: !! material.alphaMap,
			alphaTest: useAlphaTest,

			gradientMap: !! material.gradientMap,

			sheen: material.sheen > 0,
			sheenColorMap: !! material.sheenColorMap,
			sheenColorMapEncoding: getTextureEncodingFromMap( material.sheenColorMap ),
			sheenRoughnessMap: !! material.sheenRoughnessMap,

			transmission: material.transmission > 0,
			transmissionMap: !! material.transmissionMap,
			thicknessMap: !! material.thicknessMap,

			combine: material.combine,

			vertexTangents: ( !! material.normalMap && !! object.geometry && !! object.geometry.attributes.tangent ),
			vertexColors: material.vertexColors,
			vertexAlphas: material.vertexColors === true && !! object.geometry && !! object.geometry.attributes.color && object.geometry.attributes.color.itemSize === 4,
			vertexUvs: !! material.map || !! material.bumpMap || !! material.normalMap || !! material.specularMap || !! material.alphaMap || !! material.emissiveMap || !! material.roughnessMap || !! material.metalnessMap || !! material.clearcoatMap || !! material.clearcoatRoughnessMap || !! material.clearcoatNormalMap || !! material.displacementMap || !! material.transmissionMap || !! material.thicknessMap || !! material.specularIntensityMap || !! material.specularColorMap || !! material.sheenColorMap || !! material.sheenRoughnessMap,
			uvsVertexOnly: ! ( !! material.map || !! material.bumpMap || !! material.normalMap || !! material.specularMap || !! material.alphaMap || !! material.emissiveMap || !! material.roughnessMap || !! material.metalnessMap || !! material.clearcoatNormalMap || material.transmission > 0 || !! material.transmissionMap || !! material.thicknessMap || !! material.specularIntensityMap || !! material.specularColorMap || material.sheen > 0 || !! material.sheenColorMap || !! material.sheenRoughnessMap ) && !! material.displacementMap,

			fog: !! fog,
			useFog: material.fog,
			fogExp2: ( !! fog && fog.isFogExp2 ),

			flatShading: !! material.flatShading,

			sizeAttenuation: material.sizeAttenuation,
			logarithmicDepthBuffer: logarithmicDepthBuffer,

			skinning: object.isSkinnedMesh === true && maxBones > 0,
			maxBones: maxBones,
			useVertexTexture: floatVertexTextures,

			morphTargets: !! object.geometry && !! object.geometry.morphAttributes.position,
			morphNormals: !! object.geometry && !! object.geometry.morphAttributes.normal,
			morphTargetsCount: ( !! object.geometry && !! object.geometry.morphAttributes.position ) ? object.geometry.morphAttributes.position.length : 0,

			numDirLights: lights.directional.length,
			numPointLights: lights.point.length,
			numSpotLights: lights.spot.length,
			numRectAreaLights: lights.rectArea.length,
			numHemiLights: lights.hemi.length,

			numDirLightShadows: lights.directionalShadowMap.length,
			numPointLightShadows: lights.pointShadowMap.length,
			numSpotLightShadows: lights.spotShadowMap.length,

			numClippingPlanes: clipping.numPlanes,
			numClipIntersection: clipping.numIntersection,

			format: material.format,
			dithering: material.dithering,

			shadowMapEnabled: renderer.shadowMap.enabled && shadows.length > 0,
			shadowMapType: renderer.shadowMap.type,

			toneMapping: material.toneMapped ? renderer.toneMapping : NoToneMapping,
			physicallyCorrectLights: renderer.physicallyCorrectLights,

			premultipliedAlpha: material.premultipliedAlpha,

			doubleSided: material.side === DoubleSide,
			flipSided: material.side === BackSide,

			depthPacking: ( material.depthPacking !== undefined ) ? material.depthPacking : false,

			index0AttributeName: material.index0AttributeName,

			extensionDerivatives: material.extensions && material.extensions.derivatives,
			extensionFragDepth: material.extensions && material.extensions.fragDepth,
			extensionDrawBuffers: material.extensions && material.extensions.drawBuffers,
			extensionShaderTextureLOD: material.extensions && material.extensions.shaderTextureLOD,

			rendererExtensionFragDepth: isWebGL2 || extensions.has( 'EXT_frag_depth' ),
			rendererExtensionDrawBuffers: isWebGL2 || extensions.has( 'WEBGL_draw_buffers' ),
			rendererExtensionShaderTextureLod: isWebGL2 || extensions.has( 'EXT_shader_texture_lod' ),

			customProgramCacheKey: material.customProgramCacheKey()

		};

		return parameters;

	}

	function getProgramCacheKey( parameters ) {

		const array = [];

		if ( parameters.shaderID ) {

			array.push( parameters.shaderID );

		} else {

			array.push( hashString( parameters.fragmentShader ) );
			array.push( hashString( parameters.vertexShader ) );

		}

		if ( parameters.defines !== undefined ) {

			for ( const name in parameters.defines ) {

				array.push( name );
				array.push( parameters.defines[ name ] );

			}

		}

		if ( parameters.isRawShaderMaterial === false ) {

			for ( let i = 0; i < parameterNames.length; i ++ ) {

				array.push( parameters[ parameterNames[ i ] ] );

			}

			getProgramCacheKeyBooleans( parameters, array );
			array.push( renderer.outputEncoding );
			array.push( renderer.gammaFactor );

		}

		array.push( parameters.customProgramCacheKey );

		return array.join();

	}

	function getProgramCacheKeyBooleans( parameters, array ) {

		let booleancount = 0;
		if ( parameters.isWebGL2 )
			booleancount += 1;
		if ( parameters.supportsVertexTextures )
			booleancount += 2;
		if ( parameters.instancing )
			booleancount += 4;
		if ( parameters.instancingColor )
			booleancount += 8;
		if ( parameters.map )
			booleancount += 16;
		if ( parameters.matcap )
			booleancount += 32;
		if ( parameters.envMap )
			booleancount += 64;
		if ( parameters.envMapCubeUV )
			booleancount += 128;
		if ( parameters.lightMap )
			booleancount += 256;
		if ( parameters.aoMap )
			booleancount += 512;
		if ( parameters.emissiveMap )
			booleancount += 1024;
		if ( parameters.bumpMap )
			booleancount += 2048;
		if ( parameters.normalMap )
			booleancount += 4096;
		if ( parameters.objectSpaceNormalMap )
			booleancount += 8192;
		if ( parameters.tangentSpaceNormalMap )
			booleancount += 16384;
		if ( parameters.clearcoat )
			booleancount += 32768;
		if ( parameters.clearcoatMap )
			booleancount += 65536;
		if ( parameters.clearcoatRoughnessMap )
			booleancount += 131072;
		if ( parameters.clearcoatNormalMap )
			booleancount += 262144;
		if ( parameters.displacementMap )
			booleancount += 524288;
		if ( parameters.specularMap )
			booleancount += 1048576;
		if ( parameters.roughnessMap )
			booleancount += 2097152;
		if ( parameters.metalnessMap )
			booleancount += 4194304;
		if ( parameters.gradientMap )
			booleancount += 8388608;
		if ( parameters.alphaMap )
			booleancount += 16777216;
		if ( parameters.alphaTest )
			booleancount += 33554432;
		if ( parameters.vertexColors )
			booleancount += 67108864;
		if ( parameters.vertexAlphas )
			booleancount += 134217728;
		if ( parameters.vertexUvs )
			booleancount += 268435456;
		if ( parameters.vertexTangents )
			booleancount += 536870912;
		if ( parameters.uvsVertexOnly )
			booleancount += 1073741824;
		if ( parameters.fog )
			booleancount += 2147483648;
		array.push( booleancount );
		booleancount = 0;


		if ( parameters.useFog )
			booleancount += 1;
		if ( parameters.flatShading )
			booleancount += 2;
		if ( parameters.logarithmicDepthBuffer )
			booleancount += 4;
		if ( parameters.skinning )
			booleancount += 8;
		if ( parameters.useVertexTexture )
			booleancount += 16;
		if ( parameters.morphTargets )
			booleancount += 32;
		if ( parameters.morphNormals )
			booleancount += 64;
		if ( parameters.premultipliedAlpha )
			booleancount += 128;
		if ( parameters.shadowMapEnabled )
			booleancount += 256;
		if ( parameters.physicallyCorrectLights )
			booleancount += 512;
		if ( parameters.doubleSided )
			booleancount += 1024;
		if ( parameters.flipSided )
			booleancount += 2048;
		if ( parameters.depthPacking )
			booleancount += 4096;
		if ( parameters.dithering )
			booleancount += 8192;
		if ( parameters.specularIntensityMap )
			booleancount += 16384;
		if ( parameters.specularColorMap )
			booleancount += 32768;
		if ( parameters.transmission )
			booleancount += 65536;
		if ( parameters.transmissionMap )
			booleancount += 131072;
		if ( parameters.thicknessMap )
			booleancount += 262144;
		if ( parameters.sheen )
			booleancount += 524288;
		if ( parameters.sheenColorMap )
			booleancount += 1048576;
		if ( parameters.sheenRoughnessMap )
			booleancount += 2097152;

		array.push( booleancount );

	}

	function getUniforms( material ) {

		const shaderID = shaderIDs[ material.type ];
		let uniforms;

		if ( shaderID ) {

			const shader = ShaderLib[ shaderID ];
			uniforms = UniformsUtils.clone( shader.uniforms );

		} else {

			uniforms = material.uniforms;

		}

		return uniforms;

	}

	function acquireProgram( parameters, cacheKey ) {

		let program;

		// Check if code has been already compiled
		for ( let p = 0, pl = programs.length; p < pl; p ++ ) {

			const preexistingProgram = programs[ p ];

			if ( preexistingProgram.cacheKey === cacheKey ) {

				program = preexistingProgram;
				++ program.usedTimes;

				break;

			}

		}

		if ( program === undefined ) {

			program = new WebGLProgram( renderer, cacheKey, parameters, bindingStates );
			programs.push( program );

		}

		return program;

	}

	function releaseProgram( program ) {

		if ( -- program.usedTimes === 0 ) {

			// Remove from unordered set
			const i = programs.indexOf( program );
			programs[ i ] = programs[ programs.length - 1 ];
			programs.pop();

			// Free WebGL resources
			program.destroy();

		}

	}

	return {
		getParameters: getParameters,
		getProgramCacheKey: getProgramCacheKey,
		getUniforms: getUniforms,
		acquireProgram: acquireProgram,
		releaseProgram: releaseProgram,
		// Exposed for resource monitoring & error feedback via renderer.info:
		programs: programs
	};

}


export { WebGLPrograms };
