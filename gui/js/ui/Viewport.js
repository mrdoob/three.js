var Viewport = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#aaa' );

	//

	var sceneHelpers = new THREE.Scene();

	var plane = new THREE.Mesh(
		new THREE.PlaneGeometry( 1000, 1000, 20, 20 ),
		new THREE.MeshBasicMaterial( { color: 0x606060, wireframe: true, transparent: true } )
	);
	sceneHelpers.add( plane );

	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera( 50, 1, 1, 5000 );
	camera.position.set( 500, 250, 500 );
	camera.lookAt( scene.position );
	scene.add( camera );

	var controls = new THREE.TrackballControls( camera, container.dom );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.addEventListener( 'change', render );

	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.autoClear = false;
	container.dom.appendChild( renderer.domElement );

	signals.windowResize.add( update );

	animate();

	//

	function animate() {

		requestAnimationFrame( animate );
		controls.update();

	}

	function render() {

		renderer.clear();
		renderer.render( sceneHelpers, camera );
		renderer.render( scene, camera );

	}

	function update() {

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();

	}

	return container;

}
