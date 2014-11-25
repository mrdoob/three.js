/**
 * @author dmarcos - diego.marcos@gmail.com
 *
 * Reusable cursor for 3D scenes
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
	var pixelsToDegreesFactor = 0.00030;

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

	this.cursor.position.z = -75;
	this.add( this.cursor );
	this.scene.add( this );

	this.mouseQuat = new THREE.Quaternion();
	this.deltaQuaternion = new THREE.Quaternion();
	this.cameraDeltaQuaternion = new THREE.Quaternion();
	this.cameraInverse = new THREE.Quaternion();
	this.deltaMouse = new THREE.Quaternion();

	this.update = function() {
		var deltaAngle;
		var cameraInverse = this.cameraInverse;
		var cursorAxis;
		var cursorAngle;
		var angleSign;
		if ( this.pointerLocked ) {
			if ( !this.previousCameraQuat ) {
				this.deltaMouse.copy( this.object.quaternion );
				this.previousCameraQuat = this.object.quaternion.clone();
			}
			// Angle between camera and cursor
			deltaAngle = quaternionsAngle( scope.object.quaternion, scope.quaternion ) * ( 180 / Math.PI ) ;
			// Checks if cursor within the FOVs limits
			if ( deltaAngle >= this.maxFOV ) {
				//cursorAxis = quaternionAxis( scope.quaternion );
				//cursorAngle = quaternionAngle( scope.quaternion );
				//scope.quaternion.setFromAxisAngle( cursorAxis, cursorAngle - (( deltaAngle - this.maxFOV ) * Math.PI / 180 ));
				this.lock = true;
			}

			// diff * q1 = q2  --->  diff = q2 * inverse(q1)
			// where:  inverse(q1) = conjugate(q1) / abs(q1)
			// and:  conjugate( quaternion(re, i, j, k) ) = quaternion(re, -i, -j, -k)
			// http://stackoverflow.com/questions/22157435/difference-between-the-two-quaternions
			cameraInverse.copy( this.object.quaternion ).inverse();
			this.cameraDeltaQuaternion.copy( this.previousCameraQuat ).multiply( cameraInverse );
			scope.mouseQuat.copy( scope.quaternion ).multiply( this.cameraDeltaQuaternion );
			deltaAngle = quaternionsAngle( scope.object.quaternion, scope.mouseQuat ) * ( 180 / Math.PI );

			// Dealing with overreach on extremely fast movements
			if ( deltaAngle >= this.maxFOV + 10 ) {
				cursorAxis = quaternionAxis( scope.cameraDeltaQuaternion );
				cursorAngle = quaternionAngle( scope.cameraDeltaQuaternion );
				angleSign = cursorAngle > 0 ? 1 : -1;
				//scope.cameraDeltaQuaternion.setFromAxisAngle( cursorAxis, cursorAngle - ( ( deltaAngle - this.maxFOV )  * Math.PI / 180 ) );
				//scope.quaternion.multiply( scope.cameraDeltaQuaternion );
				scope.cameraDeltaQuaternion.setFromAxisAngle( cursorAxis, ((angleSign) * (deltaAngle - this.maxFOV)  * Math.PI / 180 ) );
			}

			/**********/
			// PING PONG
			if ( this.lock && deltaAngle >= this.maxFOV ) {
				this.deltaQuaternion.multiply( this.cameraDeltaQuaternion );
			}
			// // STICKY
			// if ( this.lock ) {
			// 	this.deltaQuaternion.multiply( this.cameraDeltaQuaternion );
			// }
			/*********/

			this.updateMouseQuaternion();
			if ( scope.lock ) {
				scope.quaternion.copy( scope.deltaQuaternion.clone().inverse() );
				scope.quaternion.multiply( scope.deltaMouse );
			} else {
				scope.quaternion.copy( scope.deltaMouse );
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

	function quaternionAngle(q) {
		return 2 * Math.acos(q.w);
	}

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

	this.updateMouseQuaternion = function() {
		var mouseQuat = scope.mouseQuat;
		var deltaAngle;
		var xDeltaQuaternion = scope.xDeltaQuaternion = xDeltaQuaternion || new THREE.Quaternion();
		var yDeltaQuaternion = scope.yDeltaQuaternion = yDeltaQuaternion || new THREE.Quaternion();
		var xAxis = new THREE.Vector3(1, 0, 0);
		var yAxis = new THREE.Vector3(0, 1, 0);

		if ( scope.mouseDeltaX !== 0 || scope.mouseDeltaY !==0 ) {
			// scope.object.localToWorld( xAxis );
			// scope.object.localToWorld( yAxis );
			yDeltaQuaternion.setFromAxisAngle( yAxis, scope.mouseDeltaY * 2 * Math.PI );
			xDeltaQuaternion.setFromAxisAngle( xAxis, scope.mouseDeltaX * 2 * Math.PI );
			scope.mouseDeltaX = 0;
			scope.mouseDeltaY = 0;
			mouseQuat.copy( scope.quaternion ).multiply( xDeltaQuaternion ).multiply( yDeltaQuaternion );
			deltaAngle = quaternionsAngle( scope.object.quaternion, mouseQuat ) * ( 180 / Math.PI );
			if ( deltaAngle < scope.maxFOV ) {
				if ( scope.lock ) {
					scope.deltaQuaternion = new THREE.Quaternion();
					scope.lock = false;
				}
				scope.deltaMouse.copy( xDeltaQuaternion ).multiply( yDeltaQuaternion ).multiply( scope.quaternion );
			}
		}
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
			scope.previousCameraQuat = false;
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