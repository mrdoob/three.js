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

THREE.QuakeCamera = function ( parameters ) {

	THREE.Camera.call( this, parameters.fov, parameters.aspect, parameters.near, parameters.far, parameters.target );
	
	this.movement_speed = 1.0;
	this.look_speed = 0.005;

	this.nofly = false;
	this.look_vertical = true;
	
	this.domElement = document;
	
	if ( parameters ) {

		if ( parameters.movement_speed !== undefined ) this.movement_speed = parameters.movement_speed;
		if ( parameters.look_speed !== undefined ) this.look_speed  = parameters.look_speed;
		if ( parameters.nofly !== undefined ) this.nofly = parameters.nofly;
		if ( parameters.look_vertical !== undefined ) this.look_vertical = parameters.look_vertical;
		
		if ( parameters.domElement !== undefined ) this.domElement = parameters.domElement;
		
	}	
	
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

	this.onMouseDown = function ( event ) {
		
		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {

			case 0: this.moveForward = true; break;
			case 2: this.moveBackward = true; break;

		}

	};

	this.onMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {

			case 0: this.moveForward = false; break;
			case 2: this.moveBackward = false; break;

		}

	};

	this.onMouseMove = function (event) {

		this.mouseX = event.clientX - this.windowHalfX;
		this.mouseY = event.clientY - this.windowHalfY;

	};
	
	this.onKeyDown = function ( event ) {

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

	this.onKeyUp = function ( event ) {

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
		
		if ( this.moveForward )  this.translateZ( - this.movement_speed, this.nofly );
		if ( this.moveBackward ) this.translateZ(   this.movement_speed, this.nofly  );
		if ( this.moveLeft )     this.translateX( - this.movement_speed, this.nofly  );
		if ( this.moveRight )    this.translateX(   this.movement_speed, this.nofly  );

		this.lon += this.mouseX * this.look_speed;
		if( this.look_vertical ) this.lat -= this.mouseY * this.look_speed;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = ( 90 - this.lat ) * Math.PI / 180;
		this.theta = this.lon * Math.PI / 180;

		var target_position = this.target.position,
			position = this.position;
		
		target_position.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		target_position.y = position.y + 100 * Math.cos( this.phi );
		target_position.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.supr.update.call( this );

	};
	
	
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );
	
};

THREE.QuakeCamera.prototype             = new THREE.Camera();
THREE.QuakeCamera.prototype.constructor = THREE.QuakeCamera;
THREE.QuakeCamera.prototype.supr        = THREE.Camera.prototype;
