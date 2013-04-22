/**
 * @author arodic / https://github.com/arodic
 */

 //"use strict";

THREE.TransformControls = function ( camera, domElement ) {

	// TODO: Choose a better fitting intersection plane when looking at grazing angles
	// TODO: Make non-uniform scale and rotate play nice in hierarchies
	// TODO: ADD RXYZ contol

	this.camera = camera;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.active = false;
	this.mode = 'translate';
	this.space = 'world';
	this.scale = 1;

	this.snapDist = null;
	this.modifierAxis = new THREE.Vector3( 1, 1, 1 );
	this.gizmo = new THREE.Object3D();

	var scope = this;

	var changeEvent = { type: 'change' };

	var showPickers = false; // debug

	var ray = new THREE.Raycaster();
	var projector = new THREE.Projector();
	var pointerVector = new THREE.Vector3();

	var point = new THREE.Vector3();
	var offset = new THREE.Vector3();

	var rotation = new THREE.Vector3();
	var offsetRotation = new THREE.Vector3();
	var scale = 1;

	var lookAtMatrix = new THREE.Matrix4();
	var eye = new THREE.Vector3()

	var tempMatrix = new THREE.Matrix4();
	var tempVector = new THREE.Vector3();
	var tempQuaternion = new THREE.Quaternion();
	var unitX = new THREE.Vector3( 1, 0, 0 );
	var unitY = new THREE.Vector3( 0, 1, 0 );
	var unitZ = new THREE.Vector3( 0, 0, 1 );

	var quaternionXYZ = new THREE.Quaternion();
	var quaternionX = new THREE.Quaternion();
	var quaternionY = new THREE.Quaternion();
	var quaternionZ = new THREE.Quaternion();
	var quaternionE = new THREE.Quaternion();

	var oldPosition = new THREE.Vector3();
	var oldScale = new THREE.Vector3();
	var oldRotationMatrix = new THREE.Matrix4();

	var parentRotationMatrix  = new THREE.Matrix4();
	var parentScale = new THREE.Vector3();

	var worldPosition = new THREE.Vector3();
	var worldRotation = new THREE.Vector3();
	var worldRotationMatrix  = new THREE.Matrix4();
	var camPosition = new THREE.Vector3();
	var camRotation = new THREE.Vector3();

	var displayAxes = {};
	var pickerAxes = {};
	var intersectionPlanes = {};
	var intersectionPlaneList = ['XY','YZ','XZ','XYZE']; // E
	var currentPlane = 'XY';
	var intersect, planeIntersect;

	var object, name;

	// gizmo geometry
	{

		displayAxes["translate"] = new THREE.Object3D();
		displayAxes["rotate"] = new THREE.Object3D();
		displayAxes["scale"] = new THREE.Object3D();
		this.gizmo.add( displayAxes["translate"] );
		this.gizmo.add( displayAxes["rotate"] );
		this.gizmo.add( displayAxes["scale"] );

		pickerAxes["translate"] = new THREE.Object3D();
		pickerAxes["rotate"] = new THREE.Object3D();
		pickerAxes["scale"] = new THREE.Object3D();
		this.gizmo.add( pickerAxes["translate"] );
		this.gizmo.add( pickerAxes["rotate"] );
		this.gizmo.add( pickerAxes["scale"] );

		var HandleMaterial = function ( color ) {
			var material = new THREE.MeshBasicMaterial();
			material.side = THREE.DoubleSide;
			material.transparent = true;
			material.depthTest = false;
			material.depthWrite = false;
			material.color.setRGB( color[0], color[1], color[2] );
			material.opacity = color[3];
			return material;
		}

		var LineMaterial = function ( color ) {
			var material = new THREE.LineBasicMaterial();
			material.transparent = true;
			material.depthTest = false;
			material.depthWrite = false;
			material.color.setRGB( color[0], color[1], color[2] );
			material.opacity = color[3];
			return material;
		}

		// materials by color
		var white = [1,1,1,0.2];
		var gray = [0.5,0.5,0.5,1];
		var red = [1,0,0,1];
		var green = [0,1,0,1];
		var blue = [0,0,1,1];
		var cyan = [0,1,1,0.2];
		var magenta = [1,0,1,0.2];
		var yellow = [1,1,0,0.2];

		var geometry, mesh;

		// Line axes

		var redColor = new THREE.Color( 0xff0000 );
		var greenColor = new THREE.Color( 0x00ff00 );
		var blueColor = new THREE.Color( 0x0000ff );

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ),
			new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 1, 0 ),
			new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 1 )
		);
		geometry.colors.push(
			redColor, redColor, greenColor, greenColor, blueColor, blueColor
		);
		material = new THREE.LineBasicMaterial( {
			vertexColors: THREE.VertexColors,
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );
		mesh = new THREE.Line( geometry, material, THREE.LinePieces );
		displayAxes['translate'].add( mesh );
		displayAxes['scale'].add( mesh.clone() );

		// Translate handles

		mesh = new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), HandleMaterial( white ) );
		mesh.name = 'TXYZ';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );

		geometry = new THREE.PlaneGeometry( 0.2, 0.2 );

		mesh = new THREE.Mesh( geometry, HandleMaterial( yellow ) );
		mesh.position.set( 0.1, 0.1, 0 );
		bakeTransformations( mesh );
		mesh.name = 'TXY';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );

		mesh = new THREE.Mesh( geometry, HandleMaterial( cyan ) );
		mesh.position.set( 0, 0.1, 0.1 );
		mesh.rotation.y = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TYZ';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );

		mesh = new THREE.Mesh( geometry, HandleMaterial( magenta ) );
		mesh.position.set( 0.1, 0, 0.1 );
		mesh.rotation.x = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TXZ';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );

		geometry = new THREE.CylinderGeometry( 0, 0.05, 0.2, 4, 1, true );

		mesh = new THREE.Mesh( geometry, HandleMaterial( red ) );
		mesh.position.x = 0.9;
		mesh.rotation.z = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TX';
		displayAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( green ) );
		mesh.position.y = 0.9;
		bakeTransformations( mesh );
		mesh.name = 'TY';
		displayAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( blue ) );
		mesh.position.z = 0.9;
		mesh.rotation.x = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TZ';
		displayAxes['translate'].add( mesh );

		geometry = new THREE.CylinderGeometry( 0.1, 0.1, 0.8, 4, 1, false );

		mesh = new THREE.Mesh( geometry, HandleMaterial( red ) );
		mesh.position.x = 0.6;
		mesh.rotation.z = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TX';
		pickerAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( green ) );
		mesh.position.y = 0.6;
		bakeTransformations( mesh );
		mesh.name = 'TY';
		pickerAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( blue ) );
		mesh.position.z = 0.6;
		mesh.rotation.x = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TZ';
		pickerAxes['translate'].add( mesh );

		// scale manipulators

		geometry = new THREE.CubeGeometry( 0.1, 0.1, 0.1 );

		mesh = new THREE.Mesh( geometry, HandleMaterial( white ) );
		mesh.name = 'SXYZ';
		displayAxes['scale'].add( mesh );
		pickerAxes['scale'].add( mesh.clone() );

		mesh = new THREE.Mesh( geometry, HandleMaterial( red ) );
		mesh.position.set( 1, 0, 0 );
		bakeTransformations( mesh );
		mesh.name = 'SX';
		displayAxes['scale'].add( mesh );
		pickerAxes['scale'].add( mesh.clone() );

		mesh = new THREE.Mesh( geometry, HandleMaterial( green ) );
		mesh.position.set( 0, 1, 0 );
		bakeTransformations( mesh );
		mesh.name = 'SY';
		displayAxes['scale'].add( mesh );
		pickerAxes['scale'].add( mesh.clone() );

		mesh = new THREE.Mesh( geometry, HandleMaterial( blue ) );
		mesh.position.set( 0, 0, 1 );
		bakeTransformations( mesh );
		mesh.name = 'SZ';
		displayAxes['scale'].add( mesh );
		pickerAxes['scale'].add( mesh.clone() );

		// rotate manipulators

		var Circle = function ( radius, facing, arc ) {

			geometry = new THREE.Geometry();
			arc = arc ? arc : 1;
			for ( var i = 0; i <= 64 * arc; ++i ) {
				if ( facing == 'x' ) geometry.vertices.push( new THREE.Vector3( 0, Math.cos( i / 32 * Math.PI ), Math.sin( i / 32 * Math.PI ) ).multiplyScalar(radius) );
				if ( facing == 'y' ) geometry.vertices.push( new THREE.Vector3( Math.cos( i / 32 * Math.PI ), 0, Math.sin( i / 32 * Math.PI ) ).multiplyScalar(radius) );
				if ( facing == 'z' ) geometry.vertices.push( new THREE.Vector3( Math.sin( i / 32 * Math.PI ), Math.cos( i / 32 * Math.PI ), 0 ).multiplyScalar(radius) );
			}

			return geometry;
		}

		mesh = new THREE.Line( Circle( 1, 'x', 0.5 ), LineMaterial( red ) );
		mesh.name = 'RX';
		displayAxes['rotate'].add( mesh );

		mesh = new THREE.Line( Circle( 1, 'y', 0.5 ), LineMaterial( green ) );
		mesh.name = 'RY';
		displayAxes['rotate'].add( mesh );

		mesh = new THREE.Line( Circle( 1, 'z', 0.5 ), LineMaterial( blue ) );
		mesh.name = 'RZ';
		displayAxes['rotate'].add( mesh );

		mesh = new THREE.Line( Circle( 1, 'z' ), LineMaterial( gray ) );
		mesh.name = 'RXYZE';
		displayAxes['rotate'].add( mesh );

		mesh = new THREE.Line( Circle( 1.1, 'z' ), LineMaterial( [1,1,0,1] ) );
		mesh.name = 'RE';
		displayAxes['rotate'].add( mesh );

		geometry = new THREE.TorusGeometry( 1, 0.05, 4, 6, Math.PI );

		mesh = new THREE.Mesh( geometry, HandleMaterial( cyan ) );
		mesh.rotation.z = -Math.PI/2;
		mesh.rotation.y = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'RX';
		pickerAxes['rotate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( magenta ) );
		mesh.rotation.z = Math.PI;
		mesh.rotation.x = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'RY';
		pickerAxes['rotate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( yellow ) );
		mesh.rotation.z = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'RZ';
		pickerAxes['rotate'].add( mesh );

		mesh = new THREE.Mesh( new THREE.SphereGeometry( 0.95, 12, 12 ), HandleMaterial( white ) );
		mesh.name = 'RXYZ';
		pickerAxes['rotate'].add( mesh );

		mesh = new THREE.Mesh( new THREE.TorusGeometry( 1.12, 0.07, 4, 12 ), HandleMaterial( yellow ) );
		mesh.name = 'RE';
		pickerAxes['rotate'].add( mesh );

		mesh = null;

	}

	// intersection planes
	{

		var planes = new THREE.Object3D();
		this.gizmo.add(planes);

		for ( var i in intersectionPlaneList ){

			intersectionPlanes[intersectionPlaneList[i]] = new THREE.Mesh( new THREE.PlaneGeometry( 500, 500 ) );
			intersectionPlanes[intersectionPlaneList[i]].material.side = THREE.DoubleSide;
			intersectionPlanes[intersectionPlaneList[i]].name = intersectionPlaneList[i];
			intersectionPlanes[intersectionPlaneList[i]].visible = false;
			planes.add(intersectionPlanes[intersectionPlaneList[i]]);

		}

		intersectionPlanes['YZ'].rotation.set( 0, Math.PI/2, 0 );
		intersectionPlanes['XZ'].rotation.set( -Math.PI/2, 0, 0 );
		bakeTransformations(intersectionPlanes['YZ']);
		bakeTransformations(intersectionPlanes['XZ']);

	}

	this.attatch = function ( object ) {

		this.object = object;
	 	this.setMode( scope.mode );

		this.domElement.addEventListener( 'mousedown', onMouseDown, false );
		document.addEventListener( 'keydown', onKeyDown, false );

	}

	this.detatch = function ( object ) {

	 	this.hide();

		this.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		document.removeEventListener( 'keydown', onKeyDown, false );

	}

	this.update = function () {

		this.object.updateMatrixWorld();
		worldPosition.getPositionFromMatrix( this.object.matrixWorld );
		worldRotation.setEulerFromRotationMatrix( tempMatrix.extractRotation(this.object.matrixWorld ));

		this.camera.updateMatrixWorld();
		camPosition.getPositionFromMatrix( this.camera.matrixWorld );
		camRotation.setEulerFromRotationMatrix( tempMatrix.extractRotation( this.camera.matrixWorld ));

		scale = worldPosition.distanceTo( camPosition ) / 10 * this.scale;
		this.gizmo.position.copy( worldPosition )
		this.gizmo.scale.set( scale, scale, scale );

		for ( var i in this.gizmo.children ) {

			for ( var j in this.gizmo.children[i].children ) {

				object = this.gizmo.children[i].children[j];
				name = object.name;

				if ( name.search('E') != -1 ){

					lookAtMatrix.lookAt( camPosition, worldPosition, tempVector.set( 0, 1, 0 ));
					object.rotation.setEulerFromRotationMatrix( lookAtMatrix );

				} else {

					eye.copy( camPosition ).sub( worldPosition ).normalize();

					if ( this.space == 'local' ) {

						tempQuaternion.setFromEuler( worldRotation );

						if ( name.search('R') != -1 ){

							tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix );
							eye.applyProjection( tempMatrix );

							if ( name == 'RX' ) {
								quaternionX.setFromAxisAngle( unitX, Math.atan2( -eye.y, eye.z ) );
								tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
							}

							if ( name == 'RY' ) {
								quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) );
								tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
							}

							if ( name == 'RZ' ) {
								quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) );
								tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
							}

						}

						object.rotation.setEulerFromQuaternion( tempQuaternion );

					} else if ( this.space == 'world' ) {

						object.rotation.set( 0, 0, 0 );

						if ( name == 'RX' ) {
							object.rotation.setX( Math.atan2( -eye.y, eye.z ) );
						}

						if ( name == 'RY' ) {
							object.rotation.setY( Math.atan2( eye.x, eye.z ) );
						}

						if ( name == 'RZ' ) {
							object.rotation.setZ( Math.atan2( eye.y, eye.x ) );
						}

					}

				}

			}

		}

	}

	this.hide = function () {

	 	for ( var i in displayAxes ) {

		 	for ( var j in displayAxes[i].children ) {

		 		displayAxes[i].children[j].visible = false;

		 	}

	 	}

	 	for ( var i in pickerAxes ) {

		 	for ( var j in pickerAxes[i].children ) {

		 		pickerAxes[i].children[j].visible = false;

		 	}

	 	}

	}

	this.setMode = function ( value ) {

		scope.mode = value;

		this.hide();

		if ( scope.mode == 'scale' ) scope.space = 'local';

	 	for ( var i in displayAxes[this.mode].children ) {

 			displayAxes[this.mode].children[i].visible = true;

	 	}

	 	for ( var i in pickerAxes[this.mode].children ) {

 			pickerAxes[this.mode].children[i].visible = showPickers;

	 	}

	 	scope.update();

	}

	this.setIntersectionPlane = function () {

		if ( isActive("X") || isActive("Y") ) {

			currentPlane = 'XY';

		}

		if ( isActive("Z") ) {

			currentPlane = 'YZ';

		}

		if ( isActive("XZ") ) {

			currentPlane = 'XZ';

		}

		if ( isActive("XYZ") || isActive("E") ) {

			currentPlane = 'XYZE';

		}

	 	if ( isActive("RX") ) {

			currentPlane = 'YZ';

		}

		if ( isActive("RY") ) {

			currentPlane = 'XZ';

		} 

		if ( isActive("RZ") ) {

			currentPlane = 'XY';

		}

		scope.update();

	}

	function onMouseDown( event ) {

		event.preventDefault();

		if ( event.button === 0 ) {

			intersect = intersectObjects( event, pickerAxes[scope.mode].children );

			if ( intersect ) {

				scope.active = intersect.object.name;

				scope.setIntersectionPlane();

				planeIntersect = intersectObjects( event, [intersectionPlanes[currentPlane]] );

				if ( planeIntersect ) {

					oldPosition.copy( scope.object.position );
					oldScale.copy( scope.object.scale );

					oldRotationMatrix.extractRotation( scope.object.matrix );
					worldRotationMatrix.extractRotation( scope.object.matrixWorld );

					parentRotationMatrix.extractRotation( scope.object.parent.matrixWorld );
					parentScale.getScaleFromMatrix( tempMatrix.getInverse( scope.object.parent.matrixWorld ) );

					offset.copy( planeIntersect.point );

				}

			}

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	function onMouseMove( event ) {

		if ( scope.active ) {

			planeIntersect = intersectObjects( event, [intersectionPlanes[currentPlane]] );

			if ( planeIntersect ) {

				point.copy( planeIntersect.point );

				if ( ( scope.mode == 'translate' ) && isActive("T") ) {

					point.sub( offset );
					point.multiply(parentScale);

					if ( scope.space == 'local' ) {

						point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

						if ( !(isActive("X")) || scope.modifierAxis.x != 1 ) point.x = 0;
						if ( !(isActive("Y")) || scope.modifierAxis.y != 1 ) point.y = 0;
						if ( !(isActive("Z")) || scope.modifierAxis.z != 1 ) point.z = 0;
						if ( isActive("XYZ") ) point.set( 0, 0, 0 );

						point.applyMatrix4( oldRotationMatrix );

						scope.object.position.copy( oldPosition );
						scope.object.position.add( point );

					} 

					if ( scope.space == 'world' || isActive("XYZ") ) {

						if ( !(isActive("X")) || scope.modifierAxis.x != 1 ) point.x = 0;
						if ( !(isActive("Y")) || scope.modifierAxis.y != 1 ) point.y = 0;
						if ( !(isActive("Z")) || scope.modifierAxis.z != 1 ) point.z = 0;

						point.applyMatrix4( tempMatrix.getInverse( parentRotationMatrix ) );

						scope.object.position.copy( oldPosition );
						scope.object.position.add( point );

						if ( scope.snapDist ) {
							if ( isActive("X") ) scope.object.position.x = Math.round( scope.object.position.x / scope.snapDist ) * scope.snapDist;
							if ( isActive("Y") ) scope.object.position.y = Math.round( scope.object.position.y / scope.snapDist ) * scope.snapDist;
							if ( isActive("Z") ) scope.object.position.z = Math.round( scope.object.position.z / scope.snapDist ) * scope.snapDist;
						}

					}

				} else if ( ( scope.mode == 'scale') && isActive("S") ) {

					point.sub( offset );
					point.multiply(parentScale);

					if ( scope.space == 'local' ) {

						if ( isActive("XYZ")) {

							scale = 1 + ( ( point.y ) / 50 );

							scope.object.scale.x = oldScale.x * scale;
							scope.object.scale.y = oldScale.y * scale;
							scope.object.scale.z = oldScale.z * scale;

						} else {

							point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

							if ( !(isActive("X")) || scope.modifierAxis.x != 1 ) point.x = 0;
							if ( !(isActive("Y")) || scope.modifierAxis.y != 1 ) point.y = 0;
							if ( !(isActive("Z")) || scope.modifierAxis.z != 1 ) point.z = 0;

							if ( isActive("X") ) scope.object.scale.x = oldScale.x * ( 1 + point.x / 50 );
							if ( isActive("Y") ) scope.object.scale.y = oldScale.y * ( 1 + point.y / 50 );
							if ( isActive("Z") ) scope.object.scale.z = oldScale.z * ( 1 + point.z / 50 );

						}

					}

				} else if ( ( scope.mode == 'rotate' ) && isActive("R") ) {

					point.sub( worldPosition );
					point.multiply(parentScale);
					tempVector.copy(offset).sub( worldPosition );
					tempVector.multiply(parentScale);

					if ( scope.active == "RE" ) {

						point.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );
						tempVector.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );

						rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
						offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

						tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

						quaternionE.setFromAxisAngle( eye, rotation.z - offsetRotation.z );
						quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

						tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionE );
						tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

						scope.object.rotation.setEulerFromQuaternion( tempQuaternion );

					} else if ( scope.active == "RXYZ" ) {

						// TODO

					} else if ( scope.space == 'local' ) {

						point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

						tempVector.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

						rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
						offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

						quaternionXYZ.setFromRotationMatrix( oldRotationMatrix );
						quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
						quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
						quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

						if ( scope.active == "RX" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionX );
						if ( scope.active == "RY" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionY );
						if ( scope.active == "RZ" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionZ );

						scope.object.rotation.setEulerFromQuaternion( quaternionXYZ );

					} else if ( scope.space == 'world' ) {

						rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
						offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

						tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

						quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
						quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
						quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );
						quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

						if ( scope.active == "RX" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
						if ( scope.active == "RY" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
						if ( scope.active == "RZ" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );

						tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

						scope.object.rotation.setEulerFromQuaternion( tempQuaternion );

					}

				}

			}

			scope.update();
			scope.dispatchEvent( changeEvent );

		}

	}

	function onMouseUp( event ) {

		scope.active = false;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	function onKeyDown( event ) {

		var currentMode = scope.mode;
		var currentSpace = scope.space;
		var currentScale = scope.scale;

		if ( event.keyCode == 87 ) { // W

			if ( scope.mode == 'translate' ) scope.space = ( scope.space == 'world' ) ? 'local' : 'world';
			scope.mode = 'translate';

		}

		if ( event.keyCode == 69 ) { // E

			if ( scope.mode == 'rotate' ) scope.space = ( scope.space == 'world' ) ? 'local' : 'world';
			scope.mode = 'rotate';

		}

		if ( event.keyCode == 82 ) { // R

			scope.mode = 'scale';
			scope.space = 'local';

		}

		if ( event.keyCode == 187 || event.keyCode == 107 ) { // +,=,num+

			scope.scale += 0.1

		}

		if ( event.keyCode == 189 || event.keyCode == 109) { // -,_,num-

			scope.scale -= 0.1
			scope.scale = Math.max( scope.scale, 0.1 );

		}

		if ( scope.mode !== currentMode || scope.space !== currentSpace || scope.scale !== currentScale ) {

			scope.setMode( scope.mode );
			scope.dispatchEvent( changeEvent );

		}

	}

	function intersectObjects( event, objects ) {

		pointerVector.set(
			( event.layerX / scope.domElement.offsetWidth ) * 2 - 1,
			- ( event.layerY / scope.domElement.offsetHeight ) * 2 + 1,
			0.5
		);

		projector.unprojectVector( pointerVector, scope.camera );
		ray.set( camPosition, pointerVector.sub( camPosition ).normalize() );

		var intersections = ray.intersectObjects( objects, true );
		return intersections[0] ? intersections[0] : false;

	}

	function isActive( name ) {
		if ( scope.active.search( name ) != -1 ) return true;
		else return false;
	}

	function bakeTransformations( object ) {

		var tempGeometry = new THREE.Geometry();
		THREE.GeometryUtils.merge( tempGeometry, object );
		object.setGeometry( tempGeometry );
		object.position.set( 0, 0, 0 );
		object.rotation.set( 0, 0, 0 );
		object.scale.set( 1, 1, 1 );

	}

};

THREE.TransformControls.prototype = Object.create( THREE.EventDispatcher.prototype );
