import { Time } from './Time.js';

/**
 * @author Lewy Blue / https://github.com/looeee
 *
 */

function App( canvas ) {

	var _canvas, _scene, _camera, _renderer;

	var _currentAnimationFrameID;

	if ( canvas !== undefined ) this.canvas = canvas;

	this.autoRender = true;

	this.autoResize = true;

	this.time = new Time();

	Object.defineProperties( this, {

		'canvas': {

			get: function () {

				if ( _canvas === undefined ) {

					_canvas = document.body.appendChild( document.createElement( 'canvas' ) );
					_canvas.style.position = 'absolute';
					_canvas.style.width = _canvas.style.height = '100%';

				}

				return _canvas;

			},

			set: function ( canvas ) {

				_canvas = canvas;

			},
		},

		'camera': {

			get: function () {

				if ( _camera === undefined ) {

					_camera = new THREE.PerspectiveCamera( 75, this.canvas.clientWidth / this.canvas.clientHeight, 1, 1000 );

				}

				return _camera;

			},

			set: function ( camera ) {

				_camera = camera;

			},
		},

		'scene': {

			get: function () {

				if ( _scene === undefined ) {

					_scene = new THREE.Scene();

				}

				return _scene;

			},

			set: function ( scene ) {

				_scene = scene;

			},
		},

		'renderer': {

			get: function () {

				if ( _renderer === undefined ) {

					_renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias: true } );
					_renderer.setPixelRatio( window.devicePixelRatio );
					_renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight, false );
					_renderer.setSize( window.innerWidth, window.innerHeight, false );

				}

				return _renderer;

			},

			set: function ( renderer ) {

				_renderer = renderer;

			},

		},

	} );

	this.animate = function () {

		this.time.start();

		var self = this;

		function animationHandler() {

			self.onUpdate();

			if ( self.autoRender ) self.renderer.render( self.scene, self.camera );

			self.currentAnimationFrameID = requestAnimationFrame( function () { animationHandler() } );

		}

		animationHandler();

	};

	this.stopAnimation = function () {

		cancelAnimationFrame( _currentAnimationFrameID );

	};

	this.onUpdate = function () {};

	this.onWindowResize =	function () {

		if ( ! this.autoResize ) return;

		if ( this.camera.type !== 'PerspectiveCamera' ) {

			console.warn( 'THREE.APP: AutoResize only works with PerspectiveCamera' );
			return;

		}

		var newWidth = this.canvas.clientWidth;
		var newHeight = this.canvas.clientHeight;

		this.camera.aspect = newWidth / newHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( newWidth, newHeight, false );

	};

	window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

}

export { App };
