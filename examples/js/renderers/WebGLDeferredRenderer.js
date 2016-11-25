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

	var _currentCamera;

	var _lightScene, _lightFullscreenScene;

	var _antialias = false;
	var _hasTransparentObject = false;
	var _lightPrePass = false;
	var _cacheKeepAlive = false;

	var _invisibleMaterial = new THREE.ShaderMaterial( { visible: false } );

	var _tmpVector3 = new THREE.Vector3();

	// scene/material/light cache for deferred rendering.
	// save them at the creation and release
	// if they're unused removeThresholdCount frames
	// unless _cacheKeepAlive is true.

	// scene.uuid -> lightScene, lightFullscreenScene
	var _lightScenesCache = {};
	var _lightFullscreenScenesCache = {};

	// originalMaterial.uuid -> deferredMaterial
	// (no mapping from children of MultiMaterial)
	var _normalDepthMaterialsCache = {};
	var _normalDepthShininessMaterialsCache = {};
	var _colorMaterialsCache = {};
	var _reconstructionMaterialsCache = {};
	var _invisibleMultiMaterialsCache = {};

	// originalLight.uuid -> deferredLight
	var _deferredLightsCache = {};

	// deferredLight.uuid -> deferredLightMaterial
	var _classicDeferredLightMaterialsCache = {};
	var _lightPrePassMaterialsCache = {};

	var _removeThresholdCount = 60;

	// object.uuid -> originalMaterial
	// deferred materials.uuid -> originalMaterial
	// save before render and release after render.
	var _originalMaterialsTable = {};

	// object.uuid -> originalOnBeforeRender
	// save before render and release after render.
	var _originalOnBeforeRendersTable = {};

	// external properties

	this.renderer = undefined;
	this.domElement = undefined;

	this.forwardRendering = false;  // for debug

	// private methods

	function init( parameters ) {

		_this.renderer = parameters.renderer !== undefined ? parameters.renderer : new THREE.WebGLRenderer( { antialias: false } );
		_this.domElement = _this.renderer.domElement;

		_gl = _this.renderer.context;

		_width = parameters.width !== undefined ? parameters.width : _this.renderer.getSize().width;
		_height = parameters.height !== undefined ? parameters.height : _this.renderer.getSize().height;

		var antialias = parameters.antialias !== undefined ? parameters.antialias : false;

		if ( parameters.cacheKeepAlive !== undefined ) _cacheKeepAlive = parameters.cacheKeepAlive;

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
		);

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
		_passLightFullscreen.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

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

		var lightSceneData = _lightScenesCache[ scene.uuid ];
		var lightFullscreenSceneData = _lightFullscreenScenesCache[ scene.uuid ];

		if ( lightSceneData === undefined ) {

			var s = new THREE.Scene();
			s.userData.lights = {};

			lightSceneData = createCacheData();
			lightSceneData.scene = s;

			_lightScenesCache[ scene.uuid ] = lightSceneData;

		}

		if ( lightFullscreenSceneData === undefined ) {

			var s = new THREE.Scene();
			s.userData.lights = {};

			var emissiveLight = createDeferredEmissiveLight();

			s.userData.emissiveLight = emissiveLight;
			s.add( emissiveLight );

			lightFullscreenSceneData = createCacheData();
			lightFullscreenSceneData.scene = s;

			_lightFullscreenScenesCache[ scene.uuid ] = lightFullscreenSceneData;

		}

		lightSceneData.used = true;
		lightFullscreenSceneData.used = true;

		var lightScene = lightSceneData.scene;
		var lightFullscreenScene = lightFullscreenSceneData.scene;

		// emissiveLight is only for Classic Deferred Rendering
		lightFullscreenScene.userData.emissiveLight.visible = ! _lightPrePass;

		_lightScene = lightScene;
		_lightFullscreenScene = lightFullscreenScene;

	}

	function getMaterialFromCacheOrCreate( originalMaterial, cache, func ) {

		var data = cache[ originalMaterial.uuid ];

		if ( data === undefined ) {

			data = createCacheData();

			var material;

			if ( originalMaterial.isMultiMaterial === true ) {

				var materials = [];

				for ( var i = 0, il = originalMaterial.materials.length; i < il; i ++ ) {

					materials.push( func( originalMaterial.materials[ i ] ) );

				}

				material = new THREE.MultiMaterial( materials );

			} else {

				material = func( originalMaterial );

			}

			data.material = material;

			cache[ originalMaterial.uuid ] = data;

		}

		return data.material;

	}

	function setMaterialNormalDepth( object ) {

		if ( object.material === undefined ) return;

		var originalMaterial = _originalMaterialsTable[ object.uuid ]
		var material = getNormalDepthMaterial( originalMaterial );

		_originalMaterialsTable[ material.uuid ] = originalMaterial;

		if ( material.isMultiMaterial === true ) {

			for ( var i = 0, il = material.materials.length; i < il; i ++ ) {

				_originalMaterialsTable[ material.materials[ i ].uuid ] = originalMaterial.materials[ i ];
				updateDeferredNormalDepthMaterial( material.materials[ i ], originalMaterial.materials[ i ] );

			}

		} else {

			updateDeferredNormalDepthMaterial( material, originalMaterial );

		}

		object.material = material;
		object.onBeforeRender = updateDeferredNormalDepthUniforms;

	}

	function getNormalDepthMaterial( originalMaterial ) {

		return getMaterialFromCacheOrCreate(
			originalMaterial,
			( _lightPrePass ) ? _normalDepthShininessMaterialsCache : _normalDepthMaterialsCache,
			createDeferredNormalDepthMaterial
		);

	}

	function createDeferredNormalDepthMaterial( originalMaterial ) {

		var shader = ( _lightPrePass ) ? THREE.ShaderDeferred[ 'normalDepthShininess' ] : THREE.ShaderDeferred[ 'normalDepth' ];

		return new THREE.ShaderMaterial( {
			uniforms: Object.assign( {}, shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			blending: THREE.NoBlending
		} );

	}

	function updateDeferredNormalDepthMaterial( material, originalMaterial ) {

		if ( originalMaterial.skinning !== undefined ) material.skinning = originalMaterial.skinning;
		if ( originalMaterial.morphTargets !== undefined ) material.morphTargets = originalMaterial.morphTargets;

		if ( originalMaterial.visible === true ) {

			material.visible = ! originalMaterial.transparent;

		} else {

			material.visible = false;

		}

	}

	function updateDeferredNormalDepthUniforms( renderer, scene, camera, geometry, material, group ) {

		if ( ! _lightPrePass ) return;

		var originalMaterial = _originalMaterialsTable[ material.uuid ];

		if ( originalMaterial === undefined || originalMaterial.shininess === undefined ) return;

		material.uniforms.shininess.value = originalMaterial.shininess;

	}

	function setMaterialColor( object ) {

		if ( object.material === undefined ) return;

		var originalMaterial = _originalMaterialsTable[ object.uuid ]
		var material = getColorMaterial( originalMaterial );

		_originalMaterialsTable[ material.uuid ] = originalMaterial;

		if ( originalMaterial.isMultiMaterial === true ) {

			for ( var i = 0, il = originalMaterial.materials.length; i < il; i ++ ) {

				_originalMaterialsTable[ material.materials[ i ].uuid ] = originalMaterial.materials[ i ];
				updateDeferredColorMaterial( material.materials[ i ], originalMaterial.materials[ i ] );

			}

		} else {

			updateDeferredColorMaterial( material, originalMaterial );

		}

		object.material = material;
		object.onBeforeRender = updateDeferredColorUniforms;

	}

	function getColorMaterial( originalMaterial ) {

		return getMaterialFromCacheOrCreate(
			originalMaterial,
			_colorMaterialsCache,
			createDeferredColorMaterial
		);

	}

	function createDeferredColorMaterial( originalMaterial ) {

		var shader = THREE.ShaderDeferred[ 'color' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: Object.assign( {}, shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			blending: THREE.NoBlending
		} );

		if ( originalMaterial.map !== undefined ) material.map = originalMaterial.map;

		return material;

	}

	function updateDeferredColorMaterial( material, originalMaterial ) {

		if ( originalMaterial.map !== undefined ) material.map = originalMaterial.map;
		if ( originalMaterial.skinning !== undefined ) material.skinning = originalMaterial.skinning;
		if ( originalMaterial.morphTargets !== undefined ) material.morphTargets = originalMaterial.morphTargets;

		if ( originalMaterial.visible === true ) {

			material.visible = ! originalMaterial.transparent;

		} else {

			material.visible = false;

		}

	}

	function updateDeferredColorUniforms( renderer, scene, camera, geometry, material, group ) {

		var originalMaterial = _originalMaterialsTable[ material.uuid ];
		var uniforms = material.uniforms;

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

		if ( diffuse !== undefined ) uniforms.diffuse.value.copy( diffuse );
		if ( emissive !== undefined ) uniforms.emissive.value.copy( emissive );
		if ( specular !== undefined ) uniforms.specular.value.copy( specular );
		if ( shininess !== undefined && uniforms.shininess !== undefined ) uniforms.shininess.value = shininess;
		if ( map !== undefined ) uniforms.map.value = map;

	}

	function setMaterialReconstruction( object ) {

		if ( object.material === undefined ) return;

		var originalMaterial = _originalMaterialsTable[ object.uuid ];

		if ( originalMaterial.transparent === true ) {

			object.material = originalMaterial;
			object.onBeforeRender = _originalOnBeforeRendersTable[ object.uuid ];

			return;

		}

		var material = getReconstructionMaterial( originalMaterial );
		_originalMaterialsTable[ material.uuid ] = originalMaterial;

		if ( originalMaterial.isMultiMaterial === true ) {

			for ( var i = 0, il = originalMaterial.materials.length; i < il; i ++ ) {

				_originalMaterialsTable[ material.materials[ i ].uuid ] = originalMaterial.materials[ i ];
				updateDeferredReconstructionMaterial( material.materials[ i ], originalMaterial.materials[ i ] );

			}

		} else {

			updateDeferredReconstructionMaterial( material, originalMaterial );

		}

		object.material = material;
		object.onBeforeRender = updateDeferredReconstructionUniforms;

	}

	function getReconstructionMaterial( originalMaterial ) {

		return getMaterialFromCacheOrCreate(
			originalMaterial,
			_reconstructionMaterialsCache,
			createDeferredReconstructionMaterial
		);

	}

	function createDeferredReconstructionMaterial( originalMaterial ) {

		var shader = THREE.ShaderDeferred[ 'reconstruction' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: Object.assign( {}, shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			blending: THREE.NoBlending
		} );

		if ( originalMaterial.map !== undefined ) material.map = originalMaterial.map;

		return material;

	}

	function updateDeferredReconstructionMaterial( material, originalMaterial ) {

		updateDeferredColorMaterial( material, originalMaterial );

	}

	function updateDeferredReconstructionUniforms( renderer, scene, camera, geometry, material, group ) {

		updateDeferredColorUniforms( renderer, scene, camera, geometry, material, group );

		material.uniforms.samplerLight.value = _compLight.renderTarget2.texture;

	}

	function setMaterialForwardRendering( object ) {

		if ( object.material === undefined ) return;

		var originalMaterial = _originalMaterialsTable[ object.uuid ];

		if ( originalMaterial.isMultiMaterial === true ) {

			var material = getInvisibleMultiMaterial( originalMaterial );

			for ( var i = 0, il = originalMaterial.materials.length; i < il; i ++ ) {

				material.materials[ i ] = getForwardRenderingMaterial( originalMaterial.materials[ i ] );

			}

			object.material = material;

		} else {

			object.material = getForwardRenderingMaterial( originalMaterial );

		}

		object.onBeforeRender = _originalOnBeforeRendersTable[ object.uuid ];

	}

	function getInvisibleMultiMaterial( originalMaterial ) {

		return getMaterialFromCacheOrCreate(
			originalMaterial,
			_invisibleMultiMaterialsCache,
			createInvisibleMaterial
		);

	}

	function createInvisibleMaterial( originalMaterial ) {

		return _invisibleMaterial;

	}

	function getForwardRenderingMaterial( originalMaterial ) {

		if ( originalMaterial.transparent === true && originalMaterial.visible === true ) {

			return originalMaterial;

		} else {

			return _invisibleMaterial;

		}

	}

	function createDeferredEmissiveLight() {

		var shader = THREE.ShaderDeferred[ 'emissiveLight' ];

		var material = new THREE.ShaderMaterial( {
			uniforms: Object.assign( {}, shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			blending: THREE.NoBlending,
			depthWrite: false
		} );

		var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
		var mesh = new THREE.Mesh( geometry, material );

		mesh.onBeforeRender = function ( renderer, scene, camera, geometry, material, group ) {

			material.uniforms.samplerColor.value = _compColor.renderTarget2.texture;

		};

		return mesh;

	}

	function createDeferredLight( originalLight ) {

		if ( originalLight.isPointLight ) {

			return createDeferredPointLight( originalLight );

		} else if ( originalLight.isSpotLight ) {

			return createDeferredSpotLight( originalLight );

		} else if ( originalLight.isDirectionalLight ) {

			return createDeferredDirectionalLight( originalLight );

		}

		return null;

	}

	function createDeferredLightMaterial( originalLight ) {

		if ( originalLight.isPointLight ) {

			return createDeferredPointLightMaterial();

		} else if ( originalLight.isSpotLight ) {

			return createDeferredSpotLightMaterial();

		} else if ( originalLight.isDirectionalLight ) {

			return createDeferredDirectionalLightMaterial();

		}

		return null;

	}

	function getDeferredLightMaterial( light ) {

		var cache = ( _lightPrePass ) ? _lightPrePassMaterialsCache : _classicDeferredLightMaterialsCache;

		var data = cache[ light.uuid ];

		if ( data === undefined ) {

			data = createCacheData();
			data.material = createDeferredLightMaterial( light.userData.originalLight );

			cache[ light.uuid ] = data;

		}

		return data.material;

	}

	function updateDeferredLight( light ) {

		var originalLight = light.userData.originalLight;

		if ( originalLight.isPointLight ) {

			updateDeferredPointLight( light );

		}

	}

	function createDeferredLightMesh( light, geometry ) {

		var mesh = new THREE.Mesh( geometry, _invisibleMaterial );

		mesh.userData.originalLight = light;

		return mesh;

	}

	function createDeferredLightShaderMaterial( shader ) {

		var material = new THREE.ShaderMaterial( {
			uniforms: Object.assign( {}, shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		} );

		if ( _lightPrePass ) material.premultipliedAlpha = true;

		return material;

	}

	function updateDeferredLightCommonUniforms( uniforms ) {

		if ( _lightPrePass ) {

			uniforms.samplerNormalDepthShininess.value = _compNormalDepth.renderTarget2.texture;

		} else {

			uniforms.samplerNormalDepth.value = _compNormalDepth.renderTarget2.texture;
			uniforms.samplerColor.value = _compColor.renderTarget2.texture;

		}

	}

	function createDeferredPointLight( light ) {

		var mesh = createDeferredLightMesh( light, new THREE.SphereGeometry( 1, 16, 8 ) );
		mesh.onBeforeRender = updateDeferredPointLightUniforms;
		return mesh;

	}

	/*
	 * optimization:
	 * Renders PointLight only back face with stencil test.
	 */
	function createDeferredPointLightMaterial() {

		var shader = ( _lightPrePass ) ? THREE.ShaderDeferred[ 'pointLightPre' ] : THREE.ShaderDeferred[ 'pointLight' ];

		var material = createDeferredLightShaderMaterial( shader );

		material.side = THREE.BackSide;
		material.depthFunc = THREE.GreaterEqualDepth;

		return material;

	}

	function updateDeferredPointLight( light ) {

		var originalLight = light.userData.originalLight;
		var distance = originalLight.distance;

		if ( distance > 0 ) {

			light.scale.set( 1, 1, 1 ).multiplyScalar( distance );
			light.position.setFromMatrixPosition( originalLight.matrixWorld );

		}

	}

	function updateDeferredPointLightUniforms( renderer, scene, camera, geometry, material, group ) {

		var light = this;

		var originalLight = light.userData.originalLight;
		var distance = originalLight.distance;
		var uniforms = material.uniforms;

		uniforms.lightColor.value.copy( originalLight.color );

		if ( distance > 0 ) {

			uniforms.lightRadius.value = distance;
			uniforms.lightIntensity.value = originalLight.intensity;
			uniforms.lightPositionVS.value.setFromMatrixPosition( originalLight.matrixWorld ).applyMatrix4( _currentCamera.matrixWorldInverse );

		} else {

			uniforms.lightRadius.value = Infinity;

		}

		updateDeferredLightCommonUniforms( uniforms );

	}

	function createDeferredSpotLight( light ) {

		var mesh = createDeferredLightMesh( light, new THREE.PlaneBufferGeometry( 2, 2 ) );
		mesh.onBeforeRender = updateDeferredSpotLightUniforms;
		return mesh;

	}

	function createDeferredSpotLightMaterial() {

		var shader = ( _lightPrePass ) ? THREE.ShaderDeferred[ 'spotLightPre' ] : THREE.ShaderDeferred[ 'spotLight' ];

		var material = createDeferredLightShaderMaterial( shader );

		material.depthTest = false;

		return material;

	}

	function updateDeferredSpotLightUniforms( renderer, scene, camera, geometry, material, group ) {

		var light = this;

		var originalLight = light.userData.originalLight;
		var uniforms = light.material.uniforms;

		uniforms.lightAngle.value = originalLight.angle;
		uniforms.lightColor.value.copy( originalLight.color );
		uniforms.lightIntensity.value = originalLight.intensity;
		uniforms.lightPositionVS.value.setFromMatrixPosition( originalLight.matrixWorld ).applyMatrix4( _currentCamera.matrixWorldInverse );

		var vec = uniforms.lightDirectionVS.value;
		var vec2 = _tmpVector3;

		vec.setFromMatrixPosition( originalLight.matrixWorld );
		vec2.setFromMatrixPosition( originalLight.target.matrixWorld );
		vec.sub( vec2 ).normalize().transformDirection( _currentCamera.matrixWorldInverse );

		updateDeferredLightCommonUniforms( uniforms );

	}

	function createDeferredDirectionalLight( light ) {

		var mesh = createDeferredLightMesh( light, new THREE.PlaneBufferGeometry( 2, 2 ) );
		mesh.onBeforeRender = updateDeferredDirectionalLightUniforms;
		return mesh;

	}

	function createDeferredDirectionalLightMaterial() {

		var shader = ( _lightPrePass ) ? THREE.ShaderDeferred[ 'directionalLightPre' ] : THREE.ShaderDeferred[ 'directionalLight' ];

		var material = createDeferredLightShaderMaterial( shader );

		material.depthTest = false;

		return material;

	}

	function updateDeferredDirectionalLightUniforms( renderer, scene, camera, geometry, material, group ) {

		var light = this;

		var originalLight = light.userData.originalLight;
		var uniforms = light.material.uniforms;

		uniforms.lightColor.value.copy( originalLight.color );
		uniforms.lightIntensity.value = originalLight.intensity;

		var vec = uniforms.lightDirectionVS.value;
		var vec2 = _tmpVector3;

		vec.setFromMatrixPosition( originalLight.matrixWorld );
		vec2.setFromMatrixPosition( originalLight.target.matrixWorld );
		vec.sub( vec2 ).normalize().transformDirection( _currentCamera.matrixWorldInverse );

		updateDeferredLightCommonUniforms( uniforms );

	}

	function saveOriginalMaterialAndCheckTransparency( object ) {

		if ( object.material === undefined ) return;

		_originalMaterialsTable[ object.uuid ] = object.material;
		_originalOnBeforeRendersTable[ object.uuid ] = object.onBeforeRender;

		// _hasTransparentObject is used only for Classic Deferred Rendering
		if ( _hasTransparentObject || _lightPrePass ) return;

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

	function restoreOriginalMaterial( object ) {

		if ( object.material === undefined ) return;

		object.material = _originalMaterialsTable[ object.uuid ];
		object.onBeforeRender = _originalOnBeforeRendersTable[ object.uuid ];

	}

	function addDeferredLightsToLightScene( object ) {

		if ( object.isLight !== true ) return;

		var data = _deferredLightsCache[ object.uuid ];

		if ( data === undefined ) {

			data = createCacheData();
			data.light = createDeferredLight( object );

			_deferredLightsCache[ object.uuid ] = data;

		}

		var light = data.light;

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

	function updateDeferredLightsInLightScene( scene ) {

		var lights = scene.userData.lights;
		var keys = Object.keys( lights );

		for ( var i = 0, il = keys.length; i < il; i ++ ) {

			var key = keys[ i ];

			if ( lights[ key ].found === false ) {

				scene.remove( lights[ key ].light );
				delete lights[ key ];

			} else {

				var light = lights[ key ].light;
				light.material = getDeferredLightMaterial( light );

				updateDeferredLight( light );
				lights[ key ].found = false;

			}

		}

	}

	function updateDeferredCommonUniforms( camera ) {

		var uniforms = THREE.ShaderDeferredCommon[ 'commonUniforms' ];

		uniforms.viewWidth.value = _width;
		uniforms.viewHeight.value = _height;

		uniforms.matProjInverse.value.getInverse( camera.projectionMatrix );

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

	function createCacheData() {

		return {
			used: true,
			keepAlive: _cacheKeepAlive,
			count: 0
		};

	}

	function cleanupCache( cache ) {

		var keys = Object.keys( cache );

		for ( var i = 0, il = keys.length; i < il; i ++ ) {

			var key = keys[ i ];

			if ( cache[ key ].used === false ) {

				cache[ key ].count++;

				if ( cache[ key ].keepAlive === false && cache[ key ].count > _removeThresholdCount ) {

					delete cache[ key ];

				}

			} else {

				cache[ key ].used = false;
				cache[ key ].count = 0;

			}

		}

	}

	function cleanupTable( table ) {

		var keys = Object.keys( cache );

		for ( var i = 0, il = keys.length; i < il; i ++ ) {

			var key = keys[ i ];

			table[ key ] = undefined;

		}

	}

	function cleanupCaches() {

		cleanupCache( _lightScenesCache );
		cleanupCache( _lightFullscreenScenesCache );
		cleanupCache( _normalDepthMaterialsCache );
		cleanupCache( _normalDepthShininessMaterialsCache );
		cleanupCache( _colorMaterialsCache );
		cleanupCache( _reconstructionMaterialsCache );
		cleanupCache( _invisibleMultiMaterialsCache );
		cleanupCache( _classicDeferredLightMaterialsCache );
		cleanupCache( _lightPrePassMaterialsCache );
		cleanupCache( _deferredLightsCache );

		cleanupTable( _originalMaterialsTable );
		cleanupTable( _originalOnBeforeRendersTable );

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
	 *  RG: normal
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

		scene.traverse( addDeferredLightsToLightScene );

		updateDeferredLightsInLightScene( _lightScene );
		updateDeferredLightsInLightScene( _lightFullscreenScene );

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

		updateDeferredLightsInLightScene( _lightScene );
		updateDeferredLightsInLightScene( _lightFullscreenScene );

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

		var currentSceneAutoUpdate = scene.autoUpdate;
		var currentAutoClearColor = this.renderer.autoClearColor;
		var currentAutoClearDepth = this.renderer.autoClearDepth;
		var currentAutoClearStencil = this.renderer.autoClearStencil;

		_currentCamera = camera;

		initLightScene( scene );

		scene.autoUpdate = false;
		scene.updateMatrixWorld();

		_hasTransparentObject = false;

		scene.traverse( saveOriginalMaterialAndCheckTransparency );

		updateDeferredCommonUniforms( camera );

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

		scene.autoUpdate = currentSceneAutoUpdate;
		this.renderer.autoClearColor = currentAutoClearColor;
		this.renderer.autoClearDepth = currentAutoClearDepth;
		this.renderer.autoClearStencil = currentAutoClearStencil;

	};

	// initialize

	init( parameters );

};

THREE.DeferredShaderChunk = {

	packVector3: [

		"float vec3_to_float( vec3 data ) {",

		"	const float unit = 255.0/256.0;",
		"	highp float compressed = fract( data.x * unit ) + floor( data.y * unit * 255.0 ) + floor( data.z * unit * 255.0 ) * 255.0;",
		"	return compressed;",

		"}"

	].join( "\n" ),

	unpackFloat: [

		"vec3 float_to_vec3( float data ) {",

		"	const float unit = 255.0;",
		"	vec3 uncompressed;",
		"	uncompressed.x = fract( data );",
		"	float zInt = floor( data / unit );",
		"	uncompressed.z = fract( zInt / unit );",
		"	uncompressed.y = fract( floor( data - ( zInt * unit ) ) / unit );",
		"	return uncompressed;",

		"}"

	].join( "\n" ),

	// Refer to http://aras-p.info/texts/CompactNormalStorage.html
	packNormal: [

		"vec2 normal_to_vec2( vec3 normal ) {",

		"	return normal.xy / sqrt( normal.z * 8.0 + 8.0 ) + 0.5;",

		"}"

	].join( "\n" ),

	unpackVector2: [

		"vec3 vec2_to_normal( vec2 data ) {",

		"	vec2 fenc = data * 4.0 - 2.0;",
		"	float f = dot( fenc, fenc );",
		"	float g = sqrt( 1.0 - f / 4.0 );",
		"	vec3 normal;",
		"	normal.xy = fenc * g;",
		"	normal.z = 1.0 - f / 2.0;",
		"	return normal;",

		"}"

	].join( "\n" ),

	computeTextureCoord: [

		"vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );"

	].join( "\n" ),

	packNormalDepth: [

		"vec4 packedNormalDepth;",
		"packedNormalDepth.xyz = normal * 0.5 + 0.5;",
		"packedNormalDepth.w = position.z / position.w;"

	].join( "\n" ),

	unpackNormalDepth: [

		"vec4 normalDepthMap = texture2D( samplerNormalDepth, texCoord );",
		"float depth = normalDepthMap.w;",

		"if ( depth == 0.0 ) discard;",

		"vec3 normal = normalDepthMap.xyz * 2.0 - 1.0;"

	].join( "\n" ),

	packNormalDepthShininess: [

		"vec4 packedNormalDepthShininess;",
		"packedNormalDepthShininess.xy = normal_to_vec2( normal );",
		"packedNormalDepthShininess.z = shininess;",
		"packedNormalDepthShininess.w = position.z / position.w;"

	].join( "\n" ),

	unpackNormalDepthShininess: [

		"vec4 normalDepthMap = texture2D( samplerNormalDepthShininess, texCoord );",
		"float depth = normalDepthMap.w;",

		"if ( depth == 0.0 ) discard;",

		"vec3 normal = vec2_to_normal( normalDepthMap.xy );",
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
		"float shininess = colorMap.w;"

	].join( "\n" ),

	packLight: [

		"vec4 packedLight;",
		"packedLight.xyz = lightIntensity * lightColor * max( dot( lightVector, normal ), 0.0 ) * attenuation;",
		"packedLight.w = lightIntensity * specular * max( dot( lightVector, normal ), 0.0 ) * attenuation;"

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
		"float specular = 0.31830988618 * ( shininess * 0.5 + 1.0 ) * pow( dotNormalHalf, shininess );"

	].join( "\n" ),

	combine: [

		"gl_FragColor = vec4( lightIntensity * lightColor * max( dot( lightVector, normal ), 0.0 ) * ( diffuseColor + specular * specularColor ) * attenuation, 1.0 );"

	].join( "\n" )

};

THREE.ShaderDeferredCommon = {

	commonUniforms: {

		matProjInverse: new THREE.Uniform( new THREE.Matrix4() ),

		viewWidth: new THREE.Uniform( 800 ),
		viewHeight: new THREE.Uniform( 600 )

	}

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

			"	vNormal = normalize( normalMatrix * objectNormal );",
			"	vPosition = gl_Position;",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"varying vec3 vNormal;",
			"varying vec4 vPosition;",

			"void main() {",

			"	vec3 normal = vNormal;",
			"	vec4 position = vPosition;",

			THREE.DeferredShaderChunk[ "packNormalDepth" ],

			"	gl_FragColor = packedNormalDepth;",

			"}"

		].join( "\n" )

	},

	color: {

		uniforms: {

			map: new THREE.Uniform( null ),
			offsetRepeat: new THREE.Uniform( new THREE.Vector4( 0, 0, 1, 1 ) ),

			diffuse: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
			emissive: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
			specular: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
			shininess: new THREE.Uniform( 30.0 )

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

			"	vec4 diffuseColor = vec4( diffuse, 1.0 );",
			"	vec3 emissiveColor = emissive;",
			"	vec3 specularColor = specular;",

			THREE.ShaderChunk[ "map_fragment" ],
			THREE.DeferredShaderChunk[ "packColor" ],

			"	gl_FragColor = packedColor;",

			"}"

		].join( "\n" )

	},

	emissiveLight: {

		uniforms: Object.assign(

			{

				samplerColor: new THREE.Uniform( null )

			},

			THREE.ShaderDeferredCommon[ 'commonUniforms' ]

		),

		vertexShader: [

			"void main() { ",

			"	gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

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

			"	gl_FragColor = vec4( emissiveColor, 1.0 );",

			"}"

		].join( '\n' )

	},

	pointLight: {

		uniforms: Object.assign(

			{

				samplerNormalDepth: new THREE.Uniform( null ),
				samplerColor: new THREE.Uniform( null ),

				lightColor: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
				lightPositionVS: new THREE.Uniform( new THREE.Vector3( 0, 1, 0 ) ),
				lightIntensity: new THREE.Uniform( 1.0 ),
				lightRadius: new THREE.Uniform( 1.0 )

			},

			THREE.ShaderDeferredCommon[ 'commonUniforms' ]

		),

		vertexShader: [

			"void main() {",

			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

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

			"	vec3 lightVector = lightPositionVS - vertexPositionVS.xyz;",
			"	float distance = length( lightVector );",

			"	if ( distance > lightRadius ) discard;",

			"	lightVector = normalize( lightVector );",

			THREE.DeferredShaderChunk[ "unpackColor" ],
			THREE.DeferredShaderChunk[ "computeSpecular" ],

			"	//float cutoff = 0.3;",
			"	//float denom = distance / lightRadius + 1.0;",
			"	//float attenuation = 1.0 / ( denom * denom );",
			"	//attenuation = ( attenuation - cutoff ) / ( 1.0 - cutoff );",
			"	//attenuation = max( attenuation, 0.0 );",
			"	//attenuation *= attenuation;",

			"	//diffuseColor *= saturate( -distance / lightRadius + 1.0 );",
			"	//float attenuation = 1.0;",

			"	float attenuation = saturate( -distance / lightRadius + 1.0 );",

			THREE.DeferredShaderChunk[ "combine" ],

			"}"

		].join( "\n" )

	},

	spotLight: {

		uniforms: Object.assign(

			{

				samplerNormalDepth: new THREE.Uniform( null ),
				samplerColor: new THREE.Uniform( null ),

				lightColor: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
				lightDirectionVS: new THREE.Uniform( new THREE.Vector3( 0, 1, 0 ) ),
				lightPositionVS: new THREE.Uniform( new THREE.Vector3( 0, 1, 0 ) ),
				lightAngle: new THREE.Uniform( 1.0 ),
				lightIntensity: new THREE.Uniform( 1.0 )

			},

			THREE.ShaderDeferredCommon[ 'commonUniforms' ]

		),

		vertexShader: [

			"void main() { ",

			"	gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

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

			"	vec3 lightVector = normalize( lightPositionVS.xyz - vertexPositionVS.xyz );",

			"	float rho = dot( lightDirectionVS, lightVector );",
			"	float rhoMax = cos( lightAngle );",

			"	if ( rho <= rhoMax ) discard;",

			"	float theta = rhoMax + 0.0001;",
			"	float phi = rhoMax + 0.05;",
			"	float falloff = 4.0;",

			"	float spot = 0.0;",

			"	if ( rho >= phi ) {",

			"		spot = 1.0;",

			"	} else if ( rho <= theta ) {",

			"		spot = 0.0;",

			"	} else { ",

			"		spot = pow( ( rho - theta ) / ( phi - theta ), falloff );",

			"	}",

			"	diffuseColor *= spot;",

			THREE.DeferredShaderChunk[ "computeSpecular" ],

			"	const float attenuation = 1.0;",

			THREE.DeferredShaderChunk[ "combine" ],

			"}"

		].join( "\n" )

	},

	directionalLight: {

		uniforms: Object.assign(

			{

				samplerNormalDepth: new THREE.Uniform( null ),
				samplerColor: new THREE.Uniform( null ),

				lightColor: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
				lightDirectionVS: new THREE.Uniform( new THREE.Vector3( 0, 1, 0 ) ),
				lightIntensity: new THREE.Uniform( 1.0 )
			},

			THREE.ShaderDeferredCommon[ 'commonUniforms' ]

		),

		vertexShader: [

			"void main() { ",

			"	gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

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

			"	vec3 lightVector = normalize( lightDirectionVS );",

			THREE.DeferredShaderChunk[ "computeSpecular" ],

			"	const float attenuation = 1.0;",

			THREE.DeferredShaderChunk[ "combine" ],

			"}"

		].join( '\n' )

	},

	normalDepthShininess: {

		uniforms: {

			shininess: new THREE.Uniform( 30.0 )

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

			"	vNormal = normalize( normalMatrix * objectNormal );",
			"	vPosition = gl_Position;",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"varying vec3 vNormal;",
			"varying vec4 vPosition;",

			"uniform float shininess;",

			THREE.DeferredShaderChunk[ "packNormal" ],

			"void main() {",

			"	vec3 normal = vNormal;",
			"	vec4 position = vPosition;",

			THREE.DeferredShaderChunk[ "packNormalDepthShininess" ],

			"	gl_FragColor = packedNormalDepthShininess;",

			"}"

		].join( "\n" )

	},

	pointLightPre: {

		uniforms: Object.assign(

			{

				samplerNormalDepthShininess: new THREE.Uniform( null ),

				lightColor: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
				lightPositionVS: new THREE.Uniform( new THREE.Vector3( 0, 1, 0 ) ),
				lightIntensity: new THREE.Uniform( 1.0 ),
				lightRadius: new THREE.Uniform( 1.0 )
			},

			THREE.ShaderDeferredCommon[ 'commonUniforms' ]

		),


		vertexShader: [

			"void main() {",

			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

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
			THREE.DeferredShaderChunk[ "unpackVector2" ],

			"void main() {",

			THREE.DeferredShaderChunk[ "computeTextureCoord" ],
			THREE.DeferredShaderChunk[ "unpackNormalDepthShininess" ],
			THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],

			"	vec3 lightVector = lightPositionVS - vertexPositionVS.xyz;",
			"	float distance = length( lightVector );",

			"	if ( distance > lightRadius ) discard;",

			"	lightVector = normalize( lightVector );",

			THREE.DeferredShaderChunk[ "computeSpecular" ],

			"	float attenuation = saturate( -distance / lightRadius + 1.0 );",

			THREE.DeferredShaderChunk[ "packLight" ],

			"	gl_FragColor = packedLight;",

			"}"

		].join( "\n" )

	},

	spotLightPre: {

		uniforms: Object.assign(

			{

				samplerNormalDepthShininess: new THREE.Uniform( null ),

				lightColor: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
				lightDirectionVS: new THREE.Uniform( new THREE.Vector3( 0, 1, 0 ) ),
				lightPositionVS: new THREE.Uniform( new THREE.Vector3( 0, 1, 0 ) ),
				lightAngle: new THREE.Uniform( 1.0 ),
				lightIntensity: new THREE.Uniform( 1.0 )

			},

			THREE.ShaderDeferredCommon[ 'commonUniforms' ]

		),

		vertexShader: [

			"void main() { ",

			"	gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

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
			THREE.DeferredShaderChunk[ "unpackVector2" ],

			"void main() {",

			THREE.DeferredShaderChunk[ "computeTextureCoord" ],
			THREE.DeferredShaderChunk[ "unpackNormalDepthShininess" ],
			THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],

			"	vec3 lightVector = normalize( lightPositionVS.xyz - vertexPositionVS.xyz );",

			"	float rho = dot( lightDirectionVS, lightVector );",
			"	float rhoMax = cos( lightAngle );",

			"	if ( rho <= rhoMax ) discard;",

			"	float theta = rhoMax + 0.0001;",
			"	float phi = rhoMax + 0.05;",
			"	float falloff = 4.0;",

			"	float spot = 0.0;",

			"	if ( rho >= phi ) {",

			"		spot = 1.0;",

			"	} else if ( rho <= theta ) {",

			"		spot = 0.0;",

			"	} else { ",

			"		spot = pow( ( rho - theta ) / ( phi - theta ), falloff );",

			"	}",

			THREE.DeferredShaderChunk[ "computeSpecular" ],

			"	const float attenuation = 1.0;",

			THREE.DeferredShaderChunk[ "packLight" ],

			"	gl_FragColor = spot * packedLight;",

			"}"

		].join( "\n" )

	},

	directionalLightPre: {

		uniforms: Object.assign(

			{

				samplerNormalDepthShininess: new THREE.Uniform( null ),

				lightColor: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
				lightDirectionVS: new THREE.Uniform( new THREE.Vector3( 0, 1, 0 ) ),
				lightIntensity: new THREE.Uniform( 1.0 )

			},

			THREE.ShaderDeferredCommon[ 'commonUniforms' ]

		),

		vertexShader: [

			"void main() { ",

			"	gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

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
			THREE.DeferredShaderChunk[ "unpackVector2" ],

			"void main() {",

			THREE.DeferredShaderChunk[ "computeTextureCoord" ],
			THREE.DeferredShaderChunk[ "unpackNormalDepthShininess" ],
			THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],

			"	vec3 lightVector = normalize( lightDirectionVS );",

			THREE.DeferredShaderChunk[ "computeSpecular" ],

			"	const float attenuation = 1.0;",

			THREE.DeferredShaderChunk[ "packLight" ],

			"	gl_FragColor = packedLight;",

			"}"

		].join( '\n' )

	},

	reconstruction: {

		uniforms: Object.assign(

			{

				samplerLight: new THREE.Uniform( null ),

				map: new THREE.Uniform( null ),
				offsetRepeat: new THREE.Uniform( new THREE.Vector4( 0, 0, 1, 1 ) ),

				diffuse: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
				emissive: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
				specular: new THREE.Uniform( new THREE.Color( 0x000000 ) ),
				shininess: new THREE.Uniform( 30.0 )

			},

			THREE.ShaderDeferredCommon[ 'commonUniforms' ]

		),

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

			"	vec4 diffuseColor = vec4( diffuse, 1.0 );",
			"	vec3 emissiveColor = emissive;",
			"	vec3 specularColor = specular;",

			THREE.DeferredShaderChunk[ "computeTextureCoord" ],

			"	vec4 light = texture2D( samplerLight, texCoord );",

			THREE.ShaderChunk[ "map_fragment" ],

			"	vec3 diffuseFinal = diffuseColor.rgb * light.rgb;",
			"	vec3 emissiveFinal = emissiveColor;",
			"	vec3 specularFinal = specularColor * light.rgb * light.a;",

			"	gl_FragColor = vec4( diffuseFinal + emissiveFinal + specularFinal, 1.0 );",

			"}"

		].join( "\n" )

	},

	// TODO: implement tone mapping
	final: {

		uniforms: {

			samplerResult: new THREE.Uniform( null )

		},

		vertexShader: [

			"varying vec2 texCoord;",

			"void main() {",

			"	vec4 pos = vec4( sign( position.xy ), 0.0, 1.0 );",
			"	texCoord = pos.xy * vec2( 0.5 ) + 0.5;",
			"	gl_Position = pos;",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"varying vec2 texCoord;",
			"uniform sampler2D samplerResult;",

			"void main() {",

			"	gl_FragColor = texture2D( samplerResult, texCoord );",

			"}"

		].join( "\n" )

	}

};
