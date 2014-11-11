/**
 * @author dmarcos - diego.marcos@gmail.com
 *
 * Reusable cursor for threejs scenes
 *
 */

THREE.Cursor = function ( object, renderer ) {

	THREE.Object3D.call( this );

	var scope = this;

	var top = Math.tan( THREE.Math.degToRad( object.fov * 0.5 ) ) * object.near;
	var bottom = - top;
	var left = object.aspect * bottom;
	var right = object.aspect * top;
	var near = object.near;
	var far = object.far;

	var cursorPosition = new THREE.Vector3();
	var pixelsToDegreesFactor = 0.00025;

	var verticalFOV = object.fov;
	var verticalFOVPadding = 5;
	var horizontalFOV = object.fov * object.aspect;
	var horizontalFOVPadding = verticalFOVPadding * object.aspect + 20;

	this.object = object;
	this.lock = false;
	this.orientation = {
		x: 0,
		y: 0,
		euler: new THREE.Euler(),
		quaternion: new THREE.Quaternion()
	};
	this.deltaEuler = new THREE.Euler();
	this.mouseDeltaX = 0;
	this.mouseDeltaY = 0;
	this.deltaQuaternion = new THREE.Quaternion();
	this.rotationQuaternion = new THREE.Quaternion();

	this.pointerLocked = false;
	this.camera = new THREE.OrthographicCamera( left, right, top, bottom, near, far );
	this.scene = new THREE.Scene();
	this.renderer = renderer;

	this.domElement = ( renderer !== undefined ) ? renderer.domElement : document;
	this.domElement.style.cursor = 'none';
	this.mouseVector = new THREE.Vector3(0, 0, 0);

	this.cursor = new THREE.Mesh(
		new THREE.SphereGeometry( 0.02, 0.02, 0.02 ),
		new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } )
	);

	this.cursor.position.z = -50;
	this.add( this.cursor );
	this.scene.add( this );

	this.mouseQuat = new THREE.Quaternion();

	this.update = function() {
		var differenceQuaternion;
		var cameraInverse;

		var quatAngle;
		var quatAxis;

		var mouseQuat = scope.mouseQuat;

		if ( this.pointerLocked ) {

			cameraInverse = new THREE.Quaternion().copy( this.object.quaternion ).inverse();
			differenceQuaternion = new THREE.Quaternion().copy( scope.quaternion ).multiply( cameraInverse );
			quatAxis = quaternionAxis( differenceQuaternion ).normalize();

			quatAngle = quaternionAngle( differenceQuaternion ) / 2;
			deltaAngle = quaternionsAngle( scope.object.quaternion, scope.quaternion ) * ( 180 / Math.PI ) ;

			//console.log("ANGLE " + deltaAngle);

			if ( deltaAngle >= 35 && !scope.locked) {
				differenceQuaternion.setFromAxisAngle( quatAxis, 35 * Math.PI / 180  );
				scope.locked = scope.locked || differenceQuaternion;
			}

			if (scope.locked) {
				scope.quaternion.copy( scope.object.quaternion ).multiply( scope.locked );
				if ( scope.mouseDeltaX !== 0 || scope.mouseDeltaY !==0 ) {
					scope.deltaEuler.set( scope.mouseDeltaX * 2 * Math.PI, scope.mouseDeltaY * 2 * Math.PI, 0 );
					scope.deltaQuaternion.setFromEuler( scope.deltaEuler, true );
					mouseQuat.copy( scope.quaternion ).multiply( scope.deltaQuaternion );
					scope.mouseDeltaX = 0;
					scope.mouseDeltaY = 0;
					deltaAngle = quaternionsAngle( scope.object.quaternion, mouseQuat ) * ( 180 / Math.PI );
					if ( deltaAngle < 35) {
						scope.quaternion.multiply( scope.deltaQuaternion );
						scope.locked = false;
					}
				}
			} else if ( scope.mouseDeltaX !== 0 || scope.mouseDeltaY !== 0 ) {
				scope.deltaEuler.set( scope.mouseDeltaX * 2 * Math.PI, scope.mouseDeltaY * 2 * Math.PI, 0 );
				scope.deltaQuaternion.setFromEuler( scope.deltaEuler, true );
				mouseQuat.copy( scope.quaternion ).multiply( scope.deltaQuaternion );
				scope.mouseDeltaX = 0;
				scope.mouseDeltaY = 0;
				deltaAngle = quaternionsAngle( scope.object.quaternion, mouseQuat ) * ( 180 / Math.PI );
				if ( deltaAngle < 35) {
					scope.quaternion.multiply( scope.deltaQuaternion );
					// differenceQuaternion = new THREE.Quaternion().copy( mouseQuat ).multiply( cameraInverse );
					// quatAxis = quaternionAxis( differenceQuaternion ).normalize();
					// scope.deltaQuaternion.setFromAxisAngle( quatAxis, 35 * Math.PI / 180 );
					// scope.locked = scope.deltaQuaternion;
				}
			}

			scope.matrixAutoUpdate = false;
			scope.updateMatrix();

		} else {
			scope.matrixAutoUpdate = true;
			this.cursor.position.x = this.mouseVector.x;
			this.cursor.position.y = -this.mouseVector.y;
		}
	};

	this.render = function() {
		if ( this.pointerLocked ) {
			return;
		}
		var autoClear = this.renderer.autoClear;
		this.renderer.autoClear = false;
		this.renderer.render( this.scene, this.camera );
		this.renderer.autoClear = autoClear;
	};

	function quaternionAngle(q) {
		return 2 * Math.acos(q.w);
	}

	// function quaternionAxis(q) {
	// 	var angle = Math.acos(q.w);
	// 	var ooScale = 1.0 / Math.sin(angle);
	// 	return THREE.Vector3( -q.x * ooScale, -q.y * ooScale, -q.z * ooScale );
	// }

  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm
	function quaternionAxis(q) {
		var x = q.x;
		var y = q.y;
		var z = q.z;
		// if w > 1 acos and sqrt will produce errors,
		// this cannot happen if quaternion is normalised
		var q = q.w <= 1? q : new THREE.Quaternion().copy( q ).normalize();
		var factor = Math.sqrt( 1 - q.w * q.w );

		if ( factor > 0.001) {
			x /= factor;
			y /= factor;
			z /= factor;
		}
		return new THREE.Vector3( x, y, z );
	}

	function clamp(value, boundary) {
		if (value < -boundary) {
		  return -boundary;
		}
		if (value > boundary) {
		  return boundary;
		}
		return angle;
	};

	function updateScreenPosition( e ) {
		// It converts from screen to camera coordinates
		var mouseX = ( e.clientX / window.innerWidth ) * 2 - 1;
		var mouseY = ( e.clientY / window.innerHeight ) * 2 - 1;

		// cursor position in camera coordinates
		cursorPosition.copy( scope.cursor.position );
		cursorPosition.project( scope.camera );

		scope.mouseVector.set( mouseX, mouseY, cursorPosition.z );
		scope.mouseVector.unproject( scope.camera );
	}

	function updateRadialPosition( e ) {
		var movementX = e.movementX ||
				e.mozMovementX ||
				e.webkitMovementX || 0;

		var movementY = e.movementY ||
				e.mozMovementY ||
				e.webkitMovementY || 0;

		scope.mouseDeltaX -= movementY * pixelsToDegreesFactor;
		scope.mouseDeltaY -= movementX * pixelsToDegreesFactor;

	}

	function quaternionsAngle(q1, q2) {
		var v1 = new THREE.Vector3( 0, 0, -1 );
		var v2 = new THREE.Vector3( 0, 0, -1 );
		v1.applyQuaternion(q1);
		v2.applyQuaternion(q2);
		return v1.angleTo(v2);
	}

	// function quaternionsAngle(q1, q2) {
	// 	var r = new THREE.Quaternion().copy( q1 ).dot(q2);
	// 	r = Math.acos(r);
	// 	if (r > Math.PI) {
	// 		return 2*Math.PI - r;
	// 	}
	// 	return r;
	// }

	function onMouseMove( e ) {
		if ( scope.pointerLocked ) {
			if ( scope.mouseDown === true ) {
				return;
			}
			updateRadialPosition ( e );
		} else {
			updateScreenPosition ( e )
		}
	}

	function resetPivot( object ) {
		scope.orientation.x = 0;
		scope.orientation.y = 0;
		scope.position.copy( object.position );
		scope.quaternion.copy( object.quaternion );
	}

	function pointerLockChanged() {
		scope.pointerLocked =
			document.pointerLockElement === scope.domElement ||
			document.mozPointerLockElement === scope.domElement ||
			document.webkitPointerLockElement === scope.domElement;

		if ( scope.pointerLocked === true ) {
			resetPivot( scope.object );
			scope.scene.remove( scope );
			scope.object.parent.add( scope );
			scope.cursor.scale.set( 50, 50, 50 );
			scope.pointerLocked = true;
		} else {
			resetPivot( scope.camera );
			scope.object.parent.remove( scope );
			scope.scene.add( scope );
			scope.cursor.scale.set( 1, 1, 1 );
			scope.pointerLocked = false;
		}
	}

	function onMouseUp() {
		scope.mouseDown = false;
	}

	function onMouseDown() {
		scope.mouseDown = true;
	}

	this.domElement.addEventListener( 'mousemove', onMouseMove );
	this.domElement.addEventListener( 'mouseup', onMouseUp, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );

	document.addEventListener( 'pointerlockchange', pointerLockChanged, false );
	document.addEventListener( 'mozpointerlockchange', pointerLockChanged, false );
	document.addEventListener( 'webkitpointerlockchange', pointerLockChanged, false );

};

THREE.Cursor.prototype = Object.create( THREE.Object3D.prototype );