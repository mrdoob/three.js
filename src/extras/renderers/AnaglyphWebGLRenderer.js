/**
 * @author mrdoob / http://mrdoob.com/
 * @author marklundin / http://mark-lundin.com/
 * @author alteredq / http://alteredqualia.com/
 */

if ( THREE.WebGLRenderer ) {

	THREE.AnaglyphWebGLRenderer = function ( parameters ) {

		THREE.WebGLRenderer.call( this, parameters );

		this.autoUpdateScene = false;

		var _this = this, _setSize = this.setSize, _render = this.render;

		var _cameraL = new THREE.PerspectiveCamera(),
			_cameraR = new THREE.PerspectiveCamera();

		var eyeRight = new THREE.Matrix4(),
			eyeLeft = new THREE.Matrix4(),
			focalLength = 125,
			_aspect, _near, _far, _fov;

		_cameraL.matrixAutoUpdate = _cameraR.matrixAutoUpdate = false;

		var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

		var _renderTargetL = new THREE.WebGLRenderTarget( 512, 512, _params ),
			_renderTargetR = new THREE.WebGLRenderTarget( 512, 512, _params );

		var _camera = new THREE.PerspectiveCamera( 53, 1, 1, 10000 );
		_camera.position.z = 2;

		var _material = new THREE.ShaderMaterial( {

			uniforms: {

				"mapLeft": { type: "t", value: 0, texture: _renderTargetL },
				"mapRight": { type: "t", value: 1, texture: _renderTargetR }

			},

			vertexShader: [

				"varying vec2 vUv;",

				"void main() {",

					"vUv = vec2( uv.x, 1.0 - uv.y );",
					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				"}"

			].join("\n"),

			fragmentShader: [

				"uniform sampler2D mapLeft;",
				"uniform sampler2D mapRight;",
				"varying vec2 vUv;",

				"void main() {",

					"vec4 colorL, colorR;",
					"vec2 uv = vUv;",

					"colorL = texture2D( mapLeft, uv );",
					"colorR = texture2D( mapRight, uv );",

					// http://3dtv.at/Knowhow/AnaglyphComparison_en.aspx

					"gl_FragColor = vec4( colorL.g * 0.7 + colorL.b * 0.3, colorR.g, colorR.b, colorL.a + colorR.a ) * 1.1;",

				"}"

				].join("\n")

		} );

		var _scene = new THREE.Scene();
		_scene.add( new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), _material ) );

		_scene.add( _camera );

		this.setSize = function ( width, height ) {

			_setSize.call( _this, width, height );

			_renderTargetL.width = width;
			_renderTargetL.height = height;

			_renderTargetR.width = width;
			_renderTargetR.height = height;

		};

		/*
		 * Renderer now uses an asymmetric perspective projection (http://paulbourke.net/miscellaneous/stereographics/stereorender/).
		 * Each camera is offset by the eye seperation and its projection matrix is also skewed asymetrically back to converge on the same
		 * projection plane. Added a focal length parameter to, this is where the parallax is equal to 0.
		 */

		this.render = function ( scene, camera, renderTarget, forceClear ) {

			scene.updateMatrixWorld();

			var hasCameraChanged = ( _aspect !== camera.aspect ) || ( _near !== camera.near ) || ( _far !== camera.far ) || ( _fov !== camera.fov );

			if( hasCameraChanged ) {

				_aspect = camera.aspect;
				_near = camera.near;
				_far = camera.far;
				_fov = camera.fov;

				var projectionMatrix = camera.projectionMatrix.clone(),
					eyeSep = focalLength / 30 * 0.5,
					eyeSepOnProjection = eyeSep * _near / focalLength,
					ymax = _near * Math.tan( _fov * Math.PI / 360 ),
					xmin, xmax;

				// translate xOffset

				eyeRight.n14 = eyeSep;
				eyeLeft.n14 = -eyeSep;

				// for left eye

				xmin = -ymax * _aspect + eyeSepOnProjection;
				xmax = ymax * _aspect + eyeSepOnProjection;

				projectionMatrix.n11 = 2 * _near / ( xmax - xmin );
				projectionMatrix.n13 = ( xmax + xmin ) / ( xmax - xmin );

				_cameraL.projectionMatrix.copy( projectionMatrix );

				// for right eye

				xmin = -ymax * _aspect - eyeSepOnProjection;
				xmax = ymax * _aspect - eyeSepOnProjection;

				projectionMatrix.n11 = 2 * _near / ( xmax - xmin );
				projectionMatrix.n13 = ( xmax + xmin ) / ( xmax - xmin );

				_cameraR.projectionMatrix.copy( projectionMatrix );

			}

			_cameraL.matrixWorld.copy( camera.matrixWorld ).multiplySelf( eyeLeft );
			_cameraL.position.copy( camera.position );
			_cameraL.near = camera.near;
			_cameraL.far = camera.far;

			_render.call( _this, scene, _cameraL, _renderTargetL, true );

			_cameraR.matrixWorld.copy( camera.matrixWorld ).multiplySelf( eyeRight );
			_cameraR.position.copy( camera.position );
			_cameraR.near = camera.near;
			_cameraR.far = camera.far;

			_render.call( _this, scene, _cameraR, _renderTargetR, true );

			_scene.updateMatrixWorld();
			_render.call( _this, _scene, _camera );

		};

	};

};
