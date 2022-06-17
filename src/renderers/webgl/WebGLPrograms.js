import { BackSide, DoubleSide, CubeUVReflectionMapping, ObjectSpaceNormalMap, TangentSpaceNormalMap, NoToneMapping, LinearEncoding, sRGBEncoding, NormalBlending } from '../../constants.js';
import { Layers } from '../../core/Layers.js';
import { WebGLProgram } from './WebGLProgram.js';
import { WebGLShaderCache } from './WebGLShaderCache.js';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { UniformsUtils } from '../shaders/UniformsUtils.js';

function WebGLPrograms( renderer, cubemaps, cubeuvmaps, extensions, capabilities, bindingStates, clipping ) {

	const _programLayers = new Layers();
	const _customShaders = new WebGLShaderCache();
	const programs = [];

	const isWebGL2 = capabilities.isWebGL2;
	const logarithmicDepthBuffer = capabilities.logarithmicDepthBuffer;
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

		const useAlphaTest = material.alphaTest > 0;
		const useClearcoat = material.clearcoat > 0;
		const useIridescence = material.iridescence > 0;

		const parameters = {

			isWebGL2: isWebGL2,

			shaderID: shaderID,
			shaderName: material.type,

			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			defines: material.defines,

			customVertexShaderID: customVertexShaderID,
			customFragmentShaderID: customFragmentShaderID,

			isRawShaderMaterial: material.isRawShaderMaterial === true,
			glslVersion: material.glslVersion,

			precision: precision,

			instancing: object.isInstancedMesh === true,
			instancingColor: object.isInstancedMesh === true && object.instanceColor !== null,

			supportsVertexTextures: vertexTextures,
			outputEncoding: ( currentRenderTarget === null ) ? renderer.outputEncoding : ( currentRenderTarget.isXRRenderTarget === true ? currentRenderTarget.texture.encoding : LinearEncoding ),
			map: !! material.map,
			matcap: !! material.matcap,
			envMap: !! envMap,
			envMapMode: envMap && envMap.mapping,
			envMapCubeUVHeight: envMapCubeUVHeight,
			lightMap: !! material.lightMap,
			aoMap: !! material.aoMap,
			emissiveMap: !! material.emissiveMap,
			bumpMap: !! material.bumpMap,
			normalMap: !! material.normalMap,
			objectSpaceNormalMap: material.normalMapType === ObjectSpaceNormalMap,
			tangentSpaceNormalMap: material.normalMapType === TangentSpaceNormalMap,

			decodeVideoTexture: !! material.map && ( material.map.isVideoTexture === true ) && ( material.map.encoding === sRGBEncoding ),

			clearcoat: useClearcoat,
			clearcoatMap: useClearcoat && !! material.clearcoatMap,
			clearcoatRoughnessMap: useClearcoat && !! material.clearcoatRoughnessMap,
			clearcoatNormalMap: useClearcoat && !! material.clearcoatNormalMap,

			iridescence: useIridescence,
			iridescenceMap: useIridescence && !! material.iridescenceMap,
			iridescenceThicknessMap: useIridescence && !! material.iridescenceThicknessMap,

			displacementMap: !! material.displacementMap,
			roughnessMap: !! material.roughnessMap,
			metalnessMap: !! material.metalnessMap,
			specularMap: !! material.specularMap,
			specularIntensityMap: !! material.specularIntensityMap,
			specularColorMap: !! material.specularColorMap,

			opaque: material.transparent === false && material.blending === NormalBlending,

			alphaMap: !! material.alphaMap,
			alphaTest: useAlphaTest,

			gradientMap: !! material.gradientMap,

			sheen: material.sheen > 0,
			sheenColorMap: !! material.sheenColorMap,
			sheenRoughnessMap: !! material.sheenRoughnessMap,

			transmission: material.transmission > 0,
			transmissionMap: !! material.transmissionMap,
			thicknessMap: !! material.thicknessMap,

			combine: material.combine,

			vertexTangents: ( !! material.normalMap && !! geometry.attributes.tangent ),
			vertexColors: material.vertexColors,
			vertexAlphas: material.vertexColors === true && !! geometry.attributes.color && geometry.attributes.color.itemSize === 4,
			vertexUvs: !! material.map || !! material.bumpMap || !! material.normalMap || !! material.specularMap || !! material.alphaMap || !! material.emissiveMap || !! material.roughnessMap || !! material.metalnessMap || !! material.clearcoatMap || !! material.clearcoatRoughnessMap || !! material.clearcoatNormalMap || !! material.iridescenceMap || !! material.iridescenceThicknessMap || !! material.displacementMap || !! material.transmissionMap || !! material.thicknessMap || !! material.specularIntensityMap || !! material.specularColorMap || !! material.sheenColorMap || !! material.sheenRoughnessMap,
			uvsVertexOnly: ! ( !! material.map || !! material.bumpMap || !! material.normalMap || !! material.specularMap || !! material.alphaMap || !! material.emissiveMap || !! material.roughnessMap || !! material.metalnessMap || !! material.clearcoatNormalMap || !! material.iridescenceMap || !! material.iridescenceThicknessMap || material.transmission > 0 || !! material.transmissionMap || !! material.thicknessMap || !! material.specularIntensityMap || !! material.specularColorMap || material.sheen > 0 || !! material.sheenColorMap || !! material.sheenRoughnessMap ) && !! material.displacementMap,

			fog: !! fog,
			useFog: material.fog === true,
			fogExp2: ( fog && fog.isFogExp2 ),

			flatShading: !! material.flatShading,

			sizeAttenuation: material.sizeAttenuation,
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

			doubleSided: material.side === DoubleSide,
			flipSided: material.side === BackSide,

			useDepthPacking: !! material.depthPacking,
			depthPacking: material.depthPacking || 0,

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
			array.push( renderer.outputEncoding );

		}

		array.push( parameters.customProgramCacheKey );

		return array.join();

	}

	function getProgramCacheKeyParameters( array, parameters ) {

		array.push( parameters.precision );
		array.push( parameters.outputEncoding );
		array.push( parameters.envMapMode );
		array.push( parameters.envMapCubeUVHeight );
		array.push( parameters.combine );
		array.push( parameters.vertexUvs );
		array.push( parameters.fogExp2 );
		array.push( parameters.sizeAttenuation );
		array.push( parameters.morphTargetsCount );
		array.push( parameters.morphAttributeCount );
		array.push( parameters.numDirLights );
		array.push( parameters.numPointLights );
		array.push( parameters.numSpotLights );
		array.push( parameters.numHemiLights );
		array.push( parameters.numRectAreaLights );
		array.push( parameters.numDirLightShadows );
		array.push( parameters.numPointLightShadows );
		array.push( parameters.numSpotLightShadows );
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
		if ( parameters.map )
			_programLayers.enable( 4 );
		if ( parameters.matcap )
			_programLayers.enable( 5 );
		if ( parameters.envMap )
			_programLayers.enable( 6 );
		if ( parameters.lightMap )
			_programLayers.enable( 7 );
		if ( parameters.aoMap )
			_programLayers.enable( 8 );
		if ( parameters.emissiveMap )
			_programLayers.enable( 9 );
		if ( parameters.bumpMap )
			_programLayers.enable( 10 );
		if ( parameters.normalMap )
			_programLayers.enable( 11 );
		if ( parameters.objectSpaceNormalMap )
			_programLayers.enable( 12 );
		if ( parameters.tangentSpaceNormalMap )
			_programLayers.enable( 13 );
		if ( parameters.clearcoat )
			_programLayers.enable( 14 );
		if ( parameters.clearcoatMap )
			_programLayers.enable( 15 );
		if ( parameters.clearcoatRoughnessMap )
			_programLayers.enable( 16 );
		if ( parameters.clearcoatNormalMap )
			_programLayers.enable( 17 );
		if ( parameters.iridescence )
			_programLayers.enable( 18 );
		if ( parameters.iridescenceMap )
			_programLayers.enable( 19 );
		if ( parameters.iridescenceThicknessMap )
			_programLayers.enable( 20 );
		if ( parameters.displacementMap )
			_programLayers.enable( 21 );
		if ( parameters.specularMap )
			_programLayers.enable( 22 );
		if ( parameters.roughnessMap )
			_programLayers.enable( 23 );
		if ( parameters.metalnessMap )
			_programLayers.enable( 24 );
		if ( parameters.gradientMap )
			_programLayers.enable( 25 );
		if ( parameters.alphaMap )
			_programLayers.enable( 26 );
		if ( parameters.alphaTest )
			_programLayers.enable( 27 );
		if ( parameters.vertexColors )
			_programLayers.enable( 28 );
		if ( parameters.vertexAlphas )
			_programLayers.enable( 29 );
		if ( parameters.vertexUvs )
			_programLayers.enable( 30 );
		if ( parameters.vertexTangents )
			_programLayers.enable( 31 );
		if ( parameters.uvsVertexOnly )
			_programLayers.enable( 32 );
		if ( parameters.fog )
			_programLayers.enable( 33 );

		array.push( _programLayers.mask );
		_programLayers.disableAll();

		if ( parameters.useFog )
			_programLayers.enable( 0 );
		if ( parameters.flatShading )
			_programLayers.enable( 1 );
		if ( parameters.logarithmicDepthBuffer )
			_programLayers.enable( 2 );
		if ( parameters.skinning )
			_programLayers.enable( 3 );
		if ( parameters.morphTargets )
			_programLayers.enable( 4 );
		if ( parameters.morphNormals )
			_programLayers.enable( 5 );
		if ( parameters.morphColors )
			_programLayers.enable( 6 );
		if ( parameters.premultipliedAlpha )
			_programLayers.enable( 7 );
		if ( parameters.shadowMapEnabled )
			_programLayers.enable( 8 );
		if ( parameters.physicallyCorrectLights )
			_programLayers.enable( 9 );
		if ( parameters.doubleSided )
			_programLayers.enable( 10 );
		if ( parameters.flipSided )
			_programLayers.enable( 11 );
		if ( parameters.useDepthPacking )
			_programLayers.enable( 12 );
		if ( parameters.dithering )
			_programLayers.enable( 13 );
		if ( parameters.specularIntensityMap )
			_programLayers.enable( 14 );
		if ( parameters.specularColorMap )
			_programLayers.enable( 15 );
		if ( parameters.transmission )
			_programLayers.enable( 16 );
		if ( parameters.transmissionMap )
			_programLayers.enable( 17 );
		if ( parameters.thicknessMap )
			_programLayers.enable( 18 );
		if ( parameters.sheen )
			_programLayers.enable( 19 );
		if ( parameters.sheenColorMap )
			_programLayers.enable( 20 );
		if ( parameters.sheenRoughnessMap )
			_programLayers.enable( 21 );
		if ( parameters.decodeVideoTexture )
			_programLayers.enable( 22 );
		if ( parameters.opaque )
			_programLayers.enable( 23 );

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
