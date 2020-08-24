console.warn( "THREE.FirstPersonControls: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/#manual/en/introduction/Installation." );

THREE.FirstPersonControls = function ( object, domElement ) {

	if ( domElement === undefined ) {

		console.warn( 'THREE.FirstPersonControls: The second parameter "domElement" is now mandatory.' );
		domElement = document;

	}

	this.object = object;
	this.domElement = domElement;

	// API

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

	this.mouseDragOn = false;

	// internals

	this.autoSpeedFactor = 0.0;

	this.pointerX = 0;
	this.pointerY = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	// private variables

	var lat = 0;
	var lon = 0;

	var lookDirection = new THREE.Vector3();
	var spherical = new THREE.Spherical();
	var target = new THREE.Vector3();

	//

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

	this.onPointerDown = function ( event ) {

		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;

			}

		}

		this.mouseDragOn = true;

	};

	this.onPointerUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;

			}

		}

		this.mouseDragOn = false;

	};

	this.onPointerMove = function ( event ) {

		if ( this.domElement === document ) {

			this.pointerX = event.pageX - this.viewHalfX;
			this.pointerY = event.pageY - this.viewHalfY;

		} else {

			this.pointerX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.pointerY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}

	};

	this.onKeyDown = function ( event ) {

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;

		}

	};

	this.lookAt = function ( x, y, z ) {

		if ( x.isVector3 ) {

			target.copy( x );

		} else {

			target.set( x, y, z );

		}

		this.object.lookAt( target );

		setOrientation( this );

		return this;

	};

	this.update = function () {

		var targetPosition = new THREE.Vector3();

		return function update( delta ) {

			if ( this.enabled === false ) return;

			if ( this.heightSpeed ) {

				var y = THREE.MathUtils.clamp( this.object.position.y, this.heightMin, this.heightMax );
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

			lon -= this.pointerX * actualLookSpeed;
			if ( this.lookVertical ) lat -= this.pointerY * actualLookSpeed * verticalLookRatio;

			lat = Math.max( - 85, Math.min( 85, lat ) );

			var phi = THREE.MathUtils.degToRad( 90 - lat );
			var theta = THREE.MathUtils.degToRad( lon );

			if ( this.constrainVertical ) {

				phi = THREE.MathUtils.mapLinear( phi, 0, Math.PI, this.verticalMin, this.verticalMax );

			}

			var position = this.object.position;

			targetPosition.setFromSphericalCoords( 1, phi, theta ).add( position );

			this.object.lookAt( targetPosition );

		};

	}();

	function contextmenu( event ) {

		event.preventDefault();

	}

	this.dispose = function () {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'pointerdown', _onPointerDown, false );
		this.domElement.removeEventListener( 'pointermove', _onPointerMove, false );
		this.domElement.removeEventListener( 'pointerup', _onPointerUp, false );

		window.removeEventListener( 'keydown', _onKeyDown, false );
		window.removeEventListener( 'keyup', _onKeyUp, false );

	};

	var _onPointerMove = bind( this, this.onPointerMove );
	var _onPointerDown = bind( this, this.onPointerDown );
	var _onPointerUp = bind( this, this.onPointerUp );
	var _onKeyDown = bind( this, this.onKeyDown );
	var _onKeyUp = bind( this, this.onKeyUp );

	this.domElement.addEventListener( 'contextmenu', contextmenu, false );
	this.domElement.addEventListener( 'pointerdown', _onPointerDown, false );
	this.domElement.addEventListener( 'pointermove', _onPointerMove, false );
	this.domElement.addEventListener( 'pointerup', _onPointerUp, false );

	window.addEventListener( 'keydown', _onKeyDown, false );
	window.addEventListener( 'keyup', _onKeyUp, false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	}

	function setOrientation( controls ) {

		var quaternion = controls.object.quaternion;

		lookDirection.set( 0, 0, - 1 ).applyQuaternion( quaternion );
		spherical.setFromVector3( lookDirection );

		lat = 90 - THREE.MathUtils.radToDeg( spherical.phi );
		lon = THREE.MathUtils.radToDeg( spherical.theta );

	}

	this.handleResize();

	setOrientation( this );

};
