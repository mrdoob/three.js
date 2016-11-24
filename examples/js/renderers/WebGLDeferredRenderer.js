/**
 * @author alteredq / http://alteredqualia.com/
 * @author MPanknin / http://www.redplant.de/
 * @author takahiro / https://github.com/takahirox
 *
 * WebGLDeferredRenderer supports two types of Deferred Renderings.
 * One is Classic Deferred Rendering and the other one is
 * Light Pre-Pass (Deferred Lighting).
 * Classic Deferred Rendering is default. You can use Light Pre-Pass
 * by calling .enableLightPrePass( true ) method.
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

	// for Classic Deferred Rendering
	var _compColor;
	var _passColor, _passForward, _passCopy;

	// for Light Pre-Pass
	var _compReconstruction;
	var _passReconstruction;

	// for Common
	var _compNormalDepth, _compLight, _compFinal;
	var _passNormalDepth, _passLight, _passLightFullscreen, _passFinal, _passFXAA;

	var _depthTexture;

	var _lightScene, _lightFullscreenScene;

	var _antialias = false, _hasTransparentObject = false, _lightPrePass = false;

	var _invisibleMaterial = new THREE.ShaderMaterial( { visible: false } );

	var _tmpVector3 = new THREE.Vector3();

	// external properties

	this.renderer;
	this.domElement;

	this.forwardRendering = false;  // for debug

	// private methods

	function init( parameters ) {

		_this.renderer = parameters.renderer !== undefined ? parameters.renderer : new THREE.WebGLRenderer( { antialias: false } );
		_this.domElement = _this.renderer.domElement;

		_gl = _this.renderer.context;

		_width = parameters.width !== undefined ? parameters.width : _this.renderer.getSize().width;
		_height = parameters.height !== undefined ? parameters.height : _this.renderer.getSize().height;

		var antialias = parameters.antialias !== undefined ? parameters.antialias : false;

		initDepthTexture();

		initPassNormalDepth();
		initPassColor();
		initPassLight();
		initPassReconstruction();
		initPassFinal();

		_this.setSize( _width, _height );
		_this.setAntialias( antialias );
		_this.enableLightPrePass( false );

	}

	function initDepthTexture() {

		_depthTexture = new THREE.DepthTexture(
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

	}

	function initPassNormalDepth() {

		_passNormalDepth = new THREE.RenderPass();
		_passNormalDepth.clear = true;

		var rt = new THREE.WebGLRenderTarget( _width, _height, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			stencilBuffer: true,
			depthTexture: _depthTexture
		} );

		rt.texture.generateMipamps = false;

		_compNormalDepth = new THREE.EffectComposer( _this.renderer, rt );
		_compNormalDepth.addPass( _passNormalDepth );

	}

	function initPassColor() {

		_passColor = new THREE.RenderPass();
		_passColor.clear = true;

		var rt = new THREE.WebGLRenderTarget( _width, _height, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			depthTexture: _depthTexture
		} );

		rt.texture.generateMipamps = false;

		_compColor = new THREE.EffectComposer( _this.renderer, rt );
		_compColor.addPass( _passColor );

	}

	function initPassLight() {

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
			depthTexture: _depthTexture
		} );

		rt.texture.generateMipamps = false;

		_compLight = new THREE.EffectComposer( _this.renderer, rt );
		_compLight.addPass( _passLightFullscreen );
		_compLight.addPass( _passLight );

	}

	function initPassReconstruction() {

		_passReconstruction = new THREE.RenderPass();
		_passReconstruction.clear = true;

		var rt = new THREE.WebGLRenderTarget( _width, _height, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			depthTexture: _depthTexture
		} );

		rt.texture.generateMipamps = false;

		_compReconstruction = new THREE.EffectComposer( _this.renderer, rt );
		_compReconstruction.addPass( _passReconstruction );

	}

	function initPassFinal() {

		_passFinal = new THREE.ShaderPass( THREE.ShaderDeferred[ 'final' ] );
		_passFinal.clear = true;
		_passFinal.uniforms.samplerResult.value = _compLight.renderTarget2.texture;
		_passFinal.material.blending = THREE.NoBlending;
		_passFinal.material.depthWrite = false;
		_passFinal.material.depthTest = false;

		_passForward = new THREE.RenderPass();
		_passForward.clear = false;

		_passCopy = new THREE.ShaderPass( THREE.CopyShader );

		_passFXAA = new THREE.ShaderPass( THREE.FXAAShader );

		var rt = new THREE.WebGLRenderTarget( _width, _height, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			type: THREE.UnsignedByteType,
			depthTexture: _depthTexture
		} );

		rt.texture.generateMipamps = false;

		_compFinal = new THREE.EffectComposer( _this.renderer, rt );
		_compFinal.addPass( _passFinal );
		_compFinal.addPass( _passForward );
		_compFinal.addPass( _passCopy );
		_compFinal.addPass( _passFXAA );

	}

	function initLightScene( scene ) {

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

		// emissiveLight is only for Classic Deferred Rendering
		_lightFullscreenScene.userData.emissiveLight.visible = ! _lightPrePass;

	}

	function setMaterialNormalDepth( object ) {

		if ( object.material === undefined ) return;

		object.material = getNormalDepthMaterial( object );

		if ( object.userData.originalMaterial.isMultiMaterial === true ) {

			for ( var i = 0, il = object.userData.originalMaterial.materials.length; i < il; i ++ ) {

				updateDeferredNormalDepthMaterial( object.material.materials[ i ], object.userData.originalMaterial.materials[ i ], _lightPrePass );

			}

		} else {

			updateDeferredNormalDepthMaterial( object.material, object.userData.originalMaterial, _lightPrePass );

		}

	}

	function getNormalDepthMaterial( object ) {

		if ( ( _lightPrePass && object.userData.normalDepthShininessMaterial === undefined ) ||
		     ( ! _lightPrePass && object.userData.normalDepthMaterial === undefined ) ) {

			initDeferredNormalDepthMaterial( object, _lightPrePass );

		}

		return ( _lightPrePass ) ? object.userData.normalDepthShininessMaterial : object.userData.normalDepthMaterial;

	}

	function initDeferredNormalDepthMaterial( object, isLightPrePass ) {

		var originalMaterial = object.userData.originalMaterial;
		var material;

		if ( originalMaterial.isMultiMaterial === true ) {

			var materials = [];

			for ( var i = 0, il = originalMaterial.materials.length; i < il; i ++ ) {

				materials.push( createDeferredNormalDepthMaterial( originalMaterial.materials[ i ], isLightPrePass ) );

			}

			material = new THREE.MultiMaterial( materials );

		} else {

			material = createDeferredNormalDepthMaterial( originalMaterial, isLightPrePass );

		}

		if ( isLightPrePass ) {

			object.userData.normalDepthShininessMaterial = material;

		} else {

			object.userData.normalDepthMaterial = material;

		}

	}

	function createDeferredNormalDepthMaterial( originalMaterial, isLightPrePass ) {

		var shader = ( isLightPrePass ) ? THREE.ShaderDeferred[ 'normalDepthShininess' ] : THREE.ShaderDeferred[ 'normalDepth' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			blending: THREE.NoBlending
		} );

		return material;

	}

	function updateDeferredNormalDepthMaterial( material, originalMaterial, isLightPrePass ) {

		if ( originalMaterial.skinning !== undefined ) material.skinning = originalMaterial.skinning;
		if ( originalMaterial.morphTargets !== undefined ) material.morphTargets = originalMaterial.morphTargets;

		if ( isLightPrePass ) {

			var shininess = originalMaterial.shininess;

			if ( ( originalMaterial.isShaderMaterial === true ) && originalMaterial.uniforms !== undefined ) {

				if ( shininess === undefined && originalMaterial.uniforms.shininess !== undefined ) shininess = originalMaterial.uniforms.shininess.value;

			}

			if ( shininess !== undefined ) material.uniforms.shininess.value = shininess;

		}

		if ( originalMaterial.visible === true ) {

			material.visible = ! originalMaterial.transparent;

		} else {

			material.visible = false;

		}

	}

	function setMaterialColor( object ) {

		if ( object.material === undefined ) return;

		object.material = getColorMaterial( object );

		if ( object.userData.originalMaterial.isMultiMaterial === true ) {

			for ( var i = 0, il = object.userData.originalMaterial.materials.length; i < il; i ++ ) {

				updateDeferredColorMaterial( object.material.materials[ i ], object.userData.originalMaterial.materials[ i ] );

			}

		} else {

			updateDeferredColorMaterial( object.material, object.userData.originalMaterial );

		}

	}

	function getColorMaterial( object ) {

		if ( object.userData.colorMaterial === undefined ) {

			initDeferredColorMaterial( object );

		}

		return object.userData.colorMaterial;

	}

	function initDeferredColorMaterial( object ) {

		var originalMaterial = object.userData.originalMaterial;

		if ( originalMaterial.isMultiMaterial === true ) {

			var materials = [];

			for ( var i = 0, il = originalMaterial.materials.length; i < il; i ++ ) {

				materials.push( createDeferredColorMaterial( originalMaterial.materials[ i ] ) );

			}

			object.userData.colorMaterial = new THREE.MultiMaterial( materials );

		} else {

			object.userData.colorMaterial = createDeferredColorMaterial( originalMaterial );

		}

	}

	function createDeferredColorMaterial( originalMaterial ) {

		var shader = THREE.ShaderDeferred[ 'color' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			blending: THREE.NoBlending
		} );

		if ( originalMaterial.map !== undefined ) material.map = originalMaterial.map;

		return material;

	}

	function updateDeferredColorMaterial( material, originalMaterial ) {

		var diffuse, emissive;

		if ( originalMaterial.isMeshBasicMaterial === true ) {

			emissive = originalMaterial.color;

		} else {

			diffuse = originalMaterial.color;
			emissive = originalMaterial.emissive;

		}

		var specular = originalMaterial.specular;
		var shininess = originalMaterial.shininess;
		var map = originalMaterial.map;

		if ( originalMaterial.isShaderMaterial === true && originalMaterial.uniforms !== undefined ) {

			if ( diffuse === undefined && originalMaterial.uniforms.diffuse !== undefined ) diffuse = originalMaterial.uniforms.diffuse.value;
			if ( emissive === undefined && originalMaterial.uniforms.emissive !== undefined ) emissive = originalMaterial.uniforms.emissive.value;
			if ( specular === undefined && originalMaterial.uniforms.specular !== undefined ) specular = originalMaterial.uniforms.specular.value;
			if ( shininess === undefined && originalMaterial.uniforms.shininess !== undefined ) shininess = originalMaterial.uniforms.shininess.value;

		}

		if ( diffuse !== undefined ) material.uniforms.diffuse.value.copy( diffuse );
		if ( emissive !== undefined ) material.uniforms.emissive.value.copy( emissive );
		if ( specular !== undefined ) material.uniforms.specular.value.copy( specular );
		if ( shininess !== undefined && material.uniforms.shininess !== undefined ) material.uniforms.shininess.value = shininess;

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

	}

	function setMaterialReconstruction( object ) {

		if ( object.material === undefined ) return;

		if ( object.userData.originalMaterial.transparent === true ) {

			object.material = object.userData.originalMaterial;

			return;

		}

		object.material = getReconstructionMaterial( object );

		if ( object.userData.originalMaterial.isMultiMaterial === true ) {

			for ( var i = 0, il = object.userData.originalMaterial.materials.length; i < il; i ++ ) {

				updateDeferredReconstructionMaterial( object.material.materials[ i ], object.userData.originalMaterial.materials[ i ] );

			}

		} else {

			updateDeferredReconstructionMaterial( object.material, object.userData.originalMaterial );

		}

	}

	function getReconstructionMaterial( object ) {

		if ( object.userData.reconstructionMaterial === undefined ) {

			initDeferredReconstructionMaterial( object );

		}

		return object.userData.reconstructionMaterial;

	}

	function initDeferredReconstructionMaterial( object ) {

		var originalMaterial = object.userData.originalMaterial;

		if ( originalMaterial.isMultiMaterial === true ) {

			var materials = [];

			for ( var i = 0, il = originalMaterial.materials.length; i < il; i ++ ) {

				materials.push( createDeferredReconstructionMaterial( originalMaterial.materials[ i ] ) );

			}

			object.userData.reconstructionMaterial = new THREE.MultiMaterial( materials );

		} else {

			object.userData.reconstructionMaterial = createDeferredReconstructionMaterial( originalMaterial );

		}

	}

	function createDeferredReconstructionMaterial( originalMaterial ) {

		var shader = THREE.ShaderDeferred[ 'reconstruction' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			blending: THREE.NoBlending
		} );

		if ( originalMaterial.map !== undefined ) material.map = originalMaterial.map;

		material.uniforms.samplerLight.value = _compLight.renderTarget2.texture;

		return material;

	}

	function updateDeferredReconstructionMaterial( material, originalMaterial ) {

		updateDeferredColorMaterial( material, originalMaterial );

		material.uniforms.viewWidth.value = _width;
		material.uniforms.viewHeight.value = _height;

	}

	function setMaterialForwardRendering( object ) {

		if ( object.material === undefined ) return;

		if ( object.userData.originalMaterial.isMultiMaterial === true ) {

			if ( object.userData.forwardMaterial === undefined ) {

				initInvisibleMaterial( object );

			}

			object.material = object.userData.forwardMaterial;

			for ( var i = 0, il = object.userData.originalMaterial.materials.length; i < il; i ++ ) {

				object.material.materials[ i ] = getForwardRenderingMaterial( object.userData.originalMaterial.materials[ i ] );

			}

		} else {

			object.material = getForwardRenderingMaterial( object.userData.originalMaterial );

		}

	}

	function initInvisibleMaterial( object ) {

		if ( object.userData.originalMaterial.isMultiMaterial === true ) {

			var materials = [];

			for ( var i = 0, il = object.userData.originalMaterial.materials.length; i < il; i ++ ) {

				materials.push( _invisibleMaterial );

			}

			object.userData.forwardMaterial = new THREE.MultiMaterial( materials );

		}

	}

	function getForwardRenderingMaterial( originalMaterial ) {

		if ( originalMaterial.transparent === true && originalMaterial.visible === true ) {

			return originalMaterial

		} else {

			return _invisibleMaterial;

		}

	}

	function createDeferredEmissiveLight() {

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

	}

	function updateDeferredEmissiveLight( light, camera ) {

		var uniforms = light.material.uniforms;

		uniforms.viewWidth.value = _width;
		uniforms.viewHeight.value = _height;

	}

	function initDeferredLight( light ) {

		var deferredLight;

		if ( light.isPointLight ) {

			deferredLight = createDeferredPointLight( light );

		} else if ( light.isSpotLight ) {

			deferredLight = createDeferredSpotLight( light );

		} else if ( light.isDirectionalLight ) {

			deferredLight = createDeferredDirectionalLight( light );

		} else {

			deferredLight = null;

		}

		light.userData.deferredLight = deferredLight;

	}

	function initDeferredLightMaterial( light, isLightPrePass ) {

		var originalLight = light.userData.originalLight;
		var material;

		if ( originalLight.isPointLight ) {

			material = createDeferredPointLightMaterial( isLightPrePass );

		} else if ( originalLight.isSpotLight ) {

			material = createDeferredSpotLightMaterial( isLightPrePass );

		} else if ( originalLight.isDirectionalLight ) {

			material = createDeferredDirectionalLightMaterial( isLightPrePass );

		} else {

			material = null;

		}

		if ( isLightPrePass ) {

			light.userData.materialLightPrePass = material;

		} else {

			light.userData.materialClassic = material;

		}

	}

	function getDeferredLightMaterial( light ) {

		if ( ( _lightPrePass && light.userData.materialLightPrePass === undefined ) ||
		     ( ! _lightPrePass && light.userData.materialClassic === undefined ) ) {

			initDeferredLightMaterial( light, _lightPrePass );

		}

		return ( _lightPrePass ) ? light.userData.materialLightPrePass : light.userData.materialClassic;

	}

	function updateDeferredLight( light, camera ) {

		var originalLight = light.userData.originalLight;

		if ( originalLight.isPointLight ) {

			updateDeferredPointLight( light, camera );

		} else if ( originalLight.isSpotLight ) {

			updateDeferredSpotLight( light, camera );

		} else if ( originalLight.isDirectionalLight ) {

			updateDeferredDirectionalLight( light, camera );

		}

	}

	function createDeferredLightMesh( light, geometry ) {

		var mesh = new THREE.Mesh( geometry, _invisibleMaterial );

		mesh.userData.originalLight = light;

		return mesh;

	}

	function createDeferredLightMaterial( shader, isLightPrePass ) {

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		} );

		if ( isLightPrePass ) {

			material.premultipliedAlpha = true;
			material.uniforms.samplerNormalDepthShininess.value = _compNormalDepth.renderTarget2.texture;

		} else {

			material.uniforms.samplerNormalDepth.value = _compNormalDepth.renderTarget2.texture;
			material.uniforms.samplerColor.value = _compColor.renderTarget2.texture;

		}

		return material;

	}

	function createDeferredPointLight( light ) {

		return createDeferredLightMesh( light, new THREE.SphereGeometry( 1, 16, 8 ) );

	}

	/*
	 * optimization:
	 * Renders PointLight only back face with stencil test.
	 */
	function createDeferredPointLightMaterial( isLightPrePass ) {

		var shader = ( isLightPrePass ) ? THREE.ShaderDeferred[ 'pointLightPre' ] : THREE.ShaderDeferred[ 'pointLight' ];

		var material = createDeferredLightMaterial( shader, isLightPrePass );

		material.side = THREE.BackSide;
		material.depthFunc = THREE.GreaterEqualDepth;

		return material;

	}

	function updateDeferredPointLight( light, camera ) {

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

	}

	function createDeferredSpotLight( light ) {

		return createDeferredLightMesh(	light, new THREE.PlaneBufferGeometry( 2, 2 ) );

	}

	function createDeferredSpotLightMaterial( isLightPrePass ) {

		var shader = ( isLightPrePass ) ? THREE.ShaderDeferred[ 'spotLightPre' ] : THREE.ShaderDeferred[ 'spotLight' ];

		var material = createDeferredLightMaterial( shader, isLightPrePass );

		material.depthTest = false;

		return material;

	}

	function updateDeferredSpotLight( light, camera ) {

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

	}

	function createDeferredDirectionalLight( light ) {

		return createDeferredLightMesh(	light, new THREE.PlaneBufferGeometry( 2, 2 ) );

	}

	function createDeferredDirectionalLightMaterial( isLightPrePass ) {

		var shader = ( isLightPrePass ) ? THREE.ShaderDeferred[ 'directionalLightPre' ] : THREE.ShaderDeferred[ 'directionalLight' ];

		var material = createDeferredLightMaterial( shader, isLightPrePass );

		material.depthTest = false;

		return material;

	}

	function updateDeferredDirectionalLight( light, camera ) {

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

	}

	function saveOriginalMaterialAndCheckTransparency( object ) {

		if ( object.material !== undefined ) {

			object.userData.originalMaterial = object.material;

			if ( _hasTransparentObject ) return;

			if ( object.material.isMultiMaterial === true ) {

				for ( var i = 0, il = object.material.materials.length; i < il; i ++ ) {

					if ( object.material.materials[ i ].transparent === true ) {

						_hasTransparentObject = true;
						break;

					}

				}

			} else {

				if ( object.material.transparent === true ) _hasTransparentObject = true;

			}

		}

	}

	function restoreOriginalMaterial( object ) {

		if ( object.userData.originalMaterial !== undefined ) object.material = object.userData.originalMaterial;

	}

	function addDeferredLightsToLightScene( object ) {

		if ( object.isLight !== true ) return;

		if ( object.userData.deferredLight === undefined ) {

			initDeferredLight( object );

		}

		var light = object.userData.deferredLight;

		if ( light === null ) return;

		var scene = ( object.isPointLight === true ) ? _lightScene : _lightFullscreenScene;

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

	function updateDeferredLightsInLightScene( scene, camera ) {

		var lights = scene.userData.lights;
		var keys = Object.keys( lights );

		for ( var i = 0, il = keys.length; i < il; i ++ ) {

			var key = keys[ i ];

			if ( lights[ key ].found === false ) {

				scene.remove( lights[ key ].light );
				delete lights[ key ];

			} else {

				var light = lights[ key ].light;
				var material = getDeferredLightMaterial( light );
				light.material = material;

				updateDeferredLight( light, camera );
				lights[ key ].found = false;

			}

		}

	}

	function enableFinalPasses() {

		if ( _lightPrePass ) {

			_passForward.renderToScreen = false;
			_passForward.enabled = false;

			_passCopy.renderToScreen = false;
			_passCopy.enabled = false;

			if ( _antialias ) {

				_passFinal.renderToScreen = false;

				_passFXAA.renderToScreen = true;
				_passFXAA.enabled = true;

			} else {

				_passFinal.renderToScreen = true;

				_passFXAA.renderToScreen = false;
				_passFXAA.enabled = false;

			}

		} else {

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

		}

	}

	/*
	 * Classic Deferred Rendering
	 *
	 * 1) g-buffer normal + depth pass
	 *
	 * RGB: normal
	 *   A: depth
	 *
	 *
	 * Light Pre-Pass Rendering
	 *
	 * 1') g-buffer normal + depth pass + shininess
	 *
	 *   R: normal
	 *   B: shininess
	 *   A: depth
	 */

	function renderNormalDepth( scene, camera ) {

		scene.traverse( setMaterialNormalDepth );

		_passNormalDepth.scene = scene;
		_passNormalDepth.camera = camera;

		_this.renderer.autoClearDepth = true;
		_this.renderer.autoClearStencil = true;

		_gl.enable( _gl.STENCIL_TEST );
		_gl.stencilFunc( _gl.ALWAYS, 1, 0xffffffff );
		_gl.stencilOp( _gl.REPLACE, _gl.REPLACE, _gl.REPLACE );

		_compNormalDepth.render();

	}

	/*
	 * Classic Deferred Rendering
	 *
	 * 2) g-buffer color pass
	 *
	 * R: diffuse
	 * G: emissive
	 * B: specular
	 * A: shininess
	 */

	function renderColor( scene, camera ) {

		scene.traverse( setMaterialColor );

		_passColor.scene = scene;
		_passColor.camera = camera;

		_this.renderer.autoClearDepth = false;
		_this.renderer.autoClearStencil = false;

		_gl.stencilFunc( _gl.EQUAL, 1, 0xffffffff );
		_gl.stencilOp( _gl.KEEP, _gl.KEEP, _gl.KEEP );

		_compColor.render();

	}

	/*
	 * Classic Deferred Rendering
	 *
	 * 3) light pass
	 */

	function renderLight( scene, camera ) {

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

	}

	/*
	 * Light Pre-Pass Rendering
	 *
	 * 2') Light pre pass
	 */

	function renderLightPre( scene, camera ) {

		scene.traverse( addDeferredLightsToLightScene );

		updateDeferredLightsInLightScene( _lightScene, camera );
		updateDeferredLightsInLightScene( _lightFullscreenScene, camera );

		_passLight.scene = _lightScene;
		_passLight.camera = camera;

		_passLightFullscreen.scene = _lightFullscreenScene;

		_this.renderer.autoClearDepth = false;
		_this.renderer.autoClearStencil = false;

		_gl.stencilFunc( _gl.EQUAL, 1, 0xffffffff );
		_gl.stencilOp( _gl.KEEP, _gl.KEEP, _gl.KEEP );

		_compLight.render();

	}

	/*
	 * Light Pre-Pass Rendering
	 *
	 * 3') Reconstruction pass
	 *
	 * Transprency handling:
	 * Here renders transparent objects with normal forward rendering.
	 */

	function renderReconstruction( scene, camera ) {

		scene.traverse( setMaterialReconstruction );

		_passReconstruction.scene = scene;
		_passReconstruction.camera = camera;

		_this.renderer.autoClearDepth = false;
		_this.renderer.autoClearStencil = false;

		_compReconstruction.render();

		_gl.disable( _gl.STENCIL_TEST );

	}

	/*
	 * Classic Deferred Rendering
	 *
	 * 4) Final pass
	 *
	 * transparency handling:
	 * If there's any transparent objects, here renders them on the deferred rendering result
	 * with normal forward rendering. This may be the easist way but heavy.
	 * We should consider any better ways someday.
	 *
	 *
	 * Light Pre-Pass Rendering
	 *
	 * 4') Final pass
	 *
	 *
	 * Common
	 *
	 * antialias handling:
	 * Here uses postprocessing FXAA for antialias.
	 *
	 */

	function renderFinal( scene, camera ) {

		if ( ! _lightPrePass && _hasTransparentObject ) {

			scene.traverse( setMaterialForwardRendering );

			_passForward.scene = scene;
			_passForward.camera = camera;

		}

		enableFinalPasses();

		_this.renderer.autoClearDepth = false;
		_this.renderer.autoClearStencil = false;

		_compFinal.render();

	}

	// external APIs

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		this.renderer.setSize( _width, _height );

		_compNormalDepth.setSize( _width, _height );
		_compColor.setSize( _width, _height );
		_compLight.setSize( _width, _height );
		_compReconstruction.setSize( _width, _height );
		_compFinal.setSize( _width, _height );

		_depthTexture.image.width = _width;
		_depthTexture.image.height = _height;
		_depthTexture.needsUpdate = true;

		_passFXAA.uniforms.resolution.value.set( 1 / _width, 1 / _height );

	};

	this.setAntialias = function ( enabled ) {

		_antialias = enabled;

	};

	this.enableLightPrePass = function ( enabled ) {

		_lightPrePass = enabled;

		_passFinal.uniforms.samplerResult.value = ( _lightPrePass ) ? _compReconstruction.renderTarget2.texture : _compLight.renderTarget2.texture;

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

		scene.traverse( saveOriginalMaterialAndCheckTransparency );

		renderNormalDepth( scene, camera );

		if ( _lightPrePass ) {

			renderLightPre( scene, camera );
			renderReconstruction( scene, camera );

		} else {

			renderColor( scene, camera );
			renderLight( scene, camera );

		}

		renderFinal( scene, camera );

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

	// TODO: optimize normal packing. reference http://aras-p.info/texts/CompactNormalStorage.html
	packNormalDepthShininess: [

		"vec4 packedNormalDepthShininess;",
		"packedNormalDepthShininess.x = vec3_to_float( normal * 0.5 + 0.5 );",
		"packedNormalDepthShininess.z = shininess;",
		"packedNormalDepthShininess.w = position.z / position.w;"

	].join( "\n" ),

	unpackNormalDepthShininess: [

		"vec4 normalDepthMap = texture2D( samplerNormalDepthShininess, texCoord );",
		"float depth = normalDepthMap.w;",

		"if ( depth == 0.0 ) discard;",

		"vec3 normal = float_to_vec3( normalDepthMap.x ) * 2.0 - 1.0;",
		"float shininess = normalDepthMap.z;"


	].join( "\n" ),

	packColor: [

		"vec4 packedColor;",
		"packedColor.x = vec3_to_float( diffuseColor.rgb );",
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

	packLight: [

		"vec4 packedLight;",
		"packedLight.xyz = lightIntensity * lightColor * max( dot( lightVector, normal ), 0.0 ) * attenuation;",
		"packedLight.w = lightIntensity * specular * max( dot( lightVector, normal ), 0.0 ) * attenuation;",

	].join( "\n" ),

	computeVertexPositionVS: [

		"vec2 xy = texCoord * 2.0 - 1.0;",
		"vec4 vertexPositionProjected = vec4( xy, depth, 1.0 );",
		"vec4 vertexPositionVS = matProjInverse * vertexPositionProjected;",
		"vertexPositionVS.xyz /= vertexPositionVS.w;",
		"vertexPositionVS.w = 1.0;"

	].join( "\n" ),

	// TODO: calculate schlick
	computeSpecular: [

		"vec3 halfVector = normalize( lightVector - normalize( vertexPositionVS.xyz ) );",
		"float dotNormalHalf = max( dot( normal, halfVector ), 0.0 );",
		"float specular = 0.31830988618 * ( shininess * 0.5 + 1.0 ) * pow( dotNormalHalf, shininess );",

	].join( "\n" ),

	combine: [

		"gl_FragColor = vec4( lightIntensity * lightColor * max( dot( lightVector, normal ), 0.0 ) * ( diffuseColor + specular * specularColor ) * attenuation, 1.0 );"

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

				"vec4 diffuseColor = vec4( diffuse, 1.0 );",
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

	normalDepthShininess: {

		uniforms: {

			shininess: { type: "f", value: 30.0 }

		},

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

			"uniform float shininess;",

			THREE.DeferredShaderChunk[ "packVector3" ],

			"void main() {",

				"vec3 normal = vNormal;",
				"vec4 position = vPosition;",

				THREE.DeferredShaderChunk[ "packNormalDepthShininess" ],

				"gl_FragColor = packedNormalDepthShininess;",

			"}"

		].join( "\n" )

	},

	pointLightPre: {

		uniforms: {

			samplerNormalDepthShininess: { type: "t", value: null },

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

			"uniform sampler2D samplerNormalDepthShininess;",

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
				THREE.DeferredShaderChunk[ "unpackNormalDepthShininess" ],
				THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],

				"vec3 lightVector = lightPositionVS - vertexPositionVS.xyz;",
				"float distance = length( lightVector );",

				"if ( distance > lightRadius ) discard;",

				"lightVector = normalize( lightVector );",

				THREE.DeferredShaderChunk[ "computeSpecular" ],

				"float attenuation = saturate( -distance / lightRadius + 1.0 );",

				THREE.DeferredShaderChunk[ "packLight" ],

				"gl_FragColor = packedLight;",

			"}"

		].join( "\n" )

	},

	spotLightPre: {

		uniforms: {

			samplerNormalDepthShininess: { type: "t", value: null },

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

			"uniform sampler2D samplerNormalDepthShininess;",

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
				THREE.DeferredShaderChunk[ "unpackNormalDepthShininess" ],
				THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],

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

				THREE.DeferredShaderChunk[ "computeSpecular" ],

				"const float attenuation = 1.0;",

				THREE.DeferredShaderChunk[ "packLight" ],

				"gl_FragColor = spot * packedLight;",

			"}"

		].join( "\n" )

	},

	directionalLightPre: {

		uniforms: {

			samplerNormalDepthShininess: { type: "t", value: null },

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

			"uniform sampler2D samplerNormalDepthShininess;",

			"uniform float viewHeight;",
			"uniform float viewWidth;",

			"uniform vec3 lightColor;",
			"uniform vec3 lightDirectionVS;",
			"uniform float lightIntensity;",

			"uniform mat4 matProjInverse;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				THREE.DeferredShaderChunk[ "computeTextureCoord" ],
				THREE.DeferredShaderChunk[ "unpackNormalDepthShininess" ],
				THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],

				"vec3 lightVector = normalize( lightDirectionVS );",

				THREE.DeferredShaderChunk[ "computeSpecular" ],

				"const float attenuation = 1.0;",

				THREE.DeferredShaderChunk[ "packLight" ],

				"gl_FragColor = packedLight;",

			"}"

		].join( '\n' ),

	},

	reconstruction: {

		uniforms: {

			samplerLight: { type: "t", value: null },

			map: { type: "t", value: null },
			offsetRepeat: { type: "v4", value: new THREE.Vector4( 0, 0, 1, 1 ) },

			viewWidth: { type: "f", value: 800 },
			viewHeight: { type: "f", value: 600 },

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

			"uniform sampler2D samplerLight;",

			"uniform vec3 diffuse;",
			"uniform vec3 emissive;",
			"uniform vec3 specular;",
			"uniform float shininess;",

			"uniform float viewHeight;",
			"uniform float viewWidth;",

			THREE.ShaderChunk[ "uv_pars_fragment" ],
			THREE.ShaderChunk[ "map_pars_fragment" ],

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				"vec4 diffuseColor = vec4( diffuse, 1.0 );",
				"vec3 emissiveColor = emissive;",
				"vec3 specularColor = specular;",

				THREE.DeferredShaderChunk[ "computeTextureCoord" ],

				"vec4 light = texture2D( samplerLight, texCoord );",

				THREE.ShaderChunk[ "map_fragment" ],

				"vec3 diffuseFinal = diffuseColor.rgb * light.rgb;",
				"vec3 emissiveFinal = emissiveColor;",
				"vec3 specularFinal = specularColor * light.rgb * ( light.a / ( 0.2126 * light.r + 0.7152 * light.g + 0.0722 * light.b + 0.00001 ) );",

				"gl_FragColor = vec4( diffuseFinal + emissiveFinal + specularFinal, 1.0 );",

			"}"

		].join( "\n" )

	},

	// TODO: implement tone mapping
	final: {

		uniforms: {

			samplerResult: { type: "t", value: null }

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
			"uniform sampler2D samplerResult;",

			"void main() {",

				"gl_FragColor = texture2D( samplerResult, texCoord );",

			"}"

		].join( "\n" )

	}

};