/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 *
 * parameters = {
 *  fov: <float>,
 *  aspect: <float>,
 *  near: <float>,
 *  far: <float>,
 *  target: <THREE.Object3D>,
 
 *  movementSpeed: <float>,
 *  lookSpeed: <float>,
 
 *  noFly: <bool>, 
 *  lookVertical: <bool>,
 *  autoForward: <bool>,
 
 *  heightSpeed: <bool>,
 *  heightCoef: <float>,
 *  heightMin: <float>,
 *  heightMax: <float>,
 
 *  domElement: <HTMLElement>, 
 * }
 */

function bind( scope, fn ) {

	return function () {

		fn.apply( scope, arguments );

	};

}

function clamp_bottom( x, a ) {
	
	return x < a ? a : x;
	
};

function clamp( x, a, b ) {
	
	return x < a ? a : ( x > b ? b : x );
	
};

THREE.QuakeCamera = function ( parameters ) {

	THREE.Camera.call( this, parameters.fov, parameters.aspect, parameters.near, parameters.far, parameters.target );

	this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;

	this.noFly = false;
	this.lookVertical = true;
	this.autoForward = false;
	
	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	
	this.domElement = document;

	if ( parameters ) {

		if ( parameters.movementSpeed !== undefined ) this.movementSpeed = parameters.movementSpeed;
		if ( parameters.lookSpeed !== undefined ) this.lookSpeed  = parameters.lookSpeed;
		if ( parameters.noFly !== undefined ) this.noFly = parameters.noFly;
		if ( parameters.lookVertical !== undefined ) this.lookVertical = parameters.lookVertical;
		
		if ( parameters.autoForward !== undefined ) this.autoForward = parameters.autoForward;
		
		if ( parameters.heightSpeed !== undefined ) this.heightSpeed = parameters.heightSpeed;
		if ( parameters.heightCoef !== undefined ) this.heightCoef = parameters.heightCoef;
		if ( parameters.heightMin !== undefined ) this.heightMin = parameters.heightMin;
		if ( parameters.heightMax !== undefined ) this.heightMax = parameters.heightMax;

		if ( parameters.domElement !== undefined ) this.domElement = parameters.domElement;

	}

	this.autoSpeedFactor = 0.0;
	
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

		if ( this.heightSpeed ) {

			var y = clamp( this.position.y, this.heightMin, this.heightMax ),
				delta = y - this.heightMin;
			
			this.autoSpeedFactor = delta * this.heightCoef;
			
		} else {
				
			this.autoSpeedFactor = 0.0;

		}

		if ( this.moveForward || this.autoForward ) this.translateZ( - ( this.movementSpeed + this.autoSpeedFactor ), this.noFly );
		if ( this.moveBackward ) this.translateZ( this.movementSpeed, this.noFly );
		if ( this.moveLeft ) this.translateX( - this.movementSpeed, this.noFly );
		if ( this.moveRight ) this.translateX( this.movementSpeed, this.noFly );

		this.lon += this.mouseX * this.lookSpeed;
		if( this.lookVertical ) this.lat -= this.mouseY * this.lookSpeed;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = ( 90 - this.lat ) * Math.PI / 180;
		this.theta = this.lon * Math.PI / 180;

		var targetPosition = this.target.position,
			position = this.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.supr.update.call( this );

	};


	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

};

THREE.QuakeCamera.prototype = new THREE.Camera();
THREE.QuakeCamera.prototype.constructor = THREE.QuakeCamera;
THREE.QuakeCamera.prototype.supr = THREE.Camera.prototype;
