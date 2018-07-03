/**
 * @author mrdoob / http://mrdoob.com/
 */

var APP = {

	Player: function () {

		var loader = new THREE.ObjectLoader();
		var camera, scene, renderer;

		var events = {};

		var dom = document.createElement( 'div' );

		this.dom = dom;

		this.width = 500;
		this.height = 500;

		this.load = function ( json ) {

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setClearColor( 0x000000 );
			renderer.setPixelRatio( window.devicePixelRatio );

			var project = json.project;

			if ( project.gammaInput ) renderer.gammaInput = true;
			if ( project.gammaOutput ) renderer.gammaOutput = true;
			if ( project.shadows ) renderer.shadowMap.enabled = true;
			if ( project.vr ) renderer.vr.enabled = true;

			dom.appendChild( renderer.domElement );

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

			var scriptWrapParams = 'player,renderer,scene,camera';
			var scriptWrapResultObj = {};

			for ( var eventKey in events ) {

				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[ eventKey ] = eventKey;

			}

			var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( 'uuid', uuid, true );

				if ( object === undefined ) {

					console.warn( 'APP.Player: Script without object.', uuid );
					continue;

				}

				var scripts = json.scripts[ uuid ];

				for ( var i = 0; i < scripts.length; i ++ ) {

					var script = scripts[ i ];

					var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, scene, camera );

					for ( var name in functions ) {

						if ( functions[ name ] === undefined ) continue;

						if ( events[ name ] === undefined ) {

							console.warn( 'APP.Player: Event type not supported (', name, ')' );
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

			if ( renderer.vr.enabled ) {

				dom.appendChild( WEBVR.createButton( renderer ) );

			}

		};

		this.setScene = function ( value ) {

			scene = value;

		};

		this.setSize = function ( width, height ) {

			this.width = width;
			this.height = height;

			if ( camera ) {

				camera.aspect = this.width / this.height;
				camera.updateProjectionMatrix();

			}

			if ( renderer ) {

				renderer.setSize( width, height );

			}

		};

		function dispatch( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				array[ i ]( event );

			}

		}

		var time, prevTime;

		function animate() {

			time = performance.now();

			try {

				dispatch( events.update, { time: time, delta: time - prevTime } );

			} catch ( e ) {

				console.error( ( e.message || e ), ( e.stack || "" ) );

			}

			renderer.render( scene, camera );

			prevTime = time;

		}

		this.play = function () {

			prevTime = performance.now();

			document.addEventListener( 'keydown', onDocumentKeyDown );
			document.addEventListener( 'keyup', onDocumentKeyUp );
			document.addEventListener( 'mousedown', onDocumentMouseDown );
			document.addEventListener( 'mouseup', onDocumentMouseUp );
			document.addEventListener( 'mousemove', onDocumentMouseMove );
			document.addEventListener( 'touchstart', onDocumentTouchStart );
			document.addEventListener( 'touchend', onDocumentTouchEnd );
			document.addEventListener( 'touchmove', onDocumentTouchMove );

			dispatch( events.start, arguments );

			renderer.setAnimationLoop( animate );

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

			renderer.setAnimationLoop( null );

		};

		this.dispose = function () {

			while ( dom.children.length ) {

				dom.removeChild( dom.firstChild );

			}

			renderer.dispose();

			camera = undefined;
			scene = undefined;
			renderer = undefined;

		};

		//

		function onDocumentKeyDown( event ) {

			dispatch( events.keydown, event );

		}

		function onDocumentKeyUp( event ) {

			dispatch( events.keyup, event );

		}

		function onDocumentMouseDown( event ) {

			dispatch( events.mousedown, event );

		}

		function onDocumentMouseUp( event ) {

			dispatch( events.mouseup, event );

		}

		function onDocumentMouseMove( event ) {

			dispatch( events.mousemove, event );

		}

		function onDocumentTouchStart( event ) {

			dispatch( events.touchstart, event );

		}

		function onDocumentTouchEnd( event ) {

			dispatch( events.touchend, event );

		}

		function onDocumentTouchMove( event ) {

			dispatch( events.touchmove, event );

		}

	}

};
