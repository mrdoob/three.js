/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

function bind( scope, fn ) {
	return function () {
		fn.apply( scope, arguments );
	};
}

CameraControlWASD = function ( camera, movement_speed, look_speed, nofly, look_vertical ) {

	this.movement_speed = movement_speed !== undefined ? movement_speed : 1.0;
	this.look_speed = look_speed !== undefined ? look_speed : 0.005;

	this.nofly = nofly;
	this.look_vertical = look_vertical;
	
	this.camera = camera;
	
	this.mouseX = 0;
	this.mouseY = 0;
	
	this.lat = 0;
	this.lon = 0;
	this.phy = 0;
	this.theta = 0;
	
	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	
	this.windowHalfX = window.innerWidth / 2;
	this.windowHalfY = window.innerHeight / 2;

	this.onDocumentMouseDown = function ( event ) {
		
		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {

			case 0: this.moveForward = true; break;
			case 2: this.moveBackward = true; break;

		}

	};

	this.onDocumentMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {

			case 0: this.moveForward = false; break;
			case 2: this.moveBackward = false; break;

		}

	};

	this.onDocumentMouseMove = function (event) {

		this.mouseX = event.clientX - this.windowHalfX;
		this.mouseY = event.clientY - this.windowHalfY;

	};
	
	this.onDocumentKeyDown = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

		}

	};

	this.onDocumentKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

		}

	};
	
	this.update = function() {
	
		if ( this.moveForward )  this.camera.translateZ( - this.movement_speed, this.nofly );
		if ( this.moveBackward ) this.camera.translateZ(   this.movement_speed, this.nofly  );
		if ( this.moveLeft )     this.camera.translateX( - this.movement_speed, this.nofly  );
		if ( this.moveRight )    this.camera.translateX(   this.movement_speed, this.nofly  );

		this.lon += this.mouseX * this.look_speed;
		if( this.look_vertical ) this.lat -= this.mouseY * this.look_speed;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = ( 90 - this.lat ) * Math.PI / 180;
		this.theta = this.lon * Math.PI / 180;

		this.camera.target.position.x = 100 * Math.sin( this.phi ) * Math.cos( this.theta ) + this.camera.position.x;
		this.camera.target.position.y = 100 * Math.cos( this.phi ) + this.camera.position.y;
		this.camera.target.position.z = 100 * Math.sin( this.phi ) * Math.sin( this.theta ) + this.camera.position.z;
		
	};
	
	
	document.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	
	document.addEventListener( 'mousemove', bind( this, this.onDocumentMouseMove ), false );
	document.addEventListener( 'mousedown', bind( this, this.onDocumentMouseDown ), false );
	document.addEventListener( 'mouseup', bind( this, this.onDocumentMouseUp ), false );
	document.addEventListener( 'keydown', bind( this, this.onDocumentKeyDown ), false );
	document.addEventListener( 'keyup', bind( this, this.onDocumentKeyUp ), false );
	
};
