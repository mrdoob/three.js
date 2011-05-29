/**
 * @author Eberhard Gräther / http://egraether.com/

 * parameters = {
 *	fov: <float>,
 *	aspect: <float>,
 *	near: <float>,
 *	far: <float>,
 *	target: <THREE.Object3D>,

 *	radius: <float>,
 *	screen: { width : <float>, height : <float>, offsetLeft : <float>, offsetTop : <float> },

 *	zoomSpeed: <float>,
 *	panSpeed: <float>,

 *	noZoom: <bool>,
 *	noPan: <bool>,

 *	keys: <Array>, // [ rotateKey, zoomKey, panKey ],

 *	domElement: <HTMLElement>,
 * }
 */

THREE.TrackballCamera = function ( parameters ) {

	// target.position is modified when panning

	parameters = parameters || {};

	THREE.Camera.call( this, parameters.fov, parameters.aspect, parameters.near, parameters.far, parameters.target );

	this.domElement = parameters.domElement || document;

	this.screen = parameters.screen || { width : window.innerWidth, height : window.innerHeight, offsetLeft : 0, offsetTop : 0 };
	this.radius = parameters.radius || ( this.screen.width + this.screen.height ) / 4;

	this.zoomSpeed = parameters.zoomSpeed || 1.5;
	this.panSpeed = parameters.panSpeed || 0.3;

	this.noZoom = parameters.noZoom || false;
	this.noPan = parameters.noPan || false;

	this.keys = parameters.keys || [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

	this.useTarget = true;


	//internals

	var _keyPressed = false,
	
	_state = this.STATE.NONE,
	
	_mouse = new THREE.Vector2(),
	
	_start = new THREE.Vector3(),
	_end = new THREE.Vector3();


	// methods

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	this.getMouseOnScreen = function( clientX, clientY ) {

		return new THREE.Vector2(
			( clientX - this.screen.offsetLeft ) / this.radius * 0.5,
			( clientY - this.screen.offsetTop ) / this.radius * 0.5
		);

	};

	this.getMouseProjectionOnBall = function( clientX, clientY ) {

		var mouseOnBall = new THREE.Vector3(
			( clientX - this.screen.width * 0.5 - this.screen.offsetLeft ) / this.radius,
			( this.screen.height * 0.5 + this.screen.offsetTop - clientY ) / this.radius,
			0.0
		);

		var length = mouseOnBall.length();

		if ( length > 1.0 ) {

			mouseOnBall.normalize();

		} else {

			mouseOnBall.z = Math.sqrt( 1.0 - length * length );

		}

		var projection = this.up.clone().setLength( mouseOnBall.y );
		projection.addSelf( this.up.clone().crossSelf( this.position ).setLength( mouseOnBall.x ) );
		projection.addSelf( this.position.clone().setLength( mouseOnBall.z ) );

		return projection;

	};

	this.rotateCamera = function( clientX, clientY ) {

		_end = this.getMouseProjectionOnBall( clientX, clientY );

		var angle = Math.acos( _start.dot( _end ) / _start.length() / _end.length() );

		if ( angle ) {

			var axis = (new THREE.Vector3()).cross( _end, _start ).normalize(),
			quaternion = new THREE.Quaternion();

			quaternion.setFromAxisAngle( axis, angle );

			quaternion.multiplyVector3( this.position );
			quaternion.multiplyVector3( this.up );

			// quaternion.setFromAxisAngle( axis, angle * -0.1 );
			// quaternion.multiplyVector3( _start );

		}

	};

	this.zoomCamera = function( clientX, clientY ) {

		var newMouse = this.getMouseOnScreen( clientX, clientY ),
		eye = this.position.clone().subSelf( this.target.position ),
		factor = 1.0 + ( newMouse.y - _mouse.y ) * this.zoomSpeed;

		if ( factor > 0.0 ) {

			this.position.add( this.target.position, eye.multiplyScalar( factor ) );
			_mouse = newMouse;

		}

	};

	this.panCamera = function( clientX, clientY ) {

		var newMouse = this.getMouseOnScreen( clientX, clientY ),
		mouseChange = newMouse.clone().subSelf( _mouse ),
		factor = this.position.distanceTo( this.target.position ) * this.panSpeed;

		mouseChange.multiplyScalar( factor );

		var pan = this.position.clone().crossSelf( this.up ).setLength( mouseChange.x );
		pan.addSelf( this.up.clone().setLength( mouseChange.y ) );

		this.position.addSelf( pan );
		this.target.position.addSelf( pan );

		_mouse = newMouse;

	};
	
	// this.update = function( parentMatrixWorld, forceUpdate, camera ) {
	// 
	// 	this.rotateCamera();
	// 
	// 	this.supr.update.call( this, parentMatrixWorld, forceUpdate, camera );
	// 
	// };

	// listeners

	function keydown( event ) {

		if ( _state !== this.STATE.NONE ) {

			return;

		} else if ( event.keyCode === this.keys[ this.STATE.ROTATE ] ) {

			_state = this.STATE.ROTATE;
			_keyPressed = true;

		} else if ( event.keyCode === this.keys[ this.STATE.ZOOM ] ) {

			_state = this.STATE.ZOOM;
			_keyPressed = true;

		} else if ( event.keyCode === this.keys[ this.STATE.PAN ] ) {

			_state = this.STATE.PAN;
			_keyPressed = true;

		}

	};

	function keyup( event ) {

		if ( _state !== this.STATE.NONE ) {

			_state = this.STATE.NONE;

		}

	};

	function mousedown(event) {

		event.preventDefault();
		event.stopPropagation();

		if ( _state === this.STATE.NONE ) {

			_state = event.button;

			if ( _state === this.STATE.ROTATE ) {

				_start = this.getMouseProjectionOnBall( event.clientX, event.clientY );

			} else {

				_mouse = this.getMouseOnScreen( event.clientX, event.clientY );

			}

		}

	};

	function mousemove( event ) {

		if ( _keyPressed ) {

			_start = this.getMouseProjectionOnBall( event.clientX, event.clientY );
			_mouse = this.getMouseOnScreen( event.clientX, event.clientY );

			_keyPressed = false;

		}

		if ( _state === this.STATE.NONE ) {

			return;

		} else if ( _state === this.STATE.ROTATE ) {

			// _end = this.getMouseProjectionOnBall( event.clientX, event.clientY );

			this.rotateCamera( event.clientX, event.clientY );

		} else if ( _state === this.STATE.ZOOM && !this.noZoom ) {

			this.zoomCamera( event.clientX, event.clientY );

		} else if ( _state === this.STATE.PAN && !this.noPan ) {

			this.panCamera( event.clientX, event.clientY );

		}

	};

	function mouseup( event ) {

		event.preventDefault();
		event.stopPropagation();

		_state = this.STATE.NONE;

	};
	
	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousemove', bind( this, mousemove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, mousedown ), false );
	this.domElement.addEventListener( 'mouseup',   bind( this, mouseup ), false );

	window.addEventListener( 'keydown', bind( this, keydown ), false );
	window.addEventListener( 'keyup',   bind( this, keyup ), false );

};

THREE.TrackballCamera.prototype = new THREE.Camera();
THREE.TrackballCamera.prototype.constructor = THREE.TrackballCamera;
THREE.TrackballCamera.prototype.supr = THREE.Camera.prototype;

THREE.TrackballCamera.prototype.STATE = { NONE : -1, ROTATE : 0, ZOOM : 1, PAN : 2 };
