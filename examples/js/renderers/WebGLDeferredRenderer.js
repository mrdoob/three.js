/**
 * @author alteredq / http://alteredqualia.com/
 * @author MPanknin / http://www.redplant.de/
 * @author takahiro / https://github.com/takahirox
 *
 * Dependencies
 *  - THREE.CopyShader
 *  - THREE.RenderPass
 *  - THREE.ShaderPass
 *  - THREE.EffectComposer
 *  - THREE.FXAAShader
 *
 * TODO
 *  - reuse existing glsl
 *  - shared material
 *  - shadow
 *  - optimization
 *  - MRT (when it's available on Three.js)
 *  - AmbientLight
 *  - HemisphereLight
 *  - PointLight (distance < 0)
 *  - morphNormals
 *  - BumpMap
 *  - ToneMap
 *  - envMap
 *  - wrapAround
 *  - addEffect
 */

THREE.WebGLDeferredRenderer = function ( parameters ) {

	parameters = parameters || {};

	// private properties

	var _this = this;

	var _gl;

	var _width, _height;

	var _compColor, _compNormalDepth, _compLight, _compFinal;
	var _passColor, _passNormalDepth, _passLight, _passLightFullscreen, _passFinal, _passForward, _passCopy, _passFXAA;

	var _lightScene, _lightFullscreenScene;

	var _antialias = false, _hasTransparentObject = false;

	var _invisibleMaterial = new THREE.ShaderMaterial( { visible: false } );

	var _tmpVector3 = new THREE.Vector3();

	// external properties

	this.renderer;
	this.domElement;

	this.forwardRendering = false;  // for debug

	// private methods

	var init = function ( parameters ) {

		_this.renderer = parameters.renderer !== undefined ? parameters.renderer : new THREE.WebGLRenderer( { antialias: false } );
		_this.domElement = _this.renderer.domElement;

		_gl = _this.renderer.context;

		_width = parameters.width !== undefined ? parameters.width : _this.renderer.getSize().width;
		_height = parameters.height !== undefined ? parameters.height : _this.renderer.getSize().height;

		var antialias = parameters.antialias !== undefined ? parameters.antialias : false;

		initPassFXAA();
		initPassNormalDepth();
		initPassColor();
		initPassLight();
		initPassFinal();

		_this.setSize( _width, _height );
		_this.setAntialias( antialias );

	};

	var initPassFXAA = function () {

		_passFXAA = new THREE.ShaderPass( THREE.FXAAShader );

	};

	var initPassNormalDepth = function () {

		_passNormalDepth = new THREE.RenderPass();
		_passNormalDepth.clear = true;

		var rt = new THREE.WebGLRenderTarget( _width, _height, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			stencilBuffer: true,
			depthTexture: new THREE.DepthTexture(
				_width,
				_height,
				THREE.UnsignedInt248Type,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				THREE.DepthStencilFormat
			)
		} );

		rt.texture.generateMipamps = false;

		_compNormalDepth = new THREE.EffectComposer( _this.renderer, rt );
		_compNormalDepth.addPass( _passNormalDepth );

	};

	var initPassColor = function () {

		_passColor = new THREE.RenderPass();
		_passColor.clear = true;

		var rt = new THREE.WebGLRenderTarget( _width, _height, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			depthTexture: _compNormalDepth.renderTarget2.depthTexture
		} );

		rt.texture.generateMipamps = false;

		_compColor = new THREE.EffectComposer( _this.renderer, rt );
		_compColor.addPass( _passColor );

	};

	var initPassLight = function () {

		_passLightFullscreen = new THREE.RenderPass();
		_passLightFullscreen.clear = true;
		_passLightFullscreen.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );

		_passLight = new THREE.RenderPass();
		_passLight.clear = false;

		var rt = new THREE.WebGLRenderTarget( _width, _height, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			depthTexture: _compNormalDepth.renderTarget2.depthTexture
		} );

		rt.texture.generateMipamps = false;

		_compLight = new THREE.EffectComposer( _this.renderer, rt );
		_compLight.addPass( _passLightFullscreen );
		_compLight.addPass( _passLight );

	};

	var initPassFinal = function () {

		_passFinal = new THREE.ShaderPass( THREE.ShaderDeferred[ 'composite' ] );
		_passFinal.clear = true;
		_passFinal.uniforms.samplerLight.value = _compLight.renderTarget2.texture;
		_passFinal.material.blending = THREE.NoBlending;
		_passFinal.material.depthWrite = false;
		_passFinal.material.depthTest = false;

		_passForward = new THREE.RenderPass();
		_passForward.clear = false;

		_passCopy = new THREE.ShaderPass( THREE.CopyShader );

		var rt = new THREE.WebGLRenderTarget( _width, _height, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			type: THREE.UnsignedByteType,
			depthTexture: _compNormalDepth.renderTarget2.depthTexture
		} );

		rt.texture.generateMipamps = false;

		_compFinal = new THREE.EffectComposer( _this.renderer, rt );
		_compFinal.addPass( _passFinal );
		_compFinal.addPass( _passForward );
		_compFinal.addPass( _passCopy );
		_compFinal.addPass( _passFXAA );

	};

	var initLightScene = function ( scene ) {

		if ( scene.userData.lightScene === undefined ) {

			var lightScene = new THREE.Scene();
			lightScene.userData.lights = {};

			scene.userData.lightScene = lightScene;

		}

		if ( scene.userData.lightFullscreenScene === undefined ) {

			var lightScene = new THREE.Scene();
			lightScene.userData.lights = {};

			lightScene.userData.emissiveLight = createDeferredEmissiveLight();
			lightScene.add( lightScene.userData.emissiveLight );

			scene.userData.lightFullscreenScene = lightScene;

		}

		_lightScene = scene.userData.lightScene;
		_lightFullscreenScene = scene.userData.lightFullscreenScene;

	};

	var initDeferredProperties = function ( object ) {

		if ( object.userData.deferredInitialized === true ) return;

		if ( object.material ) initDeferredMaterials( object );

		if ( object instanceof THREE.Light ) initDeferredLight( object );

		object.userData.deferredInitialized = true;

	};

	var initDeferredMaterials = function ( object ) {

		if ( object.material instanceof THREE.MultiMaterial ) {

			var normalDepthMaterials = [];
			var colorMaterials = [];
			var forwardMaterials = [];

			var materials = object.material.materials;

			for ( var i = 0, il = materials.length; i < il; i ++ ) {

				normalDepthMaterials.push( createDeferredNormalDepthMaterial( materials[ i ] ) );
				colorMaterials.push( createDeferredColorMaterial( materials[ i ] ) );
				forwardMaterials.push( _invisibleMaterial );

			}

			object.userData.normalDepthMaterial = new THREE.MultiMaterial( normalDepthMaterials );
			object.userData.colorMaterial = new THREE.MultiMaterial( colorMaterials );
			object.userData.forwardMaterial = new THREE.MultiMaterial( forwardMaterials );

		} else {

			object.userData.normalDepthMaterial = createDeferredNormalDepthMaterial( object.material );
			object.userData.colorMaterial = createDeferredColorMaterial( object.material );

		}

	};

	var createDeferredNormalDepthMaterial = function ( originalMaterial ) {

		var shader = THREE.ShaderDeferred[ 'normalDepth' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			blending: THREE.NoBlending
		} );

		return material;

	};

	var updateDeferredNormalDepthMaterial = function ( material, originalMaterial ) {

		if ( originalMaterial.skinning !== undefined ) material.skinning = originalMaterial.skinning;
		if ( originalMaterial.morphTargets !== undefined ) material.morphTargets = originalMaterial.morphTargets;

		if ( originalMaterial.visible === true ) {

			material.visible = ! originalMaterial.transparent;

		} else {

			material.visible = false;

		}

	};

	var createDeferredColorMaterial = function ( originalMaterial ) {

		var shader = THREE.ShaderDeferred[ 'color' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			blending: THREE.NoBlending
		} );

		if ( originalMaterial.map !== undefined ) material.map = originalMaterial.map;

		return material;

	};

	var updateDeferredColorMaterial = function ( material, originalMaterial ) {

		var diffuse, emissive;

		if ( originalMaterial instanceof THREE.MeshBasicMaterial ) {

			emissive = originalMaterial.color;

		} else {

			diffuse = originalMaterial.color;
			emissive = originalMaterial.emissive;

		}

		var specular = originalMaterial.specular;
		var shininess = originalMaterial.shininess;
		var map = originalMaterial.map;

		if ( ( originalMaterial instanceof THREE.ShaderMaterial ) && originalMaterial.uniforms !== undefined ) {

			if ( diffuse === undefined && originalMaterial.uniforms.diffuse !== undefined ) diffuse = originalMaterial.uniforms.diffuse.value;
			if ( emissive === undefined && originalMaterial.uniforms.emissive !== undefined ) emissive = originalMaterial.uniforms.emissive.value;
			if ( specular === undefined && originalMaterial.uniforms.specular !== undefined ) specular = originalMaterial.uniforms.specular.value;
			if ( shininess === undefined && originalMaterial.uniforms.shininess !== undefined ) shininess = originalMaterial.uniforms.shininess.value;

		}

		if ( diffuse !== undefined ) material.uniforms.diffuse.value.copy( diffuse );
		if ( emissive !== undefined ) material.uniforms.emissive.value.copy( emissive );
		if ( specular !== undefined ) material.uniforms.specular.value.copy( specular );
		if ( shininess !== undefined ) material.uniforms.shininess.value = shininess;

		if ( map !== undefined ) {

			material.map = map;
			material.uniforms.map.value = map;

		}

		if ( originalMaterial.skinning !== undefined ) material.skinning = originalMaterial.skinning;
		if ( originalMaterial.morphTargets !== undefined ) material.morphTargets = originalMaterial.morphTargets;

		if ( originalMaterial.visible === true ) {

			material.visible = ! originalMaterial.transparent;

		} else {

			material.visible = false;

		}

	};

	var getForwardRenderingMaterial = function ( originalMaterial ) {

		if ( originalMaterial.transparent === true && originalMaterial.visible === true ) {

			return originalMaterial

		} else {

			return _invisibleMaterial;

		}

	};

	var initDeferredLight = function ( light ) {

		var deferredLight;

		if ( light instanceof THREE.PointLight ) {

			deferredLight = createDeferredPointLight( light );

		} else if ( light instanceof THREE.SpotLight ) {

			deferredLight = createDeferredSpotLight( light );

		} else if ( light instanceof THREE.DirectionalLight ) {

			deferredLight = createDeferredDirectionalLight( light );

		}

		light.userData.deferredLight = deferredLight;

	};

	var updateDeferredLight = function ( light, camera ) {

		var originalLight = light.userData.originalLight;

		if ( originalLight instanceof THREE.PointLight ) {

			updateDeferredPointLight( light, camera );

		} else if ( originalLight instanceof THREE.SpotLight ) {

			updateDeferredSpotLight( light, camera );

		} else if ( originalLight instanceof THREE.DirectionalLight ) {

			updateDeferredDirectionalLight( light, camera );

		}

	};

	var createDeferredEmissiveLight = function () {

		var shader = THREE.ShaderDeferred[ 'emissiveLight' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			blending: THREE.NoBlending,
			depthWrite: false
		} );

		material.uniforms.samplerColor.value = _compColor.renderTarget2.texture;

		var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
		var mesh = new THREE.Mesh( geometry, material );

		return mesh;

	};

	var updateDeferredEmissiveLight = function ( light, camera ) {

		var uniforms = light.material.uniforms;

		uniforms.viewWidth.value = _width;
		uniforms.viewHeight.value = _height;

	};

	var createDeferredPointLight = function ( light ) {

		var shader = THREE.ShaderDeferred[ 'pointLight' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			transparent: true,
			side: THREE.BackSide,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
			depthFunc: THREE.GreaterEqualDepth
		} );

		material.uniforms.samplerNormalDepth.value = _compNormalDepth.renderTarget2.texture;
		material.uniforms.samplerColor.value = _compColor.renderTarget2.texture;

		var geometry = new THREE.SphereGeometry( 1, 16, 8 );
		var mesh = new THREE.Mesh( geometry, material );

		mesh.userData.originalLight = light;

		return mesh;

	};

	var updateDeferredPointLight = function ( light, camera ) {

		var originalLight = light.userData.originalLight;
		var distance = originalLight.distance;
		var uniforms = light.material.uniforms;

		uniforms.matProjInverse.value.getInverse( camera.projectionMatrix );
		uniforms.viewWidth.value = _width;
		uniforms.viewHeight.value = _height;
		uniforms.lightColor.value.copy( originalLight.color );

		if ( distance > 0 ) {

			light.scale.set( 1, 1, 1 ).multiplyScalar( distance );
			uniforms.lightRadius.value = distance;
			uniforms.lightIntensity.value = originalLight.intensity;
			uniforms.lightPositionVS.value.setFromMatrixPosition( originalLight.matrixWorld ).applyMatrix4( camera.matrixWorldInverse );
			light.position.setFromMatrixPosition( originalLight.matrixWorld );

		} else {

			uniforms.lightRadius.value = Infinity;

		}

	};

	var createDeferredSpotLight = function ( light ) {

		var shader = THREE.ShaderDeferred[ 'spotLight' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
			depthTest: false
		} );

		material.uniforms.samplerNormalDepth.value = _compNormalDepth.renderTarget2.texture;
		material.uniforms.samplerColor.value = _compColor.renderTarget2.texture;

		var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
		var mesh = new THREE.Mesh( geometry, material );

		mesh.userData.originalLight = light;

		return mesh;

	};

	var updateDeferredSpotLight = function ( light, camera ) {

		var originalLight = light.userData.originalLight;
		var uniforms = light.material.uniforms;

		uniforms.matProjInverse.value.getInverse( camera.projectionMatrix );
		uniforms.viewWidth.value = _width;
		uniforms.viewHeight.value = _height;
		uniforms.lightAngle.value = originalLight.angle;
		uniforms.lightColor.value.copy( originalLight.color );
		uniforms.lightIntensity.value = originalLight.intensity;
		uniforms.lightPositionVS.value.setFromMatrixPosition( originalLight.matrixWorld ).applyMatrix4( camera.matrixWorldInverse );

		var vec = uniforms.lightDirectionVS.value;
		var vec2 = _tmpVector3;

		vec.setFromMatrixPosition( originalLight.matrixWorld );
		vec2.setFromMatrixPosition( originalLight.target.matrixWorld );
		vec.sub( vec2 ).normalize().transformDirection( camera.matrixWorldInverse );

	};

	var createDeferredDirectionalLight = function ( light ) {

		var shader = THREE.ShaderDeferred[ 'directionalLight' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
			depthTest: false
		} );

		material.uniforms.samplerNormalDepth.value = _compNormalDepth.renderTarget2.texture;
		material.uniforms.samplerColor.value = _compColor.renderTarget2.texture;

		var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
		var mesh = new THREE.Mesh( geometry, material );

		mesh.userData.originalLight = light;

		return mesh;

	};

	var updateDeferredDirectionalLight = function ( light, camera ) {

		var originalLight = light.userData.originalLight;
		var uniforms = light.material.uniforms;

		uniforms.matProjInverse.value.getInverse( camera.projectionMatrix );
		uniforms.viewWidth.value = _width;
		uniforms.viewHeight.value = _height;
		uniforms.lightColor.value.copy( originalLight.color );
		uniforms.lightIntensity.value = originalLight.intensity;

		var vec = uniforms.lightDirectionVS.value;
		var vec2 = _tmpVector3;

		vec.setFromMatrixPosition( originalLight.matrixWorld );
		vec2.setFromMatrixPosition( originalLight.target.matrixWorld );
		vec.sub( vec2 ).normalize().transformDirection( camera.matrixWorldInverse );

	};

	var setMaterialNormalDepth = function ( object ) {

		if ( object.material === undefined ) return;

		if ( object.userData.normalDepthMaterial !== undefined ) {

			object.material = object.userData.normalDepthMaterial;

			if ( object.userData.originalMaterial instanceof THREE.MultiMaterial ) {

				for ( var i = 0, il = object.userData.originalMaterial.materials.length; i < il; i ++ ) {

					updateDeferredNormalDepthMaterial( object.material.materials[ i ], object.userData.originalMaterial.materials[ i ] );

				}

			} else {

				updateDeferredNormalDepthMaterial( object.material, object.userData.originalMaterial );

			}

		}

	};

	var setMaterialColor = function ( object ) {

		if ( object.material === undefined ) return;

		if ( object.userData.colorMaterial !== undefined ) {

			object.material = object.userData.colorMaterial;

			if ( object.userData.originalMaterial instanceof THREE.MultiMaterial ) {

				for ( var i = 0, il = object.userData.originalMaterial.materials.length; i < il; i ++ ) {

					updateDeferredColorMaterial( object.material.materials[ i ], object.userData.originalMaterial.materials[ i ] );

				}

			} else {

				updateDeferredColorMaterial( object.material, object.userData.originalMaterial );

			}

		}

	};

	var setMaterialForwardRendering = function ( object ) {

		if ( object.material === undefined ) return;

		if ( object.userData.originalMaterial instanceof THREE.MultiMaterial ) {

			object.material = object.userData.forwardMaterial;

			for ( var i = 0, il = object.userData.originalMaterial.materials.length; i < il; i ++ ) {

				object.material.materials[ i ] = getForwardRenderingMaterial( object.userData.originalMaterial.materials[ i ] );

			}

		} else {

			object.material = getForwardRenderingMaterial( object.userData.originalMaterial );

		}

	};

	var saveOriginalMaterialAndCheckTransparency = function ( object ) {

		if ( object.material !== undefined ) {

			object.userData.originalMaterial = object.material;

			if ( object.material instanceof THREE.MultiMaterial ) {

				for ( var i = 0, il = object.material.materials.length; i < il; i ++ ) {

					if ( object.material.materials[ i ].transparent === true ) _hasTransparentObject = true;

				}

			} else {

				if ( object.material.transparent === true ) _hasTransparentObject = true;

			}

		}

	};

	var restoreOriginalMaterial = function ( object ) {

		if ( object.userData.originalMaterial !== undefined ) object.material = object.userData.originalMaterial;

	};

	var enableCompositePasses = function () {

		if ( _hasTransparentObject ) {

			if ( _antialias ) {

				_passFinal.renderToScreen = false;

				_passForward.renderToScreen = false;
				_passForward.enabled = true;

				_passCopy.renderToScreen = false;
				_passCopy.enabled = false;

				_passFXAA.renderToScreen = true;
				_passFXAA.enabled = true;


			} else {

				_passFinal.renderToScreen = false;

				_passForward.renderToScreen = false;
				_passForward.enabled = true;

				_passCopy.renderToScreen = true;
				_passCopy.enabled = true;

				_passFXAA.renderToScreen = false;
				_passFXAA.enabled = false;

			}

		} else {

			if ( _antialias ) {

				_passFinal.renderToScreen = false;

				_passForward.renderToScreen = false;
				_passForward.enabled = false;

				_passCopy.renderToScreen = false;
				_passCopy.enabled = false;

				_passFXAA.renderToScreen = true;
				_passFXAA.enabled = true;

			} else {

				_passFinal.renderToScreen = true;

				_passForward.renderToScreen = false;
				_passForward.enabled = false;

				_passCopy.renderToScreen = false;
				_passCopy.enabled = false;

				_passFXAA.renderToScreen = false;
				_passFXAA.enabled = false;

			}

		}

	};

	var addDeferredLightsToLightScene = function ( object ) {

		var light = object.userData.deferredLight;

		if ( light !== undefined ) {

			var originalLight = light.userData.originalLight;
			var scene;

			if ( originalLight instanceof THREE.PointLight ) {

				scene = _lightScene;

			} else {

				scene = _lightFullscreenScene;

			}

			var lights = scene.userData.lights;

			if ( lights[ light.uuid ] === undefined ) {

				scene.add( light );

				lights[ light.uuid ] = {
					light: light,
					found: true
				};

			}

			lights[ light.uuid ].found = true;


		}

	};

	var updateDeferredLightsInLightScene = function ( scene, camera ) {

		var lights = scene.userData.lights;
		var keys = Object.keys( lights );

		for ( var i = 0, il = keys.length; i < il; i ++ ) {

			var key = keys[ i ];

			if ( lights[ key ].found === false ) {

				scene.remove( lights[ key ].light );
				delete lights[ key ];

			} else {

				updateDeferredLight( lights[ key ].light, camera );
				lights[ key ].found = false;

			}

		}

	};

	/*
	 * 1) g-buffer normal + depth pass
	 *
	 * RGB: normal
	 *   A: depth
	 */

	var renderNormalDepth = function ( scene, camera ) {

		scene.traverse( setMaterialNormalDepth );

		_passNormalDepth.scene = scene;
		_passNormalDepth.camera = camera;

		_this.renderer.autoClearDepth = true;
		_this.renderer.autoClearStencil = true;

		_gl.enable( _gl.STENCIL_TEST );
		_gl.stencilFunc( _gl.ALWAYS, 1, 0xffffffff );
		_gl.stencilOp( _gl.REPLACE, _gl.REPLACE, _gl.REPLACE );

		_compNormalDepth.render();

	};

	/*
	 * 2) g-buffer color pass
	 *
	 * R: diffuse
	 * G: emissive
	 * B: specular
	 * A: shininess
	 */

	var renderColor = function ( scene, camera ) {

		scene.traverse( setMaterialColor );

		_passColor.scene = scene;
		_passColor.camera = camera;

		_this.renderer.autoClearDepth = false;
		_this.renderer.autoClearStencil = false;

		_gl.stencilFunc( _gl.EQUAL, 1, 0xffffffff );
		_gl.stencilOp( _gl.KEEP, _gl.KEEP, _gl.KEEP );

		_compColor.render();

	};

	/*
	 * 3) light pass
	 *
	 * optimization:
	 * Here renders PointLight only back face with stencil test.
	 */

	var renderLight = function ( scene, camera ) {

		updateDeferredEmissiveLight( _lightFullscreenScene.userData.emissiveLight, camera );

		scene.traverse( addDeferredLightsToLightScene );

		updateDeferredLightsInLightScene( _lightScene, camera );
		updateDeferredLightsInLightScene( _lightFullscreenScene, camera );

		_passLight.scene = _lightScene;
		_passLight.camera = camera;

		_passLightFullscreen.scene = _lightFullscreenScene;

		_this.renderer.autoClearDepth = false;
		_this.renderer.autoClearStencil = false;

		_compLight.render();

		_gl.disable( _gl.STENCIL_TEST );

	};

	/*
	 * 4) composite pass
	 *
	 * transparency handling:
	 * If there's any transparent objects, here renders them on the deferred rendering result
	 * with forward rendering. This may be the easist way but heavy.
	 * We should consider any better ways someday.
	 *
	 * antialias handling:
	 * Here uses postprocessing FXAA for antialias.
	 */

	var renderComposite = function ( scene, camera ) {

		if ( _hasTransparentObject ) {

			scene.traverse( setMaterialForwardRendering );

			_passForward.scene = scene;
			_passForward.camera = camera;

		}

		enableCompositePasses();

		_this.renderer.autoClearDepth = false;
		_this.renderer.autoClearStencil = false;

		_compFinal.render();

	};

	// external APIs

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		this.renderer.setSize( _width, _height );

		_compNormalDepth.setSize( _width, _height );
		_compColor.setSize( _width, _height );
		_compLight.setSize( _width, _height );
		_compFinal.setSize( _width, _height );

		_compNormalDepth.renderTarget2.depthTexture.image.width = _width;
		_compNormalDepth.renderTarget2.depthTexture.image.height = _height;
		_compNormalDepth.renderTarget2.depthTexture.needsUpdate = true;

		_passFXAA.uniforms.resolution.value.set( 1 / _width, 1 / _height );

	};

	this.setAntialias = function ( enabled ) {

		_antialias = enabled;

	};

	this.render = function ( scene, camera ) {

		// for debug to compare with normal forward rendering

		if ( this.forwardRendering ) {

			this.renderer.render( scene, camera );
			return;

		}

		var tmpSceneAutoUpdate = scene.autoUpdate;
		var tmpAutoClearColor = this.renderer.autoClearColor;
		var tmpAutoClearDepth = this.renderer.autoClearDepth;
		var tmpAutoClearStencil = this.renderer.autoClearStencil;

		initLightScene( scene );

		scene.autoUpdate = false;
		scene.updateMatrixWorld();

		_hasTransparentObject = false;

		scene.traverse( initDeferredProperties );
		scene.traverse( saveOriginalMaterialAndCheckTransparency );

		renderNormalDepth( scene, camera );
		renderColor( scene, camera );
		renderLight( scene, camera );
		renderComposite( scene, camera );

		scene.traverse( restoreOriginalMaterial );

		scene.autoUpdate = tmpSceneAutoUpdate;
		this.renderer.autoClearColor = tmpAutoClearColor;
		this.renderer.autoClearDepth = tmpAutoClearDepth;
		this.renderer.autoClearStencil = tmpAutoClearStencil;

	};

	// initialize

	init( parameters );

};

