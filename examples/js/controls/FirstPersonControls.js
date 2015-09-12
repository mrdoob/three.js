/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

THREE.FirstPersonControls = function ( object, domElement ) {
	var scope = this;

	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.enabled = true;

	this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;

	this.lookVertical = true;
	this.autoForward = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

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

	this.mouseDragOn = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', - 1 );

	}

	//

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	function onMouseDown( event ) {

		if (scope.enabled === false) return;

		if ( scope.domElement !== document ) {

			scope.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( scope.activeLook ) {

			switch ( event.button ) {

				case 0: scope.moveForward = true; break;
				case 2: scope.moveBackward = true; break;

			}

		}

		scope.mouseDragOn = true;

	}

	function onMouseUp( event ) {

		if (scope.enabled === false) return;

		event.preventDefault();
		event.stopPropagation();

		if ( scope.activeLook ) {

			switch ( event.button ) {

				case 0: scope.moveForward = false; break;
				case 2: scope.moveBackward = false; break;

			}

		}

		scope.mouseDragOn = false;

	}

	function onMouseMove( event ) {

		if (scope.enabled === false) return;

		if ( scope.domElement === document ) {

			scope.mouseX = event.pageX - scope.viewHalfX;
			scope.mouseY = event.pageY - scope.viewHalfY;

		} else {

			scope.mouseX = event.pageX - scope.domElement.offsetLeft - scope.viewHalfX;
			scope.mouseY = event.pageY - scope.domElement.offsetTop - scope.viewHalfY;

		}

	}

	function onKeyDown( event ) {

		if (scope.enabled === false) return;

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ scope.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ scope.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ scope.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ scope.moveRight = true; break;

			case 82: /*R*/ scope.moveUp = true; break;
			case 70: /*F*/ scope.moveDown = true; break;

		}

	}

	function onKeyUp( event ) {

		if (scope.enabled === false) return;

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ scope.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ scope.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ scope.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ scope.moveRight = false; break;

			case 82: /*R*/ scope.moveUp = false; break;
			case 70: /*F*/ scope.moveDown = false; break;

		}

	}

	this.update = function( delta ) {

		if ( this.enabled === false ) return;

		if ( this.heightSpeed ) {

			var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;

			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

		} else {

			this.autoSpeedFactor = 0.0;

		}

		var actualMoveSpeed = delta * this.movementSpeed;

		if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
		if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

		if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
		if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

		if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
		if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

		var actualLookSpeed = delta * this.lookSpeed;

		if ( ! this.activeLook ) {

			actualLookSpeed = 0;

		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		this.lon += this.mouseX * actualLookSpeed;
		if ( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );

		this.theta = THREE.Math.degToRad( this.lon );

		if ( this.constrainVertical ) {

			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.object.lookAt( targetPosition );

	};


	function contextmenu( /* event */) {
		event.preventDefault();
	}

	this.enable = function () {

		this.domElement.addEventListener( 'contextmenu', contextmenu, false );

		this.domElement.addEventListener( 'mousemove', onMouseMove, false );
		this.domElement.addEventListener( 'mousedown', onMouseDown, false );
		this.domElement.addEventListener( 'mouseup', onMouseUp, false );

		window.addEventListener( 'keydown', onKeyDown, false );
		window.addEventListener( 'keyup', onKeyUp, false );

	};

	this.disable = function () {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );

		this.domElement.removeEventListener( 'mousemove', onMouseMove, false );
		this.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		this.domElement.removeEventListener( 'mouseup', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );
		window.removeEventListener( 'keyup', onKeyUp, false );

	};

	this.dispose = function() {
	
		this.disable();
		
	};
	
	this.enable();


	this.handleResize();

};
