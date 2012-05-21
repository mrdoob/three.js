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

	var selectionBox = new THREE.Mesh( new THREE.CubeGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true } ) );
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

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

	// object picking

	var projector = new THREE.Projector();

	container.dom.addEventListener( 'mousedown', function ( event ) {

		event.preventDefault();

		var vector = new THREE.Vector3( ( event.clientX / container.dom.offsetWidth ) * 2 - 1, - ( event.clientY / container.dom.offsetHeght ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
		var intersects = ray.intersectObjects( scene.children );

		if ( intersects.length ) {

			signals.objectSelected.dispatch( intersects[ 0 ].object );

			// controls.enabled = false;

		} else {

			signals.objectSelected.dispatch( null );

		}

	}, false );

	// events

	signals.objectAdded.add( function ( object ) {

		scene.add( object );
		render();

	} );

	signals.objectSelected.add( function ( object ) {

		if ( object === null ) {

			selectionBox.visible = false;

		} else {

			var geometry = object.geometry;

			if ( geometry.boundingBox === null ) {

				geometry.computeBoundingBox();

			}

			selectionBox.scale.x = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
			selectionBox.scale.y = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
			selectionBox.scale.z = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

			selectionBox.visible = true;

		}

		render();

	} );

	signals.windowResize.add( function () {

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();

	} );

	//

	var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false, clearColor: 0xaaaaaa, clearAlpha: 1 } );
	renderer.autoClear = false;
	container.dom.appendChild( renderer.domElement );

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

	return container;

}
