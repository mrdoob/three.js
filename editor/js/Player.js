var Player = function () {

	var camera = new THREE.PerspectiveCamera( 50, 1, 1, 1000 );
	camera.position.set( 500, 250, 500 );
	camera.lookAt( new THREE.Vector3() );

	var loader = new THREE.ObjectLoader();
	var scene = new THREE.Scene();

	var scripts;

	var renderer = new THREE.WebGLRenderer( { antialias: true } );

	//

	var load = function ( json ) {

		scene = loader.parse( json );

		//

		scripts = [];

		scene.traverse( function ( child ) {

			if ( child.script !== undefined ) {

				var script = new Function( 'scene', child.script.source ).bind( child );
				scripts.push( script );

			}

		} );

	};

	var request;

	var play = function () {

		request = requestAnimationFrame( play );
		update();

	};

	var stop = function () {

		cancelAnimationFrame( request );

	};

	var setSize = function ( width, height ) {

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize( width, height );

	};

	var update = function () {

		for ( var i = 0; i < scripts.length; i ++ ) {

			scripts[ i ]( scene );

		}

		renderer.render( scene, camera );

	};

	return {
		dom: renderer.domElement,
		load: load,
		play: play,
		stop: stop,
		setSize: setSize
	}

};