/**
 * @author James Baicoianu / http://www.baicoianu.com/
 */

THREE.FlyControls = function ( object, domElement ) {
	var scope = this;

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;
	if ( domElement ) this.domElement.setAttribute( 'tabindex', - 1 );

	// API

	this.movementSpeed = 1.0;
	this.rollSpeed = 0.005;

	this.dragToLook = false;
	this.autoForward = false;

	// disable default target object behavior

	// internals

	this.tmpQuaternion = new THREE.Quaternion();

	this.mouseStatus = 0;

	this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
	this.moveVector = new THREE.Vector3( 0, 0, 0 );
	this.rotationVector = new THREE.Vector3( 0, 0, 0 );

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	function onKeyDown( event ) {

		if (scope.enabled === false) return;

		if ( event.altKey ) {

			return;

		}

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 16: /* shift */ scope.movementSpeedMultiplier = .1; break;

			case 87: /*W*/ scope.moveState.forward = 1; break;
			case 83: /*S*/ scope.moveState.back = 1; break;

			case 65: /*A*/ scope.moveState.left = 1; break;
			case 68: /*D*/ scope.moveState.right = 1; break;

			case 82: /*R*/ scope.moveState.up = 1; break;
			case 70: /*F*/ scope.moveState.down = 1; break;

			case 38: /*up*/ scope.moveState.pitchUp = 1; break;
			case 40: /*down*/ scope.moveState.pitchDown = 1; break;

			case 37: /*left*/ scope.moveState.yawLeft = 1; break;
			case 39: /*right*/ scope.moveState.yawRight = 1; break;

			case 81: /*Q*/ scope.moveState.rollLeft = 1; break;
			case 69: /*E*/ scope.moveState.rollRight = 1; break;

		}

		scope.updateMovementVector();
		scope.updateRotationVector();

	}

	function onKeyUp( event ) {

		if (scope.enabled === false) return;
		
		switch ( event.keyCode ) {

			case 16: /* shift */ scope.movementSpeedMultiplier = 1; break;

			case 87: /*W*/ scope.moveState.forward = 0; break;
			case 83: /*S*/ scope.moveState.back = 0; break;

			case 65: /*A*/ scope.moveState.left = 0; break;
			case 68: /*D*/ scope.moveState.right = 0; break;

			case 82: /*R*/ scope.moveState.up = 0; break;
			case 70: /*F*/ scope.moveState.down = 0; break;

			case 38: /*up*/ scope.moveState.pitchUp = 0; break;
			case 40: /*down*/ scope.moveState.pitchDown = 0; break;

			case 37: /*left*/ scope.moveState.yawLeft = 0; break;
			case 39: /*right*/ scope.moveState.yawRight = 0; break;

			case 81: /*Q*/ scope.moveState.rollLeft = 0; break;
			case 69: /*E*/ scope.moveState.rollRight = 0; break;

		}

		scope.updateMovementVector();
		scope.updateRotationVector();

	}

	function onMouseDown( event ) {

		if (scope.enabled === false) return;

		if ( scope.domElement !== document ) {

			scope.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( scope.dragToLook ) {

			scope.mouseStatus ++;

		} else {

			switch ( event.button ) {

				case 0: scope.moveState.forward = 1; break;
				case 2: scope.moveState.back = 1; break;

			}

			scope.updateMovementVector();

		}
	}

	function onMouseMove( event ) {

		if (scope.enabled === false) return;

		if ( !scope.dragToLook || scope.mouseStatus > 0 ) {

			var container = scope.getContainerDimensions();
			var halfWidth  = container.size[ 0 ] / 2;
			var halfHeight = container.size[ 1 ] / 2;

			scope.moveState.yawLeft   = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth;
			scope.moveState.pitchDown =   ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

			scope.updateRotationVector();

		}
	}

	function onMouseUp( event ) {

		if (scope.enabled === false) return;

		event.preventDefault();
		event.stopPropagation();

		if ( scope.dragToLook ) {

			scope.mouseStatus --;

			scope.moveState.yawLeft = scope.moveState.pitchDown = 0;

		} else {

			switch ( event.button ) {

				case 0: scope.moveState.forward = 0; break;
				case 2: scope.moveState.back = 0; break;

			}

			scope.updateMovementVector();

		}

		scope.updateRotationVector();
	}

	this.update = function( delta ) {

		var moveMult = delta * this.movementSpeed;
		var rotMult = delta * this.rollSpeed;

		this.object.translateX( this.moveVector.x * moveMult );
		this.object.translateY( this.moveVector.y * moveMult );
		this.object.translateZ( this.moveVector.z * moveMult );

		this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
		this.object.quaternion.multiply( this.tmpQuaternion );

		// expose the rotation vector for convenience
		this.object.rotation.setFromQuaternion( this.object.quaternion, this.object.rotation.order );


	};

	this.updateMovementVector = function() {

		var forward = ( this.moveState.forward || ( this.autoForward && ! this.moveState.back ) ) ? 1 : 0;

		this.moveVector.x = ( - this.moveState.left    + this.moveState.right );
		this.moveVector.y = ( - this.moveState.down    + this.moveState.up );
		this.moveVector.z = ( - forward + this.moveState.back );

		//console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

	};

	this.updateRotationVector = function() {

		this.rotationVector.x = ( - this.moveState.pitchDown + this.moveState.pitchUp );
		this.rotationVector.y = ( - this.moveState.yawRight  + this.moveState.yawLeft );
		this.rotationVector.z = ( - this.moveState.rollRight + this.moveState.rollLeft );

		//console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

	};

	this.getContainerDimensions = function() {

		if ( this.domElement != document ) {

			return {
				size	: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
				offset	: [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
			};

		} else {

			return {
				size	: [ window.innerWidth, window.innerHeight ],
				offset	: [ 0, 0 ]
			};

		}

	};

	function contextmenu( /* event */) {
		event.preventDefault();
	};

	this.enable = function () {

		this.domElement.addEventListener('contextmenu', contextmenu, false);

		this.domElement.addEventListener('mousemove', onMouseMove, false);
		this.domElement.addEventListener('mousedown', onMouseDown, false);
		this.domElement.addEventListener('mouseup', onMouseUp, false);

		window.addEventListener('keydown', onKeyDown, false);
		window.addEventListener('keyup', onKeyUp, false);

	};

	this.disable = function () {

		this.domElement.removeEventListener('contextmenu', contextmenu, false);

		this.domElement.removeEventListener('mousemove', onMouseMove, false);
		this.domElement.removeEventListener('mousedown', onMouseDown, false);
		this.domElement.removeEventListener('mouseup', onMouseUp, false);

		window.removeEventListener('keydown', onKeyDown, false);
		window.removeEventListener('keyup', onKeyUp, false);

	};

	this.dispose = function() {
	
		this.disable();
		
	};
	
	this.enable();

	this.updateMovementVector();
	this.updateRotationVector();

};
