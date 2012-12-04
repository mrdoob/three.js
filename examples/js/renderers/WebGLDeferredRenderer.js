/**
 * @author alteredq / http://alteredqualia.com/
 * @author MPanknin / http://www.redplant.de/
 */

THREE.WebGLDeferredRenderer = function ( parameters ) {

	var _this = this;

	var width = parameters.width;
	var height = parameters.height;
	var scale = parameters.scale;

	var scaledWidth = Math.floor( scale * width );
	var scaledHeight = Math.floor( scale * height );

	var brightness = parameters.brightness;

	this.renderer = parameters.renderer;

	if ( this.renderer === undefined ) {

		this.renderer = new THREE.WebGLRenderer( { alpha: false } );
		this.renderer.setSize( width, height );
		this.renderer.setClearColorHex( 0x000000, 0 );

		this.renderer.autoClear = false;

	}

	this.domElement = this.renderer.domElement;


	//

	var geometryLight = new THREE.SphereGeometry( 1, 16, 8 );

	var black = new THREE.Color( 0x000000 );

	var colorShader = THREE.ShaderDeferred[ "color" ];
	var normalDepthShader = THREE.ShaderDeferred[ "normalDepth" ];

	//

	var emissiveLightShader = THREE.ShaderDeferred[ "emissiveLight" ];
	var pointLightShader = THREE.ShaderDeferred[ "pointLight" ];
	var directionalLightShader = THREE.ShaderDeferred[ "directionalLight" ];

	var compositeShader = THREE.ShaderDeferred[ "composite" ];

	//

	var compColor, compNormal, compDepth, compLight, compFinal;
	var passColor, passNormal, passDepth, passLightFullscreen, passLightProxy, compositePass;

	var effectFXAA;

	//

	var lightSceneFullscreen, lightSceneProxy;
	var lightMaterials = [];

	//

	var defaultNormalDepthMaterial = new THREE.ShaderMaterial( {

		uniforms:       THREE.UniformsUtils.clone( normalDepthShader.uniforms ),
		vertexShader:   normalDepthShader.vertexShader,
		fragmentShader: normalDepthShader.fragmentShader

	} );

	//

	var initDeferredMaterials = function ( object ) {

		if ( object.material instanceof THREE.MeshFaceMaterial ) {

			var colorMaterials = [];
			var normalDepthMaterials = [];

			var materials = object.material.materials;

			for ( var i = 0, il = materials.length; i < il; i ++ ) {

				var deferredMaterials = createDeferredMaterials( materials[ i ] );

				colorMaterials.push( deferredMaterials.colorMaterial );
				normalDepthMaterials.push( deferredMaterials.normalDepthMaterial );

			}

			object.properties.colorMaterial = new THREE.MeshFaceMaterial( colorMaterials );
			object.properties.normalDepthMaterial = new THREE.MeshFaceMaterial( normalDepthMaterials );

		} else {

			var deferredMaterials = createDeferredMaterials( object.material );

			object.properties.colorMaterial = deferredMaterials.colorMaterial;
			object.properties.normalDepthMaterial = deferredMaterials.normalDepthMaterial;

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
		var defines = { "USE_MAP": !! originalMaterial.map, "GAMMA_INPUT": true };

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

		uniforms.emissive.value.copy( emissive );
		uniforms.diffuse.value.copy( diffuse );
		uniforms.specular.value.copy( specular );
		uniforms.shininess.value = shininess;
		uniforms.wrapAround.value = wrapAround;
		uniforms.additiveSpecular.value = additiveSpecular;

		uniforms.map.value = originalMaterial.map;

		material.vertexColors = originalMaterial.vertexColors;
		material.morphTargets = originalMaterial.morphTargets;
		material.morphNormals = originalMaterial.morphNormals;

		material.alphaTest = originalMaterial.alphaTest;

		if ( originalMaterial.bumpMap ) {

			var offset = originalMaterial.bumpMap.offset;
			var repeat = originalMaterial.bumpMap.repeat;

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

		if ( originalMaterial.morphTargets || originalMaterial.bumpMap ) {

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

			if ( originalMaterial.morphTargets ) {

				normalDepthMaterial.morphTargets = originalMaterial.morphTargets;
				normalDepthMaterial.morphNormals = originalMaterial.morphNormals;

			}

			if ( originalMaterial.bumpMap ) {

				uniforms.bumpMap.value = originalMaterial.bumpMap;
				uniforms.bumpScale.value = originalMaterial.bumpScale;

				var offset = originalMaterial.bumpMap.offset;
				var repeat = originalMaterial.bumpMap.repeat;

				uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

			}

			deferredMaterials.normalDepthMaterial = normalDepthMaterial;

		} else {

			deferredMaterials.normalDepthMaterial = defaultNormalDepthMaterial;

		}

		return deferredMaterials;

	};

	var createDeferredPointLight = function ( light ) {

		// setup light material

		var materialLight = new THREE.ShaderMaterial( {

			uniforms:       THREE.UniformsUtils.clone( pointLightShader.uniforms ),
			vertexShader:   pointLightShader.vertexShader,
			fragmentShader: pointLightShader.fragmentShader,

			blending:		THREE.AdditiveBlending,
			depthWrite:		false,
			transparent:	true

		} );

		materialLight.uniforms[ "lightPos" ].value = light.position;
		materialLight.uniforms[ "lightRadius" ].value = light.distance;
		materialLight.uniforms[ "lightIntensity" ].value = light.intensity;
		materialLight.uniforms[ "lightColor" ].value = light.color;

		materialLight.uniforms[ "viewWidth" ].value = scaledWidth;
		materialLight.uniforms[ "viewHeight" ].value = scaledHeight;

		materialLight.uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
		materialLight.uniforms[ 'samplerNormalDepth' ].value = compNormalDepth.renderTarget2;

		// create light proxy mesh

		var meshLight = new THREE.Mesh( geometryLight, materialLight );
		meshLight.position = light.position;
		meshLight.scale.multiplyScalar( light.distance );

		// keep reference for size reset

		lightMaterials.push( materialLight );

		return meshLight;

	};

	var createDeferredDirectionalLight = function ( light ) {

		// setup light material

		var materialLight = new THREE.ShaderMaterial( {

			uniforms:       THREE.UniformsUtils.clone( directionalLightShader.uniforms ),
			vertexShader:   directionalLightShader.vertexShader,
			fragmentShader: directionalLightShader.fragmentShader,

			blending:		THREE.AdditiveBlending,
			depthWrite:		false,
			transparent:	true

		} );

		materialLight.uniforms[ "lightDir" ].value = light.position;
		materialLight.uniforms[ "lightIntensity" ].value = light.intensity;
		materialLight.uniforms[ "lightColor" ].value = light.color;

		materialLight.uniforms[ "viewWidth" ].value = scaledWidth;
		materialLight.uniforms[ "viewHeight" ].value = scaledHeight;

		materialLight.uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
		materialLight.uniforms[ 'samplerNormalDepth' ].value = compNormalDepth.renderTarget2;

		// create light proxy mesh

		var geometryLight = new THREE.PlaneGeometry( 2, 2 );
		var meshLight = new THREE.Mesh( geometryLight, materialLight );

		// keep reference for size reset

		lightMaterials.push( materialLight );

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

		var geometryLight = new THREE.PlaneGeometry( 2, 2 );
		var meshLight = new THREE.Mesh( geometryLight, materialLight );

		// keep reference for size reset

		lightMaterials.push( materialLight );

		return meshLight;

	};

	var initDeferredProperties = function ( object ) {

		if ( object.properties.deferredInitialized ) return;

		if ( object.material ) initDeferredMaterials( object );

		if ( object instanceof THREE.PointLight ) {

			var meshLight = createDeferredPointLight( object );
			lightSceneProxy.add( meshLight );

		} else if ( object instanceof THREE.DirectionalLight ) {

			var meshLight = createDeferredDirectionalLight( object );
			lightSceneFullscreen.add( meshLight );

		}

		object.properties.deferredInitialized = true;

	};

	//

	var setMaterialColor = function ( object ) {

		if ( object.material ) object.material = object.properties.colorMaterial;

	};

	var setMaterialNormalDepth = function ( object ) {

		if ( object.material ) object.material = object.properties.normalDepthMaterial;

	};

	//

	this.setSize = function ( width, height ) {

		this.renderer.setSize( width, height );

		scaledWidth = Math.floor( scale * width );
		scaledHeight = Math.floor( scale * height );

		compColor.setSize( scaledWidth, scaledHeight );
		compNormalDepth.setSize( scaledWidth, scaledHeight );
		compLight.setSize( scaledWidth, scaledHeight );
		compFinal.setSize( scaledWidth, scaledHeight );

		for ( var i = 0, il = lightMaterials.length; i < il; i ++ ) {

			var uniforms = lightMaterials[ i ].uniforms;

			uniforms[ "viewWidth" ].value = scaledWidth;
			uniforms[ "viewHeight" ].value = scaledHeight;

			uniforms[ 'samplerColor' ].value = compColor.renderTarget2;

			if ( uniforms[ 'samplerNormalDepth' ] ) {

				uniforms[ 'samplerNormalDepth' ].value = compNormalDepth.renderTarget2;

			}

		}

		compositePass.uniforms[ 'samplerLight' ].value = compLight.renderTarget2;

		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

	};

	//

	this.render = function ( scene, camera ) {

		// setup deferred properties

		if ( ! scene.properties.lightSceneProxy ) {

			scene.properties.lightSceneProxy = new THREE.Scene();
			scene.properties.lightSceneFullscreen = new THREE.Scene();

			var meshLight = createDeferredEmissiveLight();
			scene.properties.lightSceneFullscreen.add( meshLight );

		}

		lightSceneProxy = scene.properties.lightSceneProxy;
		lightSceneFullscreen = scene.properties.lightSceneFullscreen;

		passColor.camera = camera;
		passNormalDepth.camera = camera;
		passLightProxy.camera = camera;
		passLightFullscreen.camera = THREE.EffectComposer.camera;

		passColor.scene = scene;
		passNormalDepth.scene = scene;
		passLightFullscreen.scene = lightSceneFullscreen;
		passLightProxy.scene = lightSceneProxy;

		scene.traverse( initDeferredProperties );

		// update scene graph only once per frame

		this.renderer.autoUpdateScene = false;
		scene.updateMatrixWorld();

		// g-buffer color

		scene.traverse( setMaterialColor );
		compColor.render();

		// g-buffer normals + depth

		scene.traverse( setMaterialNormalDepth );
		compNormalDepth.render();

		this.renderer.autoUpdateScene = true;

		// light pass

		camera.projectionMatrixInverse.getInverse( camera.projectionMatrix );

		for ( var i = 0, il = lightSceneProxy.children.length; i < il; i ++ ) {

			var uniforms = lightSceneProxy.children[ i ].material.uniforms;

			uniforms[ "matProjInverse" ].value = camera.projectionMatrixInverse;
			uniforms[ "matView" ].value = camera.matrixWorldInverse;

		}

		for ( var i = 0, il = lightSceneFullscreen.children.length; i < il; i ++ ) {

			var uniforms = lightSceneFullscreen.children[ i ].material.uniforms;

			if ( uniforms[ "matView" ] ) uniforms[ "matView" ].value = camera.matrixWorldInverse;

		}

		compLight.render();

		// composite pass

		compFinal.render( 0.1 );

	};

	var createRenderTargets = function ( ) {

		var rtParamsFloatLinear = { minFilter: THREE.NearestFilter, magFilter: THREE.LinearFilter, stencilBuffer: false,
									format: THREE.RGBAFormat, type: THREE.FloatType };

		var rtParamsFloatNearest = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, stencilBuffer: false,
									 format: THREE.RGBAFormat, type: THREE.FloatType };

		var rtParamsUByte = { minFilter: THREE.NearestFilter, magFilter: THREE.LinearFilter, stencilBuffer: false,
							  format: THREE.RGBFormat, type: THREE.UnsignedByteType };

		// g-buffers

		var rtColor   = new THREE.WebGLRenderTarget( scaledWidth, scaledHeight, rtParamsFloatNearest );
		var rtNormalDepth = new THREE.WebGLRenderTarget( scaledWidth, scaledHeight, rtParamsFloatLinear );
		var rtLight   = new THREE.WebGLRenderTarget( scaledWidth, scaledHeight, rtParamsFloatLinear );
		var rtFinal   = new THREE.WebGLRenderTarget( scaledWidth, scaledHeight, rtParamsUByte );

		rtColor.generateMipmaps = false;
		rtNormalDepth.generateMipmaps = false;
		rtLight.generateMipmaps = false;
		rtFinal.generateMipmaps = false;

		// color composer

		passColor = new THREE.RenderPass();
		passColor.clear = true;

		compColor = new THREE.EffectComposer( _this.renderer, rtColor );
		compColor.addPass( passColor );

		// normal + depth composer

		passNormalDepth = new THREE.RenderPass();
		passNormalDepth.clear = true;

		compNormalDepth = new THREE.EffectComposer( _this.renderer, rtNormalDepth );
		compNormalDepth.addPass( passNormalDepth );

		// light composer

		passLightFullscreen = new THREE.RenderPass();
		passLightFullscreen.clear = true;

		passLightProxy = new THREE.RenderPass();
		passLightProxy.clear = false;

		compLight = new THREE.EffectComposer( _this.renderer, rtLight );
		compLight.addPass( passLightFullscreen );
		compLight.addPass( passLightProxy );

		// final composer

		compositePass = new THREE.ShaderPass( compositeShader );
		compositePass.uniforms[ 'samplerLight' ].value = compLight.renderTarget2;
		compositePass.uniforms[ 'brightness' ].value = brightness;
		compositePass.material.blending = THREE.NoBlending;
		compositePass.clear = true;

		// FXAA

		effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
		effectFXAA.renderToScreen = true;

		//

		compFinal = new THREE.EffectComposer( _this.renderer, rtFinal );
		compFinal.addPass( compositePass );
		compFinal.addPass( effectFXAA );

	};

	// init

	createRenderTargets();

};