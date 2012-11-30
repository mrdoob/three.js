/**
 * @author alteredq / http://alteredqualia.com/
 * @author MPanknin / http://www.redplant.de/
 */

THREE.DeferredHelper = function ( parameters ) {

	var width = parameters.width;
	var height = parameters.height;

	var renderer = parameters.renderer;

	var additiveSpecular = parameters.additiveSpecular;

	//

	var geometryEmitter = new THREE.SphereGeometry( 0.7, 7, 7 );

	var black = new THREE.Color( 0x000000 );

	var colorShader = THREE.ShaderDeferred[ "color" ];
	var normalShader = THREE.ShaderDeferred[ "normals" ];
	var bumpShader = THREE.ShaderDeferred[ "bump" ];
	var clipDepthShader = THREE.ShaderDeferred[ "clipDepth" ];

	//

	var unlitShader = THREE.ShaderDeferred[ "unlit" ];
	var lightShader = THREE.ShaderDeferred[ "light" ];
	var compositeShader = THREE.ShaderDeferred[ "composite" ];

	var unlitMaterials = [];
	var lightMaterials = [];

	//

	var compColor, compNormal, compDepth, compEmitter, compLight, compFinal;
	var passColor, passNormal, passDepth, passEmitter, passLight, compositePass;

	var effectFXAA;

	var emitterScene, lightScene;

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

	var rtParamsFloatLinear = { minFilter: THREE.NearestFilter, magFilter: THREE.LinearFilter, stencilBuffer: false,
								format: THREE.RGBAFormat, type: THREE.FloatType };

	var rtParamsFloatNearest = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, stencilBuffer: false,
								 format: THREE.RGBAFormat, type: THREE.FloatType };

	var rtParamsUByte = { minFilter: THREE.NearestFilter, magFilter: THREE.LinearFilter, stencilBuffer: false,
						  format: THREE.RGBFormat, type: THREE.UnsignedByteType };

	//

	var initDeferredMaterials = function ( object ) {

		var originalMaterial = object.material;

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

		var diffuse = originalMaterial.color;
		var specular = originalMaterial.specular !== undefined ? originalMaterial.specular : black;
		var shininess = originalMaterial.shininess !== undefined ? originalMaterial.shininess : 1;

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

		object.properties.colorMaterial = material;

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

			object.properties.normalMaterial = normalMaterial;

		} else if ( originalMaterial.morphTargets ) {

			var normalMaterial = new THREE.ShaderMaterial( {

				uniforms:       THREE.UniformsUtils.clone( normalShader.uniforms ),
				vertexShader:   normalShader.vertexShader,
				fragmentShader: normalShader.fragmentShader,
				shading:		originalMaterial.shading

			} );

			normalMaterial.morphTargets = originalMaterial.morphTargets;
			normalMaterial.morphNormals = originalMaterial.morphNormals;

			object.properties.normalMaterial = normalMaterial;

		} else {

			object.properties.normalMaterial = defaultNormalMaterial;

		}

		// depth material

		if ( originalMaterial.morphTargets ) {

			var depthMaterial = new THREE.ShaderMaterial( {

				uniforms:       THREE.UniformsUtils.clone( clipDepthShader.uniforms ),
				vertexShader:   clipDepthShader.vertexShader,
				fragmentShader: clipDepthShader.fragmentShader

			} );

			depthMaterial.morphTargets = originalMaterial.morphTargets;

			object.properties.depthMaterial = depthMaterial;

		} else {

			object.properties.depthMaterial = defaultDepthMaterial;

		}

	};

	var createDeferredPointLight = function ( light ) {

		// setup light material

		var materialLight = new THREE.ShaderMaterial( {

			uniforms:       THREE.UniformsUtils.clone( lightShader.uniforms ),
			vertexShader:   lightShader.vertexShader,
			fragmentShader: lightShader.fragmentShader,
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

		var geometryLight = new THREE.SphereGeometry( light.distance, 16, 8 );
		var meshLight = new THREE.Mesh( geometryLight, materialLight );
		meshLight.position = light.position;

		// keep reference for size reset

		lightMaterials.push( materialLight );

		return meshLight;

	};

	var createEmitter = function ( light ) {

		// setup emitter material

		var matEmitter = new THREE.ShaderMaterial( {

			uniforms:       THREE.UniformsUtils.clone( unlitShader.uniforms ),
			vertexShader:   unlitShader.vertexShader,
			fragmentShader: unlitShader.fragmentShader

		} );

		matEmitter.uniforms[ "viewWidth" ].value = width;
		matEmitter.uniforms[ "viewHeight" ].value = height;
		matEmitter.uniforms[ "samplerDepth" ].value = compDepth.renderTarget2;
		matEmitter.uniforms[ "lightColor" ].value = light.color;

		// create emitter mesh

		var meshEmitter = new THREE.Mesh( geometryEmitter, matEmitter );
		meshEmitter.position = light.position;

		// keep reference for size reset

		unlitMaterials.push( matEmitter );

		return meshEmitter;

	};

	var initDeferredProperties = function ( object ) {

		if ( object.properties.deferredInitialized ) return;

		if ( object.material ) initDeferredMaterials( object );

		if ( object instanceof THREE.PointLight ) {

			var meshEmitter = createEmitter( object );
			var meshLight = createDeferredPointLight( object );

			lightScene.add( meshLight );
			emitterScene.add( meshEmitter );

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

	var setMaterialNormal= function ( object ) {

		if ( object.material ) object.material = object.properties.normalMaterial;

	};

	//

	this.setSize = function ( width, height ) {

		compColor.setSize( width, height );
		compNormal.setSize( width, height );
		compDepth.setSize( width, height );
		compEmitter.setSize( width, height );
		compLight.setSize( width, height );
		compFinal.setSize( width, height );

		for ( var i = 0, il = unlitMaterials.length; i < il; i ++ ) {

			var uniforms = unlitMaterials[ i ].uniforms;

			uniforms[ "viewWidth" ].value = width;
			uniforms[ "viewHeight" ].value = height;

		}

		for ( var i = 0, il = lightMaterials.length; i < il; i ++ ) {

			var uniforms = lightMaterials[ i ].uniforms;

			uniforms[ "viewWidth" ].value = width;
			uniforms[ "viewHeight" ].value = height;

			uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
			uniforms[ 'samplerNormals' ].value = compNormal.renderTarget2;
			uniforms[ 'samplerDepth' ].value = compDepth.renderTarget2;

		}

		compositePass.uniforms[ 'samplerLight' ].value = compLight.renderTarget2;
		compositePass.uniforms[ 'samplerEmitter' ].value = compEmitter.renderTarget2;

		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

	};

	//

	this.render = function ( scene, camera ) {

		// setup deferred properties

		if ( ! scene.properties.emitterScene ) scene.properties.emitterScene = new THREE.Scene();
		if ( ! scene.properties.lightScene ) scene.properties.lightScene = new THREE.Scene();

		emitterScene = scene.properties.emitterScene;
		lightScene = scene.properties.lightScene;

		passColor.camera = camera;
		passNormal.camera = camera;
		passDepth.camera = camera;
		passEmitter.camera = camera;
		passLight.camera = camera;

		passColor.scene = scene;
		passNormal.scene = scene;
		passDepth.scene = scene;
		passEmitter.scene = emitterScene;
		passLight.scene = lightScene;

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

		// emitter pass

		compEmitter.render();

		// light pass

		camera.projectionMatrixInverse.getInverse( camera.projectionMatrix );

		for ( var i = 0, il = lightScene.children.length; i < il; i ++ ) {

			var uniforms = lightScene.children[ i ].material.uniforms;

			uniforms[ "matProjInverse" ].value = camera.projectionMatrixInverse;
			uniforms[ "matView" ].value = camera.matrixWorldInverse;

		}

		compLight.render();

		// composite pass

		compFinal.render( 0.1 );

	};

	var createRenderTargets = function ( ) {

		// g-buffers

		var rtColor   = new THREE.WebGLRenderTarget( width, height, rtParamsFloatNearest );
		var rtNormal  = new THREE.WebGLRenderTarget( width, height, rtParamsFloatLinear );
		var rtDepth   = new THREE.WebGLRenderTarget( width, height, rtParamsFloatLinear );
		var rtLight   = new THREE.WebGLRenderTarget( width, height, rtParamsFloatLinear );
		var rtEmitter = new THREE.WebGLRenderTarget( width, height, rtParamsUByte );
		var rtFinal   = new THREE.WebGLRenderTarget( width, height, rtParamsUByte );

		rtColor.generateMipmaps = false;
		rtNormal.generateMipmaps = false;
		rtDepth.generateMipmaps = false;
		rtLight.generateMipmaps = false;
		rtEmitter.generateMipmaps = false;
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

		passEmitter = new THREE.RenderPass();
		compEmitter = new THREE.EffectComposer( renderer, rtEmitter );
		compEmitter.addPass( passEmitter );

		passLight = new THREE.RenderPass();
		compLight = new THREE.EffectComposer( renderer, rtLight );
		compLight.addPass( passLight );

		// composite

		compositePass = new THREE.ShaderPass( compositeShader );
		compositePass.needsSwap = true;

		compositePass.uniforms[ 'samplerLight' ].value = compLight.renderTarget2;
		compositePass.uniforms[ 'samplerEmitter' ].value = compEmitter.renderTarget2;

		// FXAA

		effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

		// color correction

		var effectColor = new THREE.ShaderPass( THREE.ColorCorrectionShader );
		effectColor.renderToScreen = true;

		effectColor.uniforms[ 'powRGB' ].value.set( 1, 1, 1 );
		effectColor.uniforms[ 'mulRGB' ].value.set( 2, 2, 2 );

		//

		compFinal = new THREE.EffectComposer( renderer, rtFinal );
		compFinal.addPass( compositePass );
		compFinal.addPass( effectFXAA );
		compFinal.addPass( effectColor );

	};

	// init

	createRenderTargets();

};