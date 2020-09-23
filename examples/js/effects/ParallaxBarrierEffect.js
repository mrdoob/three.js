console.warn( "THREE.ParallaxBarrierEffect: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/#manual/en/introduction/Installation." );

THREE.ParallaxBarrierEffect = function ( renderer ) {

	var _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

	var _scene = new THREE.Scene();

	var _stereo = new THREE.StereoCamera();

	var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

	var _renderTargetL = new THREE.WebGLRenderTarget( 512, 512, _params );
	var _renderTargetR = new THREE.WebGLRenderTarget( 512, 512, _params );

	var _material = new THREE.ShaderMaterial( {

		uniforms: {

			"mapLeft": { value: _renderTargetL.texture },
			"mapRight": { value: _renderTargetR.texture }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = vec2( uv.x, uv.y );",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D mapLeft;",
			"uniform sampler2D mapRight;",
			"varying vec2 vUv;",

			"void main() {",

			"	vec2 uv = vUv;",

			"	if ( ( mod( gl_FragCoord.y, 2.0 ) ) > 1.00 ) {",

			"		gl_FragColor = texture2D( mapLeft, uv );",

			"	} else {",

			"		gl_FragColor = texture2D( mapRight, uv );",

			"	}",

			"}"

		].join( "\n" )

	} );

	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), _material );
	_scene.add( mesh );

	this.setSize = function ( width, height ) {

		renderer.setSize( width, height );

		var pixelRatio = renderer.getPixelRatio();

		_renderTargetL.setSize( width * pixelRatio, height * pixelRatio );
		_renderTargetR.setSize( width * pixelRatio, height * pixelRatio );

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		_stereo.update( camera );

		renderer.setRenderTarget( _renderTargetL );
		renderer.clear();
		renderer.render( scene, _stereo.cameraL );

		renderer.setRenderTarget( _renderTargetR );
		renderer.clear();
		renderer.render( scene, _stereo.cameraR );

		renderer.setRenderTarget( null );
		renderer.render( _scene, _camera );

	};

};