THREE.DeferredShaderChunk = {

	packVector3: [

		"float vec3_to_float( vec3 data ) {",

			"const float unit = 255.0/256.0;",
			"highp float compressed = fract( data.x * unit ) + floor( data.y * unit * 255.0 ) + floor( data.z * unit * 255.0 ) * 255.0;",
			"return compressed;",

		"}"

	].join( "\n" ),

	unpackFloat: [

		"vec3 float_to_vec3( float data ) {",

			"const float unit = 255.0;",
			"vec3 uncompressed;",
			"uncompressed.x = fract( data );",
			"float zInt = floor( data / unit );",
			"uncompressed.z = fract( zInt / unit );",
			"uncompressed.y = fract( floor( data - ( zInt * unit ) ) / unit );",
			"return uncompressed;",

		"}"

	].join( "\n" ),

	computeTextureCoord: [

		"vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );"

	].join( "\n" ),

	packNormalDepth: [

		"vec4 packedNormalDepth;",
		"packedNormalDepth.xyz = normal * 0.5 + 0.5;",
		"packedNormalDepth.w = position.z / position.w;",

	].join( "\n" ),

	unpackNormalDepth: [

		"vec4 normalDepthMap = texture2D( samplerNormalDepth, texCoord );",
		"float depth = normalDepthMap.w;",

		"if ( depth == 0.0 ) discard;",

		"vec3 normal = normalDepthMap.xyz * 2.0 - 1.0;"

	].join( "\n" ),

	packColor: [

		"vec4 packedColor;",
		"packedColor.x = vec3_to_float( diffuseColor );",
		"packedColor.y = vec3_to_float( emissiveColor );",
		"packedColor.z = vec3_to_float( specularColor );",
		"packedColor.w = shininess;"

	].join( "\n" ),

	unpackColor: [

		"vec4 colorMap = texture2D( samplerColor, texCoord );",
		"vec3 diffuseColor = float_to_vec3( colorMap.x );",
		"vec3 emissiveColor = float_to_vec3( colorMap.y );",
		"vec3 specularColor = float_to_vec3( colorMap.z );",
		"float shininess = colorMap.w;",

	].join( "\n" ),

	computeVertexPositionVS: [

		"vec2 xy = texCoord * 2.0 - 1.0;",
		"vec4 vertexPositionProjected = vec4( xy, depth, 1.0 );",
		"vec4 vertexPositionVS = matProjInverse * vertexPositionProjected;",
		"vertexPositionVS.xyz /= vertexPositionVS.w;",
		"vertexPositionVS.w = 1.0;"

	].join( "\n" ),

	computeSpecular: [

		"vec3 halfVector = normalize( lightVector - normalize( vertexPositionVS.xyz ) );",
		"float dotNormalHalf = max( dot( normal, halfVector ), 0.0 );",

		"float specularNormalization = ( shininess + 2.0001 ) / 8.0;",

		"vec3 schlick = specularColor + vec3( 1.0 - specularColor ) * pow( 1.0 - dot( lightVector, halfVector ), 5.0 );",
		"vec3 specular = schlick * max( pow( dotNormalHalf, shininess ), 0.0 ) * diffuseColor * max( dot( normal, lightVector ), 0.0 ) * specularNormalization;"

	].join( "\n" ),

	combine: [

		"gl_FragColor = vec4( lightIntensity * lightColor * ( diffuseColor * max( dot( normal, lightVector ), 0.0 ) + specular ), attenuation );"

	].join( "\n" )

};

