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

	this.camera = new THREE.OrthographicCamera( left, right, top, bottom, near, far );
	this.scene = new THREE.Scene();
	this.renderer = renderer;

	this.domElement = ( renderer !== undefined ) ? renderer.domElement : document;
	this.domElement.style.cursor = 'none';
	this.mouseVector = new THREE.Vector3(0, 0, 0);

	this.raycaster = new THREE.Raycaster();
	this.pivot = new THREE.Object3D();
	this.cursor = new THREE.Mesh(
		new THREE.SphereGeometry( 0.0100, 0.0100, 0.0100 ),
		new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } )
	);
	this.cursor.position.z = -50;
	this.pivot.add( this.cursor );
	this.scene.add( this.pivot );
	//this.object.add( this.pivot );

	this.update = function() {
		var autoClear = this.renderer.autoClear;
		this.renderer.autoClear = false;
		this.renderer.render( this.scene, this.camera );
		this.renderer.autoClear = autoClear;
	};

	function onMouseMove( e ) {

		var movementX = e.movementX ||
				e.mozMovementX ||
				e.webkitMovementX || 0;

		var movementY = e.movementY ||
				e.mozMovementY ||
				e.webkitMovementY || 0;

		// It converts from screen to camera coordinates
		var mouseX = ( e.clientX / window.innerWidth ) * 2 - 1;
		var mouseY = ( e.clientY / window.innerHeight ) * 2 - 1;

		// cursor position in camera coordinates
		var cursorPos = new THREE.Vector3(scope.cursor.position.x, scope.cursor.position.y, scope.pivot.position.z + scope.cursor.position.z);
		cursorPos.project( scope.camera );

		scope.mouseVector.set( mouseX, mouseY, cursorPos.z );
		scope.mouseVector.unproject( scope.camera );

		// console.log("SCREEN " + mouseX + " " + mouseY);
		// console.log("CAMERA " + scope.mouseVector.x + " " + scope.mouseVector.x);
		scope.cursor.position.x = scope.mouseVector.x;
		scope.cursor.position.y = -scope.mouseVector.y;

		// var pivotQuat = new THREE.Quaternion();
		//scope.pivot.rotation.x = scope.object.rotation.x;
		//scope.pivot.rotation.y = scope.object.rotation.y;
		// scope.object.updateMatrix();
		// scope.pivot.quaternion.copy( pivotQuat );
		// scope.pivot.quaternion.multiply( scope.object.quaternion );
		// scope.pivot.updateMatrix();
	}

	this.domElement.addEventListener( 'mousemove', onMouseMove );
	this.domElement.onmouseover = function() { console.log("over"); };
	this.domElement.onmouseleave = function() { console.log("leave"); };

};
