/**
 * @author arodic / https://github.com/arodic
 */

 //"use strict";

THREE.TransformControls = function ( camera, domElement, doc ) {

	// TODO: Make non-uniform scale and rotate play nice in hierarchies
	// TODO: ADD RXYZ contol

	this.camera = camera;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.document = ( doc !== undefined ) ? doc : document;

	this.object = undefined;

	this.active = false;
	this.hovered = false;

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
	var worldRotation = new THREE.Euler();
	var worldRotationMatrix  = new THREE.Matrix4();
	var camPosition = new THREE.Vector3();
	var camRotation = new THREE.Euler();

	var displayAxes = {};
	var pickerAxes = {};
	var intersectionPlanes = {};
	var intersectionPlaneList = ['XY','YZ','XZ','XYZE']; // E
	var currentPlane = 'XY';

	// intersection planes
	{

		var planes = new THREE.Object3D();
		this.gizmo.add(planes);

		for ( var i in intersectionPlaneList ){

			intersectionPlanes[intersectionPlaneList[i]] = new THREE.Mesh( new THREE.PlaneGeometry( 500, 500 ) );
			intersectionPlanes[intersectionPlaneList[i]].material.side = THREE.DoubleSide;
			intersectionPlanes[intersectionPlaneList[i]].visible = false;
			planes.add(intersectionPlanes[intersectionPlaneList[i]]);

		}

		intersectionPlanes['YZ'].rotation.set( 0, Math.PI/2, 0 );
		intersectionPlanes['XZ'].rotation.set( -Math.PI/2, 0, 0 );
		bakeTransformations(intersectionPlanes['YZ']);
		bakeTransformations(intersectionPlanes['XZ']);

	}

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

		var HandleMaterial = function ( color, opacity ) {
			var material = new THREE.MeshBasicMaterial();
			material.color = color;
			material.side = THREE.DoubleSide;
			material.depthTest = false;
			material.depthWrite = false;
			material.opacity = opacity !== undefined ? opacity : 1;
			material.transparent = true;
			return material;
		}

		var LineMaterial = function ( color, opacity ) {
			var material = new THREE.LineBasicMaterial();
			material.color = color;
			material.depthTest = false;
			material.depthWrite = false;
			material.opacity = opacity !== undefined ? opacity : 1;
			material.transparent = true;
			return material;
		}

		// materials by color
		var white = new THREE.Color( 0xffffff );
		var gray = new THREE.Color( 0x808080 );
		var red = new THREE.Color( 0xff0000 );
		var green = new THREE.Color( 0x00ff00 );
		var blue = new THREE.Color( 0x0000ff );
		var cyan = new THREE.Color( 0x00ffff );
		var magenta = new THREE.Color( 0xff00ff );
		var yellow = new THREE.Color( 0xffff00 );

		var geometry, mesh;

		// Line axes

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ),
			new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 1, 0 ),
			new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 1 )
		);
		geometry.colors.push(
			red, red, green, green, blue, blue
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

		mesh = new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), HandleMaterial( white, 0.25 ) );
		mesh.name = 'TXYZ';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );

		geometry = new THREE.PlaneGeometry( 0.3, 0.3 );

		mesh = new THREE.Mesh( geometry, HandleMaterial( yellow, 0.25 ) );
		mesh.position.set( 0.15, 0.15, 0 );
		bakeTransformations( mesh );
		mesh.name = 'TXY';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );

		mesh = new THREE.Mesh( geometry, HandleMaterial( cyan, 0.25 ) );
		mesh.position.set( 0, 0.15, 0.15 );
		mesh.rotation.y = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TYZ';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );

		mesh = new THREE.Mesh( geometry, HandleMaterial( magenta, 0.25 ) );
		mesh.position.set( 0.15, 0, 0.15 );
		mesh.rotation.x = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TXZ';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );

		geometry = new THREE.CylinderGeometry( 0, 0.05, 0.2, 4, 1, true );

		mesh = new THREE.Mesh( geometry, HandleMaterial( red ) );
		mesh.position.x = 1.1;
		mesh.rotation.z = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TX';
		displayAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( green ) );
		mesh.position.y = 1.1;
		bakeTransformations( mesh );
		mesh.name = 'TY';
		displayAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( blue ) );
		mesh.position.z = 1.1;
		mesh.rotation.x = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TZ';
		displayAxes['translate'].add( mesh );

		geometry = new THREE.CylinderGeometry( 0.2, 0.1, 0.8, 4, 1, false );

		mesh = new THREE.Mesh( geometry, HandleMaterial( red ) );
		mesh.position.x = 0.7;
		mesh.rotation.z = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TX';
		pickerAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( green ) );
		mesh.position.y = 0.7;
		bakeTransformations( mesh );
		mesh.name = 'TY';
		pickerAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( blue ) );
		mesh.position.z = 0.7;
		mesh.rotation.x = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TZ';
		pickerAxes['translate'].add( mesh );

		// scale manipulators

		geometry = new THREE.CubeGeometry( 0.125, 0.125, 0.125 );

		mesh = new THREE.Mesh( geometry, HandleMaterial( white, 0.25 ) );
		mesh.name = 'SXYZ';
		displayAxes['scale'].add( mesh );
		pickerAxes['scale'].add( mesh.clone() );

		mesh = new THREE.Mesh( geometry, HandleMaterial( red ) );
		mesh.position.set( 1.05, 0, 0 );
		bakeTransformations( mesh );
		mesh.name = 'SX';
		displayAxes['scale'].add( mesh );
		pickerAxes['scale'].add( mesh.clone() );

		mesh = new THREE.Mesh( geometry, HandleMaterial( green ) );
		mesh.position.set( 0, 1.05, 0 );
		bakeTransformations( mesh );
		mesh.name = 'SY';
		displayAxes['scale'].add( mesh );
		pickerAxes['scale'].add( mesh.clone() );

		mesh = new THREE.Mesh( geometry, HandleMaterial( blue ) );
		mesh.position.set( 0, 0, 1.05 );
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

		mesh = new THREE.Line( Circle( 1.25, 'z' ), LineMaterial( yellow, 0.25 ) );
		mesh.name = 'RE';
		displayAxes['rotate'].add( mesh );

		geometry = new THREE.TorusGeometry( 1, 0.15, 4, 6, Math.PI );

		mesh = new THREE.Mesh( geometry, HandleMaterial( red ) );
		mesh.rotation.z = -Math.PI/2;
		mesh.rotation.y = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'RX';
		pickerAxes['rotate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( green ) );
		mesh.rotation.z = Math.PI;
		mesh.rotation.x = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'RY';
		pickerAxes['rotate'].add( mesh );

		mesh = new THREE.Mesh( geometry, HandleMaterial( blue ) );
		mesh.rotation.z = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'RZ';
		pickerAxes['rotate'].add( mesh );

		mesh = new THREE.Mesh( new THREE.SphereGeometry( 0.95, 12, 12 ), HandleMaterial( white, 0.25 ) );
		mesh.name = 'RXYZE';
		pickerAxes['rotate'].add( mesh );

		intersectionPlanes['SPHERE'] = new THREE.Mesh( new THREE.SphereGeometry( 0.95, 12, 12 ) );
		intersectionPlanes['SPHERE'].visible = false;
		planes.add(intersectionPlanes['SPHERE']);

		mesh = new THREE.Mesh( new THREE.TorusGeometry( 1.30, 0.15, 4, 12 ), HandleMaterial( yellow, 0.25 ) );
		mesh.name = 'RE';
		pickerAxes['rotate'].add( mesh );

		mesh = null;

	}

	this.attach = function ( object ) {

		this.object = object;
	 	this.setMode( scope.mode );

		this.domElement.addEventListener( 'mousedown', onMouseDown, false );
		this.domElement.addEventListener( 'mousemove', onMouseHover, false );
		this.document.addEventListener( 'keydown', onKeyDown, false );

	}

	this.detach = function ( object ) {

		this.object = undefined;
		this.hovered = false;

	 	this.hide();

		this.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		this.domElement.removeEventListener( 'mousemove', onMouseHover, false );
		this.document.removeEventListener( 'keydown', onKeyDown, false );

	}

	this.update = function () {

		if ( this.object === undefined ) return;

		this.object.updateMatrixWorld();
		worldPosition.getPositionFromMatrix( this.object.matrixWorld );
		worldRotation.setFromRotationMatrix( tempMatrix.extractRotation( this.object.matrixWorld ) );

		this.camera.updateMatrixWorld();
		camPosition.getPositionFromMatrix( this.camera.matrixWorld );
		camRotation.setFromRotationMatrix( tempMatrix.extractRotation( this.camera.matrixWorld ) );

		scale = worldPosition.distanceTo( camPosition ) / 6 * this.scale;
		this.gizmo.position.copy( worldPosition )
		this.gizmo.scale.set( scale, scale, scale );

		for ( var i in this.gizmo.children ) {

			for ( var j in this.gizmo.children[i].children ) {

				var object = this.gizmo.children[i].children[j];
				var name = object.name;

				if ( name.search('E') != -1 ){

					lookAtMatrix.lookAt( camPosition, worldPosition, tempVector.set( 0, 1, 0 ));
					object.rotation.setFromRotationMatrix( lookAtMatrix );

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

						object.quaternion.copy( tempQuaternion );

					} else if ( this.space == 'world' ) {

						object.rotation.set( 0, 0, 0 );

						if ( name == 'RX' ) object.rotation.x = Math.atan2( -eye.y, eye.z );
						if ( name == 'RY' ) object.rotation.y = Math.atan2(  eye.x, eye.z );
						if ( name == 'RZ' ) object.rotation.z = Math.atan2(  eye.y, eye.x );

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

		eye.copy( camPosition ).sub( worldPosition ).normalize();

		if ( this.space == 'local' ) {

			eye.applyMatrix4( tempMatrix.getInverse( scope.object.matrixWorld ) );

		}

		if ( isActive("X") ) {

			if ( eye.y > eye.z ) currentPlane = 'XZ';
			else currentPlane = 'XY';

		}

		if ( isActive("Y") ) {

			if ( eye.x > eye.z ) currentPlane = 'YZ';
			else currentPlane = 'XY';

		}

		if ( isActive("Z") ) {

			if ( eye.x > eye.y ) currentPlane = 'YZ';
			else currentPlane = 'XZ';

		}

		if ( isActive("XY") ) {

			currentPlane = 'XY';

		}

		if ( isActive("YZ") ) {

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

		if ( isActive("RXYZ") ) {

			currentPlane = 'SPHERE';

		}

	}

	var hovered = null;
	var hoveredColor = new THREE.Color();
	var hoveredOpacity = 1;

	function onMouseHover( event ) {

		event.preventDefault();

		if ( event.button === 0 && scope.active === false ) {

			var intersect = intersectObjects( event, pickerAxes[scope.mode].children );

			if ( intersect ) {

				if ( hovered !== intersect.object ) {

					if ( hovered !== null ) {

						hovered.material.color.copy( hoveredColor );
						hovered.material.opacity = hoveredOpacity;

					}

					hovered = intersect.object;
					hoveredColor.copy( hovered.material.color );
					hoveredOpacity = hovered.material.opacity;

					hovered.material.color.setRGB( 1, 1, 0 );
					hovered.material.opacity = 1;

					scope.dispatchEvent( changeEvent );

				}

				scope.hovered = true;

			} else if ( hovered !== null ) {

				hovered.material.color.copy( hoveredColor );
				hovered.material.opacity = hoveredOpacity;

				hovered = null;

				scope.dispatchEvent( changeEvent );

				scope.hovered = false;

			}

		}

		scope.document.addEventListener( 'mousemove', onMouseMove, false );
		scope.document.addEventListener( 'mouseup', onMouseUp, false );

	};

	function onMouseDown( event ) {

		event.preventDefault();

		if ( event.button === 0 ) {

			var intersect = intersectObjects( event, pickerAxes[scope.mode].children );

			if ( intersect ) {

				scope.active = intersect.object.name;

				scope.update();
				scope.setIntersectionPlane();

				var planeIntersect = intersectObjects( event, [intersectionPlanes[currentPlane]] );

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

		scope.document.addEventListener( 'mousemove', onMouseMove, false );
		scope.document.addEventListener( 'mouseup', onMouseUp, false );

	};

	function onMouseMove( event ) {

		if ( scope.active ) {

			var planeIntersect = intersectObjects( event, [intersectionPlanes[currentPlane]] );

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

						scope.object.quaternion.copy( tempQuaternion );

					} else if ( scope.active == "RXYZE" ) {

						quaternionE.setFromEuler( point.clone().cross(tempVector).normalize() ); // rotation axis

						tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );
						quaternionX.setFromAxisAngle( quaternionE, - point.clone().angleTo(tempVector) );
						quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

						tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
						tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

						scope.object.quaternion.copy( tempQuaternion );

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

						scope.object.quaternion.copy( quaternionXYZ );

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

						scope.object.quaternion.copy( tempQuaternion );

					}

				}

			}

			scope.update();
			scope.dispatchEvent( changeEvent );

		}

	}

	function onMouseUp( event ) {

		scope.active = false;

		scope.document.removeEventListener( 'mousemove', onMouseMove, false );
		scope.document.removeEventListener( 'mouseup', onMouseUp, false );

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
		object.geometry = tempGeometry;
		object.position.set( 0, 0, 0 );
		object.rotation.set( 0, 0, 0 );
		object.scale.set( 1, 1, 1 );

	}

};

THREE.TransformControls.prototype = Object.create( THREE.EventDispatcher.prototype );
