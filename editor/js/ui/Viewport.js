var Viewport = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#aaa' );

	//

	var objects = [];

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
	selectionBox.geometry.dynamic = true;
	selectionBox.matrixAutoUpdate = false;
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

	/*
	var controls = new THREE.OrbitControls( camera, container.dom );
	controls.addEventListener( 'change', render );
	*/

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 0.5, 0 ).normalize();
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light.position.set( - 1, - 0.5, 0 ).normalize();
	scene.add( light );

	signals.sceneChanged.dispatch( scene );

	// object picking

	var projector = new THREE.Projector();

	container.dom.addEventListener( 'mousedown', function ( event ) {

		event.preventDefault();

		var vector = new THREE.Vector3(
			( ( event.clientX - container.dom.offsetLeft ) / container.dom.offsetWidth ) * 2 - 1,
			- ( ( event.clientY - container.dom.offsetTop ) / container.dom.offsetHeight ) * 2 + 1,
			0.5
		);
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
		var intersects = ray.intersectObjects( objects, true );

		if ( intersects.length ) {

			signals.objectSelected.dispatch( intersects[ 0 ].object );

			// controls.enabled = false;

		} else {

			signals.objectSelected.dispatch( null );

		}

	}, false );

	// events

	signals.objectAdded.add( function ( object ) {

		THREE.SceneUtils.traverseHierarchy( object, function ( child ) {

			objects.push( child );

		} );

		objects.push( object );

		scene.add( object );
		render();

		signals.sceneChanged.dispatch( scene );

	} );

	signals.objectChanged.add( function ( object ) {

		render();

	} );

	var selected = null;

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;

		if ( object !== null && object.geometry ) {

			var geometry = object.geometry;

			if ( geometry.boundingBox === null ) {

				geometry.computeBoundingBox();

			}

			selectionBox.geometry.vertices[ 0 ].x = geometry.boundingBox.max.x;
			selectionBox.geometry.vertices[ 0 ].y = geometry.boundingBox.max.y;
			selectionBox.geometry.vertices[ 0 ].z = geometry.boundingBox.max.z;

			selectionBox.geometry.vertices[ 1 ].x = geometry.boundingBox.max.x;
			selectionBox.geometry.vertices[ 1 ].y = geometry.boundingBox.max.y;
			selectionBox.geometry.vertices[ 1 ].z = geometry.boundingBox.min.z;

			selectionBox.geometry.vertices[ 2 ].x = geometry.boundingBox.max.x;
			selectionBox.geometry.vertices[ 2 ].y = geometry.boundingBox.min.y;
			selectionBox.geometry.vertices[ 2 ].z = geometry.boundingBox.max.z;

			selectionBox.geometry.vertices[ 3 ].x = geometry.boundingBox.max.x;
			selectionBox.geometry.vertices[ 3 ].y = geometry.boundingBox.min.y;
			selectionBox.geometry.vertices[ 3 ].z = geometry.boundingBox.min.z;

			selectionBox.geometry.vertices[ 4 ].x = geometry.boundingBox.min.x;
			selectionBox.geometry.vertices[ 4 ].y = geometry.boundingBox.max.y;
			selectionBox.geometry.vertices[ 4 ].z = geometry.boundingBox.min.z;

			selectionBox.geometry.vertices[ 5 ].x = geometry.boundingBox.min.x;
			selectionBox.geometry.vertices[ 5 ].y = geometry.boundingBox.max.y;
			selectionBox.geometry.vertices[ 5 ].z = geometry.boundingBox.max.z;

			selectionBox.geometry.vertices[ 6 ].x = geometry.boundingBox.min.x;
			selectionBox.geometry.vertices[ 6 ].y = geometry.boundingBox.min.y;
			selectionBox.geometry.vertices[ 6 ].z = geometry.boundingBox.min.z;

			selectionBox.geometry.vertices[ 7 ].x = geometry.boundingBox.min.x;
			selectionBox.geometry.vertices[ 7 ].y = geometry.boundingBox.min.y;
			selectionBox.geometry.vertices[ 7 ].z = geometry.boundingBox.max.z;

			selectionBox.geometry.computeBoundingSphere();

			selectionBox.geometry.verticesNeedUpdate = true;

			selectionBox.matrixWorld = object.matrixWorld;

			selectionBox.visible = true;

		}

		render();

	} );

	signals.materialChanged.add( function ( material ) {

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
	renderer.autoUpdateScene = false;
	container.dom.appendChild( renderer.domElement );

	animate();

	//

	function animate() {

		requestAnimationFrame( animate );
		controls.update();

	}

	function render() {

		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();

		renderer.clear();
		renderer.render( sceneHelpers, camera );
		renderer.render( scene, camera );

	}

	return container;

}
