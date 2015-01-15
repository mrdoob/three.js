/**
 * @author mrdoob / http://mrdoob.com/
 */

var APP = {

	Player: function () {

		var loader = new THREE.ObjectLoader();
		var camera, scene, renderer;

		var scripts = {};

		this.dom = undefined;

		this.width = 500;
		this.height = 500;

		this.load = function ( json ) {

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setPixelRatio( window.devicePixelRatio );

			camera = loader.parse( json.camera );
			scene = loader.parse( json.scene );

			scripts = {
				keydown: [],
				keyup: [],
				mousedown: [],
				mouseup: [],
				mousemove: [],
				update: []
			};

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( 'uuid', uuid, true );

				var sources = json.scripts[ uuid ];

				for ( var i = 0; i < sources.length; i ++ ) {

					var script = sources[ i ];

					var events = ( new Function( 'player', 'scene', 'keydown', 'keyup', 'mousedown', 'mouseup', 'mousemove', 'update', script.source + '\nreturn { keydown: keydown, keyup: keyup, mousedown: mousedown, mouseup: mouseup, mousemove: mousemove, update: update };' ).bind( object ) )( this, scene );

					for ( var name in events ) {

						if ( events[ name ] === undefined ) continue;

						if ( scripts[ name ] === undefined ) {

							console.warn( 'APP.Player: event type not supported (', name, ')' );
							continue;

						}

						scripts[ name ].push( events[ name ].bind( object ) );

					}

				}

			}

			this.dom = renderer.domElement;

		};

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

		};

		this.setSize = function ( width, height ) {

			this.width = width;
			this.height = height;

			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			renderer.setSize( width, height );

		};

		var dispatch = function ( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				array[ i ]( event );

			}

		};

		var request;

		var animate = function ( time ) {

			request = requestAnimationFrame( animate );

			dispatch( scripts.update, { time: time } );

			renderer.render( scene, camera );

		};

		this.play = function () {

			document.addEventListener( 'keydown', onDocumentKeyDown );
			document.addEventListener( 'keyup', onDocumentKeyUp );
			document.addEventListener( 'mousedown', onDocumentMouseDown );
			document.addEventListener( 'mouseup', onDocumentMouseUp );
			document.addEventListener( 'mousemove', onDocumentMouseMove );

			request = requestAnimationFrame( animate );

		};

		this.stop = function () {

			document.removeEventListener( 'keydown', onDocumentKeyDown );
			document.removeEventListener( 'keyup', onDocumentKeyUp );
			document.removeEventListener( 'mousedown', onDocumentMouseDown );
			document.removeEventListener( 'mouseup', onDocumentMouseUp );
			document.removeEventListener( 'mousemove', onDocumentMouseMove );

			cancelAnimationFrame( request );

		};

		//

		var onDocumentKeyDown = function ( event ) {

			dispatch( scripts.keydown, event );

		};

		var onDocumentKeyUp = function ( event ) {

			dispatch( scripts.keyup, event );

		};

		var onDocumentMouseDown = function ( event ) {

			dispatch( scripts.mousedown, event );

		};

		var onDocumentMouseUp = function ( event ) {

			dispatch( scripts.mouseup, event );

		};

		var onDocumentMouseMove = function ( event ) {

			dispatch( scripts.mousemove, event );

		};

	}

};
