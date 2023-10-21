import { BackSide, DoubleSide, CubeUVReflectionMapping, ObjectSpaceNormalMap, TangentSpaceNormalMap, NoToneMapping, NormalBlending, LinearSRGBColorSpace, SRGBTransfer } from '../../constants.js';
import { Layers } from '../../core/Layers.js';
import { WebGLProgram } from './WebGLProgram.js';
import { WebGLShaderCache } from './WebGLShaderCache.js';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { UniformsUtils } from '../shaders/UniformsUtils.js';
import { ColorManagement } from '../../math/ColorManagement.js';

function WebGLPrograms( renderer, cubemaps, cubeuvmaps, extensions, capabilities, bindingStates, clipping ) {

	const _programLayers = new Layers();
	const _customShaders = new WebGLShaderCache();
	const programs = [];

	const IS_WEBGL2 = capabilities.isWebGL2;
	const logarithmicDepthBuffer = capabilities.logarithmicDepthBuffer;
	const SUPPORTS_VERTEX_TEXTURES = capabilities.vertexTextures;

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

	function getChannel( value ) {

		if ( value === 0 ) return 'uv';

		return `uv${ value }`;

	}

	function getParameters( material, lights, shadows, scene, object ) {

		const fog = scene.fog;
		const geometry = object.geometry;
		const environment = material.isMeshStandardMaterial ? scene.environment : null;

		const envMap = ( material.isMeshStandardMaterial ? cubeuvmaps : cubemaps ).get( material.envMap || environment );
		const envMapCubeUVHeight = ( !! envMap ) && ( envMap.mapping === CubeUVReflectionMapping ) ? envMap.image.height : null;

		const shaderID = shaderIDs[ material.type ];

		// heuristics to create shader parameters according to lights in the scene
		// (not to blow over maxLights budget)

		if ( material.precision !== null ) {

			precision = capabilities.getMaxPrecision( material.precision );

			if ( precision !== material.precision ) {

				console.warn( 'THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', precision, 'instead.' );

			}

		}

		//

		const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
		const morphTargetsCount = ( morphAttribute !== undefined ) ? morphAttribute.length : 0;

		let morphTextureStride = 0;

		if ( geometry.morphAttributes.position !== undefined ) morphTextureStride = 1;
		if ( geometry.morphAttributes.normal !== undefined ) morphTextureStride = 2;
		if ( geometry.morphAttributes.color !== undefined ) morphTextureStride = 3;

		//

		let vertexShader, fragmentShader;
		let customVertexShaderID, customFragmentShaderID;

		if ( shaderID ) {

			const shader = ShaderLib[ shaderID ];

			vertexShader = shader.vertexShader;
			fragmentShader = shader.fragmentShader;

		} else {

			vertexShader = material.vertexShader;
			fragmentShader = material.fragmentShader;

			_customShaders.update( material );

			customVertexShaderID = _customShaders.getVertexShaderID( material );
			customFragmentShaderID = _customShaders.getFragmentShaderID( material );

		}

		const currentRenderTarget = renderer.getRenderTarget();

		const IS_INSTANCEDMESH = object.isInstancedMesh === true;

		const HAS_MAP = !! material.map;
		const HAS_MATCAP = !! material.matcap;
		const HAS_ENVMAP = !! envMap;
		const HAS_AOMAP = !! material.aoMap;
		const HAS_LIGHTMAP = !! material.lightMap;
		const HAS_BUMPMAP = !! material.bumpMap;
		const HAS_NORMALMAP = !! material.normalMap;
		const HAS_DISPLACEMENTMAP = !! material.displacementMap;
		const HAS_EMISSIVEMAP = !! material.emissiveMap;

		const HAS_METALNESSMAP = !! material.metalnessMap;
		const HAS_ROUGHNESSMAP = !! material.roughnessMap;

		const HAS_ANISOTROPY = material.anisotropy > 0;
		const HAS_CLEARCOAT = material.clearcoat > 0;
		const HAS_IRIDESCENCE = material.iridescence > 0;
		const HAS_SHEEN = material.sheen > 0;
		const HAS_TRANSMISSION = material.transmission > 0;

		const HAS_ANISOTROPYMAP = HAS_ANISOTROPY && !! material.anisotropyMap;

		const HAS_CLEARCOATMAP = HAS_CLEARCOAT && !! material.clearcoatMap;
		const HAS_CLEARCOAT_NORMALMAP = HAS_CLEARCOAT && !! material.clearcoatNormalMap;
		const HAS_CLEARCOAT_ROUGHNESSMAP = HAS_CLEARCOAT && !! material.clearcoatRoughnessMap;

		const HAS_IRIDESCENCEMAP = HAS_IRIDESCENCE && !! material.iridescenceMap;
		const HAS_IRIDESCENCE_THICKNESSMAP = HAS_IRIDESCENCE && !! material.iridescenceThicknessMap;

		const HAS_SHEEN_COLORMAP = HAS_SHEEN && !! material.sheenColorMap;
		const HAS_SHEEN_ROUGHNESSMAP = HAS_SHEEN && !! material.sheenRoughnessMap;

		const HAS_SPECULARMAP = !! material.specularMap;
		const HAS_SPECULAR_COLORMAP = !! material.specularColorMap;
		const HAS_SPECULAR_INTENSITYMAP = !! material.specularIntensityMap;

		const HAS_TRANSMISSIONMAP = HAS_TRANSMISSION && !! material.transmissionMap;
		const HAS_THICKNESSMAP = HAS_TRANSMISSION && !! material.thicknessMap;

		const HAS_GRADIENTMAP = !! material.gradientMap;

		const HAS_ALPHAMAP = !! material.alphaMap;

		const HAS_ALPHATEST = material.alphaTest > 0;

		const HAS_ALPHAHASH = !! material.alphaHash;

		const HAS_EXTENSIONS = !! material.extensions;

		const HAS_ATTRIBUTE_UV1 = !! geometry.attributes.uv1;
		const HAS_ATTRIBUTE_UV2 = !! geometry.attributes.uv2;
		const HAS_ATTRIBUTE_UV3 = !! geometry.attributes.uv3;

		let toneMapping = NoToneMapping;

		if ( material.toneMapped ) {

			if ( currentRenderTarget === null || currentRenderTarget.isXRRenderTarget === true ) {

				toneMapping = renderer.toneMapping;

			}

		}

		const parameters = {

			isWebGL2: IS_WEBGL2,

			shaderID: shaderID,
			shaderType: material.type,
			shaderName: material.name,

			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			defines: material.defines,

			customVertexShaderID: customVertexShaderID,
			customFragmentShaderID: customFragmentShaderID,

			isRawShaderMaterial: material.isRawShaderMaterial === true,
			glslVersion: material.glslVersion,

			precision: precision,

			instancing: IS_INSTANCEDMESH,
			instancingColor: IS_INSTANCEDMESH && object.instanceColor !== null,

			supportsVertexTextures: SUPPORTS_VERTEX_TEXTURES,
			outputColorSpace: ( currentRenderTarget === null ) ? renderer.outputColorSpace : ( currentRenderTarget.isXRRenderTarget === true ? currentRenderTarget.texture.colorSpace : LinearSRGBColorSpace ),

			map: HAS_MAP,
			matcap: HAS_MATCAP,
			envMap: HAS_ENVMAP,
			envMapMode: HAS_ENVMAP && envMap.mapping,
			envMapCubeUVHeight: envMapCubeUVHeight,
			aoMap: HAS_AOMAP,
			lightMap: HAS_LIGHTMAP,
			bumpMap: HAS_BUMPMAP,
			normalMap: HAS_NORMALMAP,
			displacementMap: SUPPORTS_VERTEX_TEXTURES && HAS_DISPLACEMENTMAP,
			emissiveMap: HAS_EMISSIVEMAP,

			normalMapObjectSpace: HAS_NORMALMAP && material.normalMapType === ObjectSpaceNormalMap,
			normalMapTangentSpace: HAS_NORMALMAP && material.normalMapType === TangentSpaceNormalMap,

			metalnessMap: HAS_METALNESSMAP,
			roughnessMap: HAS_ROUGHNESSMAP,

			anisotropy: HAS_ANISOTROPY,
			anisotropyMap: HAS_ANISOTROPYMAP,

			clearcoat: HAS_CLEARCOAT,
			clearcoatMap: HAS_CLEARCOATMAP,
			clearcoatNormalMap: HAS_CLEARCOAT_NORMALMAP,
			clearcoatRoughnessMap: HAS_CLEARCOAT_ROUGHNESSMAP,

			iridescence: HAS_IRIDESCENCE,
			iridescenceMap: HAS_IRIDESCENCEMAP,
			iridescenceThicknessMap: HAS_IRIDESCENCE_THICKNESSMAP,

			sheen: HAS_SHEEN,
			sheenColorMap: HAS_SHEEN_COLORMAP,
			sheenRoughnessMap: HAS_SHEEN_ROUGHNESSMAP,

			specularMap: HAS_SPECULARMAP,
			specularColorMap: HAS_SPECULAR_COLORMAP,
			specularIntensityMap: HAS_SPECULAR_INTENSITYMAP,

			transmission: HAS_TRANSMISSION,
			transmissionMap: HAS_TRANSMISSIONMAP,
			thicknessMap: HAS_THICKNESSMAP,

			gradientMap: HAS_GRADIENTMAP,

			opaque: material.transparent === false && material.blending === NormalBlending,

			alphaMap: HAS_ALPHAMAP,
			alphaTest: HAS_ALPHATEST,
			alphaHash: HAS_ALPHAHASH,

			combine: material.combine,

			//

			mapUv: HAS_MAP && getChannel( material.map.channel ),
			aoMapUv: HAS_AOMAP && getChannel( material.aoMap.channel ),
			lightMapUv: HAS_LIGHTMAP && getChannel( material.lightMap.channel ),
			bumpMapUv: HAS_BUMPMAP && getChannel( material.bumpMap.channel ),
			normalMapUv: HAS_NORMALMAP && getChannel( material.normalMap.channel ),
			displacementMapUv: HAS_DISPLACEMENTMAP && getChannel( material.displacementMap.channel ),
			emissiveMapUv: HAS_EMISSIVEMAP && getChannel( material.emissiveMap.channel ),

			metalnessMapUv: HAS_METALNESSMAP && getChannel( material.metalnessMap.channel ),
			roughnessMapUv: HAS_ROUGHNESSMAP && getChannel( material.roughnessMap.channel ),

			anisotropyMapUv: HAS_ANISOTROPYMAP && getChannel( material.anisotropyMap.channel ),

			clearcoatMapUv: HAS_CLEARCOATMAP && getChannel( material.clearcoatMap.channel ),
			clearcoatNormalMapUv: HAS_CLEARCOAT_NORMALMAP && getChannel( material.clearcoatNormalMap.channel ),
			clearcoatRoughnessMapUv: HAS_CLEARCOAT_ROUGHNESSMAP && getChannel( material.clearcoatRoughnessMap.channel ),

			iridescenceMapUv: HAS_IRIDESCENCEMAP && getChannel( material.iridescenceMap.channel ),
			iridescenceThicknessMapUv: HAS_IRIDESCENCE_THICKNESSMAP && getChannel( material.iridescenceThicknessMap.channel ),

			sheenColorMapUv: HAS_SHEEN_COLORMAP && getChannel( material.sheenColorMap.channel ),
			sheenRoughnessMapUv: HAS_SHEEN_ROUGHNESSMAP && getChannel( material.sheenRoughnessMap.channel ),

			specularMapUv: HAS_SPECULARMAP && getChannel( material.specularMap.channel ),
			specularColorMapUv: HAS_SPECULAR_COLORMAP && getChannel( material.specularColorMap.channel ),
			specularIntensityMapUv: HAS_SPECULAR_INTENSITYMAP && getChannel( material.specularIntensityMap.channel ),

			transmissionMapUv: HAS_TRANSMISSIONMAP && getChannel( material.transmissionMap.channel ),
			thicknessMapUv: HAS_THICKNESSMAP && getChannel( material.thicknessMap.channel ),

			alphaMapUv: HAS_ALPHAMAP && getChannel( material.alphaMap.channel ),

			//

			vertexTangents: !! geometry.attributes.tangent && ( HAS_NORMALMAP || HAS_ANISOTROPY ),
			vertexColors: material.vertexColors,
			vertexAlphas: material.vertexColors === true && !! geometry.attributes.color && geometry.attributes.color.itemSize === 4,
			vertexUv1s: HAS_ATTRIBUTE_UV1,
			vertexUv2s: HAS_ATTRIBUTE_UV2,
			vertexUv3s: HAS_ATTRIBUTE_UV3,

			pointsUvs: object.isPoints === true && !! geometry.attributes.uv && ( HAS_MAP || HAS_ALPHAMAP ),

			fog: !! fog,
			useFog: material.fog === true,
			fogExp2: ( fog && fog.isFogExp2 ),

			flatShading: material.flatShading === true,

			sizeAttenuation: material.sizeAttenuation === true,
			logarithmicDepthBuffer: logarithmicDepthBuffer,

			skinning: object.isSkinnedMesh === true,

			morphTargets: geometry.morphAttributes.position !== undefined,
			morphNormals: geometry.morphAttributes.normal !== undefined,
			morphColors: geometry.morphAttributes.color !== undefined,
			morphTargetsCount: morphTargetsCount,
			morphTextureStride: morphTextureStride,

			numDirLights: lights.directional.length,
			numPointLights: lights.point.length,
			numSpotLights: lights.spot.length,
			numSpotLightMaps: lights.spotLightMap.length,
			numRectAreaLights: lights.rectArea.length,
			numHemiLights: lights.hemi.length,

			numDirLightShadows: lights.directionalShadowMap.length,
			numPointLightShadows: lights.pointShadowMap.length,
			numSpotLightShadows: lights.spotShadowMap.length,
			numSpotLightShadowsWithMaps: lights.numSpotLightShadowsWithMaps,

			numLightProbes: lights.numLightProbes,

			numClippingPlanes: clipping.numPlanes,
			numClipIntersection: clipping.numIntersection,

			dithering: material.dithering,

			shadowMapEnabled: renderer.shadowMap.enabled && shadows.length > 0,
			shadowMapType: renderer.shadowMap.type,

			toneMapping: toneMapping,
			useLegacyLights: renderer._useLegacyLights,

			decodeVideoTexture: HAS_MAP && ( material.map.isVideoTexture === true ) && ( ColorManagement.getTransfer( material.map.colorSpace ) === SRGBTransfer ),

			premultipliedAlpha: material.premultipliedAlpha,

			doubleSided: material.side === DoubleSide,
			flipSided: material.side === BackSide,

			useDepthPacking: material.depthPacking >= 0,
			depthPacking: material.depthPacking || 0,

			index0AttributeName: material.index0AttributeName,

			extensionDerivatives: HAS_EXTENSIONS && material.extensions.derivatives === true,
			extensionFragDepth: HAS_EXTENSIONS && material.extensions.fragDepth === true,
			extensionDrawBuffers: HAS_EXTENSIONS && material.extensions.drawBuffers === true,
			extensionShaderTextureLOD: HAS_EXTENSIONS && material.extensions.shaderTextureLOD === true,

			rendererExtensionFragDepth: IS_WEBGL2 || extensions.has( 'EXT_frag_depth' ),
			rendererExtensionDrawBuffers: IS_WEBGL2 || extensions.has( 'WEBGL_draw_buffers' ),
			rendererExtensionShaderTextureLod: IS_WEBGL2 || extensions.has( 'EXT_shader_texture_lod' ),
			rendererExtensionParallelShaderCompile: extensions.has( 'KHR_parallel_shader_compile' ),

			customProgramCacheKey: material.customProgramCacheKey()

		};

		return parameters;

	}

	function getProgramCacheKey( parameters ) {

		const array = [];

		if ( parameters.shaderID ) {

			array.push( parameters.shaderID );

		} else {

			array.push( parameters.customVertexShaderID );
			array.push( parameters.customFragmentShaderID );

		}

		if ( parameters.defines !== undefined ) {

			for ( const name in parameters.defines ) {

				array.push( name );
				array.push( parameters.defines[ name ] );

			}

		}

		if ( parameters.isRawShaderMaterial === false ) {

			getProgramCacheKeyParameters( array, parameters );
			getProgramCacheKeyBooleans( array, parameters );
			array.push( renderer.outputColorSpace );

		}

		array.push( parameters.customProgramCacheKey );

		return array.join();

	}

	function getProgramCacheKeyParameters( array, parameters ) {

		array.push( parameters.precision );
		array.push( parameters.outputColorSpace );
		array.push( parameters.envMapMode );
		array.push( parameters.envMapCubeUVHeight );
		array.push( parameters.mapUv );
		array.push( parameters.alphaMapUv );
		array.push( parameters.lightMapUv );
		array.push( parameters.aoMapUv );
		array.push( parameters.bumpMapUv );
		array.push( parameters.normalMapUv );
		array.push( parameters.displacementMapUv );
		array.push( parameters.emissiveMapUv );
		array.push( parameters.metalnessMapUv );
		array.push( parameters.roughnessMapUv );
		array.push( parameters.anisotropyMapUv );
		array.push( parameters.clearcoatMapUv );
		array.push( parameters.clearcoatNormalMapUv );
		array.push( parameters.clearcoatRoughnessMapUv );
		array.push( parameters.iridescenceMapUv );
		array.push( parameters.iridescenceThicknessMapUv );
		array.push( parameters.sheenColorMapUv );
		array.push( parameters.sheenRoughnessMapUv );
		array.push( parameters.specularMapUv );
		array.push( parameters.specularColorMapUv );
		array.push( parameters.specularIntensityMapUv );
		array.push( parameters.transmissionMapUv );
		array.push( parameters.thicknessMapUv );
		array.push( parameters.combine );
		array.push( parameters.fogExp2 );
		array.push( parameters.sizeAttenuation );
		array.push( parameters.morphTargetsCount );
		array.push( parameters.morphAttributeCount );
		array.push( parameters.numDirLights );
		array.push( parameters.numPointLights );
		array.push( parameters.numSpotLights );
		array.push( parameters.numSpotLightMaps );
		array.push( parameters.numHemiLights );
		array.push( parameters.numRectAreaLights );
		array.push( parameters.numDirLightShadows );
		array.push( parameters.numPointLightShadows );
		array.push( parameters.numSpotLightShadows );
		array.push( parameters.numSpotLightShadowsWithMaps );
		array.push( parameters.numLightProbes );
		array.push( parameters.shadowMapType );
		array.push( parameters.toneMapping );
		array.push( parameters.numClippingPlanes );
		array.push( parameters.numClipIntersection );
		array.push( parameters.depthPacking );

	}

	function getProgramCacheKeyBooleans( array, parameters ) {

		_programLayers.disableAll();

		if ( parameters.isWebGL2 )
			_programLayers.enable( 0 );
		if ( parameters.supportsVertexTextures )
			_programLayers.enable( 1 );
		if ( parameters.instancing )
			_programLayers.enable( 2 );
		if ( parameters.instancingColor )
			_programLayers.enable( 3 );
		if ( parameters.matcap )
			_programLayers.enable( 4 );
		if ( parameters.envMap )
			_programLayers.enable( 5 );
		if ( parameters.normalMapObjectSpace )
			_programLayers.enable( 6 );
		if ( parameters.normalMapTangentSpace )
			_programLayers.enable( 7 );
		if ( parameters.clearcoat )
			_programLayers.enable( 8 );
		if ( parameters.iridescence )
			_programLayers.enable( 9 );
		if ( parameters.alphaTest )
			_programLayers.enable( 10 );
		if ( parameters.vertexColors )
			_programLayers.enable( 11 );
		if ( parameters.vertexAlphas )
			_programLayers.enable( 12 );
		if ( parameters.vertexUv1s )
			_programLayers.enable( 13 );
		if ( parameters.vertexUv2s )
			_programLayers.enable( 14 );
		if ( parameters.vertexUv3s )
			_programLayers.enable( 15 );
		if ( parameters.vertexTangents )
			_programLayers.enable( 16 );
		if ( parameters.anisotropy )
			_programLayers.enable( 17 );
		if ( parameters.alphaHash )
			_programLayers.enable( 18 );

		array.push( _programLayers.mask );
		_programLayers.disableAll();

		if ( parameters.fog )
			_programLayers.enable( 0 );
		if ( parameters.useFog )
			_programLayers.enable( 1 );
		if ( parameters.flatShading )
			_programLayers.enable( 2 );
		if ( parameters.logarithmicDepthBuffer )
			_programLayers.enable( 3 );
		if ( parameters.skinning )
			_programLayers.enable( 4 );
		if ( parameters.morphTargets )
			_programLayers.enable( 5 );
		if ( parameters.morphNormals )
			_programLayers.enable( 6 );
		if ( parameters.morphColors )
			_programLayers.enable( 7 );
		if ( parameters.premultipliedAlpha )
			_programLayers.enable( 8 );
		if ( parameters.shadowMapEnabled )
			_programLayers.enable( 9 );
		if ( parameters.useLegacyLights )
			_programLayers.enable( 10 );
		if ( parameters.doubleSided )
			_programLayers.enable( 11 );
		if ( parameters.flipSided )
			_programLayers.enable( 12 );
		if ( parameters.useDepthPacking )
			_programLayers.enable( 13 );
		if ( parameters.dithering )
			_programLayers.enable( 14 );
		if ( parameters.transmission )
			_programLayers.enable( 15 );
		if ( parameters.sheen )
			_programLayers.enable( 16 );
		if ( parameters.opaque )
			_programLayers.enable( 17 );
		if ( parameters.pointsUvs )
			_programLayers.enable( 18 );
		if ( parameters.decodeVideoTexture )
			_programLayers.enable( 19 );

		array.push( _programLayers.mask );

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

	function releaseShaderCache( material ) {

		_customShaders.remove( material );

	}

	function dispose() {

		_customShaders.dispose();

	}

	return {
		getParameters: getParameters,
		getProgramCacheKey: getProgramCacheKey,
		getUniforms: getUniforms,
		acquireProgram: acquireProgram,
		releaseProgram: releaseProgram,
		releaseShaderCache: releaseShaderCache,
		// Exposed for resource monitoring & error feedback via renderer.info:
		programs: programs,
		dispose: dispose
	};

}

export { WebGLPrograms };
