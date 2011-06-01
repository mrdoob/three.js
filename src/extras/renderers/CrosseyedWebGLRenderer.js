/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.CrosseyedWebGLRenderer = function ( parameters ) {

	THREE.WebGLRenderer.call( this, parameters );

	var _this = this, _setSize = this.setSize, _render = this.render;

	var _cameraL = new THREE.Camera(), 
		_cameraR = new THREE.Camera();

	var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };
	
	var _renderTargetL = new THREE.WebGLRenderTarget( 256, 512, _params ), 
		_renderTargetR = new THREE.WebGLRenderTarget( 256, 512, _params );

	_this.separation = 10;
	if ( parameters && parameters.separation !== undefined ) _this.separation = parameters.separation;

	var SCREEN_WIDTH  = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;
	var HALF_WIDTH = SCREEN_WIDTH / 2;

	var _orthoCamera = new THREE.Camera();
	_orthoCamera.projectionMatrix = THREE.Matrix4.makeOrtho( SCREEN_WIDTH / - 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / - 2, -10000, 10000 );
	
	var _camera = new THREE.Camera( 53, HALF_WIDTH / SCREEN_HEIGHT, 1, 10000 );
	_camera.position.z = -10;

	var base = THREE.ShaderUtils.lib[ "screen" ];
	
	var uniformsL = THREE.UniformsUtils.clone( base.uniforms );
	var uniformsR = THREE.UniformsUtils.clone( base.uniforms );
	
	uniformsL.tDiffuse.texture = _renderTargetL;
	uniformsR.tDiffuse.texture = _renderTargetR;
	
	var screenMaterialL = new THREE.MeshShaderMaterial( { fragmentShader: base.fragmentShader, vertexShader: base.vertexShader, uniforms: uniformsL } );
	var screenMaterialR = new THREE.MeshShaderMaterial( { fragmentShader: base.fragmentShader, vertexShader: base.vertexShader, uniforms: uniformsR } );
	
	var _left  = new THREE.Mesh( new THREE.Plane( HALF_WIDTH, SCREEN_HEIGHT ), screenMaterialL );
	var _right = new THREE.Mesh( new THREE.Plane( HALF_WIDTH, SCREEN_HEIGHT ), screenMaterialR );
	
	_left.position.x  = -HALF_WIDTH/2;
	_right.position.x =  HALF_WIDTH/2;
	
	var _scene = new THREE.Scene();
	_scene.addObject( _left );
	_scene.addObject( _right );

	this.setSize = function ( width, height ) {

		_setSize.call( _this, width, height );

		_renderTargetL.width = width/2;
		_renderTargetL.height = height;

		_renderTargetR.width = width/2;
		_renderTargetR.height = height;

	};

	this.render = function ( scene, camera, renderTarget, forceClear ) {
		
		_cameraL.fov = camera.fov;
		_cameraL.aspect = 0.5 * camera.aspect;
		_cameraL.near = camera.near;
		_cameraL.far = camera.far;
		_cameraL.updateProjectionMatrix();
		
		_cameraL.position.copy( camera.position );
		_cameraL.target.position.copy( camera.target.position );
		_cameraL.translateX( _this.separation );

		_cameraR.projectionMatrix = _cameraL.projectionMatrix;

		_cameraR.position.copy( camera.position );
		_cameraR.target.position.copy( camera.target.position );
		_cameraR.translateX( - _this.separation );

		_render.call( _this, scene, _cameraL, _renderTargetL );
		_render.call( _this, scene, _cameraR, _renderTargetR );

		_render.call( _this, _scene, _orthoCamera );

	};

};

THREE.CrosseyedWebGLRenderer.prototype = new THREE.WebGLRenderer();
THREE.CrosseyedWebGLRenderer.prototype.constructor = THREE.CrosseyedWebGLRenderer;
