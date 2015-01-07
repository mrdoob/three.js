/**
 * @author mrdoob / http://mrdoob.com/
 */

var APP = {

	Player: function () {

		var loader = new THREE.ObjectLoader();
		var camera, scene, renderer;

		var scripts = {
			update: []
		};

		this.dom = undefined;

		this.load = function ( json ) {

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setPixelRatio( window.devicePixelRatio );

			camera = loader.parse( json.camera );

			scene = loader.parse( json.scene );

			scripts.update = [];

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( 'uuid', uuid, true );
				var sources = json.scripts[ uuid ];

				for ( var i = 0; i < sources.length; i ++ ) {

					var source = sources[ i ];

					var script = ( new Function( 'scene', 'time', source ).bind( object ) );
					scripts.update.push( script );

				}

			}

			this.dom = renderer.domElement;

		};

		this.setSize = function ( width, height ) {

			camera.aspect = width / height;
			camera.updateProjectionMatrix();

			renderer.setSize( width, height );

		};

		var request;

		var animate = function ( time ) {

			request = requestAnimationFrame( animate );

			for ( var i = 0, l = scripts.update.length; i < l; i ++ ) {

				scripts.update[ i ]( scene, time );

			}

			renderer.render( scene, camera );

		};

		this.play = function () {

			request = requestAnimationFrame( animate );

		};

		this.stop = function () {

			cancelAnimationFrame( request );

		};

	}

};
