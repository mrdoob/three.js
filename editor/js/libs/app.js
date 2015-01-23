/**
 * @author mrdoob / http://mrdoob.com/
 */

var APP = {

	Player: function () {

		var loader = new THREE.ObjectLoader();
		var camera, scene, renderer;

		var scripts = {};

		this.dom = undefined;

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

					var events = ( new Function( 'scene', script.source ).bind( object ) )( scene );

					for ( var name in events ) {

						if ( scripts[ name ] === undefined ) {

							console.warn( 'APP.Player: event type not supported (', name, ')' );
							continue;

						}

						scripts[ name ].push( events[ name ] );

					}

				}

			}

			this.dom = renderer.domElement;

		};

		this.setSize = function ( width, height ) {

			camera.aspect = width / height;
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
