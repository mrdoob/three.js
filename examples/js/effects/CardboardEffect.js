/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CardboardEffect = function ( renderer ) {

	var _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

	var _scene = new THREE.Scene();

	var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

	var _renderTarget = new THREE.WebGLRenderTarget( 512, 512, _params );
	_renderTarget.scissorTest = true;

	// https://github.com/borismus/webvr-boilerplate/blob/master/src/distortion/barrel-distortion-fragment.js

	var _material = new THREE.ShaderMaterial( {

		uniforms: {
			'texture': { type: 't', value: _renderTarget },
			'distortion': { type: 'v2', value: new THREE.Vector2( 0.441, 0.156 ) },
			'leftCenter': { type: 'v2', value: new THREE.Vector2( 0.5, 0.5 ) },
			'rightCenter': { type: 'v2', value: new THREE.Vector2( 0.5, 0.5 ) },
			'background': { type: 'v4', value: new THREE.Vector4( 0.0, 0.0, 0.0, 1.0 ) },
		},

		vertexShader: [
			'varying vec2 vUV;',

			'void main() {',
				'vUV = uv;',
				'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
			'}'

		].join( '\n' ),

		fragmentShader: [
			'uniform sampler2D texture;',

			'uniform vec2 distortion;',
			'uniform vec2 leftCenter;',
			'uniform vec2 rightCenter;',
			'uniform vec4 background;',

			'varying vec2 vUV;',

			'float poly(float val) {',
				'return 1.0 + (distortion.x + distortion.y * val) * val;',
			'}',

			'vec2 barrel(vec2 v, vec2 center) {',
				'vec2 w = v - center;',
				'return poly(dot(w, w)) * w + center;',
			'}',
			'void main() {',
				'bool isLeft = (vUV.x < 0.5);',
				'float offset = isLeft ? 0.0 : 0.5;',
				'vec2 a = barrel(vec2((vUV.x - offset) / 0.5, vUV.y), isLeft ? leftCenter : rightCenter);',
				'if (a.x < 0.0 || a.x > 1.0 || a.y < 0.0 || a.y > 1.0) {',
					'gl_FragColor = background;',
				'} else {',
					'gl_FragColor = texture2D(texture, vec2(a.x * 0.5 + offset, a.y));',
				'}',
			'}'
		].join( '\n' )

	} );

	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), _material );
	_scene.add( mesh );

	this.setSize = function ( width, height ) {

		_renderTarget.setSize( width, height );

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera ) {

		if ( camera instanceof THREE.StereoCamera === false ) {

			console.error( 'THREE.StereoCamera.render(): camera should now be an insteance of THREE.StereoCamera.' );
			return;

		}

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		var width = _renderTarget.width / 2;
		var height = _renderTarget.height;

		_renderTarget.scissor.set( 0, 0, width, height );
		_renderTarget.viewport.set( 0, 0, width, height );
		renderer.render( scene, camera.cameraL, _renderTarget );

		_renderTarget.scissor.set( width, 0, width, height );
		_renderTarget.viewport.set( width, 0, width, height );
		renderer.render( scene, camera.cameraR, _renderTarget );

		renderer.render( _scene, _camera );

	};

};
