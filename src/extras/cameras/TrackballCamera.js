/**
 * @author Eberhard Graether / http://egraether.com/

 * parameters = {
 *	fov: <float>,
 *	aspect: <float>,
 *	near: <float>,
 *	far: <float>,
 *	target: <THREE.Object3D>,

 *	radius: <float>,
 *	screen: { width : <float>, height : <float>, offsetLeft : <float>, offsetTop : <float> },

 *	rotateSpeed: <float>,
 *	zoomSpeed: <float>,
 *	panSpeed: <float>,

 *	noZoom: <bool>,
 *	noPan: <bool>,

 *	staticMoving: <bool>,
 *	dynamicDampingFactor: <float>,

 *	minDistance: <float>,
 *	maxDistance: <float>,

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

	this.rotateSpeed = parameters.rotateSpeed || 1.0;
	this.zoomSpeed = parameters.zoomSpeed || 1.2;
	this.panSpeed = parameters.panSpeed || 0.3;

	this.noZoom = parameters.noZoom || false;
	this.noPan = parameters.noPan || false;

	this.staticMoving = parameters.staticMoving || false;
	this.dynamicDampingFactor = parameters.dynamicDampingFactor || 0.2;

	this.minDistance = parameters.minDistance || 0;
	this.maxDistance = parameters.maxDistance || Infinity;

	this.keys = parameters.keys || [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

	this.useTarget = true;


	//internals

	var _keyPressed = false,
	_state = this.STATE.NONE,

	_eye = new THREE.Vector3(),

	_rotateStart = new THREE.Vector3(),
	_rotateEnd = new THREE.Vector3(),

	_zoomStart = new THREE.Vector2(),
	_zoomEnd = new THREE.Vector2(),

	_panStart = new THREE.Vector2(),
	_panEnd = new THREE.Vector2();


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

		_eye = this.position.clone().subSelf( this.target.position );

		var projection = this.up.clone().setLength( mouseOnBall.y );
		projection.addSelf( this.up.clone().crossSelf( _eye ).setLength( mouseOnBall.x ) );
		projection.addSelf( _eye.setLength( mouseOnBall.z ) );

		return projection;

	};

	this.rotateCamera = function() {

		var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );

		if ( angle ) {

			var axis = (new THREE.Vector3()).cross( _rotateStart, _rotateEnd ).normalize(),
			quaternion = new THREE.Quaternion();

			angle *= this.rotateSpeed;

			quaternion.setFromAxisAngle( axis, -angle );

			quaternion.multiplyVector3( _eye );
			quaternion.multiplyVector3( this.up );

			quaternion.multiplyVector3( _rotateEnd );

			if ( this.staticMoving ) {

				_rotateStart = _rotateEnd;

			} else {

				quaternion.setFromAxisAngle( axis, angle * ( this.dynamicDampingFactor - 1.0 ) );
				quaternion.multiplyVector3( _rotateStart );

			}

		}

	};

	this.zoomCamera = function() {

		var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * this.zoomSpeed;

		if ( factor !== 1.0 && factor > 0.0 ) {

			_eye.multiplyScalar( factor );

			if ( this.staticMoving ) {

				_zoomStart = _zoomEnd;

			} else {

				_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

			}

		}

	};

	this.panCamera = function() {

		var mouseChange = _panEnd.clone().subSelf( _panStart );

		if ( mouseChange.lengthSq() ) {

			mouseChange.multiplyScalar( _eye.length() * this.panSpeed );

			var pan = _eye.clone().crossSelf( this.up ).setLength( mouseChange.x );
			pan.addSelf( this.up.clone().setLength( mouseChange.y ) );

			this.position.addSelf( pan );
			this.target.position.addSelf( pan );

			if ( this.staticMoving ) {

				_panStart = _panEnd;

			} else {

				_panStart.addSelf( mouseChange.sub( _panEnd, _panStart ).multiplyScalar( this.dynamicDampingFactor ) );

			}

		}

	};

	this.checkDistances = function() {

		if ( !this.noZoom || !this.noPan ) {

			if ( this.position.lengthSq() > this.maxDistance * this.maxDistance ) {

				this.position.setLength( this.maxDistance );

			}

			if ( _eye.lengthSq() < this.minDistance * this.minDistance ) {

				this.position.add( this.target.position, _eye.setLength( this.minDistance ) );

			}

		}

	};

	this.update = function( parentMatrixWorld, forceUpdate, camera ) {

		_eye = this.position.clone().subSelf( this.target.position ),

		this.rotateCamera();

		if ( !this.noZoom ) {

			this.zoomCamera();

		}

		if ( !this.noPan ) {

			this.panCamera();

		}

		this.position.add( this.target.position, _eye );

		this.checkDistances();

		this.supr.update.call( this, parentMatrixWorld, forceUpdate, camera );

	};


	// listeners

	function keydown( event ) {

		if ( _state !== this.STATE.NONE ) {

			return;

		} else if ( event.keyCode === this.keys[ this.STATE.ROTATE ] ) {

			_state = this.STATE.ROTATE;

		} else if ( event.keyCode === this.keys[ this.STATE.ZOOM ] && !this.noZoom ) {

			_state = this.STATE.ZOOM;

		} else if ( event.keyCode === this.keys[ this.STATE.PAN ] && !this.noPan ) {

			_state = this.STATE.PAN;

		}

		if ( _state !== this.STATE.NONE ) {

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

				_rotateStart = _rotateEnd = this.getMouseProjectionOnBall( event.clientX, event.clientY );

			} else if ( _state === this.STATE.ZOOM && !this.noZoom ) {

				_zoomStart = _zoomEnd = this.getMouseOnScreen( event.clientX, event.clientY );

			} else if ( !this.noPan ) {

				_panStart = _panEnd = this.getMouseOnScreen( event.clientX, event.clientY );

			}

		}

	};

	function mousemove( event ) {

		if ( _keyPressed ) {

			_rotateStart = _rotateEnd = this.getMouseProjectionOnBall( event.clientX, event.clientY );
			_zoomStart = _zoomEnd = this.getMouseOnScreen( event.clientX, event.clientY );
			_panStart = _panEnd = this.getMouseOnScreen( event.clientX, event.clientY );

			_keyPressed = false;

		}

		if ( _state === this.STATE.NONE ) {

			return;

		} else if ( _state === this.STATE.ROTATE ) {

			_rotateEnd = this.getMouseProjectionOnBall( event.clientX, event.clientY );

		} else if ( _state === this.STATE.ZOOM && !this.noZoom ) {

			_zoomEnd = this.getMouseOnScreen( event.clientX, event.clientY );

		} else if ( _state === this.STATE.PAN && !this.noPan ) {

			_panEnd = this.getMouseOnScreen( event.clientX, event.clientY );

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