THREE.ShaderDeferred = {

	normalDepth: {

		uniforms: {},

		vertexShader: [

			"varying vec3 vNormal;",
			"varying vec4 vPosition;",

			THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
			THREE.ShaderChunk[ "skinning_pars_vertex" ],

			"void main() {",

				THREE.ShaderChunk[ "begin_vertex" ],
				THREE.ShaderChunk[ "beginnormal_vertex" ],
				THREE.ShaderChunk[ "skinbase_vertex" ],
				THREE.ShaderChunk[ "skinnormal_vertex" ],
				THREE.ShaderChunk[ "defaultnormal_vertex" ],
				THREE.ShaderChunk[ "morphtarget_vertex" ],
				THREE.ShaderChunk[ "skinning_vertex" ],
				THREE.ShaderChunk[ "project_vertex" ],

				"vNormal = normalize( normalMatrix * objectNormal );",
				"vPosition = gl_Position;",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"varying vec3 vNormal;",
			"varying vec4 vPosition;",

			"void main() {",

				"vec3 normal = vNormal;",
				"vec4 position = vPosition;",

				THREE.DeferredShaderChunk[ "packNormalDepth" ],

				"gl_FragColor = packedNormalDepth;",

			"}"

		].join( "\n" )

	},

	color: {

		uniforms: {

				map: { type: "t", value: null },
				offsetRepeat: { type: "v4", value: new THREE.Vector4( 0, 0, 1, 1 ) },

				diffuse: { type: "c", value: new THREE.Color( 0x000000 ) },
				emissive: { type: "c", value: new THREE.Color( 0x000000 ) },
				specular: { type: "c", value: new THREE.Color( 0x000000 ) },
				shininess: { type: "f", value: 30.0 }

		},

		vertexShader: [

			THREE.ShaderChunk[ "uv_pars_vertex" ],
			THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
			THREE.ShaderChunk[ "skinning_pars_vertex" ],

			"void main() {",

				THREE.ShaderChunk[ "uv_vertex" ],
				THREE.ShaderChunk[ "begin_vertex" ],
				THREE.ShaderChunk[ "beginnormal_vertex" ],
				THREE.ShaderChunk[ "skinbase_vertex" ],
				THREE.ShaderChunk[ "skinnormal_vertex" ],
				THREE.ShaderChunk[ "defaultnormal_vertex" ],
				THREE.ShaderChunk[ "morphtarget_vertex" ],
				THREE.ShaderChunk[ "skinning_vertex" ],
				THREE.ShaderChunk[ "project_vertex" ],

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform vec3 diffuse;",
			"uniform vec3 emissive;",
			"uniform vec3 specular;",
			"uniform float shininess;",

			THREE.ShaderChunk[ "uv_pars_fragment" ],
			THREE.ShaderChunk[ "map_pars_fragment" ],
			THREE.DeferredShaderChunk[ "packVector3" ],

			"void main() {",

				"vec3 diffuseColor = diffuse;",
				"vec3 emissiveColor = emissive;",
				"vec3 specularColor = specular;",

				THREE.ShaderChunk[ "map_fragment" ],
				THREE.DeferredShaderChunk[ "packColor" ],

				"gl_FragColor = packedColor;",

			"}"

		].join( "\n" )

	},

	emissiveLight: {

		uniforms: {

			samplerColor: { type: "t", value: null },
			viewWidth: { type: "f", value: 800 },
			viewHeight: { type: "f", value: 600 }

		},

		vertexShader: [

			"void main() { ",

				"gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

			"}"

		].join( '\n' ),

		fragmentShader: [

			"uniform sampler2D samplerColor;",

			"uniform float viewHeight;",
			"uniform float viewWidth;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				THREE.DeferredShaderChunk[ "computeTextureCoord" ],
				THREE.DeferredShaderChunk[ "unpackColor" ],

				"gl_FragColor = vec4( emissiveColor, 1.0 );",

			"}"

		].join( '\n' )

	},

	pointLight: {

		uniforms: {

			samplerNormalDepth: { type: "t", value: null },
			samplerColor: { type: "t", value: null },

			matProjInverse: { type: "m4", value: new THREE.Matrix4() },

			viewWidth: { type: "f", value: 800 },
			viewHeight: { type: "f", value: 600 },

			lightColor: { type: "c", value: new THREE.Color( 0x000000 ) },
			lightPositionVS: { type: "v3", value: new THREE.Vector3( 0, 1, 0 ) },
			lightIntensity: { type: "f", value: 1.0 },
			lightRadius: { type: "f", value: 1.0 }

		},

		vertexShader: [

			"void main() {",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D samplerNormalDepth;",
			"uniform sampler2D samplerColor;",

			"uniform float viewHeight;",
			"uniform float viewWidth;",

			"uniform vec3 lightColor;",
			"uniform vec3 lightPositionVS;",
			"uniform float lightIntensity;",
			"uniform float lightRadius;",

			"uniform mat4 matProjInverse;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				THREE.DeferredShaderChunk[ "computeTextureCoord" ],
				THREE.DeferredShaderChunk[ "unpackNormalDepth" ],
				THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],

				"vec3 lightVector = lightPositionVS - vertexPositionVS.xyz;",
				"float distance = length( lightVector );",

				"if ( distance > lightRadius ) discard;",

				"lightVector = normalize( lightVector );",

				THREE.DeferredShaderChunk[ "unpackColor" ],
				THREE.DeferredShaderChunk[ "computeSpecular" ],

				"//float cutoff = 0.3;",
				"//float denom = distance / lightRadius + 1.0;",
				"//float attenuation = 1.0 / ( denom * denom );",
				"//attenuation = ( attenuation - cutoff ) / ( 1.0 - cutoff );",
				"//attenuation = max( attenuation, 0.0 );",
				"//attenuation *= attenuation;",

				"//diffuseColor *= saturate( -distance / lightRadius + 1.0 );",
				"//float attenuation = 1.0;",

				"float attenuation = saturate( -distance / lightRadius + 1.0 );",

				THREE.DeferredShaderChunk[ "combine" ],

			"}"

		].join( "\n" )

	},

	spotLight: {

		uniforms: {

			samplerNormalDepth: { type: "t", value: null },
			samplerColor: { type: "t", value: null },

			matProjInverse: { type: "m4", value: new THREE.Matrix4() },

			viewWidth: { type: "f", value: 800 },
			viewHeight: { type: "f", value: 600 },

			lightColor: { type: "c", value: new THREE.Color( 0x000000 ) },
			lightDirectionVS: { type: "v3", value: new THREE.Vector3( 0, 1, 0 ) },
			lightPositionVS: { type: "v3", value: new THREE.Vector3( 0, 1, 0 ) },
			lightAngle: { type: "f", value: 1.0 },
			lightIntensity: { type: "f", value: 1.0 }

		},

		vertexShader: [

			"void main() { ",

				"gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D samplerNormalDepth;",
			"uniform sampler2D samplerColor;",

			"uniform float viewHeight;",
			"uniform float viewWidth;",

			"uniform vec3 lightColor;",
			"uniform vec3 lightPositionVS;",
			"uniform vec3 lightDirectionVS;",
			"uniform float lightAngle;",
			"uniform float lightIntensity;",

			"uniform mat4 matProjInverse;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				THREE.DeferredShaderChunk[ "computeTextureCoord" ],
				THREE.DeferredShaderChunk[ "unpackNormalDepth" ],
				THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],
				THREE.DeferredShaderChunk[ "unpackColor" ],

				"vec3 lightVector = normalize( lightPositionVS.xyz - vertexPositionVS.xyz );",

				"float rho = dot( lightDirectionVS, lightVector );",
				"float rhoMax = cos( lightAngle * 0.5 );",

				"if ( rho <= rhoMax ) discard;",

				"float theta = rhoMax + 0.0001;",
				"float phi = rhoMax + 0.05;",
				"float falloff = 4.0;",

				"float spot = 0.0;",

				"if ( rho >= phi ) {",

					"spot = 1.0;",

				"} else if ( rho <= theta ) {",

					"spot = 0.0;",

				"} else { ",

					"spot = pow( ( rho - theta ) / ( phi - theta ), falloff );",

				"}",

				"diffuseColor *= spot;",

				THREE.DeferredShaderChunk[ "computeSpecular" ],

				"const float attenuation = 1.0;",

				THREE.DeferredShaderChunk[ "combine" ],

			"}"

		].join( "\n" )

	},

	directionalLight: {

		uniforms: {

			samplerNormalDepth: { type: "t", value: null },
			samplerColor: { type: "t", value: null },

			matProjInverse: { type: "m4", value: new THREE.Matrix4() },

			viewWidth: { type: "f", value: 800 },
			viewHeight: { type: "f", value: 600 },

			lightColor: { type: "c", value: new THREE.Color( 0x000000 ) },
			lightDirectionVS : { type: "v3", value: new THREE.Vector3( 0, 1, 0 ) },
			lightIntensity: { type: "f", value: 1.0 }

		},

		vertexShader: [

			"void main() { ",

				"gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

			"}"

		].join( '\n' ),

		fragmentShader: [

			"uniform sampler2D samplerNormalDepth;",
			"uniform sampler2D samplerColor;",

			"uniform float viewHeight;",
			"uniform float viewWidth;",

			"uniform vec3 lightColor;",
			"uniform vec3 lightDirectionVS;",
			"uniform float lightIntensity;",

			"uniform mat4 matProjInverse;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				THREE.DeferredShaderChunk[ "computeTextureCoord" ],
				THREE.DeferredShaderChunk[ "unpackNormalDepth" ],
				THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],
				THREE.DeferredShaderChunk[ "unpackColor" ],

				"vec3 lightVector = normalize( lightDirectionVS );",

				THREE.DeferredShaderChunk[ "computeSpecular" ],

				"const float attenuation = 1.0;",

				THREE.DeferredShaderChunk[ "combine" ],

			"}"

		].join( '\n' ),

	},

	composite: {

		uniforms: {

			samplerLight: { type: "t", value: null }

		},

		vertexShader: [

			"varying vec2 texCoord;",

			"void main() {",

				"vec4 pos = vec4( sign( position.xy ), 0.0, 1.0 );",
				"texCoord = pos.xy * vec2( 0.5 ) + 0.5;",
				"gl_Position = pos;",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"varying vec2 texCoord;",
			"uniform sampler2D samplerLight;",

			"void main() {",

				"gl_FragColor = texture2D( samplerLight, texCoord );",

			"}"

		].join( "\n" )

	}

};