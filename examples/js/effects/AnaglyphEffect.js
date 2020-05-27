console.warn( "THREE.AnaglyphEffect: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author mrdoob / http://mrdoob.com/
 * @author marklundin / http://mark-lundin.com/
 * @author alteredq / http://alteredqualia.com/
 * @author tschw
 */

THREE.AnaglyphEffect = function ( renderer, width, height ) {

	// Matrices generated with angler.js https://github.com/tschw/angler.js/
	// (in column-major element order, as accepted by WebGL)

	this.colorMatrixLeft = new THREE.Matrix3().fromArray( [

		1.0671679973602295, - 0.0016435992438346148, 0.0001777536963345483, // r out
		- 0.028107794001698494, - 0.00019593400065787137, - 0.0002875397040043026, // g out
		- 0.04279090091586113, 0.000015809757314855233, - 0.00024287120322696865 // b out

	] );

	//		red						green 						blue  						in

	this.colorMatrixRight = new THREE.Matrix3().fromArray( [

		- 0.0355340838432312, - 0.06440307199954987, 0.018319187685847282, // r out
		- 0.10269022732973099, 0.8079727292060852, - 0.04835830628871918, // g out
		0.0001224992738571018, - 0.009558862075209618, 0.567823588848114 // b out

	] );

	var _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

	var _scene = new THREE.Scene();

	var _stereo = new THREE.StereoCamera();

	var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

	if ( width === undefined ) width = 512;
	if ( height === undefined ) height = 512;

	var _renderTargetL = new THREE.WebGLRenderTarget( width, height, _params );
	var _renderTargetR = new THREE.WebGLRenderTarget( width, height, _params );

	var _material = new THREE.ShaderMaterial( {

		uniforms: {

			"mapLeft": { value: _renderTargetL.texture },
			"mapRight": { value: _renderTargetR.texture },

			"colorMatrixLeft": { value: this.colorMatrixLeft },
			"colorMatrixRight": { value: this.colorMatrixRight }

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

			"uniform mat3 colorMatrixLeft;",
			"uniform mat3 colorMatrixRight;",

			// These functions implement sRGB linearization and gamma correction

			"float lin( float c ) {",
			"	return c <= 0.04045 ? c * 0.0773993808 :",
			"			pow( c * 0.9478672986 + 0.0521327014, 2.4 );",
			"}",

			"vec4 lin( vec4 c ) {",
			"	return vec4( lin( c.r ), lin( c.g ), lin( c.b ), c.a );",
			"}",

			"float dev( float c ) {",
			"	return c <= 0.0031308 ? c * 12.92",
			"			: pow( c, 0.41666 ) * 1.055 - 0.055;",
			"}",


			"void main() {",

			"	vec2 uv = vUv;",

			"	vec4 colorL = lin( texture2D( mapLeft, uv ) );",
			"	vec4 colorR = lin( texture2D( mapRight, uv ) );",

			"	vec3 color = clamp(",
			"			colorMatrixLeft * colorL.rgb +",
			"			colorMatrixRight * colorR.rgb, 0., 1. );",

			"	gl_FragColor = vec4(",
			"			dev( color.r ), dev( color.g ), dev( color.b ),",
			"			max( colorL.a, colorR.a ) );",

			"}"

		].join( "\n" )

	} );

	var _mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), _material );
	_scene.add( _mesh );

	this.setSize = function ( width, height ) {

		renderer.setSize( width, height );

		var pixelRatio = renderer.getPixelRatio();

		_renderTargetL.setSize( width * pixelRatio, height * pixelRatio );
		_renderTargetR.setSize( width * pixelRatio, height * pixelRatio );

	};

	this.render = function ( scene, camera ) {

		var currentRenderTarget = renderer.getRenderTarget();

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

		renderer.setRenderTarget( currentRenderTarget );

	};

	this.dispose = function () {

		if ( _renderTargetL ) _renderTargetL.dispose();
		if ( _renderTargetR ) _renderTargetR.dispose();
		if ( _mesh ) _mesh.geometry.dispose();
		if ( _material ) _material.dispose();

	};

};
