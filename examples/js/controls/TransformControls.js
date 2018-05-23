/**
 * @author arodic / https://github.com/arodic
 */

THREE.TransformControls = function ( camera, domElement ) {

	// TODO: Make non-uniform scale and rotate play nice in hierarchies
	// TODO: prevent infinite horizon translate

	THREE.Object3D.call( this );

	domElement = ( domElement !== undefined ) ? domElement : document;

	this.visible = false;

	var _gizmo = new THREE.TransformControlsGizmo();
	this.add( _gizmo );

	var _plane = new THREE.TransformControlsPlane();
	this.add( _plane );

	var scope = this;

	defineProperty( "camera", camera );
	defineProperty( "object", undefined );
	defineProperty( "axis", null );
	defineProperty( "mode", "translate" );
	defineProperty( "translationSnap", null );
	defineProperty( "rotationSnap", null );
	defineProperty( "space", "world" );
	defineProperty( "size", 1 );

	scope.dragging = false;

	var changeEvent = { type: "change" };
	var mouseDownEvent = { type: "mouseDown" };
	var mouseUpEvent = { type: "mouseUp", mode: scope.mode };
	var objectChangeEvent = { type: "objectChange" };

	var ray = new THREE.Raycaster();
	var pointerVector = new THREE.Vector2();

	var point = new THREE.Vector3();
	var offset = new THREE.Vector3();

	var rotation = new THREE.Vector3();
	var offsetRotation = new THREE.Vector3();

	var lookAtMatrix = new THREE.Matrix4();
	var _eye = new THREE.Vector3();

	var _tempMatrix = new THREE.Matrix4();
	var _tempVector = new THREE.Vector3();
	var _tempQuaternion = new THREE.Quaternion();
	var _unitX = new THREE.Vector3( 1, 0, 0 );
	var _unitY = new THREE.Vector3( 0, 1, 0 );
	var _unitZ = new THREE.Vector3( 0, 0, 1 );
	var _identityEuler = new THREE.Euler();

	// var oldPosition = new THREE.Vector3();
	// var oldScale = new THREE.Vector3();
	// var oldRotationMatrix = new THREE.Matrix4();
	var _worldRotationStart = new THREE.Quaternion();
	var _worldPositionStart = new THREE.Vector3();
	var _worldPointStart = new THREE.Vector3();
	var _localPointStart = new THREE.Vector3();
	var _localScale = new THREE.Vector3();
	var _localPoint = new THREE.Vector3();
	var _worldPoint = new THREE.Vector3();
	var _worldShift = new THREE.Vector3();
	var _localShift = new THREE.Vector3();
	var _worldCross = new THREE.Vector3();
	var _localCross = new THREE.Vector3();
	var _worldQuaternion = new THREE.Quaternion();
	var _localQuaternion = new THREE.Quaternion();

	var _worldPosition = new THREE.Vector3();
	var _worldRotation = new THREE.Euler();

	var alignVector = new THREE.Vector3();
	var _positionStart = new THREE.Vector3();
	var _quaternionStart = new THREE.Quaternion();
	var _scaleStart = new THREE.Vector3();

	domElement.addEventListener( "mousedown", onPointerDown, false );
	domElement.addEventListener( "touchstart", onPointerDown, false );
	domElement.addEventListener( "mousemove", onPointerHover, false );
	domElement.addEventListener( "touchmove", onPointerHover, false );
	domElement.addEventListener( "mousemove", onPointerMove, false );
	domElement.addEventListener( "touchmove", onPointerMove, false );
	domElement.addEventListener( "mouseup", onPointerUp, false );
	domElement.addEventListener( "mouseleave", onPointerUp, false );
	domElement.addEventListener( "mouseout", onPointerUp, false );
	domElement.addEventListener( "touchend", onPointerUp, false );
	domElement.addEventListener( "touchcancel", onPointerUp, false );
	domElement.addEventListener( "touchleave", onPointerUp, false );
	domElement.addEventListener( "contextmenu", onContext, false );

	this.dispose = function () {

		domElement.removeEventListener( "mousedown", onPointerDown );
		domElement.removeEventListener( "touchstart", onPointerDown );
		domElement.removeEventListener( "mousemove", onPointerHover );
		domElement.removeEventListener( "touchmove", onPointerHover );
		domElement.removeEventListener( "mousemove", onPointerMove );
		domElement.removeEventListener( "touchmove", onPointerMove );
		domElement.removeEventListener( "mouseup", onPointerUp );
		domElement.removeEventListener( "mouseleave", onPointerUp );
		domElement.removeEventListener( "mouseout", onPointerUp );
		domElement.removeEventListener( "touchend", onPointerUp );
		domElement.removeEventListener( "touchcancel", onPointerUp );
		domElement.removeEventListener( "touchleave", onPointerUp );
		domElement.removeEventListener( "contextmenu", onContext );

	};

	this.attach = function ( object ) {

		this.object = object;
		this.visible = true;

	};

	this.detach = function () {

		this.object = undefined;
		this.visible = false;
		this.axis = null;

	};

	function defineProperty( propName, defaultValue ) {

		var propValue = defaultValue;

		Object.defineProperty( scope, propName, {

			get: function() {

				return propValue !== undefined ? propValue : defaultValue;

			},

			set: function( value ) {

				if ( propValue !== value ) {

					propValue = value;

					scope.dispatchEvent( changeEvent );

				}

			}

		});

		scope[ propName ] = defaultValue;

	}

	this.updateMatrixWorld = function () {

		if ( this.object === undefined ) return;

		if ( this.mode === 'scale') this.space = 'local';

		// camera.updateMatrixWorld();
		// this.object.updateMatrixWorld();

		_worldPosition.setFromMatrixPosition( this.object.matrixWorld );
		_worldRotation.setFromRotationMatrix( _tempMatrix.extractRotation( this.object.matrixWorld ) );

		this.position.copy( _worldPosition );

		if ( camera instanceof THREE.PerspectiveCamera ) {

			_eye.setFromMatrixPosition( camera.matrixWorld ).sub( _worldPosition ).normalize();

		} else if ( camera instanceof THREE.OrthographicCamera ) {

			_eye.setFromMatrixPosition( camera.matrixWorld ).normalize();

		}

		// TODO
		this._worldPosition = _worldPosition;
		this._worldRotation = _worldRotation;
		this._eye = _eye;

		var scale = _worldPosition.distanceTo( _tempVector.setFromMatrixPosition( camera.matrixWorld ) ) / 6 * this.size;
		this.scale.set( scale, scale, scale );

		THREE.Object3D.prototype.updateMatrixWorld.call( this );

	};

	function onContext( event ) {

		event.preventDefault();

	}

	function onPointerHover( event ) {

		if ( scope.object === undefined || scope.dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

		var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

		var intersect = intersectObjects( pointer, _gizmo.picker[ scope.mode ].children );

		if ( intersect ) {

			scope.axis = intersect.object.name;

			event.preventDefault();

		} else {

			scope.axis = null;

		}

	}

	function onPointerDown( event ) {

		if ( scope.object === undefined || scope.dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

		var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

		if ( pointer.button === 0 || pointer.button === undefined ) {

			var intersect = intersectObjects( pointer, _gizmo.picker[ scope.mode ].children );

			if ( intersect ) {

				event.preventDefault();
				event.stopPropagation();

				scope.axis = intersect.object.name;

				_plane.update( scope.space === "local" ? _worldRotation : _identityEuler, _eye );

				var planeIntersect = intersectObjects( pointer, [ _plane ] );

				if ( planeIntersect ) {

					_positionStart.copy( scope.object.position );
					_quaternionStart.copy( scope.object.quaternion );
					_scaleStart.copy( scope.object.scale );

					_worldRotationStart.setFromRotationMatrix( scope.object.matrixWorld );
					_worldPositionStart.setFromMatrixPosition( scope.object.matrixWorld );

					_worldPointStart.copy( planeIntersect.point ).sub( _worldPositionStart );
					_localPointStart.copy( _worldPointStart ).applyQuaternion( _worldRotationStart.clone().inverse() );

				}

			} else {

				scope.axis = null;

			}

		}

		scope.dragging = true;

	}

	function onPointerMove( event ) {

		var axis = scope.axis;
		var mode = scope.mode;
		var object = scope.object;
		var space = scope.space;

		if ( object === undefined || axis === null || scope.dragging === false || ( event.button !== undefined && event.button !== 0 ) ) return;

		var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

		var planeIntersect = intersectObjects( pointer, [ _plane ] );

		if ( planeIntersect === false ) return;

		event.preventDefault();
		event.stopPropagation();

		_worldPoint.copy( planeIntersect.point ).sub( _worldPositionStart );
		_worldShift.subVectors( _worldPoint, _worldPointStart );

		_localPoint.copy( _worldPoint );
		_localPoint.applyQuaternion( _worldRotationStart.clone().inverse() );
		_localShift.subVectors( _localPoint, _localPointStart );
		_worldCross.copy( _worldPoint ).cross( _worldPointStart );
		_localCross.copy( _localPoint ).cross( _localPointStart );

		if ( mode === 'translate' ) {

			if ( axis.search( 'X' ) === -1 ) {
				_worldShift.x = 0;
				_localShift.x = 0;
			}
			if ( axis.search( 'Y' ) === -1 ) {
				_worldShift.y = 0;
				_localShift.y = 0;
			}
			if ( axis.search( 'Z' ) === -1 ) {
				_worldShift.z = 0;
				_localShift.z = 0;
			}

			// Apply translate

			if ( space === 'local' ) {
				object.position.copy(_localShift).applyQuaternion( _quaternionStart );
			} else {
				object.position.copy( _worldShift );
			}

			object.position.add( _positionStart );

			if ( scope.translationSnap ) {

				if ( space === 'local' ) {

					object.position.applyQuaternion(_tempQuaternion.copy( _quaternionStart ).inverse() );

					if ( axis.search( 'X' ) !== -1 ) {
						object.position.x = Math.round( object.position.x / scope.translationSnap ) * scope.translationSnap;
					}

					if ( axis.search( 'Y' ) !== -1 ) {
						object.position.y = Math.round( object.position.y / scope.translationSnap ) * scope.translationSnap;
					}

					if ( axis.search( 'Z' ) !== -1 ) {
						object.position.z = Math.round( object.position.z / scope.translationSnap ) * scope.translationSnap;
					}

					object.position.applyQuaternion( _quaternionStart );

				}

				if ( space === 'world' ) {

					if ( object.parent ) {
						object.position.add( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );
					}

					if ( axis.search( 'X' ) !== -1 ) {
						object.position.x = Math.round( object.position.x / scope.translationSnap ) * scope.translationSnap;
					}

					if ( axis.search( 'Y' ) !== -1 ) {
						object.position.y = Math.round( object.position.y / scope.translationSnap ) * scope.translationSnap;
					}

					if ( axis.search( 'Z' ) !== -1 ) {
						object.position.z = Math.round( object.position.z / scope.translationSnap ) * scope.translationSnap;
					}

					if ( object.parent ) {
						object.position.sub( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );
					}

				}

			}

		} else if ( mode === 'scale' ) {

			if ( axis === 'XYZ' ) {

				_localScale.set( _worldShift.y / 50, _worldShift.y / 50, _worldShift.y / 50 ).addScalar( 1 );

			} else {

				_localScale.set(
					axis.search( 'X' ) !== -1 ? _localShift.x / 100 : 0,
					axis.search( 'Y' ) !== -1 ? _localShift.y / 100 : 0,
					axis.search( 'Z' ) !== -1 ? _localShift.z / 100 : 0
				).addScalar( 1 );

			}

			// Apply scale

			object.scale.copy( _scaleStart ).multiply( _localScale );

		} else if ( mode === 'rotate' ) {

			if ( axis === 'E' ) {

				_localCross.applyQuaternion( _worldRotationStart ).normalize();
				direction = _localCross.dot( _eye ) < 0 ? 1 : -1;
				_worldQuaternion.setFromAxisAngle( _eye, _localPoint.angleTo( _localPointStart ) * direction );

			} else if ( axis === 'XYZE' ) {

				// TODO: not working
				// _tempVector.copy( _worldShift ).cross( _eye ).normalize();
				// _worldQuaternion.setFromAxisAngle( _tempVector, -2 * offset.length() );

			} else {

				var rotation = scope.space === "local" ? _worldRotation : _identityEuler;

				// TODO: make rotation speed relative to pointer movement in view space.
				var LINEAR_ROTATION_SPEED = 0.005;

				if ( axis === 'X' ) {

					alignVector.set( 1, 0, 0 ).applyEuler( rotation );

					if ( Math.abs( alignVector.dot( _eye ) ) > 0.3 ) {

						_localQuaternion.setFromAxisAngle( _unitX, _localPoint.angleTo( _localPointStart ) * ( _localCross.x > 0 ? -1 : 1 ) );
						_worldQuaternion.setFromAxisAngle( _unitX, _worldPoint.angleTo( _worldPointStart ) * ( _worldCross.x > 0 ? -1 : 1 ) );

          } else {

						_localQuaternion.setFromAxisAngle( _unitX, _worldPoint.sub( _worldPointStart ).dot( _unitX.clone().applyQuaternion( _worldRotationStart ).cross( _eye ) ) * LINEAR_ROTATION_SPEED );
						_worldQuaternion.setFromAxisAngle( _unitX, _worldPoint.sub( _worldPointStart ).dot( _unitX.clone().cross( _eye ) ) * LINEAR_ROTATION_SPEED );

          }

				} else if ( axis === 'Y' ) {

					alignVector.set( 0, 1, 0 ).applyEuler( rotation );

					if ( Math.abs( alignVector.dot( _eye ) ) > 0.3 ) {

						_localQuaternion.setFromAxisAngle( _unitY, _localPoint.angleTo( _localPointStart ) * ( _localCross.y > 0 ? -1 : 1 ) );
						_worldQuaternion.setFromAxisAngle( _unitY, _worldPoint.angleTo( _worldPointStart ) * ( _worldCross.y > 0 ? -1 : 1 ) );

          } else {

						_localQuaternion.setFromAxisAngle( _unitY, _worldPoint.sub( _worldPointStart ).dot( _unitY.clone().applyEuler( rotation ).cross( _eye ) ) * LINEAR_ROTATION_SPEED );
						_worldQuaternion.setFromAxisAngle( _unitY, _worldPoint.sub( _worldPointStart ).dot( _unitY.clone().cross( _eye ) ) * LINEAR_ROTATION_SPEED );

          }

				} else if ( axis === 'Z' ) {

					alignVector.set( 0, 0, 1 ).applyEuler( rotation );

					if ( Math.abs( alignVector.dot( _eye ) ) > 0.3 ) {

						_localQuaternion.setFromAxisAngle( _unitZ, _localPoint.angleTo( _localPointStart ) * ( _localCross.z > 0 ? -1 : 1 ) );
						_worldQuaternion.setFromAxisAngle( _unitZ, _worldPoint.angleTo( _worldPointStart ) * ( _worldCross.z > 0 ? -1 : 1 ) );

          } else {

						_localQuaternion.setFromAxisAngle( _unitZ, _worldPoint.sub( _worldPointStart ).dot( _unitZ.clone().applyEuler( rotation ).cross( _eye ) ) * LINEAR_ROTATION_SPEED );
						_worldQuaternion.setFromAxisAngle( _unitZ, _worldPoint.sub( _worldPointStart ).dot( _unitZ.clone().cross( _eye ) ) * LINEAR_ROTATION_SPEED );

					}

				}

			}

			// Apply rotate

			if ( axis === 'E' ||  axis === 'XYZE' ) {

			  space = 'world';

			}

			if ( space === 'local' ) {

				object.quaternion.copy( _quaternionStart );
				object.quaternion.multiply( _localQuaternion );

			} else {

				object.quaternion.copy( _worldQuaternion );
				object.quaternion.multiply( _quaternionStart );

			}

			if ( scope.snapAngle) {

				// TODO: implement rotation snap

			}

		}

		scope.dispatchEvent( changeEvent );
		scope.dispatchEvent( objectChangeEvent );

	}

	function onPointerUp( event ) {

		event.preventDefault(); // Prevent MouseEvent on mobile

		if ( event.button !== undefined && event.button !== 0 ) return;

		if ( scope.dragging && ( scope.axis !== null ) ) {

			mouseUpEvent.mode = scope.mode;
			scope.dispatchEvent( mouseUpEvent );

		}

		scope.dragging = false;

		if ( 'TouchEvent' in window && event instanceof TouchEvent ) {

			// Force "rollover"

			scope.axis = null;

		} else {

			onPointerHover( event );

		}

	}

	function intersectObjects( pointer, objects ) {

		var rect = domElement.getBoundingClientRect();
		var x = ( pointer.clientX - rect.left ) / rect.width;
		var y = ( pointer.clientY - rect.top ) / rect.height;

		pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1 );
		ray.setFromCamera( pointerVector, camera );

		var intersections = ray.intersectObjects( objects, true );

		return intersections[ 0 ] ? intersections[ 0 ] : false;

	}

	// TODO: depricate

	this.getMode = function () {

		return scope.mode;

		console.warn( 'THREE.TransformControls: getMode function has been depricated.' );

	};

	this.setMode = function ( mode ) {

		scope.mode = mode;

		console.warn( 'THREE.TransformControls: setMode function has been depricated.' );

	};

	this.setTranslationSnap = function ( translationSnap ) {

		scope.translationSnap = translationSnap;

		console.warn( 'THREE.TransformControls: setTranslationSnap function has been depricated.' );

	};

	this.setRotationSnap = function ( rotationSnap ) {

		scope.rotationSnap = rotationSnap;

		console.warn( 'THREE.TransformControls: setRotationSnap function has been depricated.' );

	};

	this.setSize = function ( size ) {

		scope.size = size;

		console.warn( 'THREE.TransformControls: setSize function has been depricated.' );

	};

	this.setSpace = function ( space ) {

		scope.space = space;

		console.warn( 'THREE.TransformControls: setSpace function has been depricated.' );

	};

	this.update = function () {

		console.warn( 'THREE.TransformControls: update function has been depricated.' );

	}

};

THREE.TransformControls.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {

  constructor: THREE.TransformControls,

  isTransformControls: true

} );
