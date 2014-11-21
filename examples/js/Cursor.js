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
	this.maxFOV = 30;
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
	this.mouseQuaternion = new THREE.Quaternion();
	this.deltaQuaternion = new THREE.Quaternion();
	this.deltaMouse = new THREE.Quaternion();

	this.update = function() {
		var deltaAngle;
		var differenceQuaternion;
		var cameraInverse;
		if ( this.pointerLocked ) {
			if ( !this.previousCameraQuat ) {
				this.previousCameraQuat = this.object.quaternion.clone();
			}
			cameraInverse = new THREE.Quaternion().copy( this.object.quaternion ).inverse();
			scope.differenceQuaternion = new THREE.Quaternion().copy( this.previousCameraQuat ).multiply( cameraInverse );
			/**********/
			scope.mouseQuat.copy( scope.quaternion ).multiply( scope.differenceQuaternion );
			deltaAngle = quaternionsAngle( scope.object.quaternion, scope.mouseQuat ) * ( 180 / Math.PI ) ;
			if ( this.lock && deltaAngle >= this.maxFOV ) {
				this.deltaQuaternion.multiply( scope.differenceQuaternion );
			}
			/*********/
			this.updateMouseQuaternion();
			// Angle between camera and cursor
			deltaAngle = quaternionsAngle( scope.object.quaternion, scope.quaternion ) * ( 180 / Math.PI ) ;
			// console.log("ANGLE " + deltaAngle);
			if ( deltaAngle >= this.maxFOV) {
				this.lock = true;
			}
			this.previousCameraQuat = this.previousCameraQuat.copy( this.object.quaternion );
			scope.matrixAutoUpdate = false;
			scope.updateMatrix();
		} else {
			scope.matrixAutoUpdate = true;
			this.cursor.position.x = this.mouseVector.x;
			this.cursor.position.y = -this.mouseVector.y;
		}

	};

	this.updateMouseQuaternion = function() {
		var mouseQuat = scope.mouseQuat;
		var newDeltaQuaternion = new THREE.Quaternion();
		var deltaAngle;
		var signX;
		var signY;
		if ( scope.mouseDeltaX !== 0 || scope.mouseDeltaY !==0 ) {
			scope.deltaEuler.set( scope.mouseDeltaX * 2 * Math.PI, scope.mouseDeltaY * 2 * Math.PI, 0 );
			newDeltaQuaternion.setFromEuler( scope.deltaEuler, true ).normalize();
			signX = scope.mouseDeltaX < 0 ? -1 : 1;
			signY = scope.mouseDeltaY < 0 ? -1 : 1;
			scope.mouseDeltaX = 0;
			scope.mouseDeltaY = 0;
			mouseQuat.copy( scope.mouseQuaternion ).multiply( newDeltaQuaternion );
			deltaAngle = quaternionsAngle( scope.object.quaternion, mouseQuat ) * ( 180 / Math.PI );
			if ( deltaAngle < scope.maxFOV ) {
				if ( scope.lock ) {
					scope.deltaQuaternion = new THREE.Quaternion();
					scope.lock = false;
				}
				scope.deltaMouse.copy( scope.quaternion ).multiply( newDeltaQuaternion );
			}
		}
		if ( scope.lock ) {
			scope.mouseQuaternion.copy( scope.deltaQuaternion.clone().inverse() );
			scope.mouseQuaternion.multiply( scope.deltaMouse );
			//scope.mouseQuaternion.multiply( scope.differenceQuaternion.inverse() );
		} else {
			scope.mouseQuaternion.copy( scope.deltaMouse );
		}
		scope.quaternion.copy( scope.mouseQuaternion );
	};

	this.render = function() {
		if ( this.pointerLocked ) {
			return;
		}
		var autoClear = this.renderer.autoClear;
		if ( this.parent !== this.scene ) {
			storeParentScene();
			this.parent.remove( this );
			this.scene.add( this );
		}
		this.renderer.autoClear = false;
		this.renderer.render( this.scene, this.camera );
		this.renderer.autoClear = autoClear;
	};

	function quaternionAngle(q) {
		return 2 * Math.acos(q.w);
	}

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

		var sign;

		scope.mouseDeltaX -= movementY * pixelsToDegreesFactor;
		scope.mouseDeltaY -= movementX * pixelsToDegreesFactor;

		// if ( Math.abs(scope.mouseDeltaX * 360) >= (scope.maxFOV - 5) ) {
		// 	scope.mouseDeltaX += movementX * pixelsToDegreesFactor;
		// }

		// if ( Math.abs(scope.mouseDeltaY * 360) >= (scope.maxFOV - 5) ) {
		// 	scope.mouseDeltaY += movementY * pixelsToDegreesFactor;
		// }

	}

	function quaternionsAngle(q1, q2) {
		var v1 = new THREE.Vector3( 0, 0, -1 );
		var v2 = new THREE.Vector3( 0, 0, -1 );
		v1.applyQuaternion(q1);
		v2.applyQuaternion(q2);
		return v1.angleTo(v2);
	}

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
		scope.deltaQuaternion = new THREE.Quaternion();
	}

	function pointerLockChanged() {
		scope.pointerLocked =
			document.pointerLockElement === scope.domElement ||
			document.mozPointerLockElement === scope.domElement ||
			document.webkitPointerLockElement === scope.domElement;

		storeParentScene();

		if ( scope.pointerLocked === true ) {
			resetPivot( scope.object );
			scope.scene.remove( scope );
			scope.parentScene.add( scope );
			scope.cursor.scale.set( 50, 50, 50 );
			scope.pointerLocked = true;
		} else {
			resetPivot( scope.camera );
			scope.parentScene.remove( scope );
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

	function storeParentScene() {
		if (!scope.parentScene && scope.parent !== scope.scene) {
			scope.parentScene = scope.parent;
		}
	}

	this.domElement.addEventListener( 'mousemove', onMouseMove );
	this.domElement.addEventListener( 'mouseup', onMouseUp, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );

	document.addEventListener( 'pointerlockchange', pointerLockChanged, false );
	document.addEventListener( 'mozpointerlockchange', pointerLockChanged, false );
	document.addEventListener( 'webkitpointerlockchange', pointerLockChanged, false );

};

THREE.Cursor.prototype = Object.create( THREE.Object3D.prototype );