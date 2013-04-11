/**
 * @author arodic / https://github.com/arodic
 */

THREE.TransformControls = function ( camera, domElement ) {

	this.camera = camera;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.active = false;

	this.snapDist = null;
  this.modifierAxis = new THREE.Vector3( 1, 1, 1 );
	
	var scope = this;

	var ray = new THREE.Raycaster();
	var projector = new THREE.Projector();
	var offset = new THREE.Vector3();
	var oldScale = new THREE.Vector3();
	var oldRotation = new THREE.Vector3();
	var objPos = new THREE.Vector3();
	var camPos = new THREE.Vector3();

	this.mode = 'translate';

	// gizmo object

	this.gizmo = new THREE.Object3D();

	this.displayAxis = {};
	this.displayAxis["translate"] = new THREE.Object3D();
	this.displayAxis["rotate"] = new THREE.Object3D();
	this.displayAxis["scale"] = new THREE.Object3D();
	this.gizmo.add(this.displayAxis["translate"]);
	this.gizmo.add(this.displayAxis["rotate"]);
	this.gizmo.add(this.displayAxis["scale"]);

	this.pickerAxis = {};
	this.pickerAxis["translate"] = new THREE.Object3D();
	this.pickerAxis["rotate"] = new THREE.Object3D();
	this.pickerAxis["scale"] = new THREE.Object3D();
	this.gizmo.add(this.pickerAxis["translate"]);
	this.gizmo.add(this.pickerAxis["rotate"]);
	this.gizmo.add(this.pickerAxis["scale"]);

	// master material
	var MeshColoredNamed = function ( geometry, color, name ) {
		var material = new THREE.MeshBasicMaterial( { transparent: true } );
		material.side = THREE.DoubleSide;
		material.depthTest = false;
		material.depthWrite = false;
		material.color.setRGB( color[0], color[1], color[2] );
		material.opacity = color[3];
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = name ? name : mesh.name ;
		return mesh;
	}

	// materials by color
	var white = [1,1,1,0.33];
	var red = [1,0,0,1];
	var green = [0,1,0,1];
	var blue = [0,0,1,1];
	var cyan = [0,1,1,0.2];
	var magenta = [1,0,1,0.2];
	var yellow = [1,1,0,0.2];
	
	//// translate manipulators

	var arrow = new THREE.Geometry();
	var line = new THREE.Mesh( new THREE.CylinderGeometry( 0.005, 0.005, 0.8, 8, 1, true ) );
	line.position.y = 0.4;
	THREE.GeometryUtils.merge(arrow,line);
	var cone = new THREE.Mesh( new THREE.CylinderGeometry( 0, 0.05, 0.2, 4, 1, true ) );
	cone.position.y = 0.9;
	THREE.GeometryUtils.merge(arrow,cone);

	var corner = new THREE.Geometry();
	var plane = new THREE.Mesh( new THREE.PlaneGeometry( 0.2, 0.2 ) );
	plane.position.y = 0.105;
	plane.position.x = 0.105;
	THREE.GeometryUtils.merge(corner,plane);

	var TXYZ = MeshColoredNamed( new THREE.OctahedronGeometry( 0.1, 0 ), white, 'TXYZ' );
	this.displayAxis['translate'].add(TXYZ);
	var TXY = MeshColoredNamed( corner, yellow, 'TXY' );
	this.displayAxis['translate'].add(TXY);
	var TYZ = MeshColoredNamed( corner, cyan, 'TYZ' );
	TYZ.rotation.y = -Math.PI/2;
	this.displayAxis['translate'].add(TYZ);
	var TXZ = MeshColoredNamed( corner, magenta, 'TXZ' );
	TXZ.rotation.x = Math.PI/2;
	this.displayAxis['translate'].add(TXZ);
	var TX = MeshColoredNamed( arrow, red, 'TX' );
	TX.rotation.z = -Math.PI/2;
	this.displayAxis['translate'].add(TX);
	var TY = MeshColoredNamed( arrow, green, 'TY' );
	this.displayAxis['translate'].add(TY);
	var TZ = MeshColoredNamed( arrow, blue, 'TZ' );
	TZ.rotation.x = Math.PI/2;
	this.displayAxis['translate'].add(TZ);

	var handle = new THREE.Geometry();
	line = new THREE.Mesh( new THREE.CylinderGeometry( 0.04, 0.04, 0.8, 4, 1, false ) );
	line.position.y = 0.6;
	THREE.GeometryUtils.merge(handle,line);

	TXYZ = MeshColoredNamed( new THREE.OctahedronGeometry( 0.125, 0 ), white, 'TXYZ' );
	this.pickerAxis['translate'].add(TXYZ);
	TXY = MeshColoredNamed( corner, yellow, 'TXY' );
	this.pickerAxis['translate'].add(TXY);
	TYZ = MeshColoredNamed( corner, cyan, 'TYZ' );
	TYZ.rotation.y = -Math.PI/2;
	this.pickerAxis['translate'].add(TYZ);
	TXZ = MeshColoredNamed( corner, magenta, 'TXZ' );
	TXZ.rotation.x = Math.PI/2;
	this.pickerAxis['translate'].add(TXZ);
	TX = MeshColoredNamed( handle, red, 'TX' );
	TX.rotation.z = -Math.PI/2;
	this.pickerAxis['translate'].add(TX);
	TY = MeshColoredNamed( handle, green, 'TY' );
	this.pickerAxis['translate'].add(TY);
	TZ = MeshColoredNamed( handle, blue, 'TZ' );
	TZ.rotation.x = Math.PI/2;
	this.pickerAxis['translate'].add(TZ);

	//// scale manipulators

	handle = new THREE.Geometry();
	line = new THREE.Mesh( new THREE.CylinderGeometry( 0.005, 0.005, 1, 8, 1, true ) );
	line.position.y = 0.5;
	THREE.GeometryUtils.merge(handle,line);
	var cube = new THREE.Mesh( new THREE.CubeGeometry( 0.1, 0.1, 0.1 ) );
	cube.position.y = 1.025;
	THREE.GeometryUtils.merge(handle,cube);

	var corner = new THREE.Geometry();
	var plane = new THREE.Mesh( new THREE.PlaneGeometry( 0.2, 0.2 ) );
	plane.position.y = 0.1;
	plane.position.x = 0.1;
	THREE.GeometryUtils.merge(corner,plane);

	var SXYZ = MeshColoredNamed( new THREE.CubeGeometry( 0.1, 0.1, 0.1 ), white, 'SXYZ' );
	this.displayAxis['scale'].add(SXYZ);
	var SX = MeshColoredNamed( handle, red, 'SX' );
	SX.rotation.z = -Math.PI/2;
	this.displayAxis['scale'].add(SX);
	var SY = MeshColoredNamed( handle, green, 'SY' );
	this.displayAxis['scale'].add(SY);
	var SZ = MeshColoredNamed( handle, blue, 'SZ' );
	SZ.rotation.x = Math.PI/2;
	this.displayAxis['scale'].add(SZ);

	handle = new THREE.Geometry();
	cube = new THREE.Mesh( new THREE.CubeGeometry( 0.125, 0.125, 0.125 ) );
	cube.position.y = 1.025;
	THREE.GeometryUtils.merge(handle,cube);

	SXYZ = MeshColoredNamed( new THREE.CubeGeometry( 0.1, 0.1, 0.1 ), white, 'SXYZ' );
	this.pickerAxis['scale'].add(SXYZ);
	SX = MeshColoredNamed( handle, red, 'SX' );
	SX.rotation.z = -Math.PI/2;
	this.pickerAxis['scale'].add(SX);
	SY = MeshColoredNamed( handle, green, 'SY' );
	this.pickerAxis['scale'].add(SY);
	SZ = MeshColoredNamed( handle, blue, 'SZ' );
	SZ.rotation.x = Math.PI/2;
	this.pickerAxis['scale'].add(SZ);

	// //// rotate manipulators

	var torus = new THREE.TorusGeometry( 0.65, 0.005, 4, 64 );
	var torusLarge = new THREE.TorusGeometry( 0.76, 0.005, 4, 64 );

	var RXYZ = MeshColoredNamed( torusLarge, white, 'RXYZ' );
	this.displayAxis['rotate'].add(RXYZ);
	var RX = MeshColoredNamed( torus, red , 'RX');
	RX.rotation.y = -Math.PI/2;
	this.displayAxis['rotate'].add(RX);
	var RY = MeshColoredNamed( torus, green , 'RY');
	RY.rotation.x = -Math.PI/2;
	this.displayAxis['rotate'].add(RY);
	var RZ = MeshColoredNamed( torus, blue , 'RZ');
	this.displayAxis['rotate'].add(RZ);

	var torusFat = new THREE.TorusGeometry( 0.65, 0.05, 4, 12 );
	var torusFatLarge = new THREE.TorusGeometry( 0.78, 0.05, 4, 12 );

	RXYZ = MeshColoredNamed( torusFatLarge, white, 'RXYZ' );
	this.pickerAxis['rotate'].add(RXYZ);
	RX = MeshColoredNamed( torusFat, white, 'RX' );
	RX.rotation.y = -Math.PI/2;
	this.pickerAxis['rotate'].add(RX);
	RY = MeshColoredNamed( torusFat, white, 'RY' );
	RY.rotation.x = -Math.PI/2;
	this.pickerAxis['rotate'].add(RY);
	RZ = MeshColoredNamed( torusFat, white, 'RZ' );
	this.pickerAxis['rotate'].add(RZ);

	for ( i in this.pickerAxis ) {

		for ( j in this.pickerAxis[i].children ) {

			this.pickerAxis[i].children[j].visible = false;

		}
	
	}
	// intersection planes

	var intersectionPlane;
	var intersectionPlaneXYZ = new THREE.Mesh( new THREE.PlaneGeometry( 500, 500, 50, 50 ), new THREE.MeshBasicMaterial( { wireframe: true } ) );
	intersectionPlaneXYZ.material.side = 2;
	intersectionPlaneXYZ.visible = false;
	var intersectionPlaneXY = intersectionPlaneXYZ.clone();
	var intersectionPlaneYZ = intersectionPlaneXYZ.clone();
	var intersectionPlaneXZ = intersectionPlaneXYZ.clone();
	intersectionPlaneYZ.rotation.set( 0, Math.PI/2, 0 );
	intersectionPlaneXZ.rotation.set( -Math.PI/2, 0, 0 );

	this.gizmo.add(intersectionPlaneXYZ);
	this.gizmo.add(intersectionPlaneXY);
	this.gizmo.add(intersectionPlaneYZ);
	this.gizmo.add(intersectionPlaneXZ);


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

		objPos = new THREE.Vector3(
			this.object.matrixWorld.elements[12],
			this.object.matrixWorld.elements[13],
			this.object.matrixWorld.elements[14]);

		camPos = new THREE.Vector3(
			this.camera.matrixWorld.elements[12],
			this.camera.matrixWorld.elements[13],
			this.camera.matrixWorld.elements[14]);


		var lookAtMat = new THREE.Matrix4().lookAt(camPos, objPos, new THREE.Vector3( 0, 1, 0 ).applyEuler(scope.camera.rotation) );
		var rotation = new THREE.Vector3().setEulerFromRotationMatrix(lookAtMat);
		var distance = objPos.distanceTo(camPos);

		scope.gizmo.rotation = scope.object.rotation;
		this.gizmo.position = this.object.position;
		this.gizmo.scale.set(distance/6,distance/6,distance/6);
		this.gizmo.updateMatrix();

		intersectionPlaneXYZ.rotation = rotation;
		intersectionPlaneXYZ.updateMatrix();
 
  }

  this.hide = function () {

	 	for ( i in this.displayAxis ) {

		 	for ( j in this.displayAxis[i].children ) {

		 		this.displayAxis[i].children[j].visible = false;

		 	}

	 	}

  } 

  this.updateMode = function() {

  	this.hide();

	 	for ( i in this.displayAxis[this.mode].children ) {

 			this.displayAxis[this.mode].children[i].visible = true;
	 		
	 	}

	 	signals.objectChanged.dispatch( this.object );

  }

  this.setIntersectionPlane = function () {

  	if ( this.active.search("X") != -1 || this.active.search("Y") != -1 ) {

  		intersectionPlane = intersectionPlaneXY;

  	} 

  	if ( this.active.search("Z") != -1 ) {

  		intersectionPlane = intersectionPlaneYZ;

  	}

  	if ( this.active.search("XZ") != -1 ) {

  		intersectionPlane = intersectionPlaneXZ;

  	} 

  	if ( this.active.search("XYZ") != -1 ) {

  		intersectionPlane = intersectionPlaneXYZ;

  	}

   	if ( this.active.search("RX") != -1 ) {

  		intersectionPlane = intersectionPlaneYZ;

  	}

  	if ( this.active.search("RY") != -1 ) {

  		intersectionPlane = intersectionPlaneXZ;

  	} 

  	if ( this.active.search("RZ") != -1 ) {

  		intersectionPlane = intersectionPlaneXY;

  	}

  }

  function onMouseDown( event ) {

		event.preventDefault();

		scope.domElement.focus();

		scope.updateGizmo();

		if ( event.button === 0 ) {

			scope.updateGizmo();

			var vector = new THREE.Vector3(
				( event.layerX / scope.domElement.offsetWidth ) * 2 - 1,
				- ( event.layerY / scope.domElement.offsetHeight ) * 2 + 1,
				0.5
			);

			projector.unprojectVector( vector, scope.camera );

			ray.set( scope.camera.position, vector.sub( scope.camera.position ).normalize() );

			var intersects = ray.intersectObjects( scope.pickerAxis[scope.mode].children, true );

			if ( intersects.length > 0 ) {

				scope.active = intersects[ 0 ].object.name;

				// console.log(scope.active);

				scope.setIntersectionPlane();

				var planeIntersect = ray.intersectObject( intersectionPlane );

			  offset.copy( planeIntersect[ 0 ].point ).sub( objPos );
			  oldScale = scope.object.scale.clone();
			  oldRotation = scope.object.rotation.clone();

			} else {

		 		scope.active = false;

			}

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );
		document.addEventListener( 'mouseout', onMouseUp, false );

	};

	function onMouseMove( event ) {

		scope.updateGizmo();

		if ( scope.active ) {

			var vector = new THREE.Vector3(
				( event.layerX / scope.domElement.offsetWidth ) * 2 - 1,
				- ( event.layerY / scope.domElement.offsetHeight ) * 2 + 1,
				0.5
			);

			projector.unprojectVector( vector, scope.camera );

			ray.set( scope.camera.position, vector.sub( scope.camera.position ).normalize() );

			var intersects = ray.intersectObject( intersectionPlane );
			var point = intersects[ 0 ].point;

			if ( point ) {

				if ( ( scope.mode == 'translate' ) && scope.active.search("T") != -1 ) {

					point = point.sub( offset );

					if (scope.snapDist) {
						point.x = Math.round( point.x / scope.snapDist ) * scope.snapDist;
		        point.y = Math.round( point.y / scope.snapDist ) * scope.snapDist;
		        point.z = Math.round( point.z / scope.snapDist ) * scope.snapDist;
					}

					if ( scope.active.search("X") != -1 && scope.modifierAxis.x === 1 ) scope.object.position.x = point.x;
					if ( scope.active.search("Y") != -1 && scope.modifierAxis.y === 1 ) scope.object.position.y = point.y;
					if ( scope.active.search("Z") != -1 && scope.modifierAxis.z === 1 ) scope.object.position.z = point.z;

				}

				if ( ( scope.mode == 'rotate' ) && scope.active.search("R") != -1 ) {

					point = point;

					var offsetRotation = new THREE.Vector3( Math.atan2( offset.z, offset.y ), Math.atan2( offset.x, offset.z ), Math.atan2( offset.y, offset.x ) );
					var rotation = new THREE.Vector3( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );

					if ( scope.active.search("X") != -1 && scope.modifierAxis.x === 1 ) scope.object.rotation.x = oldRotation.x - offsetRotation.x + rotation.x;
					if ( scope.active.search("Y") != -1 && scope.modifierAxis.y === 1 ) scope.object.rotation.y = oldRotation.y - offsetRotation.y + rotation.y;
					if ( scope.active.search("Z") != -1 && scope.modifierAxis.z === 1 ) scope.object.rotation.z = oldRotation.z - offsetRotation.z + rotation.z;

				}

				if ( ( scope.mode == 'scale') && scope.active.search("S") != -1 ) {

					point = point.sub( offset );

					if ( scope.active.search("XYZ") != -1) {
							
							var scale = 1 + ( ( point.x + point.y ) / 200 );
							point.set(scale,scale,scale);

							if ( scope.modifierAxis.x === 1 ) scope.object.scale.x = oldScale.x * point.x;
							if ( scope.modifierAxis.y === 1 ) scope.object.scale.y = oldScale.y * point.y;
							if ( scope.modifierAxis.z === 1 ) scope.object.scale.z = oldScale.z * point.z;

					} else {

						if ( scope.active.search("X") != -1 && scope.modifierAxis.x === 1 ) scope.object.scale.x = oldScale.x + point.x/offset.x;
						if ( scope.active.search("Y") != -1 && scope.modifierAxis.y === 1 ) scope.object.scale.y = oldScale.y + point.y/offset.y;
						if ( scope.active.search("Z") != -1 && scope.modifierAxis.z === 1 ) scope.object.scale.z = oldScale.z + point.z/offset.z;

					}

				}

			}

		}

	}

	function onMouseUp( event ) {

		scope.active = false;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	function onKeyDown( event ) {

 
		if ( event.keyCode == 87 ) { // W

			scope.mode = 'translate';
			scope.updateMode();

		}

		if ( event.keyCode == 69 ) { // E
			
			scope.mode = 'rotate';
			scope.updateMode();

		}

		if ( event.keyCode == 82 ) { // R
			
			scope.mode = 'scale';
			scope.updateMode();

		}

	}


};

THREE.TransformControls.prototype = Object.create( THREE.EventDispatcher.prototype );