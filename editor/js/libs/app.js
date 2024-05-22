import { ViewportPathtracer } from '../Viewport.Pathtracer.js';

var APP = {

	Player: function () {

		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio ); // TODO: Use player.setPixelRatio()

		var loader = new THREE.ObjectLoader();

		this.events = {};

		var dom = document.createElement( 'div' );
		dom.appendChild( this.renderer.domElement );

		this.dom = dom;
		this.canvas = this.renderer.domElement;

		this.width = 500;
		this.height = 500;

		const scope = this;

		this.load = function ( json ) {

			var project = json.project;

			if ( project.shadows !== undefined ) scope.renderer.shadowMap.enabled = project.shadows;
			if ( project.shadowType !== undefined ) scope.renderer.shadowMap.type = project.shadowType;
			if ( project.toneMapping !== undefined ) scope.renderer.toneMapping = project.toneMapping;
			if ( project.toneMappingExposure !== undefined ) scope.renderer.toneMappingExposure = project.toneMappingExposure;

			scope.setScene( loader.parse( json.scene ) );
			scope.setCamera( loader.parse( json.camera ) );

			scope.events = {
				init: [],
				start: [],
				stop: [],
				keydown: [],
				keyup: [],
				pointerdown: [],
				pointerup: [],
				pointermove: [],
				update: []
			};

			var scriptWrapParams = 'player,renderer,scene,camera';
			var scriptWrapResultObj = {};

			for ( var eventKey in scope.events ) {

				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[ eventKey ] = eventKey;

			}

			var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

			for ( var uuid in json.scripts ) {

				var object = scope.scene.getObjectByProperty( 'uuid', uuid, true );

				if ( object === undefined ) {

					console.warn( 'APP.Player: Script without object.', uuid );
					continue;

				}

				var scripts = json.scripts[ uuid ];

				for ( var i = 0; i < scripts.length; i ++ ) {

					var script = scripts[ i ];

					var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( scope, scope.renderer, scope.scene, scope.camera );

					for ( var name in functions ) {

						if ( functions[ name ] === undefined ) continue;

						if ( scope.events[ name ] === undefined ) {

							console.warn( 'APP.Player: Event type not supported (', name, ')' );
							continue;

						}

						scope.events[ name ].push( functions[ name ].bind( object ) );

					}

				}

			}

			scope.dispatch( scope.events.init, arguments );

		};

		this.setCamera = function ( value ) {

			scope.camera = value;
			scope.camera.aspect = scope.width / scope.height;
			scope.camera.updateProjectionMatrix();

		};

		this.setScene = function ( value ) {

			scope.scene = value;

		};

		this.setPixelRatio = function ( pixelRatio ) {

			scope.renderer.setPixelRatio( pixelRatio );

		};

		this.setSize = function ( width, height ) {

			scope.width = width;
			scope.height = height;

			if ( scope.camera ) {

				scope.camera.aspect = scope.width / scope.height;
				scope.camera.updateProjectionMatrix();

			}

			scope.renderer.setSize( width, height );

		};

		this.dispatch = function ( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				array[ i ]( event );

			}

		};

		var time, startTime, prevTime;

		function animate() {

			time = performance.now();

			try {

				scope.dispatch( scope.events.update, { time: time - startTime, delta: time - prevTime } );

			} catch ( e ) {

				console.error( ( e.message || e ), ( e.stack || '' ) );

			}

			scope.renderer.render( scope.scene, scope.camera );

			prevTime = time;

		}

		this.play = function () {

			startTime = prevTime = performance.now();

			document.addEventListener( 'keydown', onKeyDown );
			document.addEventListener( 'keyup', onKeyUp );
			document.addEventListener( 'pointerdown', onPointerDown );
			document.addEventListener( 'pointerup', onPointerUp );
			document.addEventListener( 'pointermove', onPointerMove );

			scope.dispatch( scope.events.start, arguments );

			scope.renderer.setAnimationLoop( animate );

		};

		this.stop = function () {

			document.removeEventListener( 'keydown', onKeyDown );
			document.removeEventListener( 'keyup', onKeyUp );
			document.removeEventListener( 'pointerdown', onPointerDown );
			document.removeEventListener( 'pointerup', onPointerUp );
			document.removeEventListener( 'pointermove', onPointerMove );

			scope.dispatch( scope.events.stop, arguments );

			scope.renderer.setAnimationLoop( null );

		};

		this.render = function ( time ) {

			scope.dispatch( scope.events.update, { time: time * 1000, delta: 0 /* TODO */ } );

			scope.renderer.render( scope.scene, scope.camera );

		};

		this.dispose = function () {

			scope.renderer.dispose();

			scope.camera = undefined;
			scope.scene = undefined;

		};

		//

		function onKeyDown( event ) {

			scope.dispatch( scope.events.keydown, event );

		}

		function onKeyUp( event ) {

			scope.dispatch( scope.events.keyup, event );

		}

		function onPointerDown( event ) {

			scope.dispatch( scope.events.pointerdown, event );

		}

		function onPointerUp( event ) {

			scope.dispatch( scope.events.pointerup, event );

		}

		function onPointerMove( event ) {

			scope.dispatch( scope.events.pointermove, event );

		}

	},

	RenderingPlayer: function () {

		APP.Player.apply( this, arguments );

		let pathTracer = null;
		let prevTime = - 1;

		const scope = this;

		this.start = function () {

			scope.dispatch( scope.events.start, arguments );

		};

		this.stop = function () {

			scope.dispatch( scope.events.stop, arguments );

		};

		this.render = function ( time, shadingType = 'solid', maxSamples = - 1 ) {

			return new Promise( ( resolve ) => {

				const delta = ( prevTime === - 1 ) ? 0 : ( time - prevTime ) * 1000;
				scope.dispatch( scope.events.update, { time: time * 1000, delta } );

				switch ( shadingType ) {

					case 'solid':

					{

						scope.renderer.render( scope.scene, scope.camera );

						prevTime = time;

						resolve();

						break;

					}

					case 'realistic':

					{

						function renderSample() {

							const samples = Math.floor( pathTracer.getSamples() );

							if ( samples < maxSamples ) {

								requestAnimationFrame( renderSample );

							} else {

								prevTime = time;

								resolve();

							}

							pathTracer.update();

						}

						if ( pathTracer === null ) {

							pathTracer = new ViewportPathtracer( scope.renderer );

						}

						pathTracer.init( scope.scene, scope.camera );
						renderSample();

						break;

					}

					default:

					{

						console.error( 'APP.RenderingPlayer.render: Unknown shading type' );

					}

				}

			} );

		};

	}

};

export { APP };
