var Viewport = function ( editor, signals ) {

	var container = new UI.Panel();
	container.setPosition( 'absolute' );
	container.setBackgroundColor( '#aaa' );

	var info = new UI.Text();
	info.setPosition( 'absolute' );
	info.setRight( '5px' );
	info.setBottom( '5px' );
	info.setFontSize( '12px' );
	info.setColor( '#ffffff' );
	container.add( info );

	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;

	var clearColor = 0xAAAAAA;

	var grid = new THREE.GridHelper( 500, 25 );
	sceneHelpers.add( grid );

	//

	var camera = new THREE.PerspectiveCamera( 50, container.dom.offsetWidth / container.dom.offsetHeight, 1, 5000 );
	camera.position.set( 500, 250, 500 );
	camera.lookAt( scene.position );

	editor.select( camera );

	//

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	//

	var transformControls = new THREE.TransformControls( camera, container.dom );
	transformControls.addEventListener( 'change', function () {

		signals.objectChanged.dispatch( this.object );

	} );
	sceneHelpers.add( transformControls.gizmo );
	transformControls.hide();

	//

	var selected;

	// object picking

	var ray = new THREE.Raycaster();
	var projector = new THREE.Projector();

	// events

	var getIntersects = function ( event, object ) {

		var vector = new THREE.Vector3(
			( event.layerX / container.dom.offsetWidth ) * 2 - 1,
			- ( event.layerY / container.dom.offsetHeight ) * 2 + 1,
			0.5
		);

		projector.unprojectVector( vector, camera );

		ray.set( camera.position, vector.sub( camera.position ).normalize() );

		if ( object instanceof Array ) {

			return ray.intersectObjects( object, true );

		}

		return ray.intersectObject( object, true );

	};

	var onMouseDownPosition = new THREE.Vector2();
	var onMouseUpPosition = new THREE.Vector2();

	var onMouseDown = function ( event ) {

		event.preventDefault();

		onMouseDownPosition.set( event.layerX, event.layerY );

		if ( transformControls.hovered === false ) {

			controls.enabled = true;
			document.addEventListener( 'mouseup', onMouseUp, false );

		}

	};

	var onMouseUp = function ( event ) {

		onMouseUpPosition.set( event.layerX, event.layerY );

		if ( onMouseDownPosition.distanceTo( onMouseUpPosition ) < 1 ) {

			var hit;

			var intersect = getIntersects( event, [ scene, sceneHelpers ] );

			for ( var i in intersect ) {

				if ( editor.objects[ intersect[i].object.id ] ) {

					editor.selectById( intersect[i].object.id );
					hit = true;
					break;

				}

			}

			if ( !hit ) editor.deselectAll();

		}

		controls.enabled = false; // ?

		document.removeEventListener( 'mouseup', onMouseUp );

	};

	var onDoubleClick = function ( event ) {

		var intersect = getIntersects( event, [ scene, sceneHelpers ] );

			for ( var i in intersect ) {

				if ( editor.objects[ intersect[i].object.id ] ) {

					editor.selectById( intersect[i].object.id );

					controls.focus( editor.objects[ intersect[i].object.id ] );

					break;

				}

			}

	};

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'dblclick', onDoubleClick, false );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	var controls = new THREE.EditorControls( camera, container.dom );
	controls.addEventListener( 'change', function () {

		transformControls.update();
		signals.objectChanged.dispatch( camera );

	} );
	controls.enabled = false;


	function updateHelpers( object ) {

		if ( object.geometry !== undefined ) {

			selectionBox.visible = true;
			selectionBox.update( object );
			transformControls.update();

		}

		if ( editor.helpers[ object.id ] ) editor.helpers[ object.id ].update();

	} 

	// signals

	signals.setTransformMode.add( function ( mode ) {

		transformControls.setMode( mode );
		render();

	} );

	signals.snapChanged.add( function ( dist ) {

		transformControls.snapDist = dist;

	} );

	signals.setRenderer.add( function ( object ) {

		container.dom.removeChild( renderer.domElement );

		renderer = object;
		renderer.setClearColor( clearColor );
		renderer.autoClear = false;
		renderer.autoUpdateScene = false;
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		container.dom.appendChild( renderer.domElement );

		render();

	} );

	signals.selected.add( function () {

		selectionBox.visible = false;
		transformControls.detach();

		selected = editor.listSelected( 'object' );
		object = ( selected.length ) ? selected[0] : null;

		if ( object && object !== scene ) {

			transformControls.attach( object );
			updateHelpers( object );

		}

		render();

	} );

	signals.sceneChanged.add( function () {

		render();

	} );

	signals.objectAdded.add( function ( object ) {

		updateHelpers( object );
		updateInfo();
		render();

	} );

	signals.objectChanged.add( function ( object ) {

		updateHelpers( object );
		transformControls.update();
		updateInfo();
		render();

	} );

	signals.objectDeleted.add( function () {

		updateInfo();
		render();

	} );

	signals.materialChanged.add( function ( material ) {

		render();

	} );

	signals.geometryChanged.add( function ( material ) {

		updateInfo();
		render();

	} );

	signals.clearColorChanged.add( function ( color ) {

		renderer.setClearColor( color );
		render();

		clearColor = color;

	} );

	signals.fogChanged.add( function () {

		render();

	} );

	signals.windowResize.add( function () {

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();

	} );

	signals.playAnimations.add( function (animations) {

		function animate() {
			requestAnimationFrame( animate );

			for (var i = 0; i < animations.length ; i++ ){
				animations[i].update(0.016);
			} 

			render();
		}

		animate();

	} );
	
	//

	var renderer;

	if ( System.support.webgl === true ) {

		renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );

	} else {

		renderer = new THREE.CanvasRenderer();

	}

	renderer.setClearColor( clearColor );
	renderer.autoClear = false;
	renderer.autoUpdateScene = false;
	container.dom.appendChild( renderer.domElement );

	animate();

	//

	function updateInfo() {

		var objects = 0;
		var vertices = 0;
		var faces = 0;

		scene.traverse( function ( object ) {

			if ( object instanceof THREE.Mesh ) {

				objects ++;
				vertices += object.geometry.vertices.length;
				faces += object.geometry.faces.length;

			}

		} );

		info.setValue( 'objects: ' + objects + ', vertices: ' + vertices + ', faces: ' + faces );

	}

	function animate() {

		requestAnimationFrame( animate );

	}

	function render() {

		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();

		renderer.clear();
		renderer.render( scene, camera );
		renderer.render( sceneHelpers, camera );

	}

	return container;

}
