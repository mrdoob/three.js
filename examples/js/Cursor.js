/**
 * @author dmarcos - diego.marcos@gmail.com
 *
 * Reusable cursor for threejs scenes
 *
 */

THREE.Cursor = function ( object, renderer ) {

	var scope = this;
	this.object = object;

	var top = Math.tan( THREE.Math.degToRad( object.fov * 0.5 ) ) * object.near;
	var bottom = - top;
	var left = object.aspect * bottom;
	var right = object.aspect * top;
	var near = object.near;
	var far = object.far;

	var cursorPosition = new THREE.Vector3();
	var pixelsToDegreesFactor = 0.00025;

	this.rotation = {
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

	this.raycaster = new THREE.Raycaster();
	this.pivot = new THREE.Object3D();
	this.cursor = new THREE.Mesh(
		new THREE.SphereGeometry( 0.01, 0.01, 0.01 ),
		new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } )
	);

	this.cursor.position.z = -50;
	this.pivot.add( this.cursor );
	this.scene.add( this.pivot );

	this.update = function() {
		var autoClear;
		var rotation = this.rotation;
		if ( this.pointerLocked ) {
			rotation.euler.set( rotation.x, rotation.y, 0 );
			rotation.quaternion.setFromEuler( rotation.euler, true );
			this.pivot.quaternion.copy( rotation.quaternion );
		} else {
			this.cursor.position.x = this.mouseVector.x;
			this.cursor.position.y = -this.mouseVector.y;
			autoClear = this.renderer.autoClear;
			this.renderer.autoClear = false;
			this.renderer.render( this.scene, this.camera );
			this.renderer.autoClear = autoClear;
		}
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

		// Rotation in degrees
		var rotationX = (movementX * pixelsToDegreesFactor) % 360;
		var rotationY = (movementY * pixelsToDegreesFactor) % 360;

		// To Radians
		scope.rotation.x -= rotationY * 2 * Math.PI;
		scope.rotation.y -= rotationX * 2 * Math.PI;
	}

	function onMouseMove( e ) {
		if ( scope.pointerLocked ) {
			updateRadialPosition ( e );
		} else {
			updateScreenPosition ( e )
		}
	}

	function resetPivot( object ) {
		scope.rotation.x = 0;
		scope.rotation.y = 0;
		scope.pivot.position.copy( object.position );
		scope.pivot.quaternion.copy( object.quaternion );
	}

	function pointerLockChanged() {
		scope.pointerLocked =
			document.pointerLockElement === scope.domElement ||
			document.mozPointerLockElement === scope.domElement ||
			document.webkitPointerLockElement === scope.domElement;

		if ( scope.pointerLocked === true ) {
			resetPivot( scope.object );
			scope.scene.remove( scope.pivot );
			scope.object.add( scope.pivot );
			scope.cursor.scale.set( 50, 50, 50 );
			scope.pointerLocked = true;
		} else {
			resetPivot( scope.camera );
			scope.object.remove( scope.pivot );
			scope.scene.add( scope.pivot );
			scope.cursor.scale.set( 1, 1, 1 );
			scope.pointerLocked = false;
		}
	}

	function onMouseUp() {
		scope.onMouseDown = false;
	}

	function onMouseDown() {
		scope.onMouseDown = true;
	}

	this.domElement.addEventListener( 'mousemove', onMouseMove );
	this.domElement.addEventListener( 'mouseup', onMouseUp, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );

	document.addEventListener( 'pointerlockchange', pointerLockChanged, false );
	document.addEventListener( 'mozpointerlockchange', pointerLockChanged, false );
	document.addEventListener( 'webkitpointerlockchange', pointerLockChanged, false );

};