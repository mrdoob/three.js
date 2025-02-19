import * as THREE from 'three';

class EditorControls extends THREE.EventDispatcher {

	constructor( object, domElement ) {

		super();

		// API

		this.enabled = true;
		this.center = new THREE.Vector3();
		this.panSpeed = 0.002;
		this.zoomSpeed = 0.1;
		this.rotationSpeed = 0.005;

		// internals

		const scope = this;
		const vector = new THREE.Vector3();
		const delta = new THREE.Vector3();
		const box = new THREE.Box3();

		const STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2 };
		let state = STATE.NONE;

		const center = this.center;
		const normalMatrix = new THREE.Matrix3();
		const pointer = new THREE.Vector2();
		const pointerOld = new THREE.Vector2();
		const spherical = new THREE.Spherical();
		const sphere = new THREE.Sphere();

		const pointers = [];
		const pointerPositions = {};

		// events

		const changeEvent = { type: 'change' };

		this.focus = function ( target ) {

			let distance;

			box.setFromObject( target );

			if ( box.isEmpty() === false ) {

				box.getCenter( center );
				distance = box.getBoundingSphere( sphere ).radius;

			} else {

				// Focusing on an Group, AmbientLight, etc

				center.setFromMatrixPosition( target.matrixWorld );
				distance = 0.1;

			}

			delta.set( 0, 0, 1 );
			delta.applyQuaternion( object.quaternion );
			delta.multiplyScalar( distance * 4 );

			object.position.copy( center ).add( delta );

			scope.dispatchEvent( changeEvent );

		};

		this.pan = function ( delta ) {

			const distance = object.position.distanceTo( center );

			delta.multiplyScalar( distance * scope.panSpeed );
			delta.applyMatrix3( normalMatrix.getNormalMatrix( object.matrix ) );

			object.position.add( delta );
			center.add( delta );

			scope.dispatchEvent( changeEvent );

		};

		this.zoom = function ( delta ) {

			const distance = object.position.distanceTo( center );

			delta.multiplyScalar( distance * scope.zoomSpeed );

			if ( delta.length() > distance ) return;

			delta.applyMatrix3( normalMatrix.getNormalMatrix( object.matrix ) );

			object.position.add( delta );

			scope.dispatchEvent( changeEvent );

		};

		this.rotate = function ( delta ) {

			vector.copy( object.position ).sub( center );

			spherical.setFromVector3( vector );

			spherical.theta += delta.x * scope.rotationSpeed;
			spherical.phi += delta.y * scope.rotationSpeed;

			spherical.makeSafe();

			vector.setFromSpherical( spherical );

			object.position.copy( center ).add( vector );

			object.lookAt( center );

			scope.dispatchEvent( changeEvent );

		};

		//

		function onPointerDown( event ) {

			if ( scope.enabled === false ) return;

			if ( pointers.length === 0 ) {

				domElement.setPointerCapture( event.pointerId );

				domElement.ownerDocument.addEventListener( 'pointermove', onPointerMove );
				domElement.ownerDocument.addEventListener( 'pointerup', onPointerUp );

			}

			//

			if ( isTrackingPointer( event ) ) return;

			//

			addPointer( event );

			if ( event.pointerType === 'touch' ) {

				onTouchStart( event );

			} else {

				onMouseDown( event );

			}

		}

		function onPointerMove( event ) {

			if ( scope.enabled === false ) return;

			if ( event.pointerType === 'touch' ) {

				onTouchMove( event );

			} else {

				onMouseMove( event );

			}

		}

		function onPointerUp( event ) {

			removePointer( event );

			switch ( pointers.length ) {

				case 0:

					domElement.releasePointerCapture( event.pointerId );

					domElement.ownerDocument.removeEventListener( 'pointermove', onPointerMove );
					domElement.ownerDocument.removeEventListener( 'pointerup', onPointerUp );

					break;

				case 1:

					const pointerId = pointers[ 0 ];
					const position = pointerPositions[ pointerId ];

					// minimal placeholder event - allows state correction on pointer-up
					onTouchStart( { pointerId: pointerId, pageX: position.x, pageY: position.y } );

					break;

			}

		}

		// mouse

		function onMouseDown( event ) {

			if ( event.button === 0 ) {

				state = STATE.ROTATE;

			} else if ( event.button === 1 ) {

				state = STATE.ZOOM;

			} else if ( event.button === 2 ) {

				state = STATE.PAN;

			}

			pointerOld.set( event.clientX, event.clientY );

		}

		function onMouseMove( event ) {

			pointer.set( event.clientX, event.clientY );

			const movementX = pointer.x - pointerOld.x;
			const movementY = pointer.y - pointerOld.y;

			if ( state === STATE.ROTATE ) {

				scope.rotate( delta.set( - movementX, - movementY, 0 ) );

			} else if ( state === STATE.ZOOM ) {

				scope.zoom( delta.set( 0, 0, movementY ) );

			} else if ( state === STATE.PAN ) {

				scope.pan( delta.set( - movementX, movementY, 0 ) );

			}

			pointerOld.set( event.clientX, event.clientY );

		}

