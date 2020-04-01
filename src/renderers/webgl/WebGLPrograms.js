/**
 * @author mrdoob / http://mrdoob.com/
 */

import { BackSide, DoubleSide, UVMapping, CubeUVRefractionMapping, CubeUVReflectionMapping, WorldMapping, LinearEncoding, ObjectSpaceNormalMap, TangentSpaceNormalMap, NoToneMapping } from '../../constants.js';
import { WebGLProgram } from './WebGLProgram.js';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { UniformsUtils } from '../shaders/UniformsUtils.js';

function WebGLPrograms( renderer, extensions, capabilities ) {

	var programs = [];

	var isWebGL2 = capabilities.isWebGL2;
	var logarithmicDepthBuffer = capabilities.logarithmicDepthBuffer;
	var floatVertexTextures = capabilities.floatVertexTextures;
	var precision = capabilities.precision;
	var maxVertexUniforms = capabilities.maxVertexUniforms;
	var vertexTextures = capabilities.vertexTextures;

	var shaderIDs = {
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

	var parameterNames = [
		"precision", "isWebGL2", "supportsVertexTextures", "outputEncoding", "instancing",
		"map", "mapEncoding", "matcap", "matcapEncoding", "envMap", "envMapMode", "envMapEncoding", "envMapCubeUV",
		"lightMap", "lightMapEncoding", "aoMap", "emissiveMap", "emissiveMapEncoding", "bumpMap", "normalMap", "objectSpaceNormalMap", "tangentSpaceNormalMap", "clearcoatMap", "clearcoatRoughnessMap", "clearcoatNormalMap", "displacementMap", "specularMap",
		"roughnessMap", "metalnessMap", "gradientMap",
		"alphaMap", "combine", "vertexColors", "vertexTangents", "vertexUvs", "uvsVertexOnly", "fog", "useFog", "fogExp2",
		"flatShading", "sizeAttenuation", "logarithmicDepthBuffer", "skinning",
		"maxBones", "useVertexTexture", "morphTargets", "morphNormals",
		"maxMorphTargets", "maxMorphNormals", "premultipliedAlpha",
		"numDirLights", "numPointLights", "numSpotLights", "numHemiLights", "numRectAreaLights",
		"numDirLightShadows", "numPointLightShadows", "numSpotLightShadows",
		"shadowMapEnabled", "shadowMapType", "toneMapping", 'physicallyCorrectLights',
		"alphaTest", "doubleSided", "flipSided", "numClippingPlanes", "numClipIntersection", "depthPacking", "dithering",
		"sheen"
	];

	function getShaderObject( material, shaderID ) {

		var shaderobject;

		if ( shaderID ) {

			var shader = ShaderLib[ shaderID ];

			shaderobject = {
				name: material.type,
				uniforms: UniformsUtils.clone( shader.uniforms ),
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader
			};

		} else {

			shaderobject = {
				name: material.type,
				uniforms: material.uniforms,
				vertexShader: material.vertexShader,
				fragmentShader: material.fragmentShader
			};

		}

		return shaderobject;

	}

	function allocateBones( object ) {

		var skeleton = object.skeleton;
		var bones = skeleton.bones;

		if ( floatVertexTextures ) {

			return 1024;

		} else {

			// default for when object is not specified
			// ( for example when prebuilding shader to be used with multiple objects )
			//
			//  - leave some extra space for other uniforms
			//  - limit here is ANGLE's 254 max uniform vectors
			//    (up to 54 should be safe)

			var nVertexUniforms = maxVertexUniforms;
			var nVertexMatrices = Math.floor( ( nVertexUniforms - 20 ) / 4 );

			var maxBones = Math.min( nVertexMatrices, bones.length );

			if ( maxBones < bones.length ) {

				console.warn( 'THREE.WebGLRenderer: Skeleton has ' + bones.length + ' bones. This GPU supports ' + maxBones + '.' );
				return 0;

			}

			return maxBones;

		}

	}

	function getTextureEncodingFromMap( map ) {

		var encoding;

		if ( ! map ) {

			encoding = LinearEncoding;

		} else if ( map.isTexture ) {

			encoding = map.encoding;

		} else if ( map.isWebGLRenderTarget ) {

			console.warn( "THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead." );
			encoding = map.texture.encoding;

		}

		return encoding;

	}

	function getTextureMappingFromMap( map ) {

		var mapping;

		if ( ! map ) {

			mapping = UVMapping;

		} else if ( map.isTexture ) {

			mapping = map.mapping;

		} else if ( map.isWebGLRenderTarget ) {

			console.warn( "THREE.WebGLPrograms.getTextureMappingFromMap: don't use render targets as textures. Use their .texture property instead." );
			mapping = map.texture.mapping;

		}

		return mapping;

	}

	this.getParameters = function ( material, lights, shadows, scene, nClipPlanes, nClipIntersection, object ) {

		var fog = scene.fog;
		var environment = material.isMeshStandardMaterial ? scene.environment : null;

		var envMap = material.envMap || environment;

		var shaderID = shaderIDs[ material.type ];

		// heuristics to create shader parameters according to lights in the scene
		// (not to blow over maxLights budget)

		var maxBones = object.isSkinnedMesh ? allocateBones( object ) : 0;

		if ( material.precision !== null ) {

			precision = capabilities.getMaxPrecision( material.precision );

			if ( precision !== material.precision ) {

				console.warn( 'THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', precision, 'instead.' );

			}

		}

		var shaderobject = getShaderObject( material, shaderID );
		material.onBeforeCompile( shaderobject, renderer );

		var currentRenderTarget = renderer.getRenderTarget();

		var parameters = {

			isWebGL2: isWebGL2,

			shaderID: shaderID,
			shaderName: shaderobject.name,

			uniforms: shaderobject.uniforms,
			vertexShader: shaderobject.vertexShader,
			fragmentShader: shaderobject.fragmentShader,
			defines: material.defines,

			isRawShaderMaterial: material.isRawShaderMaterial,
			isShaderMaterial: material.isShaderMaterial,

			precision: precision,

			instancing: object.isInstancedMesh === true,

			supportsVertexTextures: vertexTextures,
			outputEncoding: ( currentRenderTarget !== null ) ? getTextureEncodingFromMap( currentRenderTarget.texture ) : renderer.outputEncoding,
			map: !! material.map,
			mapEncoding: getTextureEncodingFromMap( material.map ),
			mapMapping: getTextureMappingFromMap( material.map ),
			matcap: !! material.matcap,
			matcapEncoding: getTextureEncodingFromMap( material.matcap ),
			envMap: !! envMap,
			envMapMode: envMap && envMap.mapping,
			envMapEncoding: getTextureEncodingFromMap( envMap ),
			envMapCubeUV: ( !! envMap ) && ( ( envMap.mapping === CubeUVReflectionMapping ) || ( envMap.mapping === CubeUVRefractionMapping ) ),
			lightMap: !! material.lightMap,
			lightMapEncoding: getTextureEncodingFromMap( material.lightMap ),
			aoMap: !! material.aoMap,
			aoMapMapping: getTextureMappingFromMap ( material.aoMap ),
			emissiveMap: !! material.emissiveMap,
			emissiveMapEncoding: getTextureEncodingFromMap( material.emissiveMap ),
			emissiveMapMapping: getTextureMappingFromMap( material.emissiveMap ),
			bumpMap: !! material.bumpMap,
			bumpMapMapping: getTextureMappingFromMap( material.bumpMap ),
			normalMap: !! material.normalMap,
			normalMapMapping: getTextureMappingFromMap( material.normalMap ),
			objectSpaceNormalMap: material.normalMapType === ObjectSpaceNormalMap,
			tangentSpaceNormalMap: material.normalMapType === TangentSpaceNormalMap,
			clearcoatMap: !! material.clearcoatMap,
			clearcoatMapMapping: getTextureMappingFromMap( material.clearcoatMap ),
			clearcoatRoughnessMap: !! material.clearcoatRoughnessMap,
			clearcoatRoughnessMapMapping: getTextureMappingFromMap( material.clearcoatRoughnessMap ),
			clearcoatNormalMap: !! material.clearcoatNormalMap,
			clearcoatNormalMapMapping: getTextureMappingFromMap( material.clearcoatNormalMapMapping ),
			displacementMap: !! material.displacementMap,
			displacementMapMapping: getTextureMappingFromMap( material.displacementMap ),
			roughnessMap: !! material.roughnessMap,
			roughnessMapMapping: getTextureMappingFromMap( material.roughnessMap ),
			metalnessMap: !! material.metalnessMap,
			metalnessMapMapping: getTextureMappingFromMap( material.metalnessMap ),
			specularMap: !! material.specularMap,
			specularMapMapping: getTextureMappingFromMap( material.specularMap ),
			alphaMap: !! material.alphaMap,
			alphaMapMapping: getTextureMappingFromMap( material.alphaMap ),

			gradientMap: !! material.gradieUVMappingntMap,

			sheen: !! material.sheen,

			combine: material.combine,

			vertexTangents: ( material.normalMap && material.vertexTangents ),
			vertexColors: material.vertexColors,
			vertexUvs: ( material.map && material.map.mapping === UVMapping ) || ( material.bumpMap && material.bumpMap.mapping === UVMapping ) || ( material.normalMap && material.normalMap.mapping === UVMapping ) || ( material.alphaMap && material.alphaMap.mapping === UVMapping ) || ( material.emissiveMap && material.emissiveMap.mapping === UVMapping ) || ( material.roughnessMap && material.roughnessMap.mapping === UVMapping ) || ( material.metalnessMap && material.metalnessMap.mapping === UVMapping ) || ( material.clearcoatNormalMap && material.clearcoatNormalMap.mapping === UVMapping ) || ( material.clearcoatRoughnessMap && material.clearcoatRoughnessMap.mapping === UVMapping ) || ( material.displacementMap && material.displacementMap.mapping === UVMapping ),
			uvsVertexOnly: ! ( !! material.map || !! material.bumpMap || !! material.normalMap || !! material.specularMap || !! material.alphaMap || !! material.emissiveMap || !! material.roughnessMap || !! material.metalnessMap || !! material.clearcoatNormalMap ) && !! material.displacementMap,
			worldUvs : object.worldMappingAxes && (material.map && material.map.mapping === WorldMapping) || (material.bumpMap && material.bumpMap.mapping === WorldMapping) || (material.normalMap && material.normalMap.mapping === WorldMapping) || (material.alphaMap && material.alphaMap.mapping === WorldMapping) || (material.emissiveMap && material.emissiveMap.mapping === WorldMapping) || (material.roughnessMap && material.roughnessMap.mapping === WorldMapping) || (material.metalnessMap && material.metalnessMap.mapping === WorldMapping) || (material.clearcoatNormalMap && material.clearcoatNormalMap.mapping === WorldMapping) || (material.clearcoatRoughnessMap && material.clearcoatRoughnessMap.mapping === WorldMapping),

			worldUvsAxes: object.worldMappingAxes,

			fog: !! fog,
			useFog: material.fog,
			fogExp2: ( fog && fog.isFogExp2 ),

			flatShading: material.flatShading,

			sizeAttenuation: material.sizeAttenuation,
			logarithmicDepthBuffer: logarithmicDepthBuffer,

			skinning: material.skinning && maxBones > 0,
			maxBones: maxBones,
			useVertexTexture: floatVertexTextures,

			morphTargets: material.morphTargets,
			morphNormals: material.morphNormals,
			maxMorphTargets: renderer.maxMorphTargets,
			maxMorphNormals: renderer.maxMorphNormals,

			numDirLights: lights.directional.length,
			numPointLights: lights.point.length,
			numSpotLights: lights.spot.length,
			numRectAreaLights: lights.rectArea.length,
			numHemiLights: lights.hemi.length,

			numDirLightShadows: lights.directionalShadowMap.length,
			numPointLightShadows: lights.pointShadowMap.length,
			numSpotLightShadows: lights.spotShadowMap.length,

			numClippingPlanes: nClipPlanes,
			numClipIntersection: nClipIntersection,

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

			rendererExtensionFragDepth: isWebGL2 || extensions.get( 'EXT_frag_depth' ) !== null,
			rendererExtensionDrawBuffers: isWebGL2 || extensions.get( 'WEBGL_draw_buffers' ) !== null,
			rendererExtensionShaderTextureLod: isWebGL2 || extensions.get( 'EXT_shader_texture_lod' ) !== null,

			onBeforeCompile: material.onBeforeCompile

		};

		return parameters;

	};

	this.getProgramCacheKey = function ( parameters ) {

		var array = [];

		if ( parameters.shaderID ) {

			array.push( parameters.shaderID );

		} else {

			array.push( parameters.fragmentShader );
			array.push( parameters.vertexShader );

		}

		if ( parameters.defines !== undefined ) {

			for ( var name in parameters.defines ) {

				array.push( name );
				array.push( parameters.defines[ name ] );

			}

		}

		if ( parameters.isRawShaderMaterial === undefined ) {

			for ( var i = 0; i < parameterNames.length; i ++ ) {

				array.push( parameters[ parameterNames[ i ] ] );

			}

			array.push( renderer.outputEncoding );
			array.push( renderer.gammaFactor );

		}

		array.push( parameters.onBeforeCompile.toString() );

		return array.join();

	};

	this.acquireProgram = function ( parameters, cacheKey ) {

		var program;

		// Check if code has been already compiled
		for ( var p = 0, pl = programs.length; p < pl; p ++ ) {

			var preexistingProgram = programs[ p ];

			if ( preexistingProgram.cacheKey === cacheKey ) {

				program = preexistingProgram;
				++ program.usedTimes;

				break;

			}

		}

		if ( program === undefined ) {

			program = new WebGLProgram( renderer, cacheKey, parameters );
			programs.push( program );

		}

		return program;

	};

	this.releaseProgram = function ( program ) {

		if ( -- program.usedTimes === 0 ) {

			// Remove from unordered set
			var i = programs.indexOf( program );
			programs[ i ] = programs[ programs.length - 1 ];
			programs.pop();

			// Free WebGL resources
			program.destroy();

		}

	};

	// Exposed for resource monitoring & error feedback via renderer.info:
	this.programs = programs;

}


export { WebGLPrograms };
