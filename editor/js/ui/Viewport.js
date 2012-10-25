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
	selectionBox.matrixAutoUpdate = false;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	var selectionAxis = new THREE.AxisHelper( 100 );
	selectionAxis.material.depthTest = false;
	selectionAxis.material.transparent = true;
	selectionAxis.matrixAutoUpdate = false;
	selectionAxis.visible = false;
	sceneHelpers.add( selectionAxis );

	//

	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera( 50, 1, 1, 5000 );
	camera.position.set( 500, 250, 500 );
	camera.lookAt( scene.position );
	scene.add( camera );

	var light1 = new THREE.DirectionalLight( 0xffffff );
	light1.position.set( 1, 0.5, 0 ).normalize();
	scene.add( light1 );

	var light2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light2.position.set( - 1, - 0.5, 0 ).normalize();
	scene.add( light2 );

	// fog

	var oldFogType = "None";
	var oldFogColor = 0xaaaaaa;
	var oldFogNear = 1;
	var oldFogFar = 5000;
	var oldFogDensity = 0.00025;

	// default objects names

	camera.name = "Camera";

	light1.name = "Light 1";
	light1.target.name = "Light 1 Target";

	light2.name = "Light 2";
	light2.target.name = "Light 2 Target";
	signals.sceneChanged.dispatch( scene );

	// object picking

	var intersectionPlane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ) );
	intersectionPlane.visible = false;
	sceneHelpers.add( intersectionPlane );

	var ray = new THREE.Ray();
	var projector = new THREE.Projector();
	var offset = new THREE.Vector3();
	var picked = null;

	var oldMouseX = 0, oldMouseY = 0;

	// events

	var onMouseDown = function ( event ) {

		container.dom.focus();

		event.preventDefault();

		if ( event.button === 0 ) {

			var vector = new THREE.Vector3(
				( ( event.clientX - container.dom.offsetLeft ) / container.dom.offsetWidth ) * 2 - 1,
				- ( ( event.clientY - container.dom.offsetTop ) / container.dom.offsetHeight ) * 2 + 1,
				0.5
			);

			projector.unprojectVector( vector, camera );

			ray.set( camera.position, vector.subSelf( camera.position ).normalize() );

			var intersects = ray.intersectObjects( objects, true );

			if ( intersects.length > 0 ) {

				controls.enabled = false;

				intersectionPlane.position.copy( intersects[ 0 ].object.position );
				intersectionPlane.lookAt( camera.position );

				picked = intersects[ 0 ].object;
				selected = picked;

				signals.objectSelected.dispatch( selected );

				var intersects = ray.intersectObject( intersectionPlane );
				offset.copy( intersects[ 0 ].point ).subSelf( intersectionPlane.position );

				document.addEventListener( 'mousemove', onMouseMoveDrag, false );
				document.addEventListener( 'mouseup', onMouseUpDrag, false );

			} else {

				controls.enabled = true;

			}

		}

		if ( controls.enabled ) {

			oldMouseX = event.clientX;
			oldMouseY = event.clientY;

		}

	};

	var onMouseMoveDrag = function ( event ) {

		var vector = new THREE.Vector3(
			( ( event.clientX - container.dom.offsetLeft ) / container.dom.offsetWidth ) * 2 - 1,
			- ( ( event.clientY - container.dom.offsetTop ) / container.dom.offsetHeight ) * 2 + 1,
			0.5
		);

		projector.unprojectVector( vector, camera );

		ray.set( camera.position, vector.subSelf( camera.position ).normalize() );

		var intersects = ray.intersectObject( intersectionPlane );

		if ( intersects.length > 0 ) {

			picked.position.copy( intersects[ 0 ].point.subSelf( offset ) );

			signals.objectChanged.dispatch( picked );

			render();

		}

	};

	var onMouseUpDrag = function ( event ) {

		document.removeEventListener( 'mousemove', onMouseMoveDrag );
		document.removeEventListener( 'mouseup', onMouseUpDrag );

	};

	var onMouseUp = function ( event ) {

		// clear selection when clicking in empty space

		if ( controls.enabled && event.clientX === oldMouseX && event.clientY === oldMouseY ) {

			selected = null;
			signals.objectSelected.dispatch( selected );

		}

	};

	var onClick = function ( event ) {

		if ( event.button === 0 ) {

			var vector = new THREE.Vector3(
				( ( event.clientX - container.dom.offsetLeft ) / container.dom.offsetWidth ) * 2 - 1,
				- ( ( event.clientY - container.dom.offsetTop ) / container.dom.offsetHeight ) * 2 + 1,
				0.5
			);

			projector.unprojectVector( vector, camera );

			ray.set( camera.position, vector.subSelf( camera.position ).normalize() );
			var intersects = ray.intersectObjects( objects, true );

			if ( intersects.length > 0 && ! controls.enabled ) {

				selected = intersects[ 0 ].object;
				signals.objectSelected.dispatch( selected );

			}

		}

		controls.enabled = true;

	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 46: // delete

				signals.removeSelectedObject.dispatch();

				break;

		}

	};

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'mouseup', onMouseUp, false );
	container.dom.addEventListener( 'click', onClick, false );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	var controls = new THREE.TrackballControls( camera, container.dom );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.addEventListener( 'change', function () {

		signals.cameraChanged.dispatch( camera );
		render();

	} );

	// signals

	signals.objectAdded.add( function ( object ) {

		object.traverse( function ( child ) {

			objects.push( child );

		} );

		scene.add( object );
		render();

		signals.sceneChanged.dispatch( scene );

	} );

	signals.objectChanged.add( function ( object ) {

		if ( object instanceof THREE.Camera ) {

			object.updateProjectionMatrix();

		}

		render();

	} );

	signals.removeSelectedObject.add( function () {

		if ( selected === null ) {

			console.warn( "No object selected for delete" );
			return;

		}

		var name = selected.name ?  '"' + selected.name + '"': "selected object";

		if ( ! confirm( 'Delete ' + name + '?' ) ) {

			return;

		}

		var toRemove = {};

		selected.traverse( function ( child ) {

			toRemove[ child.id ] = true;

		} );

		var newObjects = [];

		for ( var i = 0; i < objects.length; i ++ ) {

			var object = objects[ i ];

			if ( ! ( object.id in toRemove ) ) {

				newObjects.push( object );

			}

		}

		objects = newObjects;

		selectionBox.visible = false;
		selectionAxis.visible = false;

		scene.traverse( function( node ) {

			node.remove( selected );

		} );

		render();

		signals.sceneChanged.dispatch( scene );
		signals.objectSelected.dispatch( null );

	} );

	var selected = null;

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		selectionAxis.visible = false;

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
			selectionAxis.matrixWorld = object.matrixWorld;

			selectionBox.visible = true;
			selectionAxis.visible = true;

		}

		if ( object !== null ) {

			selected = object;

		}

		render();

	} );

	signals.materialChanged.add( function ( material ) {

		render();

	} );

	signals.clearColorChanged.add( function ( color ) {

		renderer.setClearColorHex( color, 1 );

		render();

	} );

	signals.fogTypeChanged.add( function ( fogType ) {

		if ( fogType !== oldFogType ) {

			if ( fogType === "None" ) {

				scene.fog = null;

			} else if ( fogType === "Fog" ) {

				scene.fog = new THREE.Fog( oldFogColor, oldFogNear, oldFogFar );

			} else if ( fogType === "FogExp2" ) {

				scene.fog = new THREE.FogExp2( oldFogColor, oldFogDensity );

			}

			updateMaterials( scene );

			var enableHelpersFog = true;

			if ( enableHelpersFog )	{

				sceneHelpers.fog = scene.fog;
				updateMaterials( sceneHelpers );

			}

			oldFogType = fogType;

		}

		render();

	} );

	signals.fogColorChanged.add( function ( fogColor ) {

		oldFogColor = fogColor;

		updateFog( scene );

		render();

	} );

	signals.fogParametersChanged.add( function ( near, far, density ) {

		oldFogNear = near;
		oldFogFar = far;
		oldFogDensity = density;

		updateFog( scene );

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

	// set up for hotkeys
	// must be done here, otherwise it doesn't work

	container.dom.tabIndex = 1;
	container.dom.addEventListener( 'keydown', onKeyDown, false );

	//

	function updateMaterials( root ) {

		root.traverse( function ( node ) {

			if ( node.material ) {

				node.material.needsUpdate = true;

			}

			if ( node.geometry && node.geometry.materials ) {

				for ( var i = 0; i < node.geometry.materials.length; i ++ ) {

					node.geometry.materials[ i ].needsUpdate = true;

				}

			}

		} );

	}

	function updateFog( root ) {

		if ( root.fog ) {

			root.fog.color.setHex( oldFogColor );

			if ( root.fog.near !== undefined ) root.fog.near = oldFogNear;
			if ( root.fog.far !== undefined ) root.fog.far = oldFogFar;
			if ( root.fog.density !== undefined ) root.fog.density = oldFogDensity;

		}

	}

	function animate() {

		requestAnimationFrame( animate );
		controls.update();

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
