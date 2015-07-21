/**
 * @author mrdoob / http://mrdoob.com/
 */

var APP = {

	Player: function () {

		var scope = this;

		var loader = new THREE.ObjectLoader();
		var camera, scene, renderer;

		var vr, controls, effect;

		var events = {};

		this.dom = undefined;

		this.width = 500;
		this.height = 500;

		this.load = function ( json ) {

			vr = json.project.vr;

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setClearColor( 0x000000 );
			renderer.setPixelRatio( window.devicePixelRatio );
			this.dom = renderer.domElement;

			this.setScene( loader.parse( json.scene ) );
			this.setCamera( loader.parse( json.camera ) );

			events = {
				init: [],
				start: [],
				stop: [],
				keydown: [],
				keyup: [],
				mousedown: [],
				mouseup: [],
				mousemove: [],
				touchstart: [],
				touchend: [],
				touchmove: [],
				update: []
			};

			var scriptWrapParams = 'player,renderer,scene';
			var scriptWrapResultObj = {};
			for ( var eventKey in events ) {
				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[ eventKey ] = eventKey;
			}
			var scriptWrapResult =
					JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( 'uuid', uuid, true );

				var scripts = json.scripts[ uuid ];

				for ( var i = 0; i < scripts.length; i ++ ) {

					var script = scripts[ i ];

					var functions = ( new Function( scriptWrapParams,
							script.source + '\nreturn ' + scriptWrapResult+ ';' ).bind( object ) )( this, renderer, scene );

					for ( var name in functions ) {

						if ( functions[ name ] === undefined ) continue;

						if ( events[ name ] === undefined ) {

							console.warn( 'APP.Player: event type not supported (', name, ')' );
							continue;

						}

						events[ name ].push( functions[ name ].bind( object ) );

					}

				}

			}

			dispatch( events.init, arguments );

		};

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();


			if ( vr === true ) {

				if ( camera.parent === undefined ) {

					// camera needs to be in the scene so camera2 matrix updates

					scene.add( camera );

				}

				var camera2 = camera.clone();
				camera.add( camera2 );

				camera = camera2;

				controls = new THREE.VRControls( camera );
				effect = new THREE.VREffect( renderer );

				document.addEventListener( 'keyup', function ( event ) {

					switch ( event.keyCode ) {
						case 90:
							controls.zeroSensor();
							break;
					}

				} );

				this.dom.addEventListener( 'dblclick', function () {

					effect.setFullScreen( true );

				} );

			}

		};

		this.setScene = function ( value ) {

			scene = value;

		},

		this.setSize = function ( width, height ) {

			if ( renderer._fullScreen ) return;

			this.width = width;
			this.height = height;

			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			renderer.setSize( width, height );

		};

		var dispatch = function ( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				try {

					array[ i ]( event );

				} catch (e) {

					console.error(e.stack || e);

				}

			}

		};

		var prevTime, request;

		var animate = function ( time ) {

			request = requestAnimationFrame( animate );

			dispatch( events.update, { time: time, delta: time - prevTime } );

			if ( vr === true ) {

				controls.update();
				effect.render( scene, camera );

			} else {

				renderer.render( scene, camera );

			}

			prevTime = time;

		};

		this.play = function () {

			document.addEventListener( 'keydown', onDocumentKeyDown );
			document.addEventListener( 'keyup', onDocumentKeyUp );
			document.addEventListener( 'mousedown', onDocumentMouseDown );
			document.addEventListener( 'mouseup', onDocumentMouseUp );
			document.addEventListener( 'mousemove', onDocumentMouseMove );
			document.addEventListener( 'touchstart', onDocumentTouchStart );
			document.addEventListener( 'touchend', onDocumentTouchEnd );
			document.addEventListener( 'touchmove', onDocumentTouchMove );

			dispatch( events.start, arguments );

			request = requestAnimationFrame( animate );
			prevTime = performance.now();
		};

		this.stop = function () {

			document.removeEventListener( 'keydown', onDocumentKeyDown );
			document.removeEventListener( 'keyup', onDocumentKeyUp );
			document.removeEventListener( 'mousedown', onDocumentMouseDown );
			document.removeEventListener( 'mouseup', onDocumentMouseUp );
			document.removeEventListener( 'mousemove', onDocumentMouseMove );
			document.removeEventListener( 'touchstart', onDocumentTouchStart );
			document.removeEventListener( 'touchend', onDocumentTouchEnd );
			document.removeEventListener( 'touchmove', onDocumentTouchMove );

			dispatch( events.stop, arguments );

			cancelAnimationFrame( request );
		};

		//

		var onDocumentKeyDown = function ( event ) {

			dispatch( events.keydown, event );

		};

		var onDocumentKeyUp = function ( event ) {

			dispatch( events.keyup, event );

		};

		var onDocumentMouseDown = function ( event ) {

			dispatch( events.mousedown, event );

		};

		var onDocumentMouseUp = function ( event ) {

			dispatch( events.mouseup, event );

		};

		var onDocumentMouseMove = function ( event ) {

			dispatch( events.mousemove, event );

		};

		var onDocumentTouchStart = function ( event ) {

			dispatch( events.touchstart, event );

		};

		var onDocumentTouchEnd = function ( event ) {

			dispatch( events.touchend, event );

		};

		var onDocumentTouchMove = function ( event ) {

			dispatch( events.touchmove, event );

		};

	}

};
