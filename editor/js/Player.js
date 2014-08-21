var Player = function ( json ) {

	var camera = new THREE.PerspectiveCamera( 50, 1, 1, 1000 );
	camera.position.set( 500, 250, 500 );
	camera.lookAt( new THREE.Vector3() );

	var scene = new THREE.ObjectLoader().parse( json );

	var renderer = new THREE.WebGLRenderer( { antialias: true } );

	//

	var scriptObjects = [];

	scene.traverse( function ( child ) {

		if ( child.script !== undefined ) {

			child.script.compiled = new Function( 'scene', child.script.source ).bind( child );

			scriptObjects.push( child );

		}

	} );

	//

	var setSize = function ( width, height ) {

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize( width, height );

	};

	var request;

	var play = function () {

		request = requestAnimationFrame( play );
		update();

	};

	var stop = function () {

		cancelAnimationFrame( request );

	};

	var update = function () {

		for ( var i = 0; i < scriptObjects.length; i ++ ) {

			var object = scriptObjects[ i ];
			object.script.compiled( scene );

		}

		renderer.render( scene, camera );

	};

	return {
		dom: renderer.domElement,
		setSize: setSize,
		play: play,
		stop: stop
	}

};