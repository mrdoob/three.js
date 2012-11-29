/**
 * @author alteredq / http://alteredqualia.com/
 * @author MPanknin / http://www.redplant.de/
 */

THREE.DeferredHelper = function ( parameters ) {

	var width = parameters.width;
	var height = parameters.height;

	var renderer = parameters.renderer;

	var additiveSpecular = parameters.additiveSpecular;

	// scene for light proxy geometry

	var lightScene = new THREE.Scene();
	lightNode = new THREE.Object3D();
	lightScene.add( lightNode );

	// scene for the coloured emitter spheres

	var emitterScene = new THREE.Scene();
	emitterNode = new THREE.Object3D();
	emitterScene.add( emitterNode );

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

	unlitShader.uniforms[ "viewWidth" ].value = width;
	unlitShader.uniforms[ "viewHeight" ].value = height;

	lightShader.uniforms[ "viewWidth" ].value = width;
	lightShader.uniforms[ "viewHeight" ].value = height;

	//

	var compColor, compNormal, compDepth, compEmitter, compLightBuffer, compFinal, compositePass;
	var passColor, passNormal, passDepth, passEmitter, passLight;

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

	var addDeferredMaterials = function ( object ) {

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

		object.properties.deferredInitialized = true;

	};

	var addDeferredPointLight = function ( light ) {

		// setup material

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

		// setup proxy geometry for this light

		var geometryLight = new THREE.SphereGeometry( light.distance, 16, 8 );
		var meshLight = new THREE.Mesh( geometryLight, materialLight );
		meshLight.position = light.position;
		lightNode.add( meshLight );

		// create emitter sphere

		var matEmitter = new THREE.ShaderMaterial( {

			uniforms:       THREE.UniformsUtils.clone( unlitShader.uniforms ),
			vertexShader:   unlitShader.vertexShader,
			fragmentShader: unlitShader.fragmentShader

		} );

		matEmitter.uniforms[ "samplerDepth" ].value = compDepth.renderTarget2;
		matEmitter.uniforms[ "lightColor" ].value = light.color;

		var meshEmitter = new THREE.Mesh( geometryEmitter, matEmitter );
		meshEmitter.position = light.position;
		emitterNode.add( meshEmitter );

		// add emitter to light node

		meshLight.properties.emitter = meshEmitter;

		light.properties.deferredInitialized = true;

	};

	var initDeferredProperties = function ( object ) {

		if ( object.properties.deferredInitialized ) return;

		if ( object.material ) addDeferredMaterials( object );
		if ( object instanceof THREE.PointLight ) addDeferredPointLight( object );

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

	this.render = function ( scene, camera ) {

		passColor.camera = camera;
		passNormal.camera = camera;
		passDepth.camera = camera;
		passEmitter.camera = camera;
		passLight.camera = camera;

		passColor.scene = scene;
		passNormal.scene = scene;
		passDepth.scene = scene;

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

		for ( var i = 0, il = lightNode.children.length; i < il; i ++ ) {

			var uniforms = lightNode.children[ i ].material.uniforms;

			uniforms[ "matProjInverse" ].value = camera.projectionMatrixInverse;
			uniforms[ "matView" ].value = camera.matrixWorldInverse;

		}

		compLightBuffer.render();

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

		passEmitter = new THREE.RenderPass( emitterScene );
		compEmitter = new THREE.EffectComposer( renderer, rtEmitter );
		compEmitter.addPass( passEmitter );

		passLight = new THREE.RenderPass( lightScene );
		compLightBuffer = new THREE.EffectComposer( renderer, rtLight );
		compLightBuffer.addPass( passLight );

		//

		lightShader.uniforms[ 'samplerColor' ].value = compColor.renderTarget2;
		lightShader.uniforms[ 'samplerNormals' ].value = compNormal.renderTarget2;
		lightShader.uniforms[ 'samplerDepth' ].value = compDepth.renderTarget2;
		lightShader.uniforms[ 'samplerLightBuffer' ].value = rtLight;

		compositeShader.uniforms[ 'samplerLightBuffer' ].value = compLightBuffer.renderTarget2;
		compositeShader.uniforms[ 'samplerEmitter' ].value = compEmitter.renderTarget2;

		// composite

		var compositePass = new THREE.ShaderPass( compositeShader );
		compositePass.needsSwap = true;

		var effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

		var effectColor = new THREE.ShaderPass( THREE.ColorCorrectionShader );
		effectColor.renderToScreen = true;

		effectColor.uniforms[ 'powRGB' ].value.set( 1, 1, 1 );
		effectColor.uniforms[ 'mulRGB' ].value.set( 2, 2, 2 );

		compFinal = new THREE.EffectComposer( renderer, rtFinal );
		compFinal.addPass( compositePass );
		compFinal.addPass( effectFXAA );
		compFinal.addPass( effectColor );

	};

	// init

	createRenderTargets();

};