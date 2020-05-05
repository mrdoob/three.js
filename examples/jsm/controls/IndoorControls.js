import {
	Euler,
	EventDispatcher,
	Raycaster,
	Matrix4,
	Quaternion,
	Vector2,
	Vector3
} from '../../../build/three.module.js';

var IndoorControls = function ( camera, domElement ) {

	if ( domElement === undefined ) console.error( 'Please use "renderer.domElement".' );

	this.camera = camera;
	this.domElement = domElement;

	this.enabled = true;
	this.enabled_rotate = true;
	this.enabled_move = true;
	this.enabled_key = true;
	this.enabled_wheel = true;

	this.speedRotating = 0.001;
	this.rotateAnimate = true;
	this.rotateDamping = 0.2;
	this.rotatePrecision = 0.1;

	this.moveTime = 1.6;

	this.speedKeyMoving = 2;

	this.minFov = 50;
	this.maxFov = 76;

	this.ground = [];

	var scope = this;
	var rect = scope.domElement.getBoundingClientRect();

	var PI_2 = Math.PI / 2;

	var _v1 = new Vector3();
	var _v2 = new Vector3();
	var _v3 = new Vector3();

	var _e1 = new Euler( 0, 0, 0, 'YXZ' );

	var _q1 = new Quaternion();

	var _m1 = new Matrix4();

	var _r1 = new Raycaster();

	var prevTime = performance.now();

	var canRotate = false;
	var isRotating = false;
	var movement = new Vector2();
	var movement0 = new Vector2();
	var prevMovement = new Vector2();
	var prevScreen = new Vector2();
	var prevTouchDis = 0;
	var mouse = new Vector2();
	var raycaster = new Raycaster();
	var intersects = [];

	var canMove = false;
	var isMoving = false;
	var moveTarget = {

		position: null,

		targetDir: new Vector3(),
		targetDis: 0,
		targetAcc: 0,

		targetTime: 0,
		targetSpeed: 0,
		targetDisLater: 0

	};

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var moveUp = false;
	var moveDown = false;
	var moveDir = new Vector3();

	var isGoing = false;
	var goTarget = {

		position: null,
		lookAt: null,

		targetDir: new Vector3(),
		targetDis: 0,
		targetAcc: 0,

		initialRotate: new Quaternion(),
		targetRotate: new Quaternion(),

		targetTime: 0,
		targetSpeed: 0,
		targetDisLater: 0

	};

	var mouseMoveEvent = { type: 'mousemove', intersect: null };
	var mouseUpBeforeEvent = { type: 'mouseupbefore', raycaster: null, prevent: false };

	function onContextMenu( event ) {

		event.preventDefault();

	}

	function onMouseDown( event ) {

		if ( scope.enabled ) {

			if ( scope.enabled_rotate ) canRotate = true;

			if ( scope.enabled_move ) canMove = true;

		}

		event.preventDefault();

		scope.domElement.focus();

		if ( event.touches ) {

			prevScreen.x = event.touches[ 0 ].screenX;
			prevScreen.y = event.touches[ 0 ].screenY;

			if ( event.touches.length === 2 ) {

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

				prevTouchDis = dx * dx + dy * dy;

			}

		}

	}

	function onMouseMove( event ) {

		event.preventDefault();

		if ( canRotate === true ) {

			if ( Math.abs( event.movementX ) >= 1 || Math.abs( event.movementY ) >= 1 ) canMove = false;

			movement.x += event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			movement.y += event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			isRotating = true;

		}

		if ( scope.ground.length > 0 ) {

			mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
			mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

			raycaster.setFromCamera( mouse, scope.camera );

			intersects = raycaster.intersectObjects( scope.ground, true );

			if ( intersects.length > 0 ) {

				mouseMoveEvent.intersect = intersects[ 0 ];
				scope.dispatchEvent( mouseMoveEvent );

			}

		}

	}

	function onTouchMove( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( event.touches.length === 1 ) {

			event = event.touches[ 0 ];

			event.movementX = ( event.screenX - prevScreen.x ) * 2;
			event.movementY = ( event.screenY - prevScreen.y ) * 2;

			prevScreen.x = event.screenX;
			prevScreen.y = event.screenY;

			if ( canRotate === true ) {

				if ( Math.abs( event.movementX ) >= 1 || Math.abs( event.movementY ) >= 1 ) canMove = false;

				movement.x += event.movementX || event.mozMovementX || event.webkitMovementX || 0;
				movement.y += event.movementY || event.mozMovementY || event.webkitMovementY || 0;

				isRotating = true;

			}

			if ( scope.ground.length > 0 ) {

				mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
				mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

				raycaster.setFromCamera( mouse, scope.camera );

				intersects = raycaster.intersectObjects( scope.ground, true );

				if ( intersects.length > 0 ) {

					mouseMoveEvent.intersect = intersects[ 0 ];
					scope.dispatchEvent( mouseMoveEvent );

				}

			}

		} else if ( event.touches.length === 2 ) {

			if ( ! scope.enabled || ! scope.enabled_wheel ) return;

			canMove = false;

			var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
			var touchDis = dx * dx + dy * dy;

			if ( prevTouchDis - touchDis < 0 && scope.camera.fov >= scope.minFov ) {

				scope.camera.fov --;
				scope.camera.updateProjectionMatrix();

			} else if ( prevTouchDis - touchDis > 0 && scope.camera.fov <= scope.maxFov ) {

				scope.camera.fov ++;
				scope.camera.updateProjectionMatrix();

			}

			prevTouchDis = touchDis;

		}

	}

	function onMouseUp( event ) {

		event.preventDefault();

		canRotate = false;

		if ( canMove === true && isMoving === false ) {

			// used to prevent default move
			mouseUpBeforeEvent.raycaster = raycaster;
			scope.dispatchEvent( mouseUpBeforeEvent );

			if ( mouseUpBeforeEvent.prevent ) {

				mouseUpBeforeEvent.prevent = false;
				return;

			}

			if ( intersects.length === 0 ) return;

			moveTarget.position = intersects[ 0 ].point.clone();

			// need to avoid moving the camera to a surface (such as a wall) perpendicular to the y axis
			_r1.set( scope.camera.position, _v2.set( 0, - 1, 0 ) );
			moveTarget.position.y += scope.camera.position.y - _r1.intersectObjects( scope.ground, true )[ 0 ].point.y;

			if ( moveTarget.position.equals( scope.camera.position ) ) return;

			handleMove( moveTarget );

			isMoving = true;

		}

	}

	function onKeyDown( event ) {

		if ( ! scope.enabled || ! scope.enabled_key ) return;

		switch ( event.keyCode ) {

			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true;
				break;

			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 38: // up
			case 81: // q
				moveUp = true;
				break;

			case 40: // down
			case 69: // e
				moveDown = true;
				break;

		}

	}

	function onKeyUp( event ) {

		if ( ! scope.enabled || ! scope.enabled_key ) return;

		switch ( event.keyCode ) {

			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

			case 38: // up
			case 81: // q
				moveUp = false;
				break;

			case 40: // down
			case 69: // e
				moveDown = false;
				break;

		}

	}

	function onMouseWheel( event ) {

		if ( ! scope.enabled || ! scope.enabled_wheel ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( event.deltaY < 0 && scope.camera.fov >= scope.minFov ) {

			scope.camera.fov --;
			scope.camera.updateProjectionMatrix();

		} else if ( event.deltaY > 0 && scope.camera.fov <= scope.maxFov ) {

			scope.camera.fov ++;
			scope.camera.updateProjectionMatrix();

		}

	}


	function handleMove( target ) {

		target.targetDir.subVectors( target.position, scope.camera.position ).normalize();
		target.targetDis = target.position.distanceToSquared( scope.camera.position );

		target.targetAcc = 4 * Math.sqrt( target.targetDis ) / Math.pow( scope.moveTime, 2 );

	}

	function updateMove( target, interval ) {

		_v3.copy( scope.camera.position );

		target.targetTime += interval;

		if ( target.targetTime < scope.moveTime / 2 ) {

			target.targetSpeed += target.targetAcc * interval;
			_v3.addScaledVector( target.targetDir, target.targetSpeed * interval + 0.5 * target.targetAcc * interval * interval );

		} else {

			target.targetSpeed -= target.targetAcc * interval;
			_v3.addScaledVector( target.targetDir, target.targetSpeed * interval - 0.5 * target.targetAcc * interval * interval );

		}

		target.targetDisLater = target.position.distanceToSquared( _v3 );

		if ( target.targetDisLater >= target.targetDis ) {

			target.position.copy( scope.camera.position );
			target.targetDis = 0;
			target.targetTime = 0;
			target.targetSpeed = 0;

			isMoving = false;
			isGoing = false;

		} else {

			scope.camera.position.copy( _v3 );
			target.targetDis = target.targetDisLater;

		}

	}

	//
	// public methods
	//

	this.connect = function () {

		scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

		scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.addEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.addEventListener( 'mouseup', onMouseUp, false );

		scope.domElement.addEventListener( 'keydown', onKeyDown, false );
		scope.domElement.addEventListener( 'keyup', onKeyUp, false );

		scope.domElement.addEventListener( 'wheel', onMouseWheel, false );

		scope.domElement.addEventListener( 'touchstart', onMouseDown, false );
		scope.domElement.addEventListener( 'touchmove', onTouchMove, false );
		scope.domElement.addEventListener( 'touchend', onMouseUp, false );

		if ( scope.domElement.tabIndex === - 1 ) scope.domElement.tabIndex = 0;

	};

	this.disconnect = function () {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );

		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.removeEventListener( 'mouseup', onMouseUp, false );

		scope.domElement.removeEventListener( 'keydown', onKeyDown, false );
		scope.domElement.removeEventListener( 'keyup', onKeyUp, false );

		scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );

		scope.domElement.removeEventListener( 'touchstart', onMouseDown, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );
		scope.domElement.removeEventListener( 'touchend', onMouseUp, false );

	};

	this.dispose = function () {

		this.disconnect();

	};

	this.moveForward = function ( distance ) {

		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		_v1.setFromMatrixColumn( scope.camera.matrix, 0 );

		_v1.crossVectors( scope.camera.up, _v1 );

		scope.camera.position.addScaledVector( _v1, distance );

	};

	this.moveRight = function ( distance ) {

		_v1.setFromMatrixColumn( scope.camera.matrix, 0 );

		scope.camera.position.addScaledVector( _v1, distance );

	};

	this.moveUp = function ( distance ) {

		scope.camera.position.addScaledVector( scope.camera.up, distance );

	};

	this.goTo = function ( go_position, go_lookAt ) {

		if ( isMoving || isRotating || isGoing ) return;

		if ( !go_position || go_position.equals( scope.camera.position ) ) return;

		goTarget.position = go_position.clone();
		goTarget.lookAt = go_lookAt ? go_lookAt.clone() : null;

		handleMove( goTarget );

		if ( go_lookAt ) {

			_m1.lookAt( go_position, go_lookAt, scope.camera.up );

			goTarget.initialRotate.copy( scope.camera.quaternion );

			goTarget.targetRotate.setFromRotationMatrix( _m1 );

		}

		isGoing = true;

	};

	this.update = function () {

		var time = performance.now();
		var interval = ( time - prevTime ) / 1000;

		if ( isRotating === true ) {

			if ( movement.equals( movement0 ) ) movement.copy( prevMovement );

			_e1.setFromQuaternion( scope.camera.quaternion );

			_e1.y += movement.x * scope.speedRotating;
			_e1.x += movement.y * scope.speedRotating;

			_e1.x = Math.max( - PI_2, Math.min( PI_2, _e1.x ) );

			scope.camera.quaternion.setFromEuler( _e1 );

			if ( scope.rotateAnimate === true ) {

				movement.x = movement.x * ( 1 - scope.rotateDamping );
				movement.y = movement.y * ( 1 - scope.rotateDamping );

			} else {

				movement.copy( movement0 );

			}

			if ( Math.abs( movement.x ) <= scope.rotatePrecision && Math.abs( movement.y ) <= scope.rotatePrecision ) isRotating = false;

			prevMovement.copy( movement );
			movement.copy( movement0 );

		}

		if ( isMoving === true ) {

			updateMove( moveTarget, interval );

		}

		if ( isMoving === false ) {

			moveDir.z = Number( moveForward ) - Number( moveBackward );
			moveDir.x = Number( moveRight ) - Number( moveLeft );
			moveDir.y = Number( moveUp ) - Number( moveDown );

			if ( moveDir.x || moveDir.y || moveDir.z ) {

				moveDir.normalize();

				scope.moveForward( moveDir.z * scope.speedKeyMoving * interval );
				scope.moveRight( moveDir.x * scope.speedKeyMoving * interval );
				scope.moveUp( moveDir.y * scope.speedKeyMoving * interval );

			}

		}

		if ( isGoing === true ) {

			if ( goTarget.position ) {

				updateMove( goTarget, interval );

			}

			if ( goTarget.lookAt ) {

				var proportion = Math.pow( goTarget.targetTime / scope.moveTime, 0.4 );

				if ( proportion === 0 || proportion > 1 ) proportion = 1;

				_q1.copy( goTarget.initialRotate ).slerp( goTarget.targetRotate, proportion );
				scope.camera.setRotationFromQuaternion( _q1 );


			}

		}

		prevTime = time;

	};

	this.reset = function ( cameraNew, domElementNew ) {

		scope.camera = cameraNew;
		scope.domElement = domElementNew;

		rect = scope.domElement.getBoundingClientRect();

	};

	this.connect();

};

IndoorControls.prototype = Object.create( EventDispatcher.prototype );
IndoorControls.prototype.constructor = IndoorControls;

export { IndoorControls };
