/**
 * @author mrdoob / http://mrdoob.com/
 * - with some improvements from Lukas Wyporek ( http://lukashp.pl )
 */

THREE.PointerLockControls = function ( camera ) {
  // Constants
  var DEFAULT_GRAVITY_FACTOR = 0.50;
  var DEFAULT_MASS_FACTOR = 0.70;
  var DEFAULT_JUMP_VELOCITY = 2;
  var DEFAULT_CAMERA_ALTITUDE = 10;
  // End: constants

	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = DEFAULT_CAMERA_ALTITUDE;
	yawObject.add( pitchObject );

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var canJump = false;

	var isOnObject = false;
	var flyMode = false;
	var jumpingOn = false;

  var gravityFactor = DEFAULT_GRAVITY_FACTOR;  
  var massFactor = DEFAULT_MASS_FACTOR;
  var jumpVelocity = DEFAULT_JUMP_VELOCITY;
  var cameraAltitude = DEFAULT_CAMERA_ALTITUDE;
 
  var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;
	var _2_PI = 2*Math.PI; // sorry - variable name can't begin from digit

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

  
	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
        if ((jumpingOn)&&(!flyMode))
        {
          if ( canJump === true ) velocity.y += jumpVelocity;
          canJump = false;
        }
				break;

		}

	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // a
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

		}

	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getObject = function () {
		return yawObject;
	};

	this.isOnObject = function ( boolean ) {
		isOnObject = boolean;
		canJump = boolean;
	};

	this.getDirection = function() {
		// assumes the camera itself is not rotated
		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {
			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );
			v.copy( direction ).applyEuler( rotation );
			return v;
		}

	}();

	this.update = function ( delta ) {

		if ( scope.enabled === false ) return;
		delta *= 0.1;
		
		// Deacceleration (resistance)
		velocity.x += ( - velocity.x ) * massFactor * delta;
		velocity.z += ( - velocity.z ) * massFactor * delta;
		velocity.y += ( - velocity.y ) * massFactor * delta;


		if ( moveForward ) velocity.z -= massFactor * delta;
		if ( moveBackward ) velocity.z += massFactor * delta;

		if ( moveLeft ) velocity.x -= massFactor * delta;
		if ( moveRight ) velocity.x += massFactor * delta;

    if (flyMode)
    { // now we can change our altitude moves mouse's cursor up and down
      // if we have pressed forward key and mouse in up direction, we're increasing altitude, but if we have pressed backward key and mouse in up direction, we're decreasing alitude, so... let's define scalar which can be only 1 xor -1. Sign `+` (unary operator +) before variable name or bracket converts Boolean to Integer. Don't remove it :)
      var multiplyScalar = (+(moveForward^moveBackward)) * ((+moveForward)-1*(+moveBackward));
      velocity.y += multiplyScalar*(pitchObject.rotation.x * delta);
    }else
    {
      velocity.y -= gravityFactor * delta;    
    }

		if ( isOnObject === true ) {
			velocity.y = Math.max( 0, velocity.y );
		}

		yawObject.translateX( velocity.x );
		yawObject.translateY( velocity.y ); 
		yawObject.translateZ( velocity.z );

		if (( yawObject.position.y < cameraAltitude )&&(!flyMode)) {
			velocity.y = 0;
			yawObject.position.y = cameraAltitude;
      
			canJump = true;
		}

	};
	
  this.getCameraPosition = function () {
    return yawObject.position;
  }
  this.getCameraRotation = function () {
    var tmpVexctor3 = new THREE.Vector3();
    tmpVexctor3.x = pitchObject.rotation.x%(_2_PI);
    tmpVexctor3.y = yawObject.rotation.y%(_2_PI);
    tmpVexctor3.z = 0;
    return tmpVexctor3;
  }

  this.setMassFactor = function(_massFactor){
    if (_massFactor===null) _massFactor = DEFAULT_MASS_FACTOR;
    massFactor = parseFloat(_massFactor);
  }
  this.getMassFactor = function(){
    return massFactor;
  }
  
  this.setGravityFactor = function (_gravityFactor){
    if (_gravityFactor===null) gravityFactor = DEFAULT_GRAVITY_FACTOR;
    gravityFactor = _gravityFactor;
  }
  this.getGravityFactor = function (){
    return gravityFactor;
  }
  
  // Returns THREE.Vector3
  this.getVelocity = function (){
    return velocity;
  }  
  
  this.setFlyMode = function (_flyMode){
    //this.setGravity(0.0);
    flyMode = Boolean(_flyMode);
  }  
  this.getFlyMode = function(){
    return flyMode;
  }

  this.setJumping = function (_jumpingOn){
    jumpingOn = Boolean(_jumpingOn); // data filtration to bool only
  }
  this.getJumping = function (){
    return jumpingOn;
  }

  this.setJumpVelocity = function(_jumpVelocity){
    if (_jumpVelocity===null) _jumpVelocity = DEFAULT_JUMP_VELOCITY;
    jumpVelocity = parseFloat(_jumpVelocity);
  }
  this.getJumpVelocity = function(){
    return jumpVelocity;
  }

  this.setCameraAltitude = function(_cameraAltitude){
    if (_cameraAltitude===null) _cameraAltitude = DEFAULT_CAMERA_ALTITUDE;
    _cameraAltitude = parseFloat(_cameraAltitude);
    yawObject.position.y = _cameraAltitude;
  }
  this.getCameraAltitude = function(){
    return cameraAltitude;
  }
};
