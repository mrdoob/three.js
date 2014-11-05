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
	var horizontalFOVPadding = verticalFOVPadding * object.aspect + 10;

	this.object = object;
	this.lock = false;
	this.orientation = {
		x: 0,
		y: 0,
		euler: new THREE.Euler(),
		quaternion: new THREE.Quaternion()
	};

	this.pointerLocked = false;
	this.camera = new THREE.OrthographicCamera( left, right, top, bottom, near, far );
	this.scene = new THREE.Scene();
	this.renderer = renderer;

	this.domElement = ( renderer !== undefined ) ? renderer.domElement : document;
	this.domElement.style.cursor = 'none';
	this.mouseVector = new THREE.Vector3(0, 0, 0);

	this.cursor = new THREE.Mesh(
		new THREE.SphereGeometry( 0.01, 0.01, 0.01 ),
		new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } )
	);

	this.cursor.position.z = -50;
	this.add( this.cursor );
	this.scene.add( this );

	this.previousCamera = new THREE.Quaternion().copy( object.quaternion );

	this.update = function() {
		var mouseQuaternion;
		var differenceQuaternion;
		var lockEuler;

		if ( this.pointerLocked ) {

			differenceQuaternion = new THREE.Quaternion().copy( this.previousCamera ).inverse();
			mouseQuaternion = new THREE.Quaternion().copy( scope.object.quaternion ).multiply( differenceQuaternion );
			lockEuler = new THREE.Euler().setFromQuaternion( mouseQuaternion );

			if ( this.previousCamera.equals( scope.object.quaternion ) === false &&
						this.lock === false) {

				this.orientation.x -= lockEuler.x / (2 * Math.PI);
				this.orientation.y -= lockEuler.y / (2 * Math.PI);

				if ( Math.abs(this.orientation.x * 360) >= (verticalFOV / 2) - verticalFOVPadding) {
					this.orientation.x = clamp(this.orientation.x * 360, (verticalFOV / 2) - verticalFOVPadding) / 360;
					this.lock = true;
				}

				if (Math.abs(this.orientation.y * 360) >= (horizontalFOV / 2) - horizontalFOVPadding) {
					this.orientation.y = clamp(this.orientation.y * 360, (horizontalFOV / 2) - horizontalFOVPadding) / 360;
					this.lock = true;
				}

			}

			this.previousCamera.copy( scope.object.quaternion );

			this.orientation.euler.set( this.orientation.x * 2 * Math.PI, this.orientation.y * 2 * Math.PI, 0 );
			this.orientation.quaternion.setFromEuler( this.orientation.euler, true );
			mouseQuaternion =	new THREE.Quaternion().multiply( this.orientation.quaternion );
			pivotQuaternion = new THREE.Quaternion().multiply( mouseQuaternion );
			this.quaternion.copy( pivotQuaternion );

		} else {
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

		var rotationX = scope.orientation.x - movementY * pixelsToDegreesFactor;
		var rotationY = scope.orientation.y - movementX * pixelsToDegreesFactor;

		if (Math.abs(rotationX * 360) >= (verticalFOV / 2) - verticalFOVPadding) {
			movementY = 0;
			scope.lock = true;
		} else {
			scope.lock = false;
		}

		if (Math.abs(rotationY * 360) >= (horizontalFOV / 2) - horizontalFOVPadding) {
			movementX = 0;
			scope.lock = true;
		} else {
			scope.lock = false;
		}

		scope.orientation.x -= movementY * pixelsToDegreesFactor;
		scope.orientation.y -= movementX * pixelsToDegreesFactor;

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
	}

	function pointerLockChanged() {
		scope.pointerLocked =
			document.pointerLockElement === scope.domElement ||
			document.mozPointerLockElement === scope.domElement ||
			document.webkitPointerLockElement === scope.domElement;

		if ( scope.pointerLocked === true ) {
			resetPivot( scope.object );
			scope.scene.remove( scope );
			scope.object.add( scope );
			scope.cursor.scale.set( 50, 50, 50 );
			scope.pointerLocked = true;
		} else {
			resetPivot( scope.camera );
			scope.object.remove( scope );
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