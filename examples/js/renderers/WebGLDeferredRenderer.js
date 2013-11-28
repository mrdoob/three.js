/**
 * @author alteredq / http://alteredqualia.com/
 * @author MPanknin / http://www.redplant.de/
 */

THREE.WebGLDeferredRenderer = function ( parameters ) {

	var _this = this;

	var fullWidth = parameters.width !== undefined ? parameters.width : 800;
	var fullHeight = parameters.height !== undefined ? parameters.height : 600;
	var currentScale = parameters.scale !== undefined ? parameters.scale : 1;

	var scaledWidth = Math.floor( currentScale * fullWidth );
	var scaledHeight = Math.floor( currentScale * fullHeight );

	var brightness = parameters.brightness !== undefined ? parameters.brightness : 1;
	var tonemapping = parameters.tonemapping !== undefined ? parameters.tonemapping : THREE.SimpleOperator;
	var antialias = parameters.antialias !== undefined ? parameters.antialias : false;

	this.renderer = parameters.renderer;

	if ( this.renderer === undefined ) {

		this.renderer = new THREE.WebGLRenderer( { alpha: false, antialias: false } );
		this.renderer.setSize( fullWidth, fullHeight );
		this.renderer.setClearColorHex( 0x000000, 0 );

		this.renderer.autoClear = false;

	}

	this.domElement = this.renderer.domElement;

	//

	var gl = this.renderer.context;

	//

	var currentCamera = null;

	var positionVS = new THREE.Vector3();
	var directionVS = new THREE.Vector3();
	var tempVS = new THREE.Vector3();

	var rightVS = new THREE.Vector3();
	var normalVS = new THREE.Vector3();
	var upVS = new THREE.Vector3();

	//

	var geometryLightSphere = new THREE.SphereGeometry( 1, 16, 8 );
	var geometryLightPlane = new THREE.PlaneGeometry( 2, 2 );

	var black = new THREE.Color( 0x000000 );

	var colorShader = THREE.ShaderDeferred[ "color" ];
	var normalDepthShader = THREE.ShaderDeferred[ "normalDepth" ];

	//

	var emissiveLightShader = THREE.ShaderDeferred[ "emissiveLight" ];
	var pointLightShader = THREE.ShaderDeferred[ "pointLight" ];
	var spotLightShader = THREE.ShaderDeferred[ "spotLight" ];
	var directionalLightShader = THREE.ShaderDeferred[ "directionalLight" ];
	var hemisphereLightShader = THREE.ShaderDeferred[ "hemisphereLight" ];
	var areaLightShader = THREE.ShaderDeferred[ "areaLight" ];

	var compositeShader = THREE.ShaderDeferred[ "composite" ];

	//

	var compColor, compNormal, compDepth, compLight, compFinal;
	var passColor, passNormal, passDepth, passLightFullscreen, passLightProxy, compositePass;

	var effectFXAA;

	//

	var lightSceneFullscreen, lightSceneProxy;

	//

	var resizableMaterials = [];

	//

	var invisibleMaterial = new THREE.ShaderMaterial();
	invisibleMaterial.visible = false;


	var defaultNormalDepthMaterial = new THREE.ShaderMaterial( {

		uniforms:       THREE.UniformsUtils.clone( normalDepthShader.uniforms ),
		vertexShader:   normalDepthShader.vertexShader,
		fragmentShader: normalDepthShader.fragmentShader,
		blending:		THREE.NoBlending

	} );

	//

	var initDeferredMaterials = function ( object ) {

		if ( object.material instanceof THREE.MeshFaceMaterial ) {

			var colorMaterials = [];
			var normalDepthMaterials = [];

			var materials = object.material.materials;

			for ( var i = 0, il = materials.length; i < il; i ++ ) {

				var deferredMaterials = createDeferredMaterials( materials[ i ] );

				if ( deferredMaterials.transparent ) {

					colorMaterials.push( invisibleMaterial );
					normalDepthMaterials.push( invisibleMaterial );

				} else {

					colorMaterials.push( deferredMaterials.colorMaterial );
					normalDepthMaterials.push( deferredMaterials.normalDepthMaterial );

				}

			}

			object.userData.colorMaterial = new THREE.MeshFaceMaterial( colorMaterials );
			object.userData.normalDepthMaterial = new THREE.MeshFaceMaterial( normalDepthMaterials );

		} else {

			var deferredMaterials = createDeferredMaterials( object.material );

			object.userData.colorMaterial = deferredMaterials.colorMaterial;
			object.userData.normalDepthMaterial = deferredMaterials.normalDepthMaterial;
			object.userData.transparent = deferredMaterials.transparent;

		}

	};

	var createDeferredMaterials = function ( originalMaterial ) {

		var deferredMaterials = {};

		// color material
		// -----------------
		// 	diffuse color
		//	specular color
		//	shininess
		//	diffuse map
		//	vertex colors
		//	alphaTest
		// 	morphs

		var uniforms = THREE.UniformsUtils.clone( colorShader.uniforms );
		var defines = { "USE_MAP": !! originalMaterial.map, "USE_ENVMAP": !! originalMaterial.envMap, "GAMMA_INPUT": true };

		var material = new THREE.ShaderMaterial( {

			fragmentShader: colorShader.fragmentShader,
			vertexShader: 	colorShader.vertexShader,
			uniforms: 		uniforms,
			defines: 		defines,
			shading:		originalMaterial.shading

		} );

		if ( originalMaterial instanceof THREE.MeshBasicMaterial ) {

			var diffuse = black;
			var emissive = originalMaterial.color;

		} else {

			var diffuse = originalMaterial.color;
			var emissive = originalMaterial.emissive !== undefined ? originalMaterial.emissive : black;

		}

		var specular = originalMaterial.specular !== undefined ? originalMaterial.specular : black;
		var shininess = originalMaterial.shininess !== undefined ? originalMaterial.shininess : 1;
		var wrapAround = originalMaterial.wrapAround !== undefined ? ( originalMaterial.wrapAround ? -1 : 1 ) : 1;
		var additiveSpecular = originalMaterial.metal !== undefined ? ( originalMaterial.metal ? 1 : -1 ) : -1;

		uniforms.emissive.value.copyGammaToLinear( emissive );
		uniforms.diffuse.value.copyGammaToLinear( diffuse );
		uniforms.specular.value.copyGammaToLinear( specular );
		uniforms.shininess.value = shininess;
		uniforms.wrapAround.value = wrapAround;
		uniforms.additiveSpecular.value = additiveSpecular;

		uniforms.map.value = originalMaterial.map;

		if ( originalMaterial.envMap ) {

			uniforms.envMap.value = originalMaterial.envMap;
			uniforms.useRefract.value = originalMaterial.envMap.mapping instanceof THREE.CubeRefractionMapping;
			uniforms.refractionRatio.value = originalMaterial.refractionRatio;
			uniforms.combine.value = originalMaterial.combine;
			uniforms.reflectivity.value = originalMaterial.reflectivity;
			uniforms.flipEnvMap.value = ( originalMaterial.envMap instanceof THREE.WebGLRenderTargetCube ) ? 1 : -1;

			uniforms.samplerNormalDepth.value = compNormalDepth.renderTarget2;
			uniforms.viewWidth.value = scaledWidth;
			uniforms.viewHeight.value = scaledHeight;

			resizableMaterials.push( { "material": material } );

		}

		material.vertexColors = originalMaterial.vertexColors;
		material.morphTargets = originalMaterial.morphTargets;
		material.morphNormals = originalMaterial.morphNormals;
		material.skinning = originalMaterial.skinning;

		material.alphaTest = originalMaterial.alphaTest;
		material.wireframe = originalMaterial.wireframe;

		// uv repeat and offset setting priorities
		//	1. color map
		//	2. specular map
		//	3. normal map
		//	4. bump map

		var uvScaleMap;

		if ( originalMaterial.map ) {

			uvScaleMap = originalMaterial.map;

		} else if ( originalMaterial.specularMap ) {

			uvScaleMap = originalMaterial.specularMap;

		} else if ( originalMaterial.normalMap ) {

			uvScaleMap = originalMaterial.normalMap;

		} else if ( originalMaterial.bumpMap ) {

			uvScaleMap = originalMaterial.bumpMap;

		}

		if ( uvScaleMap !== undefined ) {

			var offset = uvScaleMap.offset;
			var repeat = uvScaleMap.repeat;

			uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

		}

		deferredMaterials.colorMaterial = material;

		// normal + depth material
		// -----------------
		//	vertex normals
		//	morph normals
		//	bump map
		//	bump scale
		//  clip depth

		if ( originalMaterial.morphTargets || originalMaterial.skinning || originalMaterial.bumpMap ) {

			var uniforms = THREE.UniformsUtils.clone( normalDepthShader.uniforms );
			var defines = { "USE_BUMPMAP": !!originalMaterial.bumpMap };

			var normalDepthMaterial = new THREE.ShaderMaterial( {

				uniforms:       uniforms,
				vertexShader:   normalDepthShader.vertexShader,
				fragmentShader: normalDepthShader.fragmentShader,
				shading:		originalMaterial.shading,
				defines:		defines,
				blending:		THREE.NoBlending

			} );

			normalDepthMaterial.morphTargets = originalMaterial.morphTargets;
			normalDepthMaterial.morphNormals = originalMaterial.morphNormals;
			normalDepthMaterial.skinning = originalMaterial.skinning;

			if ( originalMaterial.bumpMap ) {

				uniforms.bumpMap.value = originalMaterial.bumpMap;
				uniforms.bumpScale.value = originalMaterial.bumpScale;

				var offset = originalMaterial.bumpMap.offset;
				var repeat = originalMaterial.bumpMap.repeat;

				uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

			}

		} else {

			var normalDepthMaterial = defaultNormalDepthMaterial.clone();

		}

		normalDepthMaterial.wireframe = originalMaterial.wireframe;
		normalDepthMaterial.vertexColors = originalMaterial.vertexColors;

		deferredMaterials.normalDepthMaterial = normalDepthMaterial;

		//

		deferredMaterials.transparent = originalMaterial.transparent;

		return deferredMaterials;

	};

	var updatePointLightProxy = function ( lightProxy ) {

		var light = lightProxy.userData.originalLight;
		var uniforms = lightProxy.material.uniforms;

		// skip infinite pointlights
		// right now you can't switch between infinite and finite pointlights
		// it's just too messy as they use different proxies

		var distance = light.distance;

		if ( distance > 0 ) {

			lightProxy.scale.set( 1, 1, 1 ).multiplyScalar( distance );
			uniforms[ "lightRadius" ].value = distance;

			positionVS.getPositionFromMatrix( light.matrixWorld );
			positionVS.applyMatrix4( currentCamera.matrixWorldInverse );

			uniforms[ "lightPositionVS" ].value.copy( positionVS );

			lightProxy.position.getPositionFromMatrix( light.matrixWorld );

		} else {

			uniforms[ "lightRadius" ].value = Infinity;

		}

		// linear space colors

		var intensity = light.intensity * light.intensity;

		uniforms[ "lightIntensity" ].value = intensity;
		uniforms[ "lightColor" ].value.copyGammaToLinear( light.color );

	};

	var createDeferredPointLight = function ( light ) {

		// setup light material

		var materialLight = new THREE.ShaderMaterial( {

			uniforms:       THREE.UniformsUtils.clone( pointLightShader.uniforms ),
			vertexShader:   pointLightShader.vertexShader,
			fragmentShader: pointLightShader.fragmentShader,

			blending:		THREE.AdditiveBlending,
			depthWrite:		false,
			transparent:	true,

			side: THREE.BackSide

		} );

		// infinite pointlights use full-screen quad proxy
		// regular pointlights use sphere proxy

		var  geometry;

		if ( light.distance > 0 ) {

			geometry = geometryLightSphere;

		} else {

			geometry = geometryLightPlane;

			materialLight.depthTest = false;
			materialLight.side = THREE.FrontSide;

		}

		materialLight.uniforms[ "viewWidth" ].value = scaledWidth;
		materialLight.uniforms[ "viewHeight" ].value = scaledHeight;

		materialLight.uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
		materialLight.uniforms[ 'samplerNormalDepth' ].value = compNormalDepth.renderTarget2;

		// create light proxy mesh

		var meshLight = new THREE.Mesh( geometry, materialLight );

		// keep reference for color and intensity updates

		meshLight.userData.originalLight = light;

		// keep reference for size reset

		resizableMaterials.push( { "material": materialLight } );

		// sync proxy uniforms to the original light

		updatePointLightProxy( meshLight );

		return meshLight;

	};

	var updateSpotLightProxy = function ( lightProxy ) {

		var light = lightProxy.userData.originalLight;
		var uniforms = lightProxy.material.uniforms;

		var viewMatrix = currentCamera.matrixWorldInverse;
		var modelMatrix = light.matrixWorld;

		positionVS.getPositionFromMatrix( modelMatrix );
		positionVS.applyMatrix4( viewMatrix );

		directionVS.getPositionFromMatrix( modelMatrix );
		tempVS.getPositionFromMatrix( light.target.matrixWorld );
		directionVS.sub( tempVS );
		directionVS.normalize();
		directionVS.transformDirection( viewMatrix );

		uniforms[ "lightPositionVS" ].value.copy( positionVS );
		uniforms[ "lightDirectionVS" ].value.copy( directionVS );

		uniforms[ "lightAngle" ].value = light.angle;
		uniforms[ "lightDistance" ].value = light.distance;

		// linear space colors

		var intensity = light.intensity * light.intensity;

		uniforms[ "lightIntensity" ].value = intensity;
		uniforms[ "lightColor" ].value.copyGammaToLinear( light.color );

	};

	var createDeferredSpotLight = function ( light ) {

		// setup light material

		var uniforms = THREE.UniformsUtils.clone( spotLightShader.uniforms );

		var materialLight = new THREE.ShaderMaterial( {

			uniforms:       uniforms,
			vertexShader:   spotLightShader.vertexShader,
			fragmentShader: spotLightShader.fragmentShader,

			blending:		THREE.AdditiveBlending,
			depthWrite:		false,
			depthTest:		false,
			transparent:	true

		} );

		uniforms[ "viewWidth" ].value = scaledWidth;
		uniforms[ "viewHeight" ].value = scaledHeight;

		uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
		uniforms[ 'samplerNormalDepth' ].value = compNormalDepth.renderTarget2;

		// create light proxy mesh

		var meshLight = new THREE.Mesh( geometryLightPlane, materialLight );

		// keep reference for color and intensity updates

		meshLight.userData.originalLight = light;

		// keep reference for size reset

		resizableMaterials.push( { "material": materialLight } );

		// sync proxy uniforms to the original light

		updateSpotLightProxy( meshLight );

		return meshLight;

	};

	var updateDirectionalLightProxy = function ( lightProxy ) {

		var light = lightProxy.userData.originalLight;
		var uniforms = lightProxy.material.uniforms;

		directionVS.getPositionFromMatrix( light.matrixWorld );
		tempVS.getPositionFromMatrix( light.target.matrixWorld );
		directionVS.sub( tempVS );
		directionVS.normalize();
		directionVS.transformDirection( currentCamera.matrixWorldInverse );

		uniforms[ "lightDirectionVS" ].value.copy( directionVS );

		// linear space colors

		var intensity = light.intensity * light.intensity;

		uniforms[ "lightIntensity" ].value = intensity;
		uniforms[ "lightColor" ].value.copyGammaToLinear( light.color );

	};

	var createDeferredDirectionalLight = function ( light ) {

		// setup light material

		var uniforms = THREE.UniformsUtils.clone( directionalLightShader.uniforms );

		var materialLight = new THREE.ShaderMaterial( {

			uniforms:       uniforms,
			vertexShader:   directionalLightShader.vertexShader,
			fragmentShader: directionalLightShader.fragmentShader,

			blending:		THREE.AdditiveBlending,
			depthWrite:		false,
			depthTest:		false,
			transparent:	true

		} );

		uniforms[ "viewWidth" ].value = scaledWidth;
		uniforms[ "viewHeight" ].value = scaledHeight;

		uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
		uniforms[ 'samplerNormalDepth' ].value = compNormalDepth.renderTarget2;

		// create light proxy mesh

		var meshLight = new THREE.Mesh( geometryLightPlane, materialLight );

		// keep reference for color and intensity updates

		meshLight.userData.originalLight = light;

		// keep reference for size reset

		resizableMaterials.push( { "material": materialLight } );

		// sync proxy uniforms to the original light

		updateDirectionalLightProxy( meshLight );

		return meshLight;

	};

	var updateHemisphereLightProxy = function ( lightProxy ) {

		var light = lightProxy.userData.originalLight;
		var uniforms = lightProxy.material.uniforms;

		directionVS.getPositionFromMatrix( light.matrixWorld );
		directionVS.normalize();
		directionVS.transformDirection( currentCamera.matrixWorldInverse );

		uniforms[ "lightDirectionVS" ].value.copy( directionVS );

		// linear space colors

		var intensity = light.intensity * light.intensity;

		uniforms[ "lightIntensity" ].value = intensity;
		uniforms[ "lightColorSky" ].value.copyGammaToLinear( light.color );
		uniforms[ "lightColorGround" ].value.copyGammaToLinear( light.groundColor );

	};

	var createDeferredHemisphereLight = function ( light ) {

		// setup light material

		var uniforms = THREE.UniformsUtils.clone( hemisphereLightShader.uniforms );

		var materialLight = new THREE.ShaderMaterial( {

			uniforms:       uniforms,
			vertexShader:   hemisphereLightShader.vertexShader,
			fragmentShader: hemisphereLightShader.fragmentShader,

			blending:		THREE.AdditiveBlending,
			depthWrite:		false,
			depthTest:		false,
			transparent:	true

		} );

		uniforms[ "viewWidth" ].value = scaledWidth;
		uniforms[ "viewHeight" ].value = scaledHeight;

		uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
		uniforms[ 'samplerNormalDepth' ].value = compNormalDepth.renderTarget2;

		// create light proxy mesh

		var meshLight = new THREE.Mesh( geometryLightPlane, materialLight );

		// keep reference for color and intensity updates

		meshLight.userData.originalLight = light;

		// keep reference for size reset

		resizableMaterials.push( { "material": materialLight } );

		// sync proxy uniforms to the original light

		updateHemisphereLightProxy( meshLight );

		return meshLight;

	};

	var updateAreaLightProxy = function ( lightProxy ) {

		var light = lightProxy.userData.originalLight;
		var uniforms = lightProxy.material.uniforms;

		var modelMatrix = light.matrixWorld;
		var viewMatrix = currentCamera.matrixWorldInverse;

		positionVS.getPositionFromMatrix( modelMatrix );
		positionVS.applyMatrix4( viewMatrix );

		uniforms[ "lightPositionVS" ].value.copy( positionVS );

		rightVS.copy( light.right );
		rightVS.transformDirection( modelMatrix );
		rightVS.transformDirection( viewMatrix );

		normalVS.copy( light.normal );
		normalVS.transformDirection( modelMatrix );
		normalVS.transformDirection( viewMatrix );

		upVS.crossVectors( rightVS, normalVS );
		upVS.normalize();

		uniforms[ "lightRightVS" ].value.copy( rightVS );
		uniforms[ "lightNormalVS" ].value.copy( normalVS );
		uniforms[ "lightUpVS" ].value.copy( upVS );

		uniforms[ "lightWidth" ].value = light.width;
		uniforms[ "lightHeight" ].value = light.height;

		uniforms[ "constantAttenuation" ].value = light.constantAttenuation;
		uniforms[ "linearAttenuation" ].value = light.linearAttenuation;
		uniforms[ "quadraticAttenuation" ].value = light.quadraticAttenuation;

		// linear space colors

		var intensity = light.intensity * light.intensity;

		uniforms[ "lightIntensity" ].value = intensity;
		uniforms[ "lightColor" ].value.copyGammaToLinear( light.color );

	};

	var createDeferredAreaLight = function ( light ) {

		// setup light material

		var uniforms = THREE.UniformsUtils.clone( areaLightShader.uniforms );

		var materialLight = new THREE.ShaderMaterial( {

			uniforms:       uniforms,
			vertexShader:   areaLightShader.vertexShader,
			fragmentShader: areaLightShader.fragmentShader,

			blending:		THREE.AdditiveBlending,
			depthWrite:		false,
			depthTest:		false,
			transparent:	true

		} );

		uniforms[ "viewWidth" ].value = scaledWidth;
		uniforms[ "viewHeight" ].value = scaledHeight;

		uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
		uniforms[ 'samplerNormalDepth' ].value = compNormalDepth.renderTarget2;

		// create light proxy mesh

		var meshLight = new THREE.Mesh( geometryLightPlane, materialLight );

		// keep reference for color and intensity updates

		meshLight.userData.originalLight = light;

		// keep reference for size reset

		resizableMaterials.push( { "material": materialLight } );

		// sync proxy uniforms to the original light

		updateAreaLightProxy( meshLight );

		return meshLight;

	};

	var createDeferredEmissiveLight = function () {

		// setup light material

		var materialLight = new THREE.ShaderMaterial( {

			uniforms:       THREE.UniformsUtils.clone( emissiveLightShader.uniforms ),
			vertexShader:   emissiveLightShader.vertexShader,
			fragmentShader: emissiveLightShader.fragmentShader,
			depthTest:		false,
			depthWrite:		false,
			blending:		THREE.NoBlending

		} );

		materialLight.uniforms[ "viewWidth" ].value = scaledWidth;
		materialLight.uniforms[ "viewHeight" ].value = scaledHeight;

		materialLight.uniforms[ 'samplerColor' ].value = compColor.renderTarget2;

		// create light proxy mesh

		var meshLight = new THREE.Mesh( geometryLightPlane, materialLight );

		// keep reference for size reset

		resizableMaterials.push( { "material": materialLight } );

		return meshLight;

	};

	var initDeferredProperties = function ( object ) {

		if ( object.userData.deferredInitialized ) return;

		if ( object.material ) initDeferredMaterials( object );

		if ( object instanceof THREE.PointLight ) {

			var proxy = createDeferredPointLight( object );

			if ( object.distance > 0 ) {

				lightSceneProxy.add( proxy );

			} else {

				lightSceneFullscreen.add( proxy );

			}

		} else if ( object instanceof THREE.SpotLight ) {

			var proxy = createDeferredSpotLight( object );
			lightSceneFullscreen.add( proxy );

		} else if ( object instanceof THREE.DirectionalLight ) {

			var proxy = createDeferredDirectionalLight( object );
			lightSceneFullscreen.add( proxy );

		} else if ( object instanceof THREE.HemisphereLight ) {

			var proxy = createDeferredHemisphereLight( object );
			lightSceneFullscreen.add( proxy );

		} else if ( object instanceof THREE.AreaLight ) {

			var proxy = createDeferredAreaLight( object );
			lightSceneFullscreen.add( proxy );

		}

		object.userData.deferredInitialized = true;

	};

	//

	var setMaterialColor = function ( object ) {

		if ( object.material ) {

			if ( object.userData.transparent ) {

				object.material = invisibleMaterial;

			} else {

				object.material = object.userData.colorMaterial;

			}

		}

	};

	var setMaterialNormalDepth = function ( object ) {

		if ( object.material ) {

			if ( object.userData.transparent ) {

				object.material = invisibleMaterial;

			} else {

				object.material = object.userData.normalDepthMaterial;

			}

		}

	};

	// external API

	this.setAntialias = function ( enabled ) {

		antialias = enabled;

		if ( antialias ) {

			effectFXAA.enabled = true;
			compositePass.renderToScreen = false;

		} else {

			effectFXAA.enabled = false;
			compositePass.renderToScreen = true;
		}

	};

	this.getAntialias = function () {

		return antialias;

	};

	this.addEffect = function ( effect, normalDepthUniform, colorUniform ) {

		if ( effect.material && effect.uniforms ) {

			if ( normalDepthUniform ) effect.uniforms[ normalDepthUniform ].value = compNormalDepth.renderTarget2;
			if ( colorUniform )    	  effect.uniforms[ colorUniform ].value = compColor.renderTarget2;

			if ( normalDepthUniform || colorUniform ) {

				resizableMaterials.push( { "material": effect.material, "normalDepth": normalDepthUniform, "color": colorUniform } );

			}

		}

		compFinal.insertPass( effect, -1 );

	};

	this.setScale = function ( scale ) {

		currentScale = scale;

		scaledWidth = Math.floor( currentScale * fullWidth );
		scaledHeight = Math.floor( currentScale * fullHeight );

		compNormalDepth.setSize( scaledWidth, scaledHeight );
		compColor.setSize( scaledWidth, scaledHeight );
		compLight.setSize( scaledWidth, scaledHeight );
		compFinal.setSize( scaledWidth, scaledHeight );

		compColor.renderTarget2.shareDepthFrom = compNormalDepth.renderTarget2;
		compLight.renderTarget2.shareDepthFrom = compNormalDepth.renderTarget2;

		for ( var i = 0, il = resizableMaterials.length; i < il; i ++ ) {

			var materialEntry = resizableMaterials[ i ];

			var material = materialEntry.material;
			var uniforms = material.uniforms;

			var colorLabel = materialEntry.color !== undefined ? materialEntry.color : 'samplerColor';
			var normalDepthLabel = materialEntry.normalDepth !== undefined ? materialEntry.normalDepth : 'samplerNormalDepth';

			if ( uniforms[ colorLabel ] ) uniforms[ colorLabel ].value = compColor.renderTarget2;
			if ( uniforms[ normalDepthLabel ] ) uniforms[ normalDepthLabel ].value = compNormalDepth.renderTarget2;

			if ( uniforms[ 'viewWidth' ] ) uniforms[ "viewWidth" ].value = scaledWidth;
			if ( uniforms[ 'viewHeight' ] ) uniforms[ "viewHeight" ].value = scaledHeight;

		}

		compositePass.uniforms[ 'samplerLight' ].value = compLight.renderTarget2;

		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / fullWidth, 1 / fullHeight );

	};

	this.setSize = function ( width, height ) {

		fullWidth = width;
		fullHeight = height;

		this.renderer.setSize( fullWidth, fullHeight );

		this.setScale( currentScale );

	};

	//

	function updateLightProxy ( proxy ) {

		var uniforms = proxy.material.uniforms;

		if ( uniforms[ "matProjInverse" ] ) uniforms[ "matProjInverse" ].value = currentCamera.projectionMatrixInverse;
		if ( uniforms[ "matView" ] ) uniforms[ "matView" ].value = currentCamera.matrixWorldInverse;

		var originalLight = proxy.userData.originalLight;

		if ( originalLight ) {

			proxy.visible = originalLight.visible;

			if ( originalLight instanceof THREE.PointLight ) {

				updatePointLightProxy( proxy );

			} else if ( originalLight instanceof THREE.SpotLight ) {

				updateSpotLightProxy( proxy );

			} else if ( originalLight instanceof THREE.DirectionalLight ) {

				updateDirectionalLightProxy( proxy );

			} else if ( originalLight instanceof THREE.HemisphereLight ) {

				updateHemisphereLightProxy( proxy );

			} else if ( originalLight instanceof THREE.AreaLight ) {

				updateAreaLightProxy( proxy );

			}

		}

	};

	this.render = function ( scene, camera ) {

		// setup deferred properties

		if ( ! scene.userData.lightSceneProxy ) {

			scene.userData.lightSceneProxy = new THREE.Scene();
			scene.userData.lightSceneFullscreen = new THREE.Scene();

			var meshLight = createDeferredEmissiveLight();
			scene.userData.lightSceneFullscreen.add( meshLight );

		}

		currentCamera = camera;

		lightSceneProxy = scene.userData.lightSceneProxy;
		lightSceneFullscreen = scene.userData.lightSceneFullscreen;

		passColor.camera = currentCamera;
		passNormalDepth.camera = currentCamera;
		passLightProxy.camera = currentCamera;
		passLightFullscreen.camera = THREE.EffectComposer.camera;

		passColor.scene = scene;
		passNormalDepth.scene = scene;
		passLightFullscreen.scene = lightSceneFullscreen;
		passLightProxy.scene = lightSceneProxy;

		scene.traverse( initDeferredProperties );

		// update scene graph only once per frame
		// (both color and normalDepth passes use exactly the same scene state)

		scene.autoUpdate = false;
		scene.updateMatrixWorld();

		// 1) g-buffer normals + depth pass

		scene.traverse( setMaterialNormalDepth );

		// clear shared depth buffer

		this.renderer.autoClearDepth = true;
		this.renderer.autoClearStencil = true;

		// write 1 to shared stencil buffer
		// for non-background pixels

		//gl.enable( gl.STENCIL_TEST );
		gl.stencilOp( gl.REPLACE, gl.REPLACE, gl.REPLACE );
		gl.stencilFunc( gl.ALWAYS, 1, 0xffffffff );
		gl.clearStencil( 0 );

		compNormalDepth.render();

		// just touch foreground pixels (stencil == 1)
		// both in color and light passes

		gl.stencilFunc( gl.EQUAL, 1, 0xffffffff );
		gl.stencilOp( gl.KEEP, gl.KEEP, gl.KEEP );

		// 2) g-buffer color pass

		scene.traverse( setMaterialColor );

		// must use clean slate depth buffer
		// otherwise there are z-fighting glitches
		// not enough precision between two geometry passes
		// just to use EQUAL depth test

		this.renderer.autoClearDepth = true;
		this.renderer.autoClearStencil = false;

		compColor.render();

		// 3) light pass

		// do not clear depth buffer in this pass
		// depth from geometry pass is used for light culling
		// (write light proxy color pixel if behind scene pixel)

		this.renderer.autoClearDepth = false;

		scene.autoUpdate = true;

		gl.depthFunc( gl.GEQUAL );

		currentCamera.projectionMatrixInverse.getInverse( currentCamera.projectionMatrix );

		for ( var i = 0, il = lightSceneProxy.children.length; i < il; i ++ ) {

			var proxy = lightSceneProxy.children[ i ];
			updateLightProxy( proxy );

		}

		for ( var i = 0, il = lightSceneFullscreen.children.length; i < il; i ++ ) {

			var proxy = lightSceneFullscreen.children[ i ];
			updateLightProxy( proxy );

		}

		compLight.render();

		// 4) composite pass

		// return back to usual depth and stencil handling state

		this.renderer.autoClearDepth = true;
		this.renderer.autoClearStencil = true;
		gl.depthFunc( gl.LEQUAL );
		gl.disable( gl.STENCIL_TEST );

		compFinal.render( 0.1 );

	};

	//

	var createRenderTargets = function ( ) {

		var rtParamsFloatLinear = { minFilter: THREE.NearestFilter, magFilter: THREE.LinearFilter, stencilBuffer: true,
									format: THREE.RGBAFormat, type: THREE.FloatType };

		var rtParamsFloatNearest = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, stencilBuffer: true,
									 format: THREE.RGBAFormat, type: THREE.FloatType };

		var rtParamsUByte = { minFilter: THREE.NearestFilter, magFilter: THREE.LinearFilter, stencilBuffer: false,
							  format: THREE.RGBFormat, type: THREE.UnsignedByteType };

		// g-buffers

		var rtColor   = new THREE.WebGLRenderTarget( scaledWidth, scaledHeight, rtParamsFloatNearest );
		var rtNormalDepth = new THREE.WebGLRenderTarget( scaledWidth, scaledHeight, rtParamsFloatNearest );
		var rtLight   = new THREE.WebGLRenderTarget( scaledWidth, scaledHeight, rtParamsFloatLinear );
		var rtFinal   = new THREE.WebGLRenderTarget( scaledWidth, scaledHeight, rtParamsUByte );

		rtColor.generateMipmaps = false;
		rtNormalDepth.generateMipmaps = false;
		rtLight.generateMipmaps = false;
		rtFinal.generateMipmaps = false;

		// normal + depth composer

		passNormalDepth = new THREE.RenderPass();
		passNormalDepth.clear = true;

		compNormalDepth = new THREE.EffectComposer( _this.renderer, rtNormalDepth );
		compNormalDepth.addPass( passNormalDepth );

		// color composer

		passColor = new THREE.RenderPass();
		passColor.clear = true;

		compColor = new THREE.EffectComposer( _this.renderer, rtColor );
		compColor.addPass( passColor );

		compColor.renderTarget2.shareDepthFrom = compNormalDepth.renderTarget2;

		// light composer

		passLightFullscreen = new THREE.RenderPass();
		passLightFullscreen.clear = true;

		passLightProxy = new THREE.RenderPass();
		passLightProxy.clear = false;

		compLight = new THREE.EffectComposer( _this.renderer, rtLight );
		compLight.addPass( passLightFullscreen );
		compLight.addPass( passLightProxy );

		compLight.renderTarget2.shareDepthFrom = compNormalDepth.renderTarget2;

		// final composer

		compositePass = new THREE.ShaderPass( compositeShader );
		compositePass.uniforms[ 'samplerLight' ].value = compLight.renderTarget2;
		compositePass.uniforms[ 'brightness' ].value = brightness;
		compositePass.material.blending = THREE.NoBlending;
		compositePass.clear = true;

		var defines;

		switch ( tonemapping ) {

			case THREE.SimpleOperator:    defines = { "TONEMAP_SIMPLE": true };    break;
			case THREE.LinearOperator:    defines = { "TONEMAP_LINEAR": true };    break;
			case THREE.ReinhardOperator:  defines = { "TONEMAP_REINHARD": true };  break;
			case THREE.FilmicOperator:    defines = { "TONEMAP_FILMIC": true };    break;
			case THREE.UnchartedOperator: defines = { "TONEMAP_UNCHARTED": true }; break;

		}

		compositePass.material.defines = defines;

		// FXAA

		effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / fullWidth, 1 / fullHeight );
		effectFXAA.renderToScreen = true;

		//

		compFinal = new THREE.EffectComposer( _this.renderer, rtFinal );
		compFinal.addPass( compositePass );
		compFinal.addPass( effectFXAA );

		if ( antialias ) {

			effectFXAA.enabled = true;
			compositePass.renderToScreen = false;

		} else {

			effectFXAA.enabled = false;
			compositePass.renderToScreen = true;

		}

	};

	// init

	createRenderTargets();

};

// tonemapping operator types

THREE.NoOperator = 0;
THREE.SimpleOperator = 1;
THREE.LinearOperator = 2;
THREE.ReinhardOperator = 3;
THREE.FilmicOperator = 4;
THREE.UnchartedOperator = 5;