		function onMouseUp() {

			state = STATE.NONE;

		}

		function onMouseWheel( event ) {

			if ( scope.enabled === false ) return;

			event.preventDefault();

			// Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
			scope.zoom( delta.set( 0, 0, event.deltaY > 0 ? 1 : - 1 ) );

		}

		function contextmenu( event ) {

			event.preventDefault();

		}

		this.dispose = function () {

			domElement.removeEventListener( 'contextmenu', contextmenu );
			domElement.removeEventListener( 'dblclick', onMouseUp );
			domElement.removeEventListener( 'wheel', onMouseWheel );

			domElement.removeEventListener( 'pointerdown', onPointerDown );

		};

		domElement.addEventListener( 'contextmenu', contextmenu );
		domElement.addEventListener( 'dblclick', onMouseUp );
		domElement.addEventListener( 'wheel', onMouseWheel, { passive: false } );

		domElement.addEventListener( 'pointerdown', onPointerDown );

		// touch

		const touches = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
		const prevTouches = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

		let prevDistance = null;

		function onTouchStart( event ) {

			trackPointer( event );

			switch ( pointers.length ) {

				case 1:
					touches[ 0 ].set( event.pageX, event.pageY, 0 ).divideScalar( window.devicePixelRatio );
					touches[ 1 ].set( event.pageX, event.pageY, 0 ).divideScalar( window.devicePixelRatio );
					break;

				case 2:

					const position = getSecondPointerPosition( event );

					touches[ 0 ].set( event.pageX, event.pageY, 0 ).divideScalar( window.devicePixelRatio );
					touches[ 1 ].set( position.x, position.y, 0 ).divideScalar( window.devicePixelRatio );
					prevDistance = touches[ 0 ].distanceTo( touches[ 1 ] );
					break;

			}

			prevTouches[ 0 ].copy( touches[ 0 ] );
			prevTouches[ 1 ].copy( touches[ 1 ] );

		}


		function onTouchMove( event ) {

			trackPointer( event );

			function getClosest( touch, touches ) {

				let closest = touches[ 0 ];

				for ( const touch2 of touches ) {

					if ( closest.distanceTo( touch ) > touch2.distanceTo( touch ) ) closest = touch2;

				}

				return closest;

			}

			switch ( pointers.length ) {

				case 1:
					touches[ 0 ].set( event.pageX, event.pageY, 0 ).divideScalar( window.devicePixelRatio );
					touches[ 1 ].set( event.pageX, event.pageY, 0 ).divideScalar( window.devicePixelRatio );
					scope.rotate( touches[ 0 ].sub( getClosest( touches[ 0 ], prevTouches ) ).multiplyScalar( - 1 ) );
					break;

				case 2:

					const position = getSecondPointerPosition( event );

					touches[ 0 ].set( event.pageX, event.pageY, 0 ).divideScalar( window.devicePixelRatio );
					touches[ 1 ].set( position.x, position.y, 0 ).divideScalar( window.devicePixelRatio );
					const distance = touches[ 0 ].distanceTo( touches[ 1 ] );
					scope.zoom( delta.set( 0, 0, prevDistance - distance ) );
					prevDistance = distance;


					const offset0 = touches[ 0 ].clone().sub( getClosest( touches[ 0 ], prevTouches ) );
					const offset1 = touches[ 1 ].clone().sub( getClosest( touches[ 1 ], prevTouches ) );
					offset0.x = - offset0.x;
					offset1.x = - offset1.x;

					scope.pan( offset0.add( offset1 ) );

					break;

			}

			prevTouches[ 0 ].copy( touches[ 0 ] );
			prevTouches[ 1 ].copy( touches[ 1 ] );

		}

		function addPointer( event ) {

			pointers.push( event.pointerId );

		}

		function removePointer( event ) {

			delete pointerPositions[ event.pointerId ];

			for ( let i = 0; i < pointers.length; i ++ ) {

				if ( pointers[ i ] == event.pointerId ) {

					pointers.splice( i, 1 );
					return;

				}

			}

		}

		function isTrackingPointer( event ) {

			for ( let i = 0; i < pointers.length; i ++ ) {

				if ( pointers[ i ] == event.pointerId ) return true;

			}

			return false;

		}

		function trackPointer( event ) {

			let position = pointerPositions[ event.pointerId ];

			if ( position === undefined ) {

				position = new THREE.Vector2();
				pointerPositions[ event.pointerId ] = position;

			}

			position.set( event.pageX, event.pageY );

		}

		function getSecondPointerPosition( event ) {

			const pointerId = ( event.pointerId === pointers[ 0 ] ) ? pointers[ 1 ] : pointers[ 0 ];

			return pointerPositions[ pointerId ];

		}

	}

}

export { EditorControls };
