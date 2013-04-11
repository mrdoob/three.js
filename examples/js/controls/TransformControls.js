/**
 * @author arodic / https://github.com/arodic
 */

 // "use strict";

THREE.TransformControls = function ( camera, domElement ) {

	// TODO: Choose a better fitting intersection plane when looking at grazing angles
	// TODO: Make better mapping for scale
	// TODO: ADD RXYZ contol
	// TODO: fix flickering
	// TODO: make everything work with hierarchies

	this.camera = camera;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.active = false;
	this.mode = 'rotate';
	this.space = 'local';

	this.snapDist = null;
  this.modifierAxis = new THREE.Vector3( 1, 1, 1 );
	
	var scope = this;

	var showPickers = false; // debug

	var ray = new THREE.Raycaster();
	var projector = new THREE.Projector();
	var pointerVector = new THREE.Vector3();
	var intersect, planeIntersect;

	var offset = new THREE.Vector3();
	var localOffset = new THREE.Vector3();
	var point = new THREE.Vector3();
	var localPoint = new THREE.Vector3();
	var rotation = new THREE.Vector3();
	var scale = 1;
	var offsetRotation = new THREE.Vector3();
	var rotationMatrix = new THREE.Matrix4();
	var lookAtMatrix = new THREE.Matrix4();
	
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

	var oldMatrix = new THREE.Matrix4();
	var oldPosition = new THREE.Vector3();
	var oldRotation = new THREE.Vector3();
	var oldScale = new THREE.Vector3();

	var objPosition = new THREE.Vector3();
	var objRotation = new THREE.Vector3();
	var objScale = new THREE.Vector3();
	var camPosition = new THREE.Vector3();
	var camRotation = new THREE.Vector3();
	var camDistance;

	var displayAxes = {};
	var pickerAxes = {};
	var intersectionPlanes = {};
	var intersectionPlaneList = ['XY','YZ','XZ','XYZE'];
	var currentPlane = 'XY';

	var object, name;

	// gizmo geometry
	{

		this.gizmo = new THREE.Object3D();

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
			material.side = THREE.DoubleSide;
			material.transparent = true;
			material.depthTest = false;
			material.depthWrite = false;
			material.color.setRGB( color[0], color[1], color[2] );
			material.opacity = color[3];
			return material;
		}

		// var CutoffMaterial = function () {
		// 	var material = new THREE.MeshBasicMaterial();
		// 	material.side = THREE.DoubleSide;
		// 	material.transparent = true;
		// 	material.depthTest = false;
		// 	material.depthWrite = true;
		// 	material.color.setRGB( 0 ,0 ,0 );
		// 	material.opacity = 0.1;
		// 	return material;
		// }

		// materials by color
		var white = [1,1,1,0.2];
		var gray = [0.5,0.5,0.5,1];
		var red = [1,0,0,1];
		var green = [0,1,0,1];
		var blue = [0,0,1,1];
		var cyan = [0,1,1,0.2];
		var magenta = [1,0,1,0.2];
		var yellow = [1,1,0,0.2];

		var mesh;

		// line axes

		mesh = new THREE.Line( new THREE.Geometry(), LineMaterial( red ) );
		mesh.geometry.vertices = [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ) ];
		displayAxes['translate'].add( mesh );
		displayAxes['scale'].add( mesh.clone() );

		mesh = new THREE.Line( new THREE.Geometry(), LineMaterial( green ) );
		mesh.geometry.vertices = [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 1, 0 ) ];
		displayAxes['translate'].add( mesh );
		displayAxes['scale'].add( mesh.clone() );

		mesh = new THREE.Line( new THREE.Geometry(), LineMaterial( blue ) );
		mesh.geometry.vertices = [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 1 ) ];
		displayAxes['translate'].add( mesh );
		displayAxes['scale'].add( mesh.clone() );

		// Translate handles

		mesh = new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), HandleMaterial( white ) );
		mesh.name = 'TXYZ';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );

		mesh = new THREE.Mesh( new THREE.PlaneGeometry( 0.2, 0.2 ), HandleMaterial( yellow ) );
		mesh.position.set( 0.1, 0.1, 0 );
		bakeTransformations( mesh );
		mesh.name = 'TXY';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );

		mesh = new THREE.Mesh( new THREE.PlaneGeometry( 0.2, 0.2 ), HandleMaterial( cyan ) );
		mesh.position.set( 0, 0.1, 0.1 );
		mesh.rotation.y = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TYZ';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );
		
		mesh = new THREE.Mesh( new THREE.PlaneGeometry( 0.2, 0.2 ), HandleMaterial( magenta ) );
		mesh.position.set( 0.1, 0, 0.1 );
		mesh.rotation.x = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TXZ';
		displayAxes['translate'].add( mesh );
		pickerAxes['translate'].add( mesh.clone() );

		mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0, 0.05, 0.2, 4, 1, true ), HandleMaterial( red ) );
		mesh.position.x = 0.9;
		mesh.rotation.z = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TX';
		displayAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0, 0.05, 0.2, 4, 1, true ), HandleMaterial( green ) );
		mesh.position.y = 0.9;
		bakeTransformations( mesh );
		mesh.name = 'TY';
		displayAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0, 0.05, 0.2, 4, 1, true ), HandleMaterial( blue ) );
		mesh.position.z = 0.9;
		mesh.rotation.x = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TZ';
		displayAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0.04, 0.04, 0.8, 4, 1, false ), HandleMaterial( red ) );
		mesh.position.x = 0.6;
		mesh.rotation.z = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TX';
		pickerAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0.04, 0.04, 0.8, 4, 1, false ), HandleMaterial( green ) );
		mesh.position.y = 0.6;
		bakeTransformations( mesh );
		mesh.name = 'TY';
		pickerAxes['translate'].add( mesh );

		mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0.04, 0.04, 0.8, 4, 1, false ), HandleMaterial( blue ) );
		mesh.position.z = 0.6;
		mesh.rotation.x = Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'TZ';
		pickerAxes['translate'].add( mesh );

		// scale manipulators

		mesh = new THREE.Mesh( new THREE.CubeGeometry( 0.1, 0.1, 0.1 ), HandleMaterial( white ) );
		mesh.name = 'SXYZ';
		displayAxes['scale'].add( mesh );
		pickerAxes['scale'].add( mesh.clone() );

		mesh = new THREE.Mesh( new THREE.CubeGeometry( 0.1, 0.1, 0.1 ), HandleMaterial( red ) );
		mesh.position.set( 1, 0, 0 );
		bakeTransformations( mesh );
		mesh.name = 'SX';
		displayAxes['scale'].add( mesh );
		pickerAxes['scale'].add( mesh.clone() );

		mesh = new THREE.Mesh( new THREE.CubeGeometry( 0.1, 0.1, 0.1 ), HandleMaterial( green ) );
		mesh.position.set( 0, 1, 0 );
		bakeTransformations( mesh );
		mesh.name = 'SY';
		displayAxes['scale'].add( mesh );
		pickerAxes['scale'].add( mesh.clone() );

		mesh = new THREE.Mesh( new THREE.CubeGeometry( 0.1, 0.1, 0.1 ), HandleMaterial( blue ) );
		mesh.position.set( 0, 0, 1 );
		bakeTransformations( mesh );
		mesh.name = 'SZ';
		displayAxes['scale'].add( mesh );
		pickerAxes['scale'].add( mesh.clone() );

		// rotate manipulators

		// mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2.3, 2.3, 5, 5 ), CutoffMaterial() );
		// mesh.name = 'CUTOFFE';
		// displayAxes['rotate'].add( mesh );

		var Circle = function( radius, facing, arc ) {
			
			var geometry = new THREE.Geometry();
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

		mesh = new THREE.Mesh( new THREE.TorusGeometry( 1, 0.05, 4, 12 ), HandleMaterial( cyan ) );
		mesh.rotation.y = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'RX';
		pickerAxes['rotate'].add( mesh );

		mesh = new THREE.Mesh( new THREE.TorusGeometry( 1, 0.05, 4, 12 ), HandleMaterial( magenta ) );
		mesh.rotation.x = -Math.PI/2;
		bakeTransformations( mesh );
		mesh.name = 'RY';
		pickerAxes['rotate'].add( mesh );

		mesh = new THREE.Mesh( new THREE.TorusGeometry( 1, 0.05, 4, 12 ), HandleMaterial( yellow ) );
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

			intersectionPlanes[intersectionPlaneList[i]] = new THREE.Mesh( new THREE.PlaneGeometry( 500, 500, 50, 50 ), new THREE.MeshBasicMaterial( { wireframe: true } ) );
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
	 	this.updateGizmo();
	 	this.updateMode();
		
		this.domElement.addEventListener( 'mousedown', onMouseDown, false );
		document.addEventListener( 'keydown', onKeyDown, false );
  
  }

  this.detatch = function ( object ) {

	 	this.hide();

		this.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		document.removeEventListener( 'keydown', onKeyDown, false );
  
  }

  this.updateGizmo = function() {

		objPosition.getPositionFromMatrix(this.object.matrixWorld);
		objRotation.setEulerFromRotationMatrix(tempMatrix.extractRotation(this.object.matrixWorld));
		objScale.getScaleFromMatrix(this.object.matrixWorld);

		camPosition.getPositionFromMatrix(this.camera.matrixWorld);
		camRotation.setEulerFromRotationMatrix(tempMatrix.extractRotation(this.camera.matrixWorld));

		camDistance = objPosition.distanceTo( camPosition );
		this.gizmo.position.copy(objPosition)
		this.gizmo.scale.set( camDistance/6, camDistance/6, camDistance/6 );


		for ( i in this.gizmo.children ) {
			for ( j in this.gizmo.children[i].children ) {

				object = this.gizmo.children[i].children[j];
				name = object.name;

				if ( name.search('E') != -1 ){
					
					lookAtMatrix.lookAt( camPosition, objPosition, tempVector.set( 0, 1, 0 ));
					object.rotation.setEulerFromRotationMatrix( lookAtMatrix );

				} else {

					var eye = new THREE.Vector3().copy(camPosition).sub(objPosition).normalize();

					if ( this.space == 'local' ) {

						tempQuaternion = new THREE.Quaternion().setFromEuler(objRotation);

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

		signals.objectChanged.dispatch( this.object );
 
  }

  this.hide = function () {

	 	for ( i in displayAxes ) {

		 	for ( j in displayAxes[i].children ) {

		 		displayAxes[i].children[j].visible = false;

		 	}

	 	}

	 	for ( i in pickerAxes ) {

		 	for ( j in pickerAxes[i].children ) {

		 		pickerAxes[i].children[j].visible = false;

		 	}

	 	}

  }

  this.updateMode = function() {

  	this.hide();

  	if ( scope.mode == 'scale' ) scope.space = 'local';

	 	for ( i in displayAxes[this.mode].children ) {

 			displayAxes[this.mode].children[i].visible = true;
	 		
	 	}

	 	for ( i in pickerAxes[this.mode].children ) {

 			pickerAxes[this.mode].children[i].visible = showPickers;
	 		
	 	}

	 	scope.updateGizmo();

  }

  this.setIntersectionPlane = function () {

  	if ( this.active.search("X") != -1 || this.active.search("Y") != -1 ) {

  		currentPlane = 'XY';

  	} 

  	if ( this.active.search("Z") != -1 ) {

  		currentPlane = 'YZ';

  	}

  	if ( this.active.search("XZ") != -1 ) {

  		currentPlane = 'XZ';

  	} 

  	if ( this.active.search("XYZ") != -1 ) {

  		currentPlane = 'XYZE';

  	}

   	if ( this.active.search("RX") != -1 ) {

  		currentPlane = 'YZ';

  	}

  	if ( this.active.search("RY") != -1 ) {

  		currentPlane = 'XZ';

  	} 

  	if ( this.active.search("RZ") != -1 ) {

  		currentPlane = 'XY';

  	}

  	// intersectionPlanes[currentPlane].visible = true;
  	scope.updateGizmo();

  }

  function onMouseDown( event ) {

		event.preventDefault();

		scope.domElement.focus();

		scope.updateGizmo();

		if ( event.button === 0 ) {

			scope.updateGizmo();

			intersect = intersectObjects( pickerAxes[scope.mode].children );

			if ( intersect[ 0 ] ) scope.active = intersect[ 0 ].object.name;

			if ( scope.active ) {

				scope.setIntersectionPlane();

				oldMatrix.copy( scope.object.matrixWorld );
			  rotationMatrix.extractRotation( oldMatrix );

				planeIntersect = intersectObjects( [intersectionPlanes[currentPlane]] );

				offset.copy( planeIntersect[ 0 ].point );

			  oldPosition.copy(scope.object.position);
			  oldRotation.copy(objRotation);
			  oldScale.copy(objScale);

				if ( scope.mode == 'rotate' && scope.space == 'world' ) offset.sub( objPosition );

			}

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );
		document.addEventListener( 'mouseout', onMouseUp, false );

	};

	function onMouseMove( event ) {

		if ( scope.active ) {

			planeIntersect = intersectObjects( [intersectionPlanes[currentPlane]] );

			if ( planeIntersect[ 0 ] ) point.copy( planeIntersect[ 0 ].point );

			if ( point ) {

				localPoint = worldToLocal( point, oldMatrix );
				localOffset = worldToLocal( offset, oldMatrix );

				if ( ( scope.mode == 'translate' ) && scope.active.search("T") != -1 ) {

					if ( scope.space == 'local' ) {

						localPoint.multiply(objScale);
						localOffset.multiply(objScale);
						localPoint.sub( localOffset );

						if ( scope.active.search("X") == -1 || scope.modifierAxis.x != 1 ) localPoint.x = 0;
						if ( scope.active.search("Y") == -1 || scope.modifierAxis.y != 1 ) localPoint.y = 0;
						if ( scope.active.search("Z") == -1 || scope.modifierAxis.z != 1 ) localPoint.z = 0;
						if ( scope.active.search("XYZ") != -1 ) localPoint.set( 0, 0, 0 );

						localPoint.applyMatrix4( rotationMatrix );
						scope.object.position.copy( oldPosition );
						scope.object.position.add( localPoint );

					} 

					if ( scope.space == 'world' || scope.active.search("XYZ") != -1 ) {

						point.sub( offset );

						if ( scope.active.search("X") == -1 || scope.modifierAxis.x != 1 ) point.x = 0;
						if ( scope.active.search("Y") == -1 || scope.modifierAxis.y != 1 ) point.y = 0;
						if ( scope.active.search("Z") == -1 || scope.modifierAxis.z != 1 ) point.z = 0;

						scope.object.position.copy( oldPosition );
						scope.object.position.add( point );
						
						if ( scope.snapDist ) {
							if ( scope.active.search("X") != -1 ) scope.object.position.x = Math.round( scope.object.position.x / scope.snapDist ) * scope.snapDist;
			        if ( scope.active.search("Y") != -1 ) scope.object.position.y = Math.round( scope.object.position.y / scope.snapDist ) * scope.snapDist;
			        if ( scope.active.search("Z") != -1 ) scope.object.position.z = Math.round( scope.object.position.z / scope.snapDist ) * scope.snapDist;
						}

					}

				}

				if ( ( scope.mode == 'scale') && scope.active.search("S") != -1 ) {

					if ( scope.space == 'local' ) {

						point.sub( offset );

						if ( scope.active.search("X") == -1 || scope.modifierAxis.x != 1 ) point.x = 0;
						if ( scope.active.search("Y") == -1 || scope.modifierAxis.y != 1 ) point.y = 0;
						if ( scope.active.search("Z") == -1 || scope.modifierAxis.z != 1 ) point.z = 0;

						localPoint.sub( localOffset );

						if ( scope.active.search("X") == -1 || scope.modifierAxis.x != 1 ) localPoint.x = 0;
						if ( scope.active.search("Y") == -1 || scope.modifierAxis.y != 1 ) localPoint.y = 0;
						if ( scope.active.search("Z") == -1 || scope.modifierAxis.z != 1 ) localPoint.z = 0;

						if ( scope.active.search("XYZ") != -1) {
							
							scale = 1 + ( ( point.x + point.y ) / 10 );

							scope.object.scale.x = oldScale.x * scale;
							scope.object.scale.y = oldScale.y * scale;
							scope.object.scale.z = oldScale.z * scale;

						} else {

							// TODO: add more intuitive mapping
							scope.object.scale.x = oldScale.x + localPoint.x/30;
							scope.object.scale.y = oldScale.y + localPoint.y/30;
							scope.object.scale.z = oldScale.z + localPoint.z/30;

						}

					} else if ( scope.space == 'world' ) {

						// Cannot scale in world space. This would require geometry manipulation or another transformation matrix.

					}

				}

				if ( ( scope.mode == 'rotate' ) && scope.active.search("R") != -1 ) {

					if ( scope.space == 'local' ) {

						offsetRotation.set( Math.atan2( localOffset.z, localOffset.y ), Math.atan2( localOffset.x, localOffset.z ), Math.atan2( localOffset.y, localOffset.x ) );
						rotation.set( Math.atan2( localPoint.z, localPoint.y ), Math.atan2( localPoint.x, localPoint.z ), Math.atan2( localPoint.y, localPoint.x ) );

						quaternionXYZ.setFromRotationMatrix( rotationMatrix );
						quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
						quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
						quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

						if ( scope.active.search("X") != -1 && scope.modifierAxis.x === 1 ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionX );
						if ( scope.active.search("Y") != -1 && scope.modifierAxis.y === 1 ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionY );
						if ( scope.active.search("Z") != -1 && scope.modifierAxis.z === 1 ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionZ );
						
						scope.object.rotation.setEulerFromQuaternion( quaternionXYZ );

					}  else if ( scope.space == 'world' ) {

						point.sub( objPosition );

						offsetRotation.set( Math.atan2( offset.z, offset.y ), Math.atan2( offset.x, offset.z ), Math.atan2( offset.y, offset.x ) );
						rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );

						quaternionXYZ.setFromRotationMatrix( rotationMatrix );
						
						tempQuaternion = new THREE.Quaternion().setFromEuler( new THREE.Vector3( 0, 1, 0 ), 0 );
						
						quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
						quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
						quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

						if ( scope.active.search("X") != -1 && scope.modifierAxis.x === 1 ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
						if ( scope.active.search("Y") != -1 && scope.modifierAxis.y === 1 ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
						if ( scope.active.search("Z") != -1 && scope.modifierAxis.z === 1 ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );

						tempQuaternion.multiplyQuaternions( tempQuaternion,quaternionXYZ);
						
						scope.object.rotation.setEulerFromQuaternion( tempQuaternion);

					}

				}

			}

		}

		signals.objectChanged.dispatch( scope.object );
		scope.updateGizmo();

	}

	function onMouseUp( event ) {

		scope.active = false;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	function onKeyDown( event ) {

 
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

		scope.updateMode();

	}

	function intersectObjects( objects ) {

		pointerVector.set(
			( event.layerX / scope.domElement.offsetWidth ) * 2 - 1,
			- ( event.layerY / scope.domElement.offsetHeight ) * 2 + 1,
			0.5
		);

		projector.unprojectVector( pointerVector, scope.camera );
		ray.set( camPosition, pointerVector.sub( camPosition ).normalize() );
	
		return ray.intersectObjects( objects, true );
	
	}

	function worldToLocal( point, objectMatrix ) {

		tempMatrix.getInverse( objectMatrix );
		return point.clone().applyMatrix4( tempMatrix );

	}

	function bakeTransformations( object ) {

		var tempGeometry = new THREE.Geometry();
		var tempMatrix = new THREE.Matrix4().identity();
		THREE.GeometryUtils.merge( tempGeometry, object );
		object.setGeometry( tempGeometry );
		object.position.set( 0, 0, 0 );
		object.rotation.set( 0, 0, 0 );
		object.scale.set( 1, 1, 1 );

	}

};

THREE.TransformControls.prototype = Object.create( THREE.EventDispatcher.prototype );