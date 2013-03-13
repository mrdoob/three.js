var Viewport = function ( signals ) {

	var container = new UI.Panel();
	container.setPosition( 'absolute' );
	container.setBackgroundColor( '#aaa' );

	var objects = [];


	// helpers

	var helpersToObjects = {};
	var objectsToHelpers = {};

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

	// default dummy scene and camera

	var scene = new THREE.Scene();
	var camera = new THREE.Camera();

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
	var helpersVisible = true;

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

	var handleAddition = function ( object ) {

		// create helpers for invisible object types (lights, cameras, targets)

		if ( object instanceof THREE.PointLight ) {

			var helper = new THREE.PointLightHelper( object, 10 );

			sceneHelpers.add( helper );
			objects.push( helper );

			objectsToHelpers[ object.id ] = helper;
			helpersToObjects[ helper.id ] = object;

		} else if ( object instanceof THREE.DirectionalLight ) {

			var helper = new THREE.DirectionalLightHelper( object, 10 );
			sceneHelpers.add( helper.lightSphere );
			sceneHelpers.add( helper.targetLine );

			objectsToHelpers[ object.id ] = helper.lightSphere;
			helpersToObjects[ helper.lightSphere.id ] = object;

			objects.push( helper.lightSphere );
			objects.push( helper.targetLine );

		} else if ( object instanceof THREE.SpotLight ) {

			var sphereSize = 5;

			var helper = new THREE.SpotLightHelper( object, sphereSize );
			sceneHelpers.add( helper );
			sceneHelpers.add( helper.targetSphere );
			sceneHelpers.add( helper.targetLine );

			objects.push( helper.lightSphere );
			objects.push( helper.targetSphere );
			objects.push( helper.targetLine );

		} else if ( object instanceof THREE.HemisphereLight ) {

			var sphereSize = 5;
			var arrowLength = 30;

			var helper = new THREE.HemisphereLightHelper( object, sphereSize, arrowLength );
			sceneHelpers.add( helper );

			objects.push( helper.lightSphere );

		} else {

			// add to picking list

			objects.push( object );

		}

	};


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

		object.traverse( handleAddition );

		scene.add( object );

		if ( object instanceof THREE.Light )  {

			updateMaterials( scene );

		}

		render();

		signals.sceneChanged.dispatch( scene );

	} );

	signals.objectChanged.add( function ( object ) {

		if ( object instanceof THREE.Camera ) {

			object.updateProjectionMatrix();

		} else if ( object instanceof THREE.PointLight || object instanceof THREE.DirectionalLight || object instanceof THREE.HemisphereLight || object instanceof THREE.SpotLight ) {

			objectsToHelpers[ object.id ].update();

		}

		render();

	} );

	signals.cloneSelectedObject.add( function () {

		if ( selected === camera ) return;

		signals.objectAdded.dispatch( selected.clone() );

	} );

	signals.removeSelectedObject.add( function () {

		if ( selected === camera ) return;

		var name = selected.name ?  '"' + selected.name + '"': "selected object";

		if ( ! confirm( 'Delete ' + name + '?' ) ) {

			return;

		}

		// remove proxies from picking list

		var toRemove = {};

		var proxyObject = selected.userData.pickingProxy ? selected.userData.pickingProxy : selected;

		proxyObject.traverse( function ( child ) {

			toRemove[ child.id ] = true;

		} );

		// remove eventual pure Object3D target proxies from picking list

		if ( selected.target && !selected.target.geometry ) {

			toRemove[ selected.target.userData.pickingProxy.id ] = true;

		}

		//

		var newObjects = [];

		for ( var i = 0; i < objects.length; i ++ ) {

			var object = objects[ i ];

			if ( ! ( object.id in toRemove ) ) {

				newObjects.push( object );

			}

		}

		objects = newObjects;

		// clean selection highlight

		selectionBox.visible = false;
		selectionAxis.visible = false;

		// remove selected object from the scene

		selected.parent.remove( selected );

		// remove eventual pure Object3D targets from the scene

		if ( selected.target && !selected.target.geometry ) {

			selected.target.parent.remove( selected.target );

		}

		// remove eventual helpers for the object from helpers scene

		var helpersToRemove = [];

		if ( selected.userData.helper ) {

			helpersToRemove.push( selected.userData.helper );

			if ( selected.userData.helper.targetLine ) helpersToRemove.push( selected.userData.helper.targetLine );
			if ( selected.target && !selected.target.geometry ) helpersToRemove.push( selected.userData.helper.targetSphere );


		}

		for ( var i = 0; i < helpersToRemove.length; i ++ ) {

			var helper = helpersToRemove[ i ];

			helper.parent.remove( helper );

		}

		if ( selected instanceof THREE.Light )  {

			updateMaterials( scene );

		}

		render();

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

	signals.toggleHelpers.add( function () {

		helpersVisible = !helpersVisible;
		render();

	} );

	signals.resetScene.add( function () {

		var defaultScene = createDefaultScene();
		var defaultCamera = createDefaultCamera();
		var defaultBgColor = new THREE.Color( 0xaaaaaa );

		defaultCamera.lookAt( defaultScene.position );
		defaultScene.add( defaultCamera );

		signals.sceneAdded.dispatch( defaultScene, defaultCamera, defaultBgColor );
		signals.objectSelected.dispatch( defaultCamera );

	} );

	signals.sceneAdded.add( function ( newScene, newCamera ) {

		scene = newScene;

		// remove old gizmos

		var toRemove = {};

		sceneHelpers.traverse( function ( child ) {

			if ( child.userData.isGizmo ) {

				toRemove[ child.id ] = child;

			}

		} );

		for ( var id in toRemove ) {

			sceneHelpers.remove( toRemove[ id ] );

		}

		// reset picking list

		objects = [];

		// add new gizmos and fill picking list

		scene.traverse( handleAddition );

		//

		if ( newCamera ) {

			camera = newCamera;

			camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
			camera.updateProjectionMatrix();

			controls.object = camera;
			controls.update();

		} else {

			scene.add( camera );

		}

		if ( newScene.fog ) {

			oldFogColor = newScene.fog.color.getHex();

			if ( newScene.fog instanceof THREE.Fog ) {

				oldFogType = "Fog";
				oldFogNear = newScene.fog.near;
				oldFogFar = newScene.fog.far;

			} else if ( newScene.fog instanceof THREE.FogExp2 ) {

				oldFogType = "FogExp2";
				oldFogDensity = newScene.fog.density;

			}

		} else {

			oldFogType = "None";

		}

		signals.sceneChanged.dispatch( scene );
		signals.objectSelected.dispatch( camera );

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

	function createDefaultScene() {

		return new THREE.Scene();

	}

	function createDefaultCamera() {

		var camera = new THREE.PerspectiveCamera( 50, 1, 1, 5000 );

		camera.name = "Camera";
		camera.position.set( 500, 250, 500 );

		return camera;

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

		if ( helpersVisible ) {

			renderer.render( sceneHelpers, camera );

		}

	}

	return container;

}
