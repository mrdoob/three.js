/**
 * @author alteredq / http://alteredqualia.com/
 * @author MPanknin / http://www.redplant.de/
 */

THREE.WebGLDeferredRenderer = function ( parameters ) {

	var width = parameters.width;
	var height = parameters.height;
	var scale = parameters.scale;

	var renderer = parameters.renderer;

	var additiveSpecular = parameters.additiveSpecular;
	var multiply = parameters.multiply;

	//

	var geometryLight = new THREE.SphereGeometry( 1, 16, 8 );

	var black = new THREE.Color( 0x000000 );

	var colorShader = THREE.ShaderDeferred[ "color" ];
	var normalShader = THREE.ShaderDeferred[ "normals" ];
	var bumpShader = THREE.ShaderDeferred[ "bump" ];
	var clipDepthShader = THREE.ShaderDeferred[ "clipDepth" ];

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

	var defaultNormalMaterial = new THREE.ShaderMaterial( {

		uniforms:       THREE.UniformsUtils.clone( normalShader.uniforms ),
		vertexShader:   normalShader.vertexShader,
		fragmentShader: normalShader.fragmentShader

	} );

	var defaultDepthMaterial = new THREE.ShaderMaterial( {

		uniforms:       THREE.UniformsUtils.clone( clipDepthShader.uniforms ),
		vertexShader:   clipDepthShader.vertexShader,
		fragmentShader: clipDepthShader.fragmentShader

	} );

	//

	var initDeferredMaterials = function ( object ) {

		if ( object.material instanceof THREE.MeshFaceMaterial ) {

			var colorMaterials = [];
			var depthMaterials = [];
			var normalMaterials = [];

			var materials = object.material.materials;

			for ( var i = 0, il = materials.length; i < il; i ++ ) {

				var deferredMaterials = createDeferredMaterials( materials[ i ] );

				colorMaterials.push( deferredMaterials.colorMaterial );
				depthMaterials.push( deferredMaterials.depthMaterial );
				normalMaterials.push( deferredMaterials.normalMaterial );

			}

			object.properties.colorMaterial = new THREE.MeshFaceMaterial( colorMaterials );
			object.properties.depthMaterial = new THREE.MeshFaceMaterial( depthMaterials );
			object.properties.normalMaterial = new THREE.MeshFaceMaterial( normalMaterials );

		} else {

			var deferredMaterials = createDeferredMaterials( object.material );

			object.properties.colorMaterial = deferredMaterials.colorMaterial;
			object.properties.depthMaterial = deferredMaterials.depthMaterial;
			object.properties.normalMaterial = deferredMaterials.normalMaterial;

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

		uniforms.emissive.value.copy( emissive );
		uniforms.diffuse.value.copy( diffuse );
		uniforms.specular.value.copy( specular );
		uniforms.shininess.value = shininess;

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

		// normal material
		// -----------------
		//	vertex normals
		//	morph normals
		//	bump map
		//	bump scale

		if ( originalMaterial.bumpMap ) {

			var uniforms = THREE.UniformsUtils.clone( bumpShader.uniforms );

			var normalMaterial = new THREE.ShaderMaterial( {

				uniforms: 		uniforms,
				vertexShader: 	bumpShader.vertexShader,
				fragmentShader: bumpShader.fragmentShader,
				defines:		{ "USE_BUMPMAP": true }

			} );

			uniforms.bumpMap.value = originalMaterial.bumpMap;
			uniforms.bumpScale.value = originalMaterial.bumpScale;

			var offset = originalMaterial.bumpMap.offset;
			var repeat = originalMaterial.bumpMap.repeat;

			uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

			deferredMaterials.normalMaterial = normalMaterial;

		} else if ( originalMaterial.morphTargets ) {

			var normalMaterial = new THREE.ShaderMaterial( {

				uniforms:       THREE.UniformsUtils.clone( normalShader.uniforms ),
				vertexShader:   normalShader.vertexShader,
				fragmentShader: normalShader.fragmentShader,
				shading:		originalMaterial.shading

			} );

			normalMaterial.morphTargets = originalMaterial.morphTargets;
			normalMaterial.morphNormals = originalMaterial.morphNormals;

			deferredMaterials.normalMaterial = normalMaterial;

		} else {

			deferredMaterials.normalMaterial = defaultNormalMaterial;

		}

		// depth material

		if ( originalMaterial.morphTargets ) {

			var depthMaterial = new THREE.ShaderMaterial( {

				uniforms:       THREE.UniformsUtils.clone( clipDepthShader.uniforms ),
				vertexShader:   clipDepthShader.vertexShader,
				fragmentShader: clipDepthShader.fragmentShader

			} );

			depthMaterial.morphTargets = originalMaterial.morphTargets;

			deferredMaterials.depthMaterial = depthMaterial;

		} else {

			deferredMaterials.depthMaterial = defaultDepthMaterial;

		}

		return deferredMaterials;

	};

	var createDeferredPointLight = function ( light ) {

		// setup light material

		var materialLight = new THREE.ShaderMaterial( {

			uniforms:       THREE.UniformsUtils.clone( pointLightShader.uniforms ),
			vertexShader:   pointLightShader.vertexShader,
			fragmentShader: pointLightShader.fragmentShader,
			defines:		{ "ADDITIVE_SPECULAR": additiveSpecular },

			blending:		THREE.AdditiveBlending,
			depthWrite:		false,
			transparent:	true

		} );

		materialLight.uniforms[ "lightPos" ].value = light.position;
		materialLight.uniforms[ "lightRadius" ].value = light.distance;
		materialLight.uniforms[ "lightIntensity" ].value = light.intensity;
		materialLight.uniforms[ "lightColor" ].value = light.color;

		materialLight.uniforms[ "viewWidth" ].value = width;
		materialLight.uniforms[ "viewHeight" ].value = height;

		materialLight.uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
		materialLight.uniforms[ 'samplerNormals' ].value = compNormal.renderTarget2;
		materialLight.uniforms[ 'samplerDepth' ].value = compDepth.renderTarget2;

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
			defines:		{ "ADDITIVE_SPECULAR": additiveSpecular },

			blending:		THREE.AdditiveBlending,
			depthWrite:		false,
			transparent:	true

		} );

		materialLight.uniforms[ "lightDir" ].value = light.position;
		materialLight.uniforms[ "lightIntensity" ].value = light.intensity;
		materialLight.uniforms[ "lightColor" ].value = light.color;

		materialLight.uniforms[ "viewWidth" ].value = width;
		materialLight.uniforms[ "viewHeight" ].value = height;

		materialLight.uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
		materialLight.uniforms[ 'samplerDepth' ].value = compDepth.renderTarget2;
		materialLight.uniforms[ 'samplerNormals' ].value = compNormal.renderTarget2;

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
			depthWrite:		false

		} );


		materialLight.uniforms[ "viewWidth" ].value = width;
		materialLight.uniforms[ "viewHeight" ].value = height;

		materialLight.uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
		materialLight.uniforms[ 'samplerDepth' ].value = compDepth.renderTarget2;

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

	var setMaterialDepth = function ( object ) {

		if ( object.material ) object.material = object.properties.depthMaterial;

	};

	var setMaterialNormal = function ( object ) {

		if ( object.material ) object.material = object.properties.normalMaterial;

	};

	//

	this.setSize = function ( width, height ) {

		compColor.setSize( width, height );
		compNormal.setSize( width, height );
		compDepth.setSize( width, height );
		compLight.setSize( width, height );
		compFinal.setSize( width, height );

		for ( var i = 0, il = lightMaterials.length; i < il; i ++ ) {

			var uniforms = lightMaterials[ i ].uniforms;

			uniforms[ "viewWidth" ].value = width;
			uniforms[ "viewHeight" ].value = height;

			uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
			uniforms[ 'samplerDepth' ].value = compDepth.renderTarget2;

			if ( uniforms[ 'samplerNormals' ] ) {

				uniforms[ 'samplerNormals' ].value = compNormal.renderTarget2;

			}

		}

		compositePass.uniforms[ 'samplerLight' ].value = compLight.renderTarget2;

		effectFXAA.uniforms[ 'resolution' ].value.set( scale / width, scale / height );

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
		passNormal.camera = camera;
		passDepth.camera = camera;
		passLightProxy.camera = camera;
		passLightFullscreen.camera = THREE.EffectComposer.camera;

		passColor.scene = scene;
		passNormal.scene = scene;
		passDepth.scene = scene;
		passLightFullscreen.scene = lightSceneFullscreen;
		passLightProxy.scene = lightSceneProxy;

		scene.traverse( initDeferredProperties );

		// g-buffer color

		scene.traverse( setMaterialColor );
		compColor.render();

		// g-buffer depth

		scene.traverse( setMaterialDepth );
		compDepth.render();

		// g-buffer normals

		scene.traverse( setMaterialNormal );
		compNormal.render();

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

		var rtColor   = new THREE.WebGLRenderTarget( width, height, rtParamsFloatNearest );
		var rtNormal  = new THREE.WebGLRenderTarget( width, height, rtParamsFloatLinear );
		var rtDepth   = new THREE.WebGLRenderTarget( width, height, rtParamsFloatLinear );
		var rtLight   = new THREE.WebGLRenderTarget( width, height, rtParamsFloatLinear );
		var rtFinal   = new THREE.WebGLRenderTarget( width, height, rtParamsUByte );

		rtColor.generateMipmaps = false;
		rtNormal.generateMipmaps = false;
		rtDepth.generateMipmaps = false;
		rtLight.generateMipmaps = false;
		rtFinal.generateMipmaps = false;

		// composers

		passColor = new THREE.RenderPass();
		compColor = new THREE.EffectComposer( renderer, rtColor );
		compColor.addPass( passColor );

		passNormal = new THREE.RenderPass();
		compNormal = new THREE.EffectComposer( renderer, rtNormal );
		compNormal.addPass( passNormal );

		passDepth = new THREE.RenderPass();
		compDepth = new THREE.EffectComposer( renderer, rtDepth );
		compDepth.addPass( passDepth );

		passLightFullscreen = new THREE.RenderPass();
		passLightProxy = new THREE.RenderPass();
		passLightProxy.clear = false;

		compLight = new THREE.EffectComposer( renderer, rtLight );
		compLight.addPass( passLightFullscreen );
		compLight.addPass( passLightProxy );

		// composite

		compositePass = new THREE.ShaderPass( compositeShader );
		compositePass.uniforms[ 'samplerLight' ].value = compLight.renderTarget2;
		compositePass.uniforms[ 'multiply' ].value = multiply;

		// FXAA

		effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
		effectFXAA.uniforms[ 'resolution' ].value.set( scale / width, scale / height );
		effectFXAA.renderToScreen = true;

		//

		compFinal = new THREE.EffectComposer( renderer, rtFinal );
		compFinal.addPass( compositePass );
		compFinal.addPass( effectFXAA );

	};

	// init

	createRenderTargets();

};