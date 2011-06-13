/**
 * @author mrdoob / http://mrdoob.com/
 */

if ( THREE.WebGLRenderer ) {

	THREE.AnaglyphWebGLRenderer = function ( parameters ) {

		THREE.WebGLRenderer.call( this, parameters );

		var _this = this, _setSize = this.setSize, _render = this.render;
		var _cameraL = new THREE.Camera(), _cameraR = new THREE.Camera();

		var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };
		var _renderTargetL = new THREE.WebGLRenderTarget( 512, 512, _params ), _renderTargetR = new THREE.WebGLRenderTarget( 512, 512, _params );

		var _camera = new THREE.Camera( 53, 1, 1, 10000 );
		_camera.position.z = 2;

		_material = new THREE.MeshShaderMaterial( {

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
		_scene.addObject( new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), _material ) );

		this.setSize = function ( width, height ) {

			_setSize.call( _this, width, height );

			_renderTargetL.width = width;
			_renderTargetL.height = height;

			_renderTargetR.width = width;
			_renderTargetR.height = height;

		};

		this.render = function ( scene, camera, renderTarget, forceClear ) {

			_cameraL.projectionMatrix = camera.projectionMatrix;
			_cameraL.position.copy( camera.position );
			_cameraL.target.position.copy( camera.target.position );
			_cameraL.translateX( - 10 );

			_cameraR.projectionMatrix = camera.projectionMatrix;
			_cameraR.position.copy( camera.position );
			_cameraR.target.position.copy( camera.target.position );
			_cameraR.translateX( 10 );

			_render.call( _this, scene, _cameraL, _renderTargetL, true );
			_render.call( _this, scene, _cameraR, _renderTargetR, true );

			_render.call( _this, _scene, _camera );

		};

		THREE.AnaglyphWebGLRenderer.prototype = new THREE.WebGLRenderer();
		THREE.AnaglyphWebGLRenderer.prototype.constructor = THREE.AnaglyphWebGLRenderer;

	};
	
}
