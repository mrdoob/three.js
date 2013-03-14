var Viewport = function ( signals ) {

	var container = new UI.Panel();
	container.setPosition( 'absolute' );
	container.setBackgroundColor( '#aaa' );

	var objects = [];

	// helpers

	var helpersToObjects = {};
	var objectsToHelpers = {};

	var sceneHelpers = new THREE.Scene();

	var grid = new THREE.GridHelper( 500, 25 );
	sceneHelpers.add( grid );

	var selectionBox = new THREE.Mesh( new THREE.CubeGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true, fog: false } ) );
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

	var camera = new THREE.PerspectiveCamera( 50, container.dom.offsetWidth / container.dom.offsetHeight, 1, 5000 );
	camera.position.set( 500, 250, 500 );
	camera.lookAt( scene.position );

	// fog

	var oldFogType = "None";
	var oldFogColor = 0xaaaaaa;
	var oldFogNear = 1;
	var oldFogFar = 5000;
	var oldFogDensity = 0.00025;

	// object picking

	var intersectionPlane = new THREE.Mesh( new THREE.PlaneGeometry( 10000, 10000, 8, 8 ) );
	intersectionPlane.visible = false;
	sceneHelpers.add( intersectionPlane );

	var ray = new THREE.Raycaster();
	var projector = new THREE.Projector();
	var offset = new THREE.Vector3();

	var cameraChanged = false;

	//

	var picked = null;
	var selected = camera;

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

			ray.set( camera.position, vector.sub( camera.position ).normalize() );

			var intersects = ray.intersectObjects( objects, true );

			if ( intersects.length > 0 ) {

				controls.enabled = false;

				selected = intersects[ 0 ].object;

				if ( helpersToObjects[ selected.id ] !== undefined ) {

					selected = helpersToObjects[ selected.id ];

				}

				intersectionPlane.position.copy( selected.position );
				intersectionPlane.lookAt( camera.position );

				signals.objectSelected.dispatch( selected );

				var intersects = ray.intersectObject( intersectionPlane );
				offset.copy( intersects[ 0 ].point ).sub( intersectionPlane.position );

				document.addEventListener( 'mousemove', onMouseMove, false );
				document.addEventListener( 'mouseup', onMouseUp, false );

			} else {

				controls.enabled = true;

			}

		}

		cameraChanged = false;

	};

	var onMouseMove = function ( event ) {

		var vector = new THREE.Vector3(
			( ( event.clientX - container.dom.offsetLeft ) / container.dom.offsetWidth ) * 2 - 1,
			- ( ( event.clientY - container.dom.offsetTop ) / container.dom.offsetHeight ) * 2 + 1,
			0.5
		);

		projector.unprojectVector( vector, camera );

		ray.set( camera.position, vector.sub( camera.position ).normalize() );

		var intersects = ray.intersectObject( intersectionPlane );

		if ( intersects.length > 0 ) {

			intersects[ 0 ].point.sub( offset );

			selected.position.copy( intersects[ 0 ].point );
			signals.objectChanged.dispatch( selected );

			render();

		}

	};

	var onMouseUp = function ( event ) {

		document.removeEventListener( 'mousemove', onMouseMove );
		document.removeEventListener( 'mouseup', onMouseUp );

	};

	var onClick = function ( event ) {

		if ( event.button == 0 && cameraChanged === false ) {

			var vector = new THREE.Vector3(
				( ( event.clientX - container.dom.offsetLeft ) / container.dom.offsetWidth ) * 2 - 1,
				- ( ( event.clientY - container.dom.offsetTop ) / container.dom.offsetHeight ) * 2 + 1,
				0.5
			);

			projector.unprojectVector( vector, camera );

			ray.set( camera.position, vector.sub( camera.position ).normalize() );
			var intersects = ray.intersectObjects( objects, true );

			if ( intersects.length > 0 && ! controls.enabled ) {

				selected = intersects[ 0 ].object;

				if ( helpersToObjects[ selected.id ] !== undefined ) {

					selected = helpersToObjects[ selected.id ];

				}

			} else {

				selected = camera;

			}

			signals.objectSelected.dispatch( selected );

		}

		controls.enabled = true;

	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 27: // esc

				signals.toggleHelpers.dispatch();

				break;

			case 46: // delete

				signals.removeSelectedObject.dispatch();

				break;

		}

	};

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
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

		cameraChanged = true;

		signals.cameraChanged.dispatch( camera );
		render();

	} );

	// signals

	signals.rendererChanged.add( function ( object ) {

		container.dom.removeChild( renderer.domElement );

		renderer = object;
		renderer.autoClear = false;
		renderer.autoUpdateScene = false;
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		container.dom.appendChild( renderer.domElement );

		render();

	} );

	signals.objectAdded.add( function ( object ) {

		// handle children

		object.traverse( function ( object ) {

			// create helpers for invisible object types (lights, cameras, targets)

			if ( object instanceof THREE.PointLight ) {

				var helper = new THREE.PointLightHelper( object, 10 );
				sceneHelpers.add( helper );

				objectsToHelpers[ object.id ] = helper;
				helpersToObjects[ helper.lightSphere.id ] = object;

				objects.push( helper.lightSphere );

			} else if ( object instanceof THREE.DirectionalLight ) {

				var helper = new THREE.DirectionalLightHelper( object, 10 );
				sceneHelpers.add( helper );

				objectsToHelpers[ object.id ] = helper;
				helpersToObjects[ helper.lightSphere.id ] = object;

				objects.push( helper.lightSphere );

			} else if ( object instanceof THREE.SpotLight ) {

				var helper = new THREE.SpotLightHelper( object, 10 );
				sceneHelpers.add( helper );

				objectsToHelpers[ object.id ] = helper;
				helpersToObjects[ helper.lightSphere.id ] = object;

				objects.push( helper.lightSphere );

			} else if ( object instanceof THREE.HemisphereLight ) {

				var helper = new THREE.HemisphereLightHelper( object, 10 );
				sceneHelpers.add( helper );

				objectsToHelpers[ object.id ] = helper;
				helpersToObjects[ helper.lightSphere.id ] = object;

				objects.push( helper.lightSphere );

			} else {

				// add to picking list

				objects.push( object );

			}

		} );

		scene.add( object );

		// TODO: Add support for hierarchies with lights

		if ( object instanceof THREE.Light )  {

			updateMaterials( scene );

		}

		signals.sceneChanged.dispatch( scene );
		signals.objectSelected.dispatch( object );

	} );

	signals.objectChanged.add( function ( object ) {

		if ( object instanceof THREE.Camera ) {

			object.updateProjectionMatrix();

		}

		if ( objectsToHelpers[ object.id ] !== undefined ) {

			objectsToHelpers[ object.id ].update();

		}

		render();

	} );

	signals.cloneSelectedObject.add( function () {

		if ( selected === camera ) return;

		var object = selected.clone();

		signals.objectAdded.dispatch( object );
		signals.objectSelected.dispatch( object );

	} );

	signals.removeSelectedObject.add( function () {

		if ( selected === camera ) return;

		var name = selected.name ?  '"' + selected.name + '"': "selected object";

		if ( confirm( 'Delete ' + name + '?' ) === false ) return;

		if ( selected instanceof THREE.Light ) {

			var helper = objectsToHelpers[ selected.id ];

			objects.splice( objects.indexOf( helper.lightSphere ), 1 );

			helper.parent.remove( helper );
			selected.parent.remove( selected );

			delete objectsToHelpers[ selected.id ];
			delete helpersToObjects[ helper.id ];

			if ( selected instanceof THREE.DirectionalLight ||
			     selected instanceof THREE.SpotLight ) {

				selected.target.parent.remove( selected.target );

			}

			updateMaterials( scene );

		} else {

			selected.traverse( function ( object ) {

				var index = objects.indexOf( object );

				if ( index !== -1 ) {

					objects.splice( index, 1 )

				}

			} );

			selected.parent.remove( selected );

		}

		signals.sceneChanged.dispatch( scene );
		signals.objectSelected.dispatch( null );

	} );

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		selectionAxis.visible = false;

		if ( object !== null ) {

			if ( object.geometry !== undefined ) {

				var geometry = object.geometry;

				if ( geometry.boundingBox === null ) {

					geometry.computeBoundingBox();

				}

				var vertices = selectionBox.geometry.vertices;

				vertices[ 0 ].x = geometry.boundingBox.max.x;
				vertices[ 0 ].y = geometry.boundingBox.max.y;
				vertices[ 0 ].z = geometry.boundingBox.max.z;

				vertices[ 1 ].x = geometry.boundingBox.max.x;
				vertices[ 1 ].y = geometry.boundingBox.max.y;
				vertices[ 1 ].z = geometry.boundingBox.min.z;

				vertices[ 2 ].x = geometry.boundingBox.max.x;
				vertices[ 2 ].y = geometry.boundingBox.min.y;
				vertices[ 2 ].z = geometry.boundingBox.max.z;

				vertices[ 3 ].x = geometry.boundingBox.max.x;
				vertices[ 3 ].y = geometry.boundingBox.min.y;
				vertices[ 3 ].z = geometry.boundingBox.min.z;

				vertices[ 4 ].x = geometry.boundingBox.min.x;
				vertices[ 4 ].y = geometry.boundingBox.max.y;
				vertices[ 4 ].z = geometry.boundingBox.min.z;

				vertices[ 5 ].x = geometry.boundingBox.min.x;
				vertices[ 5 ].y = geometry.boundingBox.max.y;
				vertices[ 5 ].z = geometry.boundingBox.max.z;

				vertices[ 6 ].x = geometry.boundingBox.min.x;
				vertices[ 6 ].y = geometry.boundingBox.min.y;
				vertices[ 6 ].z = geometry.boundingBox.min.z;

				vertices[ 7 ].x = geometry.boundingBox.min.x;
				vertices[ 7 ].y = geometry.boundingBox.min.y;
				vertices[ 7 ].z = geometry.boundingBox.max.z;

				selectionBox.geometry.computeBoundingSphere();
				selectionBox.geometry.verticesNeedUpdate = true;

				selectionBox.matrixWorld = object.matrixWorld;
				selectionBox.visible = true;

			}

			selectionAxis.matrixWorld = object.matrixWorld;
			selectionAxis.visible = true;

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

	signals.exportGeometry.add( function ( object ) {

		if ( selected.geometry === undefined ) {

			console.warn( "Selected object doesn't have any geometry" );
			return;

		}

		var exporter = new object.exporter();

		var output = JSON.stringify( exporter.parse( selected.geometry ), null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		window.open( objectURL, '_blank' );
		window.focus();

	} );

	signals.exportScene.add( function ( object ) {

		var exporter = new object.exporter();

		var output = JSON.stringify( exporter.parse( scene ), null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		window.open( objectURL, '_blank' );
		window.focus();

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
	container.dom.style.outline = 'transparent';
	container.dom.addEventListener( 'keydown', onKeyDown, false );

	// must come after listeners are registered

	signals.sceneChanged.dispatch( scene );

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
