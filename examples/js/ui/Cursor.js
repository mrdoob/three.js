/**
 * @author dmarcos - diego.marcos@gmail.com
 *
 * Reusable cursor for threejs scenes
 *
 */

THREE.Cursor = function ( object, domElement	 ) {

	var scope = this;

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.domElement.style.cursor = 'none';
	this.mouseVector = new THREE.Vector3(0, 0, 0);

	this.raycaster = new THREE.Raycaster();
	this.pivot = new THREE.Object3D();
	this.cursor = new THREE.Mesh(
		new THREE.SphereGeometry( 0.5, 5, 5 ),
		new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } )
	);
	this.cursor.position.z = 930;
	this.pivot.add(this.cursor);
	this.object.add(this.pivot);

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
 		var cursorPos = new THREE.Vector3(scope.cursor.position.x, scope.cursor.position.y, scope.cursor.position.z);
		cursorPos.project( scope.object );
		//console.log("CURSOR " + cursorPos.x + " " + cursorPos.y + " " + cursorPos.z);

 		scope.mouseVector.set( mouseX, mouseY, cursorPos.z );
 		scope.mouseVector.unproject( scope.object );

 		// console.log("SCREEN " + mouseX + " " + mouseX);
 		// console.log("CAMERA " + scope.mouseVector.x + " " + scope.mouseVector.x);

 		scope.pivot.position.x = scope.mouseVector.x;
 		scope.pivot.position.y = -scope.mouseVector.y;

	}

	this.domElement.addEventListener( 'mousemove', onMouseMove );
	this.domElement.onmouseover = function() { console.log("over"); };
	this.domElement.onmouseleave = function() { console.log("leave"); };
};
