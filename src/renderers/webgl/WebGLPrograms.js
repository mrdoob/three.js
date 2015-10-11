THREE.WebGLPrograms = function ( renderer, capabilities ) {

	var programs = [];

	var shaderIDs = {
		MeshDepthMaterial: 'depth',
		MeshNormalMaterial: 'normal',
		MeshBasicMaterial: 'basic',
		MeshLambertMaterial: 'lambert',
		MeshPhongMaterial: 'phong',
		LineBasicMaterial: 'basic',
		LineDashedMaterial: 'dashed',
		PointsMaterial: 'points'
	};

	var parameterNames = [
		"precision", "supportsVertexTextures", "map", "envMap", "envMapMode",
		"lightMap", "aoMap", "emissiveMap", "bumpMap", "normalMap", "displacementMap", "specularMap",
		"alphaMap", "combine", "vertexColors", "fog", "useFog", "fogExp",
		"flatShading", "sizeAttenuation", "logarithmicDepthBuffer", "skinning",
		"maxBones", "useVertexTexture", "morphTargets", "morphNormals",
		"maxMorphTargets", "maxMorphNormals", "maxDirLights", "maxPointLights",
		"maxSpotLights", "maxHemiLights", "maxShadows", "shadowMapEnabled", "pointLightShadows",
		"shadowMapType", "shadowMapDebug", "alphaTest", "metal", "doubleSided",
		"flipSided"
	];


	function allocateBones ( object ) {

		if ( capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture ) {

			return 1024;

		} else {

			// default for when object is not specified
			// ( for example when prebuilding shader to be used with multiple objects )
			//
			//  - leave some extra space for other uniforms
			//  - limit here is ANGLE's 254 max uniform vectors
			//    (up to 54 should be safe)

			var nVertexUniforms = capabilities.maxVertexUniforms;
			var nVertexMatrices = Math.floor( ( nVertexUniforms - 20 ) / 4 );

			var maxBones = nVertexMatrices;

			if ( object !== undefined && object instanceof THREE.SkinnedMesh ) {

				maxBones = Math.min( object.skeleton.bones.length, maxBones );

				if ( maxBones < object.skeleton.bones.length ) {

					console.warn( 'WebGLRenderer: too many bones - ' + object.skeleton.bones.length + ', this GPU supports just ' + maxBones + ' (try OpenGL instead of ANGLE)' );

				}

			}

			return maxBones;

		}

	}

	function allocateLights( lights ) {

		var dirLights = 0;
		var pointLights = 0;
		var spotLights = 0;
		var hemiLights = 0;

		for ( var l = 0, ll = lights.length; l < ll; l ++ ) {

			var light = lights[ l ];

			if ( light.visible === false ) continue;

			if ( light instanceof THREE.DirectionalLight ) dirLights ++;
			if ( light instanceof THREE.PointLight ) pointLights ++;
			if ( light instanceof THREE.SpotLight ) spotLights ++;
			if ( light instanceof THREE.HemisphereLight ) hemiLights ++;

		}

		return { 'directional': dirLights, 'point': pointLights, 'spot': spotLights, 'hemi': hemiLights };

	}

	function allocateShadows( lights ) {

		var maxShadows = 0;
		var pointLightShadows = 0;

		for ( var l = 0, ll = lights.length; l < ll; l ++ ) {

			var light = lights[ l ];

			if ( ! light.castShadow ) continue;

			if ( light instanceof THREE.SpotLight || light instanceof THREE.DirectionalLight ) maxShadows ++;
			if ( light instanceof THREE.PointLight ) {

				maxShadows ++;
				pointLightShadows ++;

			}

		}

		return { 'maxShadows': maxShadows, 'pointLightShadows': pointLightShadows };

	}

	this.getParameters = function ( material, lights, fog, object ) {

		var shaderID = shaderIDs[ material.type ];
		// heuristics to create shader parameters according to lights in the scene
		// (not to blow over maxLights budget)

		var maxLightCount = allocateLights( lights );
		var allocatedShadows = allocateShadows( lights );
		var maxBones = allocateBones( object );
		var precision = renderer.getPrecision();

		if ( material.precision !== null ) {

			precision = capabilities.getMaxPrecision( material.precision );

			if ( precision !== material.precision ) {

				console.warn( 'THREE.WebGLRenderer.initMaterial:', material.precision, 'not supported, using', precision, 'instead.' );

			}

		}

		var parameters = {

			shaderID: shaderID,

			precision: precision,
			supportsVertexTextures: capabilities.vertexTextures,

			map: !! material.map,
			envMap: !! material.envMap,
			envMapMode: material.envMap && material.envMap.mapping,
			lightMap: !! material.lightMap,
			aoMap: !! material.aoMap,
			emissiveMap: !! material.emissiveMap,
			bumpMap: !! material.bumpMap,
			normalMap: !! material.normalMap,
			displacementMap: !! material.displacementMap,
			specularMap: !! material.specularMap,
			alphaMap: !! material.alphaMap,

			combine: material.combine,

			vertexColors: material.vertexColors,

			fog: fog,
			useFog: material.fog,
			fogExp: fog instanceof THREE.FogExp2,

			flatShading: material.shading === THREE.FlatShading,

			sizeAttenuation: material.sizeAttenuation,
			logarithmicDepthBuffer: capabilities.logarithmicDepthBuffer,

			skinning: material.skinning,
			maxBones: maxBones,
			useVertexTexture: capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture,

			morphTargets: material.morphTargets,
			morphNormals: material.morphNormals,
			maxMorphTargets: renderer.maxMorphTargets,
			maxMorphNormals: renderer.maxMorphNormals,

			maxDirLights: maxLightCount.directional,
			maxPointLights: maxLightCount.point,
			maxSpotLights: maxLightCount.spot,
			maxHemiLights: maxLightCount.hemi,

			maxShadows: allocatedShadows.maxShadows,
			pointLightShadows: allocatedShadows.pointLightShadows,
			shadowMapEnabled: renderer.shadowMap.enabled && object.receiveShadow && allocatedShadows.maxShadows > 0,
			shadowMapType: renderer.shadowMap.type,
			shadowMapDebug: renderer.shadowMap.debug,

			alphaTest: material.alphaTest,
			metal: material.metal,
			doubleSided: material.side === THREE.DoubleSide,
			flipSided: material.side === THREE.BackSide

		};

		return parameters;

	};

	this.getProgramCode = function ( material, parameters ) {

		var chunks = [];

		if ( parameters.shaderID ) {

			chunks.push( parameters.shaderID );

		} else {

			chunks.push( material.fragmentShader );
			chunks.push( material.vertexShader );

		}

		if ( material.defines !== undefined ) {

			for ( var name in material.defines ) {

				chunks.push( name );
				chunks.push( material.defines[ name ] );

			}

		}

		for ( var i = 0; i < parameterNames.length; i ++ ) {

			var parameterName = parameterNames[ i ];
			chunks.push( parameterName );
			chunks.push( parameters[ parameterName ] );

		}

		return chunks.join();

	};

	this.acquireProgram = function ( material, parameters, code ) {

		var program;

		// Check if code has been already compiled
		for ( var p = 0, pl = programs.length; p < pl; p ++ ) {

			var programInfo = programs[ p ];

			if ( programInfo.code === code ) {

				program = programInfo;
				++ program.usedTimes;

				break;

			}

		}

		if ( program === undefined ) {

			program = new THREE.WebGLProgram( renderer, code, material, parameters );
			programs.push( program );

		}

		return program;

	};

	this.releaseProgram = function( program ) {

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

};
