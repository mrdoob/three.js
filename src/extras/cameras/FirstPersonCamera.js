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
 *
 *  movementBindings.forward <Array>,
 *  movementBindings.reverse <Array>,
 *  movementBindings.strafeLeft <Array>,
 *  movementBindings.strafeRight <Array>,
 *  movementBindings.toggleActiveLook <Array>,
 *  movementBindings.toggleFreezeCamera <Array>,
 *
 *  constrainVertical: <bool>,
 *  verticalMin: <float>,
 *  verticalMax: <float>,

 *  heightSpeed: <bool>,
 *  heightCoef: <float>,
 *  heightMin: <float>,
 *  heightMax: <float>,

 *  domElement: <HTMLElement>,
 * }
 */

THREE.FirstPersonCamera = function ( parameters ) {

	THREE.Camera.call( this, parameters.fov, parameters.aspect, parameters.near, parameters.far, parameters.target );

	this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;

	this.noFly = false;
	this.lookVertical = true;
	this.autoForward = false;

	this.FORWARD = 0;
	this.REVERSE = 1;
	this.STRAFE_LEFT = 2;
	this.STRAFE_RIGHT = 3;
	this.TOGGLE_ACTIVE_LOOK = 4;
	this.TOGGLE_FREEZE_CAMERA = 5;
	this.movementBindings = {
		forward: [38, 87, 0],
		reverse: [40, 83, 2],
		strafeLeft: [37, 65],
		strafeRight: [39, 68],
		toggleActiveLook: [81],
		toggleFreezeCamera: [27]
	}
	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = 3.14;

	this.domElement = document;

	this.lastUpdate = new Date().getTime();
	this.tdiff = 0;

	if ( parameters ) {

		if ( parameters.movementSpeed !== undefined ) this.movementSpeed = parameters.movementSpeed;
		if ( parameters.lookSpeed !== undefined ) this.lookSpeed  = parameters.lookSpeed;
		if ( parameters.noFly !== undefined ) this.noFly = parameters.noFly;
		if ( parameters.lookVertical !== undefined ) this.lookVertical = parameters.lookVertical;

		if ( parameters.autoForward !== undefined ) this.autoForward = parameters.autoForward;

		if ( parameters.movementBindings !== undefined ) {
			if (parameters.movementBindings.forward !== undefined )
				this.movementBindings.forward = parameters.movementBindings.forward;
			if (parameters.movementBindings.revers !== undefined )
				this.movementBindings.reverse = parameters.movementBindings.reverse;
			if (parameters.movementBindings.strafeLeft !== undefined )
				this.movementBindings.strafeLeft = parameters.movementBindings.strafeLeft;
			if (parameters.movementBindings.strafeRight !== undefined )
				this.movementBindings.strafeRight = parameters.movementBindings.strafeRight;
			if (parameters.movementBindings.toggleActiveLook !== undefined )
				this.movementBindings.toggleActiveLook = parameters.movementBindings.toggleActiveLook;
			if (parameters.movementBindings.toggleFreezeCamera !== undefined )
				this.movementBindings.toggleFreezeCamera = parameters.movementBindings.toggleFreezeCamera;  
		}
		
		if ( parameters.activeLook !== undefined ) this.activeLook = parameters.activeLook;

		if ( parameters.heightSpeed !== undefined ) this.heightSpeed = parameters.heightSpeed;
		if ( parameters.heightCoef !== undefined ) this.heightCoef = parameters.heightCoef;
		if ( parameters.heightMin !== undefined ) this.heightMin = parameters.heightMin;
		if ( parameters.heightMax !== undefined ) this.heightMax = parameters.heightMax;

		if ( parameters.constrainVertical !== undefined ) this.constrainVertical = parameters.constrainVertical;
		if ( parameters.verticalMin !== undefined ) this.verticalMin = parameters.verticalMin;
		if ( parameters.verticalMax !== undefined ) this.verticalMax = parameters.verticalMax;

		if ( parameters.domElement !== undefined ) this.domElement = parameters.domElement;

	}

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;

	this.mouseDragOn = false;

	this.windowHalfX = window.innerWidth / 2;
	this.windowHalfY = window.innerHeight / 2;

	var eventBindings = { };
	for ( var i=0; i < this.movementBindings.forward.length; i++ ) {
		eventBindings[this.movementBindings.forward[i]] = this.FORWARD;
	}
	for ( var i=0; i < this.movementBindings.reverse.length; i++ ) {
		eventBindings[this.movementBindings.reverse[i]] = this.REVERSE;
	}
	for ( var i=0; i < this.movementBindings.strafeLeft.length; i++ ) {
		eventBindings[this.movementBindings.strafeLeft[i]] = this.STRAFE_LEFT;
	}
	for ( var i=0; i < this.movementBindings.strafeRight.length; i++ ) {
		eventBindings[this.movementBindings.strafeRight[i]] = this.STRAFE_RIGHT;
	}
	for ( var i=0; i < this.movementBindings.toggleActiveLook.length; i++ ) {
                eventBindings[this.movementBindings.toggleActiveLook[i]] = this.TOGGLE_ACTIVE_LOOK;
        }
        for ( var i=0; i < this.movementBindings.toggleFreezeCamera.length; i++ ) {
		eventBindings[this.movementBindings.toggleFreezeCamera[i]] = this.TOGGLE_FREEZE_CAMERA;
	}

	this.onMouseDown = function ( event ) {
		if (!this.freeze) {
			event.preventDefault();
			event.stopPropagation();
			if ( eventBindings[event.button] !== undefined ) {
				switch ( eventBindings[event.button] ) {
					case this.FORWARD: this.moveForward = true; break;
					case this.REVERSE: this.moveBackward = true; break;
					case this.STRAFE_LEFT: this.moveLeft = true; break;
					case this.STRAFE_RIGHT: this.moveRight = true; break;
					case this.TOGGLE_ACTIVE_LOOK: this.activeLook = !this.activeLook; break;
					case this.TOGGLE_FREEZE_CAMERA: this.freeze = !this.freeze; break;
				};
			}
		}

		this.mouseDragOn = true;

	};

	this.onMouseUp = function ( event ) {
		if (!this.freeze) {
			event.preventDefault();
			event.stopPropagation();
			if ( eventBindings[event.button] !== undefined ) {
				switch ( eventBindings[event.button] ) {
				case this.FORWARD: this.moveForward = false; break;
				case this.REVERSE: this.moveBackward = false; break;
				case this.STRAFE_LEFT: this.moveLeft = false; break;
				case this.STRAFE_RIGHT: this.moveRight = false; break;
				};
			}
		}

		this.mouseDragOn = false;

	};

	this.onMouseMove = function ( event ) {

		this.mouseX = event.clientX - this.windowHalfX;
		this.mouseY = event.clientY - this.windowHalfY;

	};


	this.onKeyDown = function ( event ) {
		switch ( eventBindings[event.keyCode] ) {
			case this.FORWARD: this.moveForward = true; break;
			case this.REVERSE: this.moveBackward = true; break;
			case this.STRAFE_LEFT: this.moveLeft = true; break;
			case this.STRAFE_RIGHT: this.moveRight = true; break;
			case this.TOGGLE_ACTIVE_LOOK: this.activeLook = !this.activeLook; break;
			case this.TOGGLE_FREEZE_CAMERA: this.freeze = !this.freeze; break;
		};
	};

	this.onKeyUp = function ( event ) {
		switch ( eventBindings[event.keyCode] ) {
			case this.FORWARD: this.moveForward = false; break;
			case this.REVERSE: this.moveBackward = false; break;
			case this.STRAFE_LEFT: this.moveLeft = false; break;
			case this.STRAFE_RIGHT: this.moveRight = false; break;                          
		};
	};

	this.update = function() {

		var now = new Date().getTime();
		this.tdiff = ( now - this.lastUpdate ) / 1000;
		this.lastUpdate = now;
		var actualLookSpeed, actualMoveSpeed;	

		if ( !this.freeze ) {

			if ( this.heightSpeed ) {

				var y = clamp( this.position.y, this.heightMin, this.heightMax ),
					delta = y - this.heightMin;

				this.autoSpeedFactor = this.tdiff * ( delta * this.heightCoef );

			} else {

				this.autoSpeedFactor = 0.0;

			}

			actualMoveSpeed = this.tdiff * this.movementSpeed;

			if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
			if ( this.moveBackward ) this.translateZ( actualMoveSpeed );
			if ( this.moveLeft ) this.translateX( - actualMoveSpeed );
			if ( this.moveRight ) this.translateX( actualMoveSpeed );

			actualLookSpeed = this.tdiff * this.lookSpeed;

			if ( !this.activeLook ) {

				actualLookSpeed = 0;

			}

			this.lon += this.mouseX * actualLookSpeed;
                        //alert("lon: "+this.lon+" "+this.mouseX+", "+actualLookSpeed);
			if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed;

			this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
			this.phi = ( 90 - this.lat ) * Math.PI / 180;
			this.theta = this.lon * Math.PI / 180;

			var targetPosition = this.target.position,
				position = this.position;

			targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
			targetPosition.y = position.y + 100 * Math.cos( this.phi );
			targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		}
		else {
			actualMoveSpeed = 0.0;
			actualLookSpeed = 0.0;
		}
               		
		this.lon += this.mouseX * actualLookSpeed;
		if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = ( 90 - this.lat ) * Math.PI / 180;
		this.theta = this.lon * Math.PI / 180;

		if ( this.constrainVertical ) {

			this.phi = map_linear( this.phi, 0, 3.14, this.verticalMin, this.verticalMax );

		}

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

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	function map_linear( x, sa, sb, ea, eb ) {

		return ( x  - sa ) * ( eb - ea ) / ( sb - sa ) + ea;

	};

	function clamp_bottom( x, a ) {

		return x < a ? a : x;

	};

	function clamp( x, a, b ) {

		return x < a ? a : ( x > b ? b : x );

	};

};


THREE.FirstPersonCamera.prototype = new THREE.Camera();
THREE.FirstPersonCamera.prototype.constructor = THREE.FirstPersonCamera;
THREE.FirstPersonCamera.prototype.supr = THREE.Camera.prototype;


THREE.FirstPersonCamera.prototype.translate = function ( distance, axis ) {

	this.matrix.rotateAxis( axis );

	if ( this.noFly ) {

		axis.y = 0;

	}

	this.position.addSelf( axis.multiplyScalar( distance ) );
	this.target.position.addSelf( axis.multiplyScalar( distance ) );

};