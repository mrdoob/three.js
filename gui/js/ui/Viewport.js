var Viewport = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#aaa' );

	//

	var sceneHelpers = new THREE.Scene();

	var size = 500, step = 25;
	var geometry = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
	var color1 = new THREE.Color( 0x444444 ), color2 = new THREE.Color( 0x888888 );

	for ( var i = - size; i <= size; i += step ) {

		geometry.vertices.push( new THREE.Vector3( -size, 0, i ) );
		geometry.vertices.push( new THREE.Vector3(  size, 0, i ) );

		geometry.vertices.push( new THREE.Vector3( i, 0, -size ) );
		geometry.vertices.push( new THREE.Vector3( i, 0,  size ) );

		var color = i === 0 ? color1 : color2;

		geometry.colors.push( color, color, color, color );

	}

	var grid = new THREE.Line( geometry, material, THREE.LinePieces );
	sceneHelpers.add( grid );

	//

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
