/**
 * @author mrdoob / http://mrdoob.com/
 */

import { BackSide, DoubleSide, CubeUVRefractionMapping, CubeUVReflectionMapping, LinearEncoding, ObjectSpaceNormalMap, TangentSpaceNormalMap, NoToneMapping } from '../../constants.js';
import { WebGLProgram } from './WebGLProgram.js';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { UniformsUtils } from '../shaders/UniformsUtils.js';

class WebGLPrograms {

	constructor( renderer, extensions, capabilities ) {

		this.renderer = renderer;
		this.extensions = extensions;
		this.capabilities = capabilities;
		// Exposed for resource monitoring & error feedback via renderer.info:
		this.programs = [];
		this.isWebGL2 = capabilities.isWebGL2;
		this.logarithmicDepthBuffer = capabilities.logarithmicDepthBuffer;
		this.floatVertexTextures = capabilities.floatVertexTextures;
		this.precision = capabilities.precision;
		this.maxVertexUniforms = capabilities.maxVertexUniforms;
		this.vertexTextures = capabilities.vertexTextures;
		this.shaderIDs = {
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
		this.parameterNames = [
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

	}

	getShaderObject( material, shaderID ) {

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
	allocateBones( object ) {

		var skeleton = object.skeleton;
		var bones = skeleton.bones;
		if ( this.floatVertexTextures ) {

			return 1024;

		} else {

			// default for when object is not specified
			// ( for example when prebuilding shader to be used with multiple objects )
			//
			//  - leave some extra space for other uniforms
			//  - limit here is ANGLE's 254 max uniform vectors
			//    (up to 54 should be safe)
			var nVertexUniforms = this.maxVertexUniforms;
			var nVertexMatrices = Math.floor( ( nVertexUniforms - 20 ) / 4 );
			var maxBones = Math.min( nVertexMatrices, bones.length );
			if ( maxBones < bones.length ) {

				console.warn( 'THREE.WebGLRenderer: Skeleton has ' + bones.length + ' bones. This GPU supports ' + maxBones + '.' );
				return 0;

			}
			return maxBones;

		}

	}
	getTextureEncodingFromMap( map ) {

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

	getParameters( material, lights, shadows, scene, nClipPlanes, nClipIntersection, object ) {

		var fog = scene.fog;
		var environment = material.isMeshStandardMaterial ? scene.environment : null;
		var envMap = material.envMap || environment;
		var shaderID = this.shaderIDs[ material.type ];
		// heuristics to create shader parameters according to lights in the scene
		// (not to blow over maxLights budget)
		var maxBones = object.isSkinnedMesh ? this.allocateBones( object ) : 0;
		if ( material.precision !== null ) {

			this.precision = this.capabilities.getMaxPrecision( material.precision );
			if ( this.precision !== material.precision ) {

				console.warn( 'THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', this.precision, 'instead.' );

			}

		}
		var shaderobject = this.getShaderObject( material, shaderID );
		material.onBeforeCompile( shaderobject, this.renderer );
		var currentRenderTarget = this.renderer.getRenderTarget();
		var parameters = {
			isWebGL2: this.isWebGL2,
			shaderID: shaderID,
			shaderName: shaderobject.name,
			uniforms: shaderobject.uniforms,
			vertexShader: shaderobject.vertexShader,
			fragmentShader: shaderobject.fragmentShader,
			defines: material.defines,
			isRawShaderMaterial: material.isRawShaderMaterial,
			isShaderMaterial: material.isShaderMaterial,
			precision: this.precision,
			instancing: object.isInstancedMesh === true,
			supportsVertexTextures: this.vertexTextures,
			outputEncoding: ( currentRenderTarget !== null ) ? this.getTextureEncodingFromMap( currentRenderTarget.texture ) : this.renderer.outputEncoding,
			map: !! material.map,
			mapEncoding: this.getTextureEncodingFromMap( material.map ),
			matcap: !! material.matcap,
			matcapEncoding: this.getTextureEncodingFromMap( material.matcap ),
			envMap: !! envMap,
			envMapMode: envMap && envMap.mapping,
			envMapEncoding: this.getTextureEncodingFromMap( envMap ),
			envMapCubeUV: ( !! envMap ) && ( ( envMap.mapping === CubeUVReflectionMapping ) || ( envMap.mapping === CubeUVRefractionMapping ) ),
			lightMap: !! material.lightMap,
			lightMapEncoding: this.getTextureEncodingFromMap( material.lightMap ),
			aoMap: !! material.aoMap,
			emissiveMap: !! material.emissiveMap,
			emissiveMapEncoding: this.getTextureEncodingFromMap( material.emissiveMap ),
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
			combine: material.combine,
			vertexTangents: ( material.normalMap && material.vertexTangents ),
			vertexColors: material.vertexColors,
			vertexUvs: !! material.map || !! material.bumpMap || !! material.normalMap || !! material.specularMap || !! material.alphaMap || !! material.emissiveMap || !! material.roughnessMap || !! material.metalnessMap || !! material.clearcoatMap || !! material.clearcoatRoughnessMap || !! material.clearcoatNormalMap || !! material.displacementMap,
			uvsVertexOnly: ! ( !! material.map || !! material.bumpMap || !! material.normalMap || !! material.specularMap || !! material.alphaMap || !! material.emissiveMap || !! material.roughnessMap || !! material.metalnessMap || !! material.clearcoatNormalMap ) && !! material.displacementMap,
			fog: !! fog,
			useFog: material.fog,
			fogExp2: ( fog && fog.isFogExp2 ),
			flatShading: material.flatShading,
			sizeAttenuation: material.sizeAttenuation,
			logarithmicDepthBuffer: this.logarithmicDepthBuffer,
			skinning: material.skinning && maxBones > 0,
			maxBones: maxBones,
			useVertexTexture: this.floatVertexTextures,
			morphTargets: material.morphTargets,
			morphNormals: material.morphNormals,
			maxMorphTargets: this.renderer.maxMorphTargets,
			maxMorphNormals: this.renderer.maxMorphNormals,
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
			shadowMapEnabled: this.renderer.shadowMap.enabled && shadows.length > 0,
			shadowMapType: this.renderer.shadowMap.type,
			toneMapping: material.toneMapped ? this.renderer.toneMapping : NoToneMapping,
			physicallyCorrectLights: this.renderer.physicallyCorrectLights,
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
			rendererExtensionFragDepth: this.isWebGL2 || this.extensions.get( 'EXT_frag_depth' ) !== null,
			rendererExtensionDrawBuffers: this.isWebGL2 || this.extensions.get( 'WEBGL_draw_buffers' ) !== null,
			rendererExtensionShaderTextureLod: this.isWebGL2 || this.extensions.get( 'EXT_shader_texture_lod' ) !== null,
			onBeforeCompile: material.onBeforeCompile
		};
		return parameters;

	}

	getProgramCacheKey( parameters ) {

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

			for ( var i = 0; i < this.parameterNames.length; i ++ ) {

				array.push( parameters[ this.parameterNames[ i ] ] );

			}
			array.push( this.renderer.outputEncoding );
			array.push( this.renderer.gammaFactor );

		}
		array.push( parameters.onBeforeCompile.toString() );
		return array.join();

	}

	acquireProgram( parameters, cacheKey ) {

		var program;
		// Check if code has been already compiled
		for ( var p = 0, pl = this.programs.length; p < pl; p ++ ) {

			var preexistingProgram = this.programs[ p ];
			if ( preexistingProgram.cacheKey === cacheKey ) {

				program = preexistingProgram;
				++ program.usedTimes;
				break;

			}

		}
		if ( program === undefined ) {

			program = new WebGLProgram( this.renderer, cacheKey, parameters );
			this.programs.push( program );

		}
		return program;

	}

	releaseProgram( program ) {

		if ( -- program.usedTimes === 0 ) {

			// Remove from unordered set
			var i = this.programs.indexOf( program );
			this.programs[ i ] = this.programs[ this.programs.length - 1 ];
			this.programs.pop();
			// Free WebGL resources
			program.destroy();

		}

	}

}


export { WebGLPrograms };
