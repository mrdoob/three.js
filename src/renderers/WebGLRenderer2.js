/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLRenderer2 = function ( parameters ) {

	var _this = this;
	var _gl;
	var _buffers = [];
	var _programs = [];

	var _viewportX = 0, _viewportY = 0;
	var _viewportWidth = 0, _viewportHeight = 0;

	// parameters

	var parameters = parameters || {};

	var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement( 'canvas' );
	var _antialias = parameters.antialias !== undefined ? parameters.antialias : false;

	// init

	try {

		if ( ! ( _gl = _canvas.getContext( 'experimental-webgl', { antialias: _antialias } ) ) ) {

			throw 'Error creating WebGL context.';

		}

	} catch ( error ) {

		console.error( error );

	}

	_gl.clearColor( 1, 0, 0, 1 );
        _gl.enable( _gl.DEPTH_TEST );

	this.domElement = _canvas;

	this.autoClear = true;
	this.sortObjects = true;

	this.setSize = function ( width, height ) {

		_canvas.width = width;
		_canvas.height = height;

		this.setViewport( 0, 0, _canvas.width, _canvas.height );

	};

	this.setViewport = function ( x, y, width, height ) {

		_viewportX = x;
		_viewportY = y;

		_viewportWidth = width;
		_viewportHeight = height;

		_gl.viewport( _viewportX, _viewportY, _viewportWidth, _viewportHeight );

	};

	this.createBuffers = function ( geometry ) {

		return {};

	};

	this.deleteBuffers = function ( geometry ) {

	};

	this.clear = function () {

		_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

	};

	this.render = function ( scene, camera ) {

		var o, ol;

		this.autoClear && this.clear();

		scene.update();

		for ( o = 0, ol = scene.objects.length; o < ol; o ++ ) {

			renderObject( scene.objects[ o ] );

		}

		function renderObject( object ) {

			if ( object instanceof THREE.Mesh ) {

				geometry = object.geometry;

				if ( _buffers[ geometry.id ] == undefined ) {

					_buffers[ geometry.id ] = _this.createBuffers( geometry );
					console.log( _buffers );
					console.log( scene );

				}

			}

		}

	};

};
