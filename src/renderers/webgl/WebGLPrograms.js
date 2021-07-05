import { BackSide, DoubleSide, CubeUVRefractionMapping, CubeUVReflectionMapping, LinearEncoding, ObjectSpaceNormalMap, TangentSpaceNormalMap, NoToneMapping } from '../../constants.js';
import { WebGLProgram } from './WebGLProgram.js';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { UniformsUtils } from '../shaders/UniformsUtils.js';

function WebGLPrograms( renderer, cubemaps, extensions, capabilities, bindingStates, clipping ) {

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

	const parameterNames = [
		'precision', 'isWebGL2', 'supportsVertexTextures', 'outputEncoding', 'instancing', 'instancingColor',
		'map', 'mapEncoding', 'matcap', 'matcapEncoding', 'envMap', 'envMapMode', 'envMapEncoding', 'envMapCubeUV',
		'lightMap', 'lightMapEncoding', 'aoMap', 'emissiveMap', 'emissiveMapEncoding', 'bumpMap', 'normalMap', 'objectSpaceNormalMap', 'tangentSpaceNormalMap', 'clearcoatMap', 'clearcoatRoughnessMap', 'clearcoatNormalMap', 'displacementMap', 'specularMap',
		'roughnessMap', 'metalnessMap', 'gradientMap',
		'alphaMap', 'combine', 'vertexColors', 'vertexAlphas', 'vertexTangents', 'vertexUvs', 'uvsVertexOnly', 'fog', 'useFog', 'fogExp2',
		'flatShading', 'sizeAttenuation', 'logarithmicDepthBuffer', 'skinning',
		'maxBones', 'useVertexTexture', 'morphTargets', 'morphNormals', 'premultipliedAlpha',
		'numDirLights', 'numPointLights', 'numSpotLights', 'numHemiLights', 'numRectAreaLights',
		'numDirLightShadows', 'numPointLightShadows', 'numSpotLightShadows',
		'shadowMapEnabled', 'shadowMapType', 'toneMapping', 'physicallyCorrectLights',
		'alphaTest', 'doubleSided', 'flipSided', 'numClippingPlanes', 'numClipIntersection', 'depthPacking', 'dithering',
		'sheen', 'transmission', 'transmissionMap', 'thicknessMap'
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

		return encoding;

	}

	function getParameters( material, lights, shadows, scene, object ) {

		const fog = scene.fog;
		const environment = material.isMeshStandardMaterial ? scene.environment : null;

		const envMap = cubemaps.get( material.envMap || environment );

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
			clearcoatMap: !! material.clearcoatMap,
			clearcoatRoughnessMap: !! material.clearcoatRoughnessMap,
			clearcoatNormalMap: !! material.clearcoatNormalMap,
			displacementMap: !! material.displacementMap,
			roughnessMap: !! material.roughnessMap,
			metalnessMap: !! material.metalnessMap,
			specularMap: !! material.specularMap,
			alphaMap: !! material.alphaMap,

			gradientMap: !! material.gradientMap,

			sheen: !! material.sheen,

			transmission: !! material.transmission,
			transmissionMap: !! material.transmissionMap,
			thicknessMap: !! material.thicknessMap,

			combine: material.combine,

			vertexTangents: ( material.normalMap && material.vertexTangents ),
			vertexColors: material.vertexColors,
			vertexAlphas: material.vertexColors === true && object.geometry && object.geometry.attributes.color && object.geometry.attributes.color.itemSize === 4,
			vertexUvs: !! material.map || !! material.bumpMap || !! material.normalMap || !! material.specularMap || !! material.alphaMap || !! material.emissiveMap || !! material.roughnessMap || !! material.metalnessMap || !! material.clearcoatMap || !! material.clearcoatRoughnessMap || !! material.clearcoatNormalMap || !! material.displacementMap || !! material.transmissionMap || !! material.thicknessMap,
			uvsVertexOnly: ! ( !! material.map || !! material.bumpMap || !! material.normalMap || !! material.specularMap || !! material.alphaMap || !! material.emissiveMap || !! material.roughnessMap || !! material.metalnessMap || !! material.clearcoatNormalMap || !! material.transmission || !! material.transmissionMap || !! material.thicknessMap ) && !! material.displacementMap,

			fog: !! fog,
			useFog: material.fog,
			fogExp2: ( fog && fog.isFogExp2 ),

			flatShading: !! material.flatShading,

			sizeAttenuation: material.sizeAttenuation,
			logarithmicDepthBuffer: logarithmicDepthBuffer,

			skinning: object.isSkinnedMesh === true && maxBones > 0,
			maxBones: maxBones,
			useVertexTexture: floatVertexTextures,

			morphTargets: material.morphTargets,
			morphNormals: material.morphNormals,

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

			dithering: material.dithering,

			shadowMapEnabled: renderer.shadowMap.enabled && shadows.length > 0,
			shadowMapType: renderer.shadowMap.type,

			toneMapping: material.toneMapped ? renderer.toneMapping : NoToneMapping,
			physicallyCorrectLights: renderer.physicallyCorrectLights,

			premultipliedAlpha: material.premultipliedAlpha,

			alphaTest: material.alphaTest,
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

			array.push( parameters.fragmentShader );
			array.push( parameters.vertexShader );

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

			array.push( renderer.outputEncoding );
			array.push( renderer.gammaFactor );

		}

		array.push( parameters.customProgramCacheKey );

		return array.join();

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
