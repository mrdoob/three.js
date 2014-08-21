var Player = function ( json ) {

	var camera = new THREE.PerspectiveCamera( 50, 1, 1, 1000 );
	camera.position.set( 500, 250, 500 );
	camera.lookAt( new THREE.Vector3() );

	var scene = new THREE.ObjectLoader().parse( json );
	var renderer = new THREE.WebGLRenderer( { antialias: true } );

	var setSize = function ( width, height ) {

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize( width, height );

	};

	var update = function () {

		renderer.render( scene, camera );

	};

	return {
		dom: renderer.domElement,
		setSize: setSize,
		update: update 
	}

};