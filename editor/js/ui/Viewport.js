var Viewport = function ( signals ) {

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

	var clearColor = 0xAAAAAA;
	var objects = [];

	// helpers

	var helpersToObjects = {};
	var objectsToHelpers = {};

	var sceneHelpers = new THREE.Scene();

	var grid = new THREE.GridHelper( 500, 25 );
	sceneHelpers.add( grid );

	var modifierAxis = new THREE.Vector3( 1, 1, 1 );
	var snapDist = null;

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.color.setHex( 0xffff00 );
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
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

	var intersectionPlane = new THREE.Mesh( new THREE.PlaneGeometry( 5000, 5000 ) );
	intersectionPlane.visible = false;
	sceneHelpers.add( intersectionPlane );

	var ray = new THREE.Raycaster();
	var projector = new THREE.Projector();
	var offset = new THREE.Vector3();

	var selected = camera;

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
	var onMouseMovePosition = new THREE.Vector2();
	var onMouseUpPosition = new THREE.Vector2();

	var onMouseDown = function ( event ) {

		event.preventDefault();

		container.dom.focus();

		onMouseDownPosition.set( event.layerX, event.layerY );

		if ( event.button === 0 ) {

			var intersects = getIntersects( event, objects );

			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;

				if ( selected === object || selected === helpersToObjects[ object.id ] ) {

					intersectionPlane.position.copy( selected.position );
					intersectionPlane.lookAt( camera.position );
					intersectionPlane.updateMatrixWorld();

					var intersects = ray.intersectObject( intersectionPlane );

					offset.copy( intersects[ 0 ].point ).sub( intersectionPlane.position );

					document.addEventListener( 'mousemove', onMouseMove, false );

					controls.enabled = false;

				}

			} else {

				controls.enabled = true;

			}

			document.addEventListener( 'mouseup', onMouseUp, false );

		}

	};

	var onMouseMove = function ( event ) {

		onMouseMovePosition.set( event.layerX, event.layerY );

		if ( onMouseDownPosition.distanceTo( onMouseUpPosition ) > 1 ) {

			var intersects = getIntersects( event, intersectionPlane );

			if ( intersects.length > 0 ) {

				var point = intersects[ 0 ].point.sub( offset );

				if (snapDist) {
					point.x = Math.round( point.x / snapDist ) * snapDist;
					point.y = Math.round( point.y / snapDist ) * snapDist;
					point.z = Math.round( point.z / snapDist ) * snapDist;
				}

				selected.position.x = modifierAxis.x === 1 ? point.x : intersectionPlane.position.x;
				selected.position.y = modifierAxis.y === 1 ? point.y : intersectionPlane.position.y;
				selected.position.z = modifierAxis.z === 1 ? point.z : intersectionPlane.position.z;


				signals.objectChanged.dispatch( selected );

				render();

			}

		}

	};

	var onMouseUp = function ( event ) {

		onMouseUpPosition.set( event.layerX, event.layerY );

		if ( onMouseDownPosition.distanceTo( onMouseUpPosition ) < 1 ) {

			var intersects = getIntersects( event, objects );

			if ( intersects.length > 0 ) {

				selected = intersects[ 0 ].object;

				if ( helpersToObjects[ selected.id ] !== undefined ) {

					selected = helpersToObjects[ selected.id ];

				}

				signals.objectSelected.dispatch( selected );

			} else {

				controls.enabled = true;

				selected = camera;

				signals.objectSelected.dispatch( selected );

			}

			render();

		}

		document.removeEventListener( 'mousemove', onMouseMove );
		document.removeEventListener( 'mouseup', onMouseUp );

	};

	var onDoubleClick = function ( event ) {

		var intersects = getIntersects( event, objects );

		if ( intersects.length > 0 && intersects[ 0 ].object === selected ) {

			controls.focus( selected );
			controls.enabled = true;

		}

	};

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'dblclick', onDoubleClick, false );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	var controls = new THREE.EditorControls( camera, container.dom );
	controls.addEventListener( 'change', function () {

		signals.objectChanged.dispatch( camera );

	} );

	// signals

	signals.modifierAxisChanged.add( function ( axis ) {

		modifierAxis.copy( axis );

	} );

	signals.snapChanged.add( function ( dist ) {

		snapDist = dist;

	} );

	signals.rendererChanged.add( function ( object ) {

		container.dom.removeChild( renderer.domElement );

		renderer = object;
		renderer.setClearColor( clearColor );
		renderer.autoClear = false;
		renderer.autoUpdateScene = false;
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		container.dom.appendChild( renderer.domElement );

		render();

	} );

	signals.sceneAdded.add( function ( object ) {

		scene.userData = JSON.parse( JSON.stringify( object.userData ) );

		while ( object.children.length > 0 ) {

			signals.objectAdded.dispatch( object.children[ 0 ] );

		}

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

		updateInfo();

		signals.sceneChanged.dispatch( scene );
		signals.objectSelected.dispatch( object );

	} );

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		selectionAxis.visible = false;

		if ( object !== null ) {

			if ( object.geometry !== undefined ) {

				selectionBox.update( object );
				selectionBox.visible = true;

			}

			selectionAxis.matrixWorld = object.matrixWorld;
			selectionAxis.visible = true;

			selected = object;

		}

		render();

	} );

	signals.objectChanged.add( function ( object ) {

		if ( object.geometry !== undefined ) {

			selectionBox.update( object );
			updateInfo();

		}

		if ( objectsToHelpers[ object.id ] !== undefined ) {

			objectsToHelpers[ object.id ].update();

		}

		render();

		signals.sceneChanged.dispatch( scene );

	} );

	signals.cloneSelectedObject.add( function () {

		if ( selected === camera ) return;

		var object = selected.clone();

		signals.objectAdded.dispatch( object );

	} );

	signals.removeSelectedObject.add( function () {

		if ( selected.parent === undefined ) return;

		var name = selected.name ?  '"' + selected.name + '"': "selected object";

		if ( confirm( 'Delete ' + name + '?' ) === false ) return;

		var parent = selected.parent;

		if ( selected instanceof THREE.PointLight ||
		     selected instanceof THREE.DirectionalLight ||
		     selected instanceof THREE.SpotLight ||
		     selected instanceof THREE.HemisphereLight ) {

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

			updateInfo();

		}

		signals.sceneChanged.dispatch( scene );
		signals.objectSelected.dispatch( parent );

	} );

	signals.materialChanged.add( function ( material ) {

		render();

	} );

	signals.clearColorChanged.add( function ( color ) {

		renderer.setClearColor( color );
		render();

		clearColor = color;

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

	function updateMaterials( root ) {

		root.traverse( function ( node ) {

			if ( node.material ) {

				node.material.needsUpdate = true;

				if ( node.material instanceof THREE.MeshFaceMaterial ) {

					for ( var i = 0; i < node.material.materials.length; i ++ ) {

						node.material.materials[ i ].needsUpdate = true;

					}

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
