import { BackSide, DoubleSide, CubeUVRefractionMapping, CubeUVReflectionMapping, LinearEncoding, sRGBEncoding, ObjectSpaceNormalMap, TangentSpaceNormalMap, NoToneMapping, RGBAFormat, UnsignedByteType } from '../../constants.js';
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

		if ( isWebGL2 && map && map.isTexture && map.format === RGBAFormat && map.type === UnsignedByteType && map.encoding === sRGBEncoding ) {

			encoding = LinearEncoding; // disable inline decode for sRGB textures in WebGL 2

		}

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
			fogExp2: ( fog && fog.isFogExp2 ),

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
		array.push( parameters.mapEncoding );
		array.push( parameters.matcapEncoding );
		array.push( parameters.envMapMode );
		array.push( parameters.envMapEncoding );
		array.push( parameters.lightMapEncoding );
		array.push( parameters.emissiveMapEncoding );
		array.push( parameters.combine );
		array.push( parameters.vertexUvs );
		array.push( parameters.fogExp2 );
		array.push( parameters.sizeAttenuation );
		array.push( parameters.maxBones );
		array.push( parameters.morphTargetsCount );
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
		array.push( parameters.format );
		array.push( parameters.specularColorMapEncoding );
		array.push( parameters.sheenColorMapEncoding );

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
		if ( parameters.envMapCubeUV )
			_programLayers.enable( 7 );
		if ( parameters.lightMap )
			_programLayers.enable( 8 );
		if ( parameters.aoMap )
			_programLayers.enable( 9 );
		if ( parameters.emissiveMap )
			_programLayers.enable( 10 );
		if ( parameters.bumpMap )
			_programLayers.enable( 11 );
		if ( parameters.normalMap )
			_programLayers.enable( 12 );
		if ( parameters.objectSpaceNormalMap )
			_programLayers.enable( 13 );
		if ( parameters.tangentSpaceNormalMap )
			_programLayers.enable( 14 );
		if ( parameters.clearcoat )
			_programLayers.enable( 15 );
		if ( parameters.clearcoatMap )
			_programLayers.enable( 16 );
		if ( parameters.clearcoatRoughnessMap )
			_programLayers.enable( 17 );
		if ( parameters.clearcoatNormalMap )
			_programLayers.enable( 18 );
		if ( parameters.displacementMap )
			_programLayers.enable( 19 );
		if ( parameters.specularMap )
			_programLayers.enable( 20 );
		if ( parameters.roughnessMap )
			_programLayers.enable( 21 );
		if ( parameters.metalnessMap )
			_programLayers.enable( 22 );
		if ( parameters.gradientMap )
			_programLayers.enable( 23 );
		if ( parameters.alphaMap )
			_programLayers.enable( 24 );
		if ( parameters.alphaTest )
			_programLayers.enable( 25 );
		if ( parameters.vertexColors )
			_programLayers.enable( 26 );
		if ( parameters.vertexAlphas )
			_programLayers.enable( 27 );
		if ( parameters.vertexUvs )
			_programLayers.enable( 28 );
		if ( parameters.vertexTangents )
			_programLayers.enable( 29 );
		if ( parameters.uvsVertexOnly )
			_programLayers.enable( 30 );
		if ( parameters.fog )
			_programLayers.enable( 31 );

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
		if ( parameters.useVertexTexture )
			_programLayers.enable( 4 );
		if ( parameters.morphTargets )
			_programLayers.enable( 5 );
		if ( parameters.morphNormals )
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
		if ( parameters.depthPacking )
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
