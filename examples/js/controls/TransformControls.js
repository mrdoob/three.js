( function () {

	const UNIT = {
		ZERO: Object.freeze( new THREE.Vector3( 0, 0, 0 ) ),
		X: Object.freeze( new THREE.Vector3( 1, 0, 0 ) ),
		Y: Object.freeze( new THREE.Vector3( 0, 1, 0 ) ),
		Z: Object.freeze( new THREE.Vector3( 0, 0, 1 ) )
	};
	let xrSession;
	/**
 * `ControlsBase`: Base class for Objects with observable properties, change events and animation.
 */

	class ControlsBase extends THREE.Mesh {

		constructor( camera, domElement ) {

			super();
			this.eye = new THREE.Vector3();
			this.cameraPosition = new THREE.Vector3();
			this.cameraQuaternion = new THREE.Quaternion();
			this.cameraScale = new THREE.Vector3();
			this.cameraOffset = new THREE.Vector3();
			this.worldPosition = new THREE.Vector3();
			this.worldQuaternion = new THREE.Quaternion();
			this.worldQuaternionInv = new THREE.Quaternion();
			this.worldScale = new THREE.Vector3();
			this._animations = [];
			this._eventTimeout = {};
			this.camera = camera;
			this.domElement = domElement;
			this.observeProperty( 'xr' );
			this._connectXR = this._connectXR.bind( this );
			this._disconnectXR = this._disconnectXR.bind( this );
			this._xrSessionStart = this._xrSessionStart.bind( this );
			this._xrSessionEnd = this._xrSessionEnd.bind( this );
			this.changed = this.changed.bind( this );

			this.onBeforeRender = renderer => {

				this.xr = renderer.xr;

			};

		}

		xrChanged( value ) {

			value ? this._connectXR() : this._disconnectXR();

		}

		_connectXR() {

			let _a, _b;

			( _a = this.xr ) === null || _a === void 0 ? void 0 : _a.addEventListener( 'sessionstart', this._xrSessionStart );
			( _b = this.xr ) === null || _b === void 0 ? void 0 : _b.addEventListener( 'sessionend', this._xrSessionEnd );

		}

		_disconnectXR() {

			let _a, _b;

			( _a = this.xr ) === null || _a === void 0 ? void 0 : _a.removeEventListener( 'sessionstart', this._xrSessionStart );
			( _b = this.xr ) === null || _b === void 0 ? void 0 : _b.removeEventListener( 'sessionend', this._xrSessionEnd );

		}

		_xrSessionStart( event ) {

			AnimationManagerSingleton.stop();
			xrSession = event.target.getSession();
			AnimationManagerSingleton.start();

		}

		_xrSessionEnd() {

			// TODO: hand over active animations to window rAF
			this.stopAllAnimations();
			xrSession = null;

		}
		/**
      * Adds property observing mechanism via getter and setter.
      * Also emits '[property]-changed' event and cummulative 'change' event on next rAF.
      */


		observeProperty( propertyKey ) {

			let value = this[ propertyKey ];
			Object.defineProperty( this, propertyKey, {
				get() {

					return value;

				},

				set( newValue ) {

					const oldValue = value;
					value = newValue;

					if ( newValue !== oldValue ) {

						this.dispatchEvent( {
							type: propertyKey + '-changed',
							property: propertyKey,
							value: newValue,
							oldValue: oldValue
						} );
						this.dispatchEvent( {
							type: 'change'
						} );

					}

				}

			} );

		}

		_invokeChangeHandlers( event ) {

			const type = event.type;

			if ( type === 'change' ) {

				this.changed();

			} else if ( type.endsWith( '-changed' ) ) {

				const handler = this[ event.property + 'Changed' ];
				handler && handler.call( this, event.value, event.oldValue );

			}

		}

		dispatchEvent( event ) {

			const type = event.type;

			if ( ! this._eventTimeout[ type ] ) {

				super.dispatchEvent( event );

				this._invokeChangeHandlers( event );

				this._eventTimeout[ type ] = - 1;

				if ( xrSession ) {

					xrSession.requestAnimationFrame( () => {

						this._eventTimeout[ type ] = 0;

					} );

				} else {

					requestAnimationFrame( () => {

						this._eventTimeout[ type ] = 0;

					} );

				}

			} else {

				if ( xrSession ) {

					xrSession.cancelAnimationFrame( this._eventTimeout[ type ] );
					this._eventTimeout[ type ] = xrSession.requestAnimationFrame( () => {

						this._eventTimeout[ type ] = 0;
						super.dispatchEvent( event );

						this._invokeChangeHandlers( event );

					} );

				} else {

					cancelAnimationFrame( this._eventTimeout[ type ] );
					this._eventTimeout[ type ] = requestAnimationFrame( () => {

						this._eventTimeout[ type ] = 0;
						super.dispatchEvent( event );

						this._invokeChangeHandlers( event );

					} );

				}

			}

		}

		changed() {} // Adds animation callback to animation loop.


		startAnimation( callback ) {

			const index = this._animations.findIndex( animation => animation === callback );

			if ( index === - 1 ) {

				callback( 1000 / 60 );

				this._animations.push( callback );

			}

			AnimationManagerSingleton.add( callback );

		} // Removes animation callback from animation loop.


		stopAnimation( callback ) {

			const index = this._animations.findIndex( animation => animation === callback );

			if ( index !== - 1 ) this._animations.splice( index, 1 );
			AnimationManagerSingleton.remove( callback );

		} // Stops all animations.


		stopAllAnimations() {

			for ( let i = 0; i < this._animations.length; i ++ ) {

				this.stopAnimation( this._animations[ i ] );

			}

		}

		dispose() {

			if ( this.parent ) this.parent.remove( this );

			this._disconnectXR();

			this.stopAllAnimations();
			this.dispatchEvent( {
				type: 'dispose'
			} );

		}

		decomposeMatrices() {

			this.matrixWorld.decompose( this.worldPosition, this.worldQuaternion, this.worldScale );
			this.worldQuaternionInv.copy( this.worldQuaternion ).invert();
			this.camera.updateMatrixWorld();
			this.camera.matrixWorld.decompose( this.cameraPosition, this.cameraQuaternion, this.cameraScale );
			this.cameraOffset.copy( this.cameraPosition ).sub( this.worldPosition );

			if ( this.camera instanceof THREE.OrthographicCamera ) {

				this.eye.set( 0, 0, 1 ).applyQuaternion( this.cameraQuaternion );

			} else {

				this.eye.copy( this.cameraOffset ).normalize();

			}

		}

		updateMatrixWorld() {

			super.updateMatrixWorld();
			this.decomposeMatrices(); // TODO: investigate why is this necessary.
			// Without this, TransformControls needs another update to reorient after "space" change.

			super.updateMatrixWorld();

		}

	}
	/**
 * Internal animation manager.
 * It runs requestAnimationFrame loop whenever there are animation callbacks in the internal queue.
 */


	class AnimationManager {

		constructor() {

			this._queue = [];
			this._running = false;
			this._time = performance.now();
			this._update = this._update.bind( this );

		} // Adds animation callback to the queue


		add( callback ) {

			const index = this._queue.indexOf( callback );

			if ( index === - 1 ) {

				this._queue.push( callback );

				if ( this._queue.length === 1 ) this.start();

			}

		} // Removes animation callback from the queue


		remove( callback ) {

			const index = this._queue.indexOf( callback );

			if ( index !== - 1 ) {

				this._queue.splice( index, 1 );

				if ( this._queue.length === 0 ) this.stop();

			}

		} // Starts animation loop when there are callbacks in the queue


		start() {

			this._time = performance.now();
			this._running = true;

			if ( xrSession ) {

				xrSession.requestAnimationFrame( this._update );

			} else {

				requestAnimationFrame( this._update );

			}

		} // Stops animation loop when the callbacks queue is empty


		stop() {

			this._running = false;

		} // Invokes all animation callbacks in the queue with timestep (dt)


		_update() {

			if ( this._queue.length === 0 ) {

				this._running = false;
				return;

			}

			if ( this._running ) {

				if ( xrSession ) {

					xrSession.requestAnimationFrame( this._update );

				} else {

					requestAnimationFrame( this._update );

				}

			}

			const time = performance.now();

			const timestep = performance.now() - this._time;

			this._time = time;

			for ( let i = 0; i < this._queue.length; i ++ ) {

				this._queue[ i ]( timestep );

			}

		}

	} // Singleton animation manager.


	const AnimationManagerSingleton = new AnimationManager(); // Keeps pointer movement data in 2D space

	class Pointer2D {

		constructor( x = 0, y = 0 ) {

			this.start = new THREE.Vector2();
			this.current = new THREE.Vector2();
			this.previous = new THREE.Vector2();
			this._movement = new THREE.Vector2();
			this._offset = new THREE.Vector2();
			this.set( x, y );

		}

		get movement() {

			return this._movement.copy( this.current ).sub( this.previous );

		}

		get offset() {

			return this._offset.copy( this.current ).sub( this.start );

		}

		set( x, y ) {

			this.start.set( x, y );
			this.current.set( x, y );
			this.previous.set( x, y );
			return this;

		}

		update( x, y ) {

			this.previous.copy( this.current );
			this.current.set( x, y );
			return this;

		}

		updateByInertia( damping ) {

			this.update( this.current.x + this.movement.x * damping, this.current.y + this.movement.y * damping );
			return this;

		}

	} // Keeps pointer movement data in 3D space


	class Pointer3D {

		constructor( x = 0, y = 0, z = 0 ) {

			this.start = new THREE.Vector3();
			this.current = new THREE.Vector3();
			this.previous = new THREE.Vector3();
			this._movement = new THREE.Vector3();
			this._offset = new THREE.Vector3();
			this.set( x, y, z );

		}

		get movement() {

			return this._movement.copy( this.current ).sub( this.previous );

		}

		get offset() {

			return this._offset.copy( this.current ).sub( this.start );

		}

		set( x, y, z ) {

			this.start.set( x, y, z );
			this.current.set( x, y, z );
			this.previous.set( x, y, z );
			return this;

		}

		update( x, y, z ) {

			this.previous.copy( this.current );
			this.current.set( x, y, z );
			return this;

		}

		updateByInertia( damping ) {

			this.update( this.current.x + this.movement.x * damping, this.current.y + this.movement.y * damping, this.current.z + this.movement.z * damping );
			return this;

		}

	} // Keeps pointer movement data in 6D space


	class Pointer6D {

		constructor( origin = new THREE.Vector3(), direction = new THREE.Vector3() ) {

			this.start = new THREE.Ray();
			this.current = new THREE.Ray();
			this.previous = new THREE.Ray();
			this._movement = new THREE.Ray();
			this._offset = new THREE.Ray();
			this._intersection = new THREE.Vector3();
			this._origin = new THREE.Vector3();
			this._direction = new THREE.Vector3();
			this._axis = new THREE.Vector3();
			this._raycaster = new THREE.Raycaster();
			this._projected = new Pointer3D();
			this.set( origin, direction );

		}

		get movement() {

			this._movement.origin.copy( this.current.origin ).sub( this.previous.origin );

			this._movement.direction.copy( this.current.direction ).sub( this.previous.direction );

			return this._movement;

		}

		get offset() {

			this._offset.origin.copy( this.current.origin ).sub( this.start.origin );

			this._offset.direction.copy( this.current.direction ).sub( this.start.direction );

			return this._offset;

		}

		set( origin, direction ) {

			this.start.set( origin, direction );
			this.current.set( origin, direction );
			this.previous.set( origin, direction );
			return this;

		}

		update( origin, direction ) {

			this.previous.copy( this.current );
			this.current.set( origin, direction );

		}

		updateByViewPointer( camera, viewPointer ) {

			if ( camera instanceof THREE.PerspectiveCamera ) {

				this.start.origin.setFromMatrixPosition( camera.matrixWorld );
				this.start.direction.set( viewPointer.start.x, viewPointer.start.y, 0.5 ).unproject( camera ).sub( this.start.origin ).normalize();
				this.current.origin.setFromMatrixPosition( camera.matrixWorld );
				this.current.direction.set( viewPointer.current.x, viewPointer.current.y, 0.5 ).unproject( camera ).sub( this.current.origin ).normalize();
				this.previous.origin.setFromMatrixPosition( camera.matrixWorld );
				this.previous.direction.set( viewPointer.previous.x, viewPointer.previous.y, 0.5 ).unproject( camera ).sub( this.previous.origin ).normalize();

			} else if ( camera instanceof THREE.OrthographicCamera ) {

				this.start.origin.set( viewPointer.start.x, viewPointer.start.y, ( camera.near + camera.far ) / ( camera.near - camera.far ) ).unproject( camera );
				this.start.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
				this.current.origin.set( viewPointer.current.x, viewPointer.current.y, ( camera.near + camera.far ) / ( camera.near - camera.far ) ).unproject( camera );
				this.current.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
				this.previous.origin.set( viewPointer.previous.x, viewPointer.previous.y, ( camera.near + camera.far ) / ( camera.near - camera.far ) ).unproject( camera );
				this.previous.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );

			} else {

				this.start.origin.setFromMatrixPosition( camera.matrixWorld );
				this.start.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
				this.current.origin.setFromMatrixPosition( camera.matrixWorld );
				this.current.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
				this.previous.origin.setFromMatrixPosition( camera.matrixWorld );
				this.previous.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );

			}

			return this;

		}

		updateByInertia( damping ) {

			this._origin.set( this.current.origin.x + this.movement.origin.x * damping, this.current.origin.y + this.movement.origin.y * damping, this.current.origin.z + this.movement.origin.z * damping );

			this._direction.set( this.current.direction.x + this.movement.direction.x * damping, this.current.direction.y + this.movement.direction.y * damping, this.current.direction.z + this.movement.direction.z * damping );

			this.update( this._origin, this._direction );
			return this;

		}

		projectOnPlane( plane, minGrazingAngle = 30 ) {

			// Avoid projecting onto a plane at grazing angles
			const _rayStart = new THREE.Ray().copy( this.start );

			const _rayCurrent = new THREE.Ray().copy( this.current );

			const _rayPrevious = new THREE.Ray().copy( this.previous );

			_rayStart.direction.normalize();

			_rayCurrent.direction.normalize();

			_rayPrevious.direction.normalize();

			const angleStart = Math.PI / 2 - _rayStart.direction.angleTo( plane.normal );

			const angleCurrent = Math.PI / 2 - _rayCurrent.direction.angleTo( plane.normal ); // Grazing angle avoidance algorithm which prevents extreme transformation changes when principal transformation axis is sharply aligned with the camera.


			if ( minGrazingAngle && Math.abs( angleCurrent ) < Math.abs( angleStart ) ) {

				const minAngle = THREE.MathUtils.DEG2RAD * minGrazingAngle;
				const correctionAngle = Math.abs( angleStart ) > minAngle ? 0 : - angleStart + ( angleStart >= 0 ? minAngle : - minAngle );

				this._axis.copy( _rayStart.direction ).cross( plane.normal ).normalize();

				this._raycaster.set( _rayStart.origin, _rayStart.direction );

				this._raycaster.ray.intersectPlane( plane, this._intersection );

				_rayStart.origin.sub( this._intersection ).applyAxisAngle( this._axis, correctionAngle ).add( this._intersection );

				_rayStart.direction.applyAxisAngle( this._axis, correctionAngle );

				_rayCurrent.origin.sub( this._intersection ).applyAxisAngle( this._axis, correctionAngle ).add( this._intersection );

				_rayCurrent.direction.applyAxisAngle( this._axis, correctionAngle );

				_rayPrevious.origin.sub( this._intersection ).applyAxisAngle( this._axis, correctionAngle ).add( this._intersection );

				_rayPrevious.direction.applyAxisAngle( this._axis, correctionAngle );

			}

			this._raycaster.set( _rayStart.origin, _rayStart.direction );

			this._raycaster.ray.intersectPlane( plane, this._projected.start );

			this._raycaster.set( _rayCurrent.origin, _rayCurrent.direction );

			this._raycaster.ray.intersectPlane( plane, this._projected.current );

			this._raycaster.set( _rayPrevious.origin, _rayPrevious.direction );

			this._raycaster.ray.intersectPlane( plane, this._projected.previous );

			return this._projected;

		}

	}
	/**
 * Track pointer movements and handles coordinate conversions to various 2D and 3D spaces.
 * It handles pointer raycasting to various 3D planes at camera's target position.
 */


	class PointerTracker {

		constructor( pointerEvent, camera ) {

			this.buttons = 0;
			this.altKey = false;
			this.ctrlKey = false;
			this.metaKey = false;
			this.shiftKey = false; // Used to distinguish a special "simulated" pointer used to actuate inertial gestures with damping.

			this.isSimulated = false; // 2D pointer with coordinates in view-space ( [-1...1] range )

			this.view = new Pointer2D(); // 6D pointer with coordinates in world-space ( origin, direction )

			this.ray = new Pointer6D();
			this._viewCoord = new THREE.Vector2();
			this._intersection = new THREE.Vector3();
			this._raycaster = new THREE.Raycaster();
			this._intersectedObjects = [];
			this._viewOffset = Object.freeze( new THREE.Vector2( 1, - 1 ) );
			this._viewMultiplier = new THREE.Vector2();
			this._origin = new THREE.Vector3();
			this._direction = new THREE.Vector3();
			this.buttons = pointerEvent.buttons;
			this.altKey = pointerEvent.altKey;
			this.ctrlKey = pointerEvent.ctrlKey;
			this.metaKey = pointerEvent.metaKey;
			this.shiftKey = pointerEvent.shiftKey;
			this.domElement = pointerEvent.target;
			this.pointerId = pointerEvent.pointerId;
			this.type = pointerEvent.type;
			this.camera = camera;
			this.timestamp = Date.now(); // Get view-space pointer coords from PointerEvent data and domElement size.

			const rect = this.domElement.getBoundingClientRect();

			this._viewCoord.set( pointerEvent.clientX - rect.left, pointerEvent.clientY - rect.top );

			this._viewMultiplier.set( this.domElement.clientWidth / 2, - 1 * this.domElement.clientHeight / 2 );

			this._viewCoord.divide( this._viewMultiplier ).sub( this._viewOffset );

			this.view.set( this._viewCoord.x, this._viewCoord.y );
			this.ray.updateByViewPointer( camera, this.view );

		}

		get button() {

			switch ( this.buttons ) {

				case 1:
					return 0;

				case 2:
					return 2;

				case 4:
					return 1;

				default:
					return - 1;

			}

		} // Updates the pointer with the lastest pointerEvent and camera.


		update( pointerEvent, camera ) {

			{

				if ( this.pointerId !== pointerEvent.pointerId ) {

					console.error( 'Invalid pointerId!' );
					return;

				}

			}

			this.camera = camera;
			this.domElement = pointerEvent.target;
			this.timestamp = Date.now(); // Get view-space pointer coords from PointerEvent data and domElement size.

			const rect = this.domElement.getBoundingClientRect();

			this._viewCoord.set( pointerEvent.clientX - rect.left, pointerEvent.clientY - rect.top );

			this._viewMultiplier.set( this.domElement.clientWidth / 2, - 1 * this.domElement.clientHeight / 2 );

			this._viewCoord.divide( this._viewMultiplier ).sub( this._viewOffset );

			this.view.update( this._viewCoord.x, this._viewCoord.y );
			this.ray.updateByViewPointer( camera, this.view );

		}

		setByXRController( controller ) {

			this.timestamp = Date.now();

			this._viewCoord.set( 0, 0 );

			this.view.set( this._viewCoord.x, this._viewCoord.y );
			this.ray.updateByViewPointer( controller, this.view );

		}

		updateByXRController( controller ) {

			this.timestamp = Date.now();

			this._viewCoord.set( this.domElement.clientWidth / 2, this.domElement.clientHeight / 2 );

			this.view.update( this._viewCoord.x, this._viewCoord.y );

			this._origin.setFromMatrixPosition( controller.matrixWorld );

			this._direction.set( 0, 0, - 1 ).transformDirection( controller.matrixWorld );

			this.ray.update( this._origin, this._direction );

		} // Simmulates inertial movement by applying damping to previous movement. For special **simmulated** pointer only!


		simmulateDamping( dampingFactor, deltaTime ) {

			{

				if ( ! this.isSimulated ) {

					console.error( 'Cannot invoke `simmulateDamping()` on non-simmulated PointerTracker!' );

				}

			}

			if ( ! this.isSimulated ) return;
			const damping = Math.pow( 1 - dampingFactor, deltaTime * 60 / 1000 );
			this.view.updateByInertia( damping );
			this.ray.updateByViewPointer( this.camera, this.view );

		} // Projects tracked pointer onto a plane object-space.


		projectOnPlane( plane, minGrazingAngle ) {

			return this.ray.projectOnPlane( plane, minGrazingAngle );

		} // Intersects specified objects with **current** view-space pointer vector.


		intersectObjects( objects ) {

			this._raycaster.set( this.ray.current.origin, this.ray.current.direction );

			this._intersectedObjects.length = 0;

			this._raycaster.intersectObjects( objects, true, this._intersectedObjects );

			return this._intersectedObjects;

		} // Intersects specified plane with **current** view-space pointer vector.


		intersectPlane( plane ) {

			this._raycaster.set( this.ray.current.origin, this.ray.current.direction );

			this._raycaster.ray.intersectPlane( plane, this._intersection );

			return this._intersection;

		} // Clears pointer movement


		clearMovement() {

			this.view.previous.copy( this.view.current );
			this.ray.previous.copy( this.ray.current );

		}

	} // Virtual "center" pointer tracker for multi-touch gestures.
	// TODO: test!


	class CenterPointerTracker extends PointerTracker {

		constructor( pointerEvent, camera ) {

			super( pointerEvent, camera ); // Array of pointers to calculate centers from

			this._pointers = [];
			this._projected = new Pointer3D(); // Set center pointer read-only "type" and "pointerId" properties.

			Object.defineProperties( this, {
				type: {
					value: 'virtual'
				},
				pointerId: {
					value: - 1
				}
			} );
			const view = new Pointer2D();
			Object.defineProperty( this, 'view', {
				get: () => {

					view.set( 0, 0 );

					for ( let i = 0; i < this._pointers.length; i ++ ) {

						view.start.add( this._pointers[ i ].view.start );
						view.current.add( this._pointers[ i ].view.current );
						view.previous.add( this._pointers[ i ].view.previous );

					}

					if ( this._pointers.length > 1 ) {

						view.start.divideScalar( this._pointers.length );
						view.current.divideScalar( this._pointers.length );
						view.previous.divideScalar( this._pointers.length );

					}

					return view;

				}
			} );
			const ray = new Pointer6D();
			Object.defineProperty( this, 'ray', {
				get: () => {

					ray.updateByViewPointer( this.camera, this.view );
					return ray;

				}
			} );

		}

		projectOnPlane( plane, minGrazingAngle ) {

			this._projected.set( 0, 0, 0 );

			for ( let i = 0; i < this._pointers.length; i ++ ) {

				const projected = this._pointers[ i ].projectOnPlane( plane, minGrazingAngle );

				this._projected.start.add( projected.start );

				this._projected.current.add( projected.current );

				this._projected.previous.add( projected.previous );

			}

			if ( this._pointers.length > 1 ) {

				this._projected.start.divideScalar( this._pointers.length );

				this._projected.current.divideScalar( this._pointers.length );

				this._projected.previous.divideScalar( this._pointers.length );

			}

			return this._projected;

		}

		updateCenter( pointers ) {

			this._pointers = pointers;

		}

	}

	const INERTIA_TIME_THRESHOLD = 100;
	const INERTIA_MOVEMENT_THRESHOLD = 0.01;
	/**
 * `ControlsInteractive`: Generic class for interactive threejs viewport controls. It solves some of the most common and complex problems in threejs control designs.
 *
 * ### Pointer Tracking ###
 *
 * - Captures most relevant pointer and keyboard events and fixes some platform-specific bugs and discrepancies.
 * - Serves as a proxy dispatcher for pointer and keyboard events:
 *   "contextmenu", "wheel", "pointerdown", "pointermove", "pointerup", "keydown", "keyup"
 * - Tracks active pointer gestures and evokes pointer event handler functions with tracked pointer data:
 *   `onTrackedPointerDown`, `onTrackedPointerMove`, `onTrackedPointerHover`, `onTrackedPointerUp`
 * - Enables inertial behaviours via simmulated pointer with framerate-independent damping.
 * - Tracks active key presses and evokes key event handler functions with currently pressed key data:
 *   `onTrackedKeyDown`, `onTrackedKeyUp`, `onTrackedKeyChange`
 *
 * ### Internal Update and Animation Loop ###
 *
 * - Removes the necessity to call `.update()` method externally from external animation loop for damping calculations.
 * - Developers can start and stop per-frame function invocations via `private startAnimation( callback )` and `stopAnimation( callback )`.
 *
 * ### ControlsInteractive Livecycle ###
 *
 * - Adds/removes event listeners during lifecycle and on `enabled` property change.
 * - Stops current animations when `enabled` property is set to `false`.
 * - Takes care of the event listener cleanup when `dipose()` method is called.
 * - Emits lyfecycle events: "enabled", "disabled", "dispose"
 */

	class ControlsInteractive extends ControlsBase {

		constructor( camera, domElement ) {

			super( camera, domElement ); // Public API

			this.enabled = true;
			this.enableDamping = false;
			this.dampingFactor = 0.05; // Tracked pointers and keys

			this._hoverPointer = null;
			this._centerPointer = null;
			this._simulatedPointer = null;
			this._pointers = [];
			this._xrControllers = [];
			this._xrPointers = [];
			this._keys = [];
			this._plane = new THREE.Plane();
			this._viewports = [];
			this._viewportCameras = new WeakMap(); // Bind handler functions

			this._preventDefault = this._preventDefault.bind( this );
			this._onContextMenu = this._onContextMenu.bind( this );
			this._onWheel = this._onWheel.bind( this );
			this._onPointerDown = this._onPointerDown.bind( this );
			this._onPointerMove = this._onPointerMove.bind( this );
			this._onPointerSimulation = this._onPointerSimulation.bind( this );
			this._onPointerUp = this._onPointerUp.bind( this );
			this._onKeyDown = this._onKeyDown.bind( this );
			this._onKeyUp = this._onKeyUp.bind( this );
			this._connect = this._connect.bind( this );
			this._disconnect = this._disconnect.bind( this );
			this._onXRControllerDown = this._onXRControllerDown.bind( this );
			this._onXRControllerMove = this._onXRControllerMove.bind( this );
			this._onXRControllerUp = this._onXRControllerUp.bind( this );
			this.observeProperty( 'enabled' );
			this.registerViewport( camera, domElement );

		}

		enabledChanged( value ) {

			value ? this._connect() : this._disconnect();

		}

		registerViewport( camera, domElement ) {

			this._viewports.push( domElement );

			this._viewportCameras.set( domElement, camera );

			this._connectViewport( domElement );

		}

		_connectViewport( domElement ) {

			domElement.addEventListener( 'contextmenu', this._onContextMenu, false );
			domElement.addEventListener( 'wheel', this._onWheel, {
				capture: false,
				passive: false
			} );
			domElement.addEventListener( 'touchdown', this._preventDefault, {
				capture: false,
				passive: false
			} );
			domElement.addEventListener( 'touchmove', this._preventDefault, {
				capture: false,
				passive: false
			} );
			domElement.addEventListener( 'pointerdown', this._onPointerDown );
			domElement.addEventListener( 'pointermove', this._onPointerMove, {
				capture: true
			} );
			domElement.addEventListener( 'pointerup', this._onPointerUp, false );
			domElement.addEventListener( 'keydown', this._onKeyDown, false );
			domElement.addEventListener( 'keyup', this._onKeyUp, false );

		}

		_disconnectViewport( domElement ) {

			domElement.removeEventListener( 'contextmenu', this._onContextMenu, false );
			domElement.removeEventListener( 'wheel', this._onWheel );
			domElement.removeEventListener( 'touchdown', this._preventDefault );
			domElement.removeEventListener( 'touchmove', this._preventDefault );
			domElement.removeEventListener( 'pointerdown', this._onPointerDown );
			domElement.removeEventListener( 'pointermove', this._onPointerMove );
			domElement.removeEventListener( 'pointerup', this._onPointerUp, false );
			domElement.removeEventListener( 'keydown', this._onKeyDown, false );
			domElement.removeEventListener( 'keyup', this._onKeyUp, false ); // Release all captured pointers

			for ( let i = 0; i < this._pointers.length; i ++ ) {

				domElement.releasePointerCapture( this._pointers[ i ].pointerId );

			}

		}

		_connect() {

			for ( let i = 0; i < this._viewports.length; i ++ ) {

				this._connectViewport( this._viewports[ i ] );

			}

			if ( this.xr ) this._connectXR();

		}

		_disconnect() {

			for ( let i = 0; i < this._viewports.length; i ++ ) {

				this._disconnectViewport( this._viewports[ i ] );

			}

			this._disconnectXR(); // Stop all animations


			this.stopAllAnimations(); // Clear current pointers and keys

			this._pointers.length = 0;
			this._keys.length = 0;

		}

		_connectXR() {

			super._connectXR();

			if ( this.xr && this.domElement ) {

				this._xrControllers = [ this.xr.getController( 0 ), this.xr.getController( 1 ) ];

				this._xrControllers[ 0 ].addEventListener( 'selectstart', this._onXRControllerDown );

				this._xrControllers[ 0 ].addEventListener( 'move', this._onXRControllerMove );

				this._xrControllers[ 0 ].addEventListener( 'selectend', this._onXRControllerUp );

				this._xrControllers[ 1 ].addEventListener( 'selectstart', this._onXRControllerDown );

				this._xrControllers[ 1 ].addEventListener( 'move', this._onXRControllerMove );

				this._xrControllers[ 1 ].addEventListener( 'selectend', this._onXRControllerUp );

				const event = {
					target: this.domElement,
					type: 'XRController',
					clientX: this.domElement.clientWidth / 2,
					clientY: this.domElement.clientHeight / 2
				};
				this._xrPointers = [ new PointerTracker( Object.assign( {
					pointerId: 0
				}, event ), this._xrControllers[ 0 ] ), new PointerTracker( Object.assign( {
					pointerId: 1
				}, event ), this._xrControllers[ 1 ] ) ];

			}

		}

		_disconnectXR() {

			super._disconnectXR();

			if ( this._xrControllers.length ) {

				this._xrControllers[ 0 ].removeEventListener( 'selectstart', this._onXRControllerDown );

				this._xrControllers[ 0 ].removeEventListener( 'move', this._onXRControllerMove );

				this._xrControllers[ 0 ].removeEventListener( 'selectend', this._onXRControllerUp );

				this._xrControllers[ 1 ].removeEventListener( 'selectstart', this._onXRControllerDown );

				this._xrControllers[ 1 ].removeEventListener( 'move', this._onXRControllerMove );

				this._xrControllers[ 1 ].removeEventListener( 'selectend', this._onXRControllerUp );

			}

		}

		_onXRControllerMove( controllerEvent ) {

			const index = this._xrControllers.indexOf( controllerEvent.target );

			const xrPointer = this._xrPointers[ index ];
			xrPointer.updateByXRController( controllerEvent.target );

			if ( xrPointer.buttons ) {

				this.onTrackedPointerMove( xrPointer, [ xrPointer ], xrPointer );

			} else {

				this.onTrackedPointerHover( xrPointer, [ xrPointer ] );

			}

		}

		_onXRControllerDown( controllerEvent ) {

			const index = this._xrControllers.indexOf( controllerEvent.target );

			const xrPointer = this._xrPointers[ index ];
			xrPointer.buttons = 1;
			xrPointer.setByXRController( controllerEvent.target );
			this.onTrackedPointerDown( xrPointer, [ xrPointer ] );

		}

		_onXRControllerUp( controllerEvent ) {

			const index = this._xrControllers.indexOf( controllerEvent.target );

			const xrPointer = this._xrPointers[ index ];
			xrPointer.buttons = 0;
			this.onTrackedPointerUp( xrPointer, [ xrPointer ] );

		} // Disables controls and triggers internal _disconnect method to stop animations, diconnects listeners and clears pointer arrays. Dispatches 'dispose' event.


		dispose() {

			this._disconnect();

			super.dispose();

		} // EventDispatcher.addEventListener with added deprecation warnings.


		addEventListener( type, listener ) {

			if ( type === 'enabled' ) {

				console.warn( 'THREE.Controls: "enabled" event is now "enabled-changed"!' );
				type = 'enabled-changed';

			}

			if ( type === 'disabled' ) {

				console.warn( 'THREE.Controls: "disabled" event is now "enabled-changed"!' );
				type = 'enabled-changed';

			}

			super.addEventListener( type, listener );

		} // Internal event handlers


		_preventDefault( event ) {

			event.preventDefault();

		}

		_onContextMenu( event ) {

			this.dispatchEvent( event );

		}

		_onWheel( event ) {

			this.dispatchEvent( event );

		}

		_onPointerDown( event ) {

			const path = event.path || event.composedPath && event.composedPath();
			const domElement = path.find( element => this._viewports.indexOf( element ) !== - 1 ); // const domElement = event.target as HTMLElement;

			const camera = this._viewportCameras.get( domElement );

			if ( this._simulatedPointer ) {

				this._simulatedPointer.clearMovement();

				this._simulatedPointer = null;
				this.stopAnimation( this._onPointerSimulation );

			}

			domElement.focus ? domElement.focus() : window.focus();
			domElement.setPointerCapture( event.pointerId );
			const pointers = this._pointers;
			const pointer = new PointerTracker( event, camera );
			pointer.clearMovement(); // TODO: investigate why this is necessary

			pointers.push( pointer );
			this.onTrackedPointerDown( pointer, pointers );
			this.dispatchEvent( event );

		}

		_onPointerMove( event ) {

			const path = event.path || event.composedPath && event.composedPath();
			const domElement = path.find( element => this._viewports.indexOf( element ) !== - 1 ); // const domElement = event.target as HTMLElement;

			const camera = this._viewportCameras.get( domElement );

			const pointers = this._pointers;
			const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
			let pointer = pointers[ index ];

			if ( pointer ) {

				pointer.update( event, camera );
				const x = Math.abs( pointer.view.current.x );
				const y = Math.abs( pointer.view.current.y ); // Workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=1131348

				if ( pointer.button !== 0 && ( x > 1 || x < 0 || y > 1 || y < 0 ) ) {

					pointers.splice( index, 1 );
					domElement.releasePointerCapture( event.pointerId );
					this.dispatchEvent( event );
					this.onTrackedPointerUp( pointer, pointers );
					return;

				}
				/**
                 * TODO: investigate multi-poiter movement accumulation and unhack.
                 * This shouldn't be necessary yet without it, multi pointer gestures result with
                 * multiplied movement values. TODO: investigate and unhack.
                 * */


				for ( let i = 0; i < pointers.length; i ++ ) {

					if ( pointer.pointerId !== pointers[ i ].pointerId ) {

						pointers[ i ].clearMovement(); // TODO: unhack

					}

				}

				this._centerPointer = this._centerPointer || new CenterPointerTracker( event, camera );

				this._centerPointer.updateCenter( pointers ); // TODO: consider throttling once per frame. On Mac pointermove fires up to 120 Hz.


				this.onTrackedPointerMove( pointer, pointers, this._centerPointer );

			} else if ( this._hoverPointer && this._hoverPointer.pointerId === event.pointerId ) {

				pointer = this._hoverPointer;
				pointer.update( event, camera );
				this.onTrackedPointerHover( pointer, [ pointer ] );

			} else {

				pointer = this._hoverPointer = new PointerTracker( event, camera );
				this.onTrackedPointerHover( pointer, [ pointer ] );

			}

			this.dispatchEvent( event );

		}

		_onPointerSimulation( timeDelta ) {

			if ( this._simulatedPointer ) {

				const pointer = this._simulatedPointer;
				pointer.simmulateDamping( this.dampingFactor, timeDelta );

				if ( pointer.view.movement.length() > 0.00005 ) {

					this.onTrackedPointerMove( pointer, [ pointer ], pointer );

				} else {

					this._simulatedPointer = null;
					this.onTrackedPointerUp( pointer, [] );
					this.stopAnimation( this._onPointerSimulation );

				}

			} else {

				this.stopAnimation( this._onPointerSimulation );

			}

		}

		_onPointerUp( event ) {

			const path = event.path || event.composedPath && event.composedPath();
			const domElement = path.find( element => this._viewports.indexOf( element ) !== - 1 ); // const domElement = event.target as HTMLElement;
			// TODO: three-finger drag on Mac touchpad producing delayed pointerup.

			const pointers = this._pointers;
			const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
			const pointer = pointers[ index ];

			if ( pointer ) {

				pointers.splice( index, 1 );
				domElement.releasePointerCapture( event.pointerId ); // Prevents residual inertia with three-finger-drag on MacOS/touchpad

				const timeDelta = Date.now() - pointer.timestamp;
				const viewDelta = pointer.view.movement.length();

				if ( this.enableDamping && timeDelta < INERTIA_TIME_THRESHOLD && viewDelta > INERTIA_MOVEMENT_THRESHOLD ) {

					this._simulatedPointer = pointer;
					this._simulatedPointer.isSimulated = true;
					this.startAnimation( this._onPointerSimulation );

				} else {

					this.onTrackedPointerUp( pointer, pointers );
					this.onTrackedPointerHover( pointer, pointers );

				}

			}

			this.dispatchEvent( event );

		}

		_onKeyDown( event ) {

			const code = Number( event.code );
			const keys = this._keys;
			const index = keys.findIndex( key => key === code );
			if ( index === - 1 ) keys.push( code );

			if ( ! event.repeat ) {

				this.onTrackedKeyDown( code, keys );
				this.onTrackedKeyChange( code, keys );

			}

			this.dispatchEvent( event );

		}

		_onKeyUp( event ) {

			const code = Number( event.code );
			const keys = this._keys;
			const index = keys.findIndex( key => key === code );
			if ( index !== - 1 ) keys.splice( index, 1 );
			this.onTrackedKeyUp( code, keys );
			this.onTrackedKeyChange( code, keys );
			this.dispatchEvent( event );

		} // Tracked pointer handlers to be implemented in subclass.

		/* eslint-disable no-unused-vars */


		onTrackedPointerDown( _pointer, _pointers ) {}

		onTrackedPointerMove( _pointer, _pointers, _centerPointer ) {}

		onTrackedPointerHover( _pointer, _pointers ) {}

		onTrackedPointerUp( _pointer, _pointers ) {}

		onTrackedKeyDown( code, codes ) {}

		onTrackedKeyUp( code, codes ) {}

		onTrackedKeyChange( code, codes ) {}

	}

	const colors = {
		'white': [ 1, 1, 1 ],
		'whiteTransparent': [ 1, 1, 1, 0.25 ],
		'lightGray': [ 0.75, 0.75, 0.75 ],
		'gray': [ 0.5, 0.5, 0.5 ],
		'darkGray': [ 0.25, 0.25, 0.25 ],
		'red': [ 1, 0.4, 0.1 ],
		'green': [ 0.3, 0.9, 0.2 ],
		'blue': [ 0.2, 0.6, 1 ],
		'cyan': [ 0.2, 1, 1 ],
		'magenta': [ 1, 0.3, 1 ],
		'yellow': [ 1, 1, 0.2 ]
	};

	class HelperMaterial extends THREE.ShaderMaterial {

		constructor( props = {
			color: new THREE.Color( 0xffffff ),
			opacity: 1,
			depthBias: 0,
			highlight: 0
		} ) {

			super();
			this.depthTest = false;
			this.depthWrite = false;
			this.transparent = true;
			this.side = THREE.DoubleSide;
			this.fog = false;
			this.toneMapped = false;
			this.linewidth = 1;
			this.color = new THREE.Color();
			this.opacity = 1;
			this.highlight = 1;
			this.dithering = false;
			const data = new Float32Array( [ 1.0 / 17.0, 0, 0, 0, 9.0 / 17.0, 0, 0, 0, 3.0 / 17.0, 0, 0, 0, 11.0 / 17.0, 0, 0, 0, 13.0 / 17.0, 0, 0, 0, 5.0 / 17.0, 0, 0, 0, 15.0 / 17.0, 0, 0, 0, 7.0 / 17.0, 0, 0, 0, 4.0 / 17.0, 0, 0, 0, 12.0 / 17.0, 0, 0, 0, 2.0 / 17.0, 0, 0, 0, 10.0 / 17.0, 0, 0, 0, 16.0 / 17.0, 0, 0, 0, 8.0 / 17.0, 0, 0, 0, 14.0 / 17.0, 0, 0, 0, 6.0 / 17.0, 0, 0, 0 ] );
			const ditherPatternTex = new THREE.DataTexture( data, 4, 4, THREE.RGBAFormat, THREE.FloatType );
			ditherPatternTex.magFilter = THREE.NearestFilter;
			ditherPatternTex.minFilter = THREE.NearestFilter;
			const color = props.color || new THREE.Color( 0xffffff );
			const opacity = props.opacity !== undefined ? props.opacity : 1;
			this.color.copy( color );
			this.opacity = opacity;
			this.highlight = props.highlight || 1;
			this.uniforms = THREE.UniformsUtils.merge( [ this.uniforms, {
				'uColor': {
					value: this.color
				},
				'uOpacity': {
					value: this.opacity
				},
				'uHighlight': {
					value: this.highlight
				},
				'uDithering': {
					value: this.dithering ? 1 : 0
				},
				'tDitherMatrix': {
					value: ditherPatternTex
				}
			} ] );
			this.uniforms.tDitherMatrix.value = ditherPatternTex;
			ditherPatternTex.needsUpdate = true;
			this.vertexShader =
    /* glsl */
    `
      attribute vec4 color;
      varying vec4 vColor;
      void main() {
        float aspect = projectionMatrix[0][0] / projectionMatrix[1][1];
        vColor = color;
        vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        vec3 nor = normalize(vec3(1., 1., 0.) * (normalMatrix * normal));
        gl_Position = pos;
      }
    `;
			this.fragmentShader =
    /* glsl */
    `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uHighlight;
      uniform float uDithering;
      uniform sampler2D tDitherMatrix;
      varying vec4 vColor;
      void main() {
        vec3 color = vColor.rgb * uColor;
        float opacity = vColor.a * uOpacity;

        float dimming = max(0.0, min(1.0, uHighlight));
        float highlight = max(0.0, min(1.0, uHighlight - 1.0));

        color = mix(vec3(0.5), color, dimming);
        color = mix(color, vec3(1.0), highlight * 0.25);
        opacity = min(dimming, opacity);
        opacity = min(1.0, opacity + highlight);

        vec2 matCoord = ( mod(gl_FragCoord.xy, 4.0) - vec2(0.5) ) / 4.0;
        vec4 ditherPattern = texture2D( tDitherMatrix, matCoord.xy );

        gl_FragColor = vec4(color, max(opacity, uDithering));

        if (max(opacity, 1.0 - uDithering) < ditherPattern.r) discard;
      }
    `;

		}

		changed() {

			this.uniforms.uColor.value = this.color;
			this.uniforms.uOpacity.value = this.opacity;
			this.uniforms.uHighlight.value = this.highlight;
			this.uniforms.uDithering.value = this.dithering ? 1 : 0;
			this.uniformsNeedUpdate = true;

		}

	} // TODO: depth bias and dithered transparency.


	const helperMaterial = new HelperMaterial();

	class ControlsHelper extends ControlsBase {

		constructor( camera, domElement, helperMap ) {

			super( camera, domElement );
			this.sizeAttenuation = 1;

			if ( helperMap ) {

				for ( let i = helperMap.length; i --; ) {

					const object = helperMap[ i ][ 0 ].clone();
					const helperSpec = helperMap[ i ][ 1 ];
					object.material = helperMaterial.clone();
					const material = object.material;
					material.userData.highlight = 1;
					material.color.setRGB( helperSpec.color.x, helperSpec.color.y, helperSpec.color.z );
					material.opacity = helperSpec.color.w;
					material.changed && material.changed();
					object.name = helperSpec.type + '-' + helperSpec.axis + helperSpec.tag || '';
					object.userData = {
						type: helperSpec.type,
						axis: helperSpec.axis,
						tag: helperSpec.tag
					};
					if ( helperSpec.position ) object.position.copy( helperSpec.position );
					if ( helperSpec.rotation ) object.rotation.copy( helperSpec.rotation );
					if ( helperSpec.scale ) object.scale.copy( helperSpec.scale );
					object.updateMatrix();
					const tempGeometry = object.geometry.clone();
					tempGeometry.applyMatrix4( object.matrix );
					object.geometry = tempGeometry;
					object.renderOrder = 1e10;
					object.position.set( 0, 0, 0 );
					object.rotation.set( 0, 0, 0 );
					object.scale.set( 1, 1, 1 );
					this.add( object );

				}

			}

		}

		dispose() {

			super.dispose();
			this.traverse( child => {

				if ( child.material ) child.material.dispose();
				if ( child.geometry ) child.geometry.dispose();

			} );

		}

		decomposeMatrices() {

			super.decomposeMatrices();
			const camera = this.camera;
			this.sizeAttenuation = 1;

			if ( camera instanceof THREE.OrthographicCamera ) {

				this.sizeAttenuation = ( camera.top - camera.bottom ) / camera.zoom;

			} else if ( camera instanceof THREE.PerspectiveCamera ) {

				const fovFactor = Math.min( 1.9 * Math.tan( Math.PI * camera.fov / 360 ) / camera.zoom, 7 );
				this.sizeAttenuation = this.worldPosition.distanceTo( this.cameraPosition ) * fovFactor;

			}

			this.sizeAttenuation *= 720 / this.domElement.clientHeight;

		}

	}

	const CircleGeometry = function ( radius, arc ) {

		const geometry = new THREE.BufferGeometry();
		const vertices = [];

		for ( let i = 0; i <= 63 * arc; ++ i ) {

			vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
			vertices.push( 0, Math.cos( ( i + 1 ) / 32 * Math.PI ) * radius, Math.sin( ( i + 1 ) / 32 * Math.PI ) * radius );

		}

		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		return geometry;

	};

	const lerp = ( x, y, a ) => {

		return x * ( 1 - a ) + y * a;

	};

	const EPS = 0.001;
	const H = 0.125;
	const HH = H / 2;
	const H2 = H * 2;
	const H3 = H * 3;
	const PICKER_DEBUG_ALPHA = 0.0;
	const scaleHandleGeometry = new THREE.BoxGeometry( H, H, H );
	const arrowGeometry = new THREE.CylinderGeometry( 0, HH, H2, 12, 1, false );
	const lineGeometry = new THREE.BufferGeometry();
	lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0 ], 3 ) );
	const squareLineGeometry = new THREE.BufferGeometry();
	squareLineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ - 1, - 1, 0, - 1, 1, 0, - 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, - 1, 0, 1, - 1, 0, - 1, - 1, 0 ], 3 ) );
	const translateOffsetLineGeometry = new THREE.BufferGeometry();
	translateOffsetLineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1 ], 3 ) );
	translateOffsetLineGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ ...colors.red, ...colors.red, ...colors.green, ...colors.green, ...colors.blue, ...colors.blue, ...colors.lightGray, ...colors.lightGray ], 3 ) );
	const scaleOffsetLineGeometry = new THREE.BufferGeometry();
	scaleOffsetLineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1 ], 3 ) );
	scaleOffsetLineGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ ...colors.white, ...colors.red, ...colors.red, ...colors.red, ...colors.red, ...colors.red, ...colors.white, ...colors.green, ...colors.green, ...colors.green, ...colors.green, ...colors.green, ...colors.white, ...colors.blue, ...colors.blue, ...colors.blue, ...colors.blue, ...colors.blue ], 3 ) );
	const cornerLineGeometry = new THREE.BufferGeometry();
	cornerLineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, - 1, 0, 0, 0, 0, 1, 0, 0 ], 3 ) );
	const translateHelperGeometrySpec = [[ new THREE.Mesh( arrowGeometry ), {
		type: 'translate',
		axis: 'X',
		tag: 'fwd',
		color: new THREE.Vector4( ...colors.red, 1 ),
		position: new THREE.Vector3( 1 - H2, 0, 0 ),
		rotation: new THREE.Euler( 0, 0, - Math.PI / 2 )
	} ], [ new THREE.Mesh( arrowGeometry ), {
		type: 'translate',
		axis: 'X',
		tag: 'bwd',
		color: new THREE.Vector4( ...colors.red, 1 ),
		position: new THREE.Vector3( 1 - H2, 0, 0 ),
		rotation: new THREE.Euler( 0, 0, Math.PI / 2 )
	} ], [ new THREE.LineSegments( lineGeometry ), {
		type: 'translate',
		axis: 'X',
		color: new THREE.Vector4( ...colors.red, 1 ),
		position: new THREE.Vector3( HH, 0, 0 ),
		scale: new THREE.Vector3( 1 - H2 - H, 1 - H2 - H, 1 - H2 - H )
	} ], [ new THREE.Mesh( arrowGeometry ), {
		type: 'translate',
		axis: 'Y',
		tag: 'fwd',
		color: new THREE.Vector4( ...colors.green, 1 ),
		position: new THREE.Vector3( 0, 1 - H2, 0 )
	} ], [ new THREE.Mesh( arrowGeometry ), {
		type: 'translate',
		axis: 'Y',
		tag: 'bwd',
		color: new THREE.Vector4( ...colors.green, 1 ),
		position: new THREE.Vector3( 0, 1 - H2, 0 ),
		rotation: new THREE.Euler( Math.PI, 0, 0 )
	} ], [ new THREE.LineSegments( lineGeometry ), {
		type: 'translate',
		axis: 'Y',
		color: new THREE.Vector4( ...colors.green, 1 ),
		position: new THREE.Vector3( 0, HH, 0 ),
		rotation: new THREE.Euler( 0, 0, Math.PI / 2 ),
		scale: new THREE.Vector3( 1 - H2 - H, 1 - H2 - H, 1 - H2 - H )
	} ], [ new THREE.Mesh( arrowGeometry ), {
		type: 'translate',
		axis: 'Z',
		tag: 'fwd',
		color: new THREE.Vector4( ...colors.blue, 1 ),
		position: new THREE.Vector3( 0, 0, 1 - H2 ),
		rotation: new THREE.Euler( Math.PI / 2, 0, 0 )
	} ], [ new THREE.Mesh( arrowGeometry ), {
		type: 'translate',
		axis: 'Z',
		tag: 'bwd',
		color: new THREE.Vector4( ...colors.blue, 1 ),
		position: new THREE.Vector3( 0, 0, 1 - H2 ),
		rotation: new THREE.Euler( - Math.PI / 2, 0, 0 )
	} ], [ new THREE.LineSegments( lineGeometry ), {
		type: 'translate',
		axis: 'Z',
		color: new THREE.Vector4( ...colors.blue, 1 ),
		position: new THREE.Vector3( 0, 0, HH ),
		rotation: new THREE.Euler( 0, - Math.PI / 2, 0 ),
		scale: new THREE.Vector3( 1 - H2 - H, 1 - H2 - H, 1 - H2 - H )
	} ], [ new THREE.Mesh( new THREE.OctahedronGeometry( HH, 0 ) ), {
		type: 'translate',
		axis: 'XYZ',
		color: new THREE.Vector4( ...colors.lightGray, 0.5 ),
		position: new THREE.Vector3( 0, 0, 0 ),
		rotation: new THREE.Euler( 0, 0, 0 )
	} ], [ new THREE.Mesh( new THREE.PlaneGeometry( H2, H2 ) ), {
		type: 'translate',
		axis: 'XY',
		color: new THREE.Vector4( ...colors.yellow, 0.15 ),
		position: new THREE.Vector3( H, H, 0 )
	} ], [ new THREE.LineSegments( cornerLineGeometry ), {
		type: 'translate',
		axis: 'XY',
		color: new THREE.Vector4( ...colors.yellow, 1 ),
		position: new THREE.Vector3( H2, H2, 0 ),
		rotation: new THREE.Euler( 0, 0, - Math.PI / 2 ),
		scale: new THREE.Vector3( H, H, 1 )
	} ], [ new THREE.Mesh( new THREE.PlaneGeometry( H2, H2 ) ), {
		type: 'translate',
		axis: 'YZ',
		color: new THREE.Vector4( ...colors.cyan, 0.15 ),
		position: new THREE.Vector3( 0, H, H ),
		rotation: new THREE.Euler( 0, Math.PI / 2, 0 )
	} ], [ new THREE.LineSegments( cornerLineGeometry ), {
		type: 'translate',
		axis: 'YZ',
		color: new THREE.Vector4( ...colors.cyan, 1 ),
		position: new THREE.Vector3( 0, H2, H2 ),
		rotation: new THREE.Euler( 0, - Math.PI / 2, - Math.PI / 2 ),
		scale: new THREE.Vector3( H, H, 1 )
	} ], [ new THREE.Mesh( new THREE.PlaneGeometry( H2, H2 ) ), {
		type: 'translate',
		axis: 'XZ',
		color: new THREE.Vector4( ...colors.magenta, 0.15 ),
		position: new THREE.Vector3( H, 0, H ),
		rotation: new THREE.Euler( - Math.PI / 2, 0, 0 )
	} ], [ new THREE.LineSegments( cornerLineGeometry ), {
		type: 'translate',
		axis: 'XZ',
		color: new THREE.Vector4( ...colors.magenta, 1 ),
		position: new THREE.Vector3( H2, 0, H2 ),
		rotation: new THREE.Euler( Math.PI / 2, 0, - Math.PI / 2 ),
		scale: new THREE.Vector3( H, H, 1 )
	} ], // Pickers
	[ new THREE.Mesh( new THREE.CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ), {
		type: 'translate',
		axis: 'X',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.red, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( H * 5, 0, 0 ),
		rotation: new THREE.Euler( Math.PI / 4, 0, - Math.PI / 2 )
	} ], [ new THREE.Mesh( new THREE.CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ), {
		type: 'translate',
		axis: 'Y',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.green, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 0, H * 5, 0 ),
		rotation: new THREE.Euler( 0, Math.PI / 4, 0 )
	} ], [ new THREE.Mesh( new THREE.CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ), {
		type: 'translate',
		axis: 'Z',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.blue, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 0, 0, H * 5 ),
		rotation: new THREE.Euler( Math.PI / 2, Math.PI / 4, 0 )
	} ], [ new THREE.Mesh( new THREE.OctahedronGeometry( H2, 0 ) ), {
		type: 'translate',
		axis: 'XYZ',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.white, PICKER_DEBUG_ALPHA )
	} ], [ new THREE.Mesh( new THREE.PlaneGeometry( H3, H3 ) ), {
		type: 'translate',
		axis: 'XY',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.yellow, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( H * 1.5, H * 1.5, 0 )
	} ], [ new THREE.Mesh( new THREE.PlaneGeometry( H3, H3 ) ), {
		type: 'translate',
		axis: 'YZ',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.cyan, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 0, H * 1.5, H * 1.5 ),
		rotation: new THREE.Euler( 0, Math.PI / 2, 0 )
	} ], [ new THREE.Mesh( new THREE.PlaneGeometry( H3, H3 ) ), {
		type: 'translate',
		axis: 'XZ',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.magenta, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( H * 1.5, 0, H * 1.5 ),
		rotation: new THREE.Euler( - Math.PI / 2, 0, 0 )
	} ], // Offset visualization
	[ new THREE.LineSegments( translateOffsetLineGeometry ), {
		type: 'translate',
		axis: 'XYZ',
		tag: 'offset',
		color: new THREE.Vector4( ...colors.white, 1 )
	} ]];
	const rotateHelperGeometrySpec = [[ new THREE.LineSegments( CircleGeometry( 1 - H, 0.5 ) ), {
		type: 'rotate',
		axis: 'X',
		color: new THREE.Vector4( ...colors.red, 1 )
	} ], [ new THREE.Mesh( new THREE.OctahedronGeometry( H / 2, 2 ) ), {
		type: 'rotate',
		axis: 'X',
		color: new THREE.Vector4( ...colors.red, 1 ),
		position: new THREE.Vector3( 0, 0, 1 - H )
	} ], [ new THREE.LineSegments( CircleGeometry( 1 - H, 0.5 ) ), {
		type: 'rotate',
		axis: 'Y',
		color: new THREE.Vector4( ...colors.green, 1 ),
		rotation: new THREE.Euler( 0, 0, - Math.PI / 2 )
	} ], [ new THREE.Mesh( new THREE.OctahedronGeometry( H / 2, 2 ) ), {
		type: 'rotate',
		axis: 'Y',
		color: new THREE.Vector4( ...colors.green, 1 ),
		position: new THREE.Vector3( 0, 0, 1 - H )
	} ], [ new THREE.LineSegments( CircleGeometry( 1 - H, 0.5 ) ), {
		type: 'rotate',
		axis: 'Z',
		color: new THREE.Vector4( ...colors.blue, 1 ),
		rotation: new THREE.Euler( 0, Math.PI / 2, 0 )
	} ], [ new THREE.Mesh( new THREE.OctahedronGeometry( H / 2, 2 ) ), {
		type: 'rotate',
		axis: 'Z',
		color: new THREE.Vector4( ...colors.blue, 1 ),
		position: new THREE.Vector3( 1 - H, 0, 0 )
	} ], [ new THREE.LineSegments( CircleGeometry( 1 + H * 3, 1 ) ), {
		type: 'rotate',
		axis: 'E',
		color: new THREE.Vector4( ...colors.yellow, 1 ),
		rotation: new THREE.Euler( 0, Math.PI / 2, 0 )
	} ], [ new THREE.LineSegments( CircleGeometry( 1 - H, 1 ) ), {
		type: 'rotate',
		axis: 'XYZE',
		color: new THREE.Vector4( ...colors.white, 0.5 ),
		rotation: new THREE.Euler( 0, Math.PI / 2, 0 )
	} ], // Pickers
	[ new THREE.Mesh( new THREE.TorusGeometry( 1 - HH, H, 4, 6, Math.PI ) ), {
		type: 'rotate',
		axis: 'X',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.red, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( - HH, 0, 0 ),
		rotation: new THREE.Euler( 0, - Math.PI / 2, - Math.PI / 2 ),
		scale: new THREE.Vector3( 1, 1, H3 )
	} ], [ new THREE.Mesh( new THREE.TorusGeometry( 1 - HH, H, 4, 6, Math.PI ) ), {
		type: 'rotate',
		axis: 'Y',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.green, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 0, - HH, 0 ),
		rotation: new THREE.Euler( Math.PI / 2, 0, 0 ),
		scale: new THREE.Vector3( 1, 1, H3 )
	} ], [ new THREE.Mesh( new THREE.TorusGeometry( 1 - HH, H, 4, 6, Math.PI ) ), {
		type: 'rotate',
		axis: 'Z',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.blue, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 0, 0, - HH ),
		rotation: new THREE.Euler( 0, 0, - Math.PI / 2 ),
		scale: new THREE.Vector3( 1, 1, H3 )
	} ], [ new THREE.Mesh( new THREE.TorusGeometry( 1 + H2 + H, H, 2, 12 ) ), {
		type: 'rotate',
		axis: 'E',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.yellow, PICKER_DEBUG_ALPHA )
	} ], [ new THREE.Mesh( new THREE.SphereGeometry( 1 + H2, 12, 2, 0, Math.PI * 2, 0, Math.PI / 2 ) ), {
		type: 'rotate',
		axis: 'XYZE',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.gray, PICKER_DEBUG_ALPHA ),
		rotation: new THREE.Euler( - Math.PI / 2, 0, 0 )
	} ], // Offset visualization
	[ new THREE.LineSegments( lineGeometry ), {
		type: 'rotate',
		axis: 'XYZ',
		tag: 'offset',
		color: new THREE.Vector4( ...colors.lightGray, 1 ),
		position: new THREE.Vector3( 0, 0, 1 + H * 3 ),
		rotation: new THREE.Euler( 0, Math.PI / 2, 0 ),
		scale: new THREE.Vector3( 2 + H * 6, 2 + H * 6, 2 + H * 6 )
	} ]];
	const scaleHelperGeometrySpec = [[ new THREE.Mesh( scaleHandleGeometry ), {
		type: 'scale',
		axis: 'XYZX',
		color: new THREE.Vector4( ...colors.lightGray, 1 ),
		position: new THREE.Vector3( 1 + H, 0, 0 )
	} ], [ new THREE.Mesh( scaleHandleGeometry ), {
		type: 'scale',
		axis: 'XYZY',
		color: new THREE.Vector4( ...colors.lightGray, 1 ),
		position: new THREE.Vector3( 0, 1 + H, 0 )
	} ], [ new THREE.Mesh( scaleHandleGeometry ), {
		type: 'scale',
		axis: 'XYZZ',
		color: new THREE.Vector4( ...colors.lightGray, 1 ),
		position: new THREE.Vector3( 0, 0, 1 + H )
	} ], [ new THREE.Mesh( scaleHandleGeometry ), {
		type: 'scale',
		axis: 'X',
		color: new THREE.Vector4( ...colors.red, 1 ),
		position: new THREE.Vector3( 1 - HH, 0, 0 ),
		rotation: new THREE.Euler( 0, 0, - Math.PI / 2 )
	} ], [ new THREE.LineSegments( lineGeometry ), {
		type: 'scale',
		axis: 'X',
		color: new THREE.Vector4( ...colors.red, 1 ),
		position: new THREE.Vector3( 0.5, 0, 0 ),
		scale: new THREE.Vector3( 0.5 - HH, 1, 1 )
	} ], [ new THREE.Mesh( scaleHandleGeometry ), {
		type: 'scale',
		axis: 'Y',
		color: new THREE.Vector4( ...colors.green, 1 ),
		position: new THREE.Vector3( 0, 1 - HH, 0 )
	} ], [ new THREE.LineSegments( lineGeometry ), {
		type: 'scale',
		axis: 'Y',
		color: new THREE.Vector4( ...colors.green, 1 ),
		position: new THREE.Vector3( 0, 0.5, 0 ),
		rotation: new THREE.Euler( 0, 0, Math.PI / 2 ),
		scale: new THREE.Vector3( 0.5 - HH, 1, 1 )
	} ], [ new THREE.Mesh( scaleHandleGeometry ), {
		type: 'scale',
		axis: 'Z',
		color: new THREE.Vector4( ...colors.blue, 1 ),
		position: new THREE.Vector3( 0, 0, 1 - HH ),
		rotation: new THREE.Euler( Math.PI / 2, 0, 0 )
	} ], [ new THREE.LineSegments( lineGeometry ), {
		type: 'scale',
		axis: 'Z',
		color: new THREE.Vector4( ...colors.blue, 1 ),
		position: new THREE.Vector3( 0, 0, 0.5 ),
		rotation: new THREE.Euler( 0, - Math.PI / 2, 0 ),
		scale: new THREE.Vector3( 0.5 - HH, 1, 1 )
	} ], [ new THREE.LineSegments( lineGeometry ), {
		type: 'scale',
		axis: 'XYZX',
		color: new THREE.Vector4( ...colors.lightGray, 1 ),
		position: new THREE.Vector3( 1 - H, 0, 0 ),
		scale: new THREE.Vector3( H2, 1, 1 )
	} ], [ new THREE.LineSegments( lineGeometry ), {
		type: 'scale',
		axis: 'XYZY',
		color: new THREE.Vector4( ...colors.lightGray, 1 ),
		position: new THREE.Vector3( 0, 1 - H, 0 ),
		rotation: new THREE.Euler( 0, 0, Math.PI / 2 ),
		scale: new THREE.Vector3( H2, 1, 1 )
	} ], [ new THREE.LineSegments( lineGeometry ), {
		type: 'scale',
		axis: 'XYZZ',
		color: new THREE.Vector4( ...colors.lightGray, 1 ),
		position: new THREE.Vector3( 0, 0, 1 - H ),
		rotation: new THREE.Euler( 0, - Math.PI / 2, 0 ),
		scale: new THREE.Vector3( H2, 1, 1 )
	} ], [ new THREE.LineSegments( squareLineGeometry ), {
		type: 'scale',
		axis: 'XY',
		color: new THREE.Vector4( ...colors.yellow, 1 ),
		position: new THREE.Vector3( 1 - HH, 1 - HH, 0 ),
		scale: new THREE.Vector3( HH, HH, 1 )
	} ], [ new THREE.Mesh( new THREE.PlaneGeometry( H2, H2 ) ), {
		type: 'scale',
		axis: 'XY',
		color: new THREE.Vector4( ...colors.yellow, 0.15 ),
		position: new THREE.Vector3( 1 - H, 1 - H, 0 )
	} ], [ new THREE.LineSegments( squareLineGeometry ), {
		type: 'scale',
		axis: 'YZ',
		color: new THREE.Vector4( ...colors.cyan, 1 ),
		position: new THREE.Vector3( 0, 1 - HH, 1 - HH ),
		rotation: new THREE.Euler( 0, Math.PI / 2, 0 ),
		scale: new THREE.Vector3( HH, HH, 1 )
	} ], [ new THREE.Mesh( new THREE.PlaneGeometry( H2, H2 ) ), {
		type: 'scale',
		axis: 'YZ',
		color: new THREE.Vector4( ...colors.cyan, 0.15 ),
		position: new THREE.Vector3( 0, 1 - H, 1 - H ),
		rotation: new THREE.Euler( 0, Math.PI / 2, 0 )
	} ], [ new THREE.LineSegments( squareLineGeometry ), {
		type: 'scale',
		axis: 'XZ',
		color: new THREE.Vector4( ...colors.magenta, 1 ),
		position: new THREE.Vector3( 1 - HH, 0, 1 - HH ),
		rotation: new THREE.Euler( Math.PI / 2, 0, 0 ),
		scale: new THREE.Vector3( HH, HH, 1 )
	} ], [ new THREE.Mesh( new THREE.PlaneGeometry( H2, H2 ) ), {
		type: 'scale',
		axis: 'XZ',
		color: new THREE.Vector4( ...colors.magenta, 0.15 ),
		position: new THREE.Vector3( 1 - H, 0, 1 - H ),
		rotation: new THREE.Euler( - Math.PI / 2, 0, 0 )
	} ], // Pickers
	[ new THREE.Mesh( new THREE.CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ), {
		type: 'scale',
		axis: 'X',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.red, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( H * 6, 0, 0 ),
		rotation: new THREE.Euler( Math.PI / 4, 0, - Math.PI / 2 )
	} ], [ new THREE.Mesh( new THREE.CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ), {
		type: 'scale',
		axis: 'Y',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.green, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 0, H * 6, 0 ),
		rotation: new THREE.Euler( 0, Math.PI / 4, 0 )
	} ], [ new THREE.Mesh( new THREE.CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ), {
		type: 'scale',
		axis: 'Z',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.blue, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 0, 0, H * 6 ),
		rotation: new THREE.Euler( Math.PI / 2, Math.PI / 4, 0 )
	} ], [ new THREE.Mesh( scaleHandleGeometry ), {
		type: 'scale',
		axis: 'XY',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.yellow, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 1 - H, 1 - H, - HH ),
		scale: new THREE.Vector3( 3, 3, 2 )
	} ], [ new THREE.Mesh( scaleHandleGeometry ), {
		type: 'scale',
		axis: 'YZ',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.cyan, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( - HH, 1 - H, 1 - H ),
		scale: new THREE.Vector3( 2, 3, 3 )
	} ], [ new THREE.Mesh( scaleHandleGeometry ), {
		type: 'scale',
		axis: 'XZ',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.magenta, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 1 - H, - HH, 1 - H ),
		scale: new THREE.Vector3( 3, 2, 3 )
	} ], [ new THREE.Mesh( new THREE.CylinderGeometry( H2, 0, H * 4, 6, 1, false ) ), {
		type: 'scale',
		axis: 'XYZX',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.white, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 1 + H, 0, 0 ),
		rotation: new THREE.Euler( Math.PI / 4, 0, - Math.PI / 2 )
	} ], [ new THREE.Mesh( new THREE.CylinderGeometry( H2, 0, H * 4, 6, 1, false ) ), {
		type: 'scale',
		axis: 'XYZY',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.white, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 0, 1 + H, 0 ),
		rotation: new THREE.Euler( 0, Math.PI / 4, 0 )
	} ], [ new THREE.Mesh( new THREE.CylinderGeometry( H2, 0, H * 4, 6, 1, false ) ), {
		type: 'scale',
		axis: 'XYZZ',
		tag: 'picker',
		color: new THREE.Vector4( ...colors.white, PICKER_DEBUG_ALPHA ),
		position: new THREE.Vector3( 0, 0, 1 + H ),
		rotation: new THREE.Euler( Math.PI / 2, Math.PI / 4, 0 )
	} ]];

	class TransformHelper extends ControlsHelper {

		constructor( camera, domElement ) {

			super( camera, domElement, [ ...scaleHelperGeometrySpec, ...translateHelperGeometrySpec, ...rotateHelperGeometrySpec ] );
			this.enabled = true;
			this.size = 1;
			this.space = 'local';
			this.activeMode = '';
			this.activeAxis = '';
			this.showX = true;
			this.showY = true;
			this.showZ = true;
			this.showE = true;
			this.showTranslate = true;
			this.showRotate = true;
			this.showScale = true;
			this.showOffset = true;
			this.dithering = false;
			this.positionOffset = new THREE.Vector3();
			this.quaternionOffset = new THREE.Quaternion();
			this.scaleOffset = new THREE.Vector3();
			this.dampingFactor = 0.2; // Hide translate and scale axis facing the camera

			this.AXIS_HIDE_TRESHOLD = 0.99;
			this.PLANE_HIDE_TRESHOLD = 0.9;
			this.AXIS_FLIP_TRESHOLD = - 0.001;
			this._tempMatrix = new THREE.Matrix4();
			this._dirVector = new THREE.Vector3( 0, 1, 0 );
			this._tempQuaternion = new THREE.Quaternion();
			this._tempQuaternion2 = new THREE.Quaternion();
			this.observeProperty( 'enabled' );
			this.observeProperty( 'activeAxis' );
			this.observeProperty( 'activeMode' );
			this.observeProperty( 'space' );
			this.observeProperty( 'size' );
			this.observeProperty( 'showX' );
			this.observeProperty( 'showY' );
			this.observeProperty( 'showZ' );
			this.observeProperty( 'showE' );
			this.observeProperty( 'showTranslate' );
			this.observeProperty( 'showRotate' );
			this.observeProperty( 'showScale' );
			this.observeProperty( 'showOffset' );
			this.observeProperty( 'dithering' );
			this._animate = this._animate.bind( this );

		}

		changed() {

			this.startAnimation( this._animate );

		}

		updateHandle( handle ) {

			const eye = this.eye;
			const quaternion = this.worldQuaternion;
			const handleType = handle.userData.type;
			const handleAxis = handle.userData.axis;
			const handleTag = handle.userData.tag || '';
			this.userData.size = this.userData.size || this.size;
			handle.quaternion.copy( quaternion ).invert();
			handle.position.set( 0, 0, 0 );
			handle.scale.set( 1, 1, 1 ).multiplyScalar( this.sizeAttenuation * this.userData.size / 7 );
			handle.quaternion.multiply( quaternion );
			handle.visible = true;
			if ( handleAxis.indexOf( 'X' ) !== - 1 && ! this.showX ) handle.visible = false;
			if ( handleAxis.indexOf( 'Y' ) !== - 1 && ! this.showY ) handle.visible = false;
			if ( handleAxis.indexOf( 'Z' ) !== - 1 && ! this.showZ ) handle.visible = false;
			if ( handleAxis !== 'E' && handleAxis.indexOf( 'E' ) !== - 1 && ( ! this.showX || ! this.showY || ! this.showZ || ! this.showE ) ) handle.visible = false;
			if ( handleAxis === 'E' && ! this.showE ) handle.visible = false;
			if ( handleType === 'translate' && ! this.showTranslate ) handle.visible = false;
			if ( handleType === 'rotate' && ! this.showRotate ) handle.visible = false;
			if ( handleType === 'scale' && ! this.showScale ) handle.visible = false;
			if ( handleTag.search( 'offset' ) !== - 1 && ! this.showOffset ) handle.visible = false;
			if ( handleTag.search( 'offset' ) !== - 1 && handleType !== this.activeMode ) handle.visible = false;

			if ( handleType === 'scale' && this.space === 'world' ) {

				if ( [ 'XYZX', 'XYZY', 'XYZZ' ].indexOf( handle.userData.axis ) === - 1 ) {

					handle.visible = false;

				}

			}

			if ( handleType === 'rotate' ) {

				this._dirVector.copy( eye ).applyQuaternion( this._tempQuaternion.copy( quaternion ).invert() ); // Hide handle pointing straight towards the camera


				if ( handleAxis.search( 'E' ) !== - 1 ) {

					this._tempQuaternion2.setFromRotationMatrix( this._tempMatrix.lookAt( eye, UNIT.ZERO, UNIT.Y ) );

					handle.quaternion.copy( quaternion ).invert();
					handle.quaternion.multiply( this._tempQuaternion2 );

				}

				if ( handleAxis === 'X' ) {

					this._tempQuaternion2.identity();

					this._tempQuaternion.setFromAxisAngle( UNIT.X, Math.atan2( - this._dirVector.y, this._dirVector.z ) );

					this._tempQuaternion.multiplyQuaternions( this._tempQuaternion2, this._tempQuaternion );

					handle.quaternion.copy( this._tempQuaternion );

					if ( this._dirVector.copy( UNIT.X ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

						handle.scale.x *= - 1;

					}

				}

				if ( handleAxis === 'Y' ) {

					this._tempQuaternion2.identity();

					this._tempQuaternion.setFromAxisAngle( UNIT.Y, Math.atan2( this._dirVector.x, this._dirVector.z ) );

					this._tempQuaternion.multiplyQuaternions( this._tempQuaternion2, this._tempQuaternion );

					handle.quaternion.copy( this._tempQuaternion );

					if ( this._dirVector.copy( UNIT.Y ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

						handle.scale.y *= - 1;

					}

				}

				if ( handleAxis === 'Z' ) {

					this._tempQuaternion2.identity();

					this._tempQuaternion.setFromAxisAngle( UNIT.Z, Math.atan2( this._dirVector.y, this._dirVector.x ) );

					this._tempQuaternion.multiplyQuaternions( this._tempQuaternion2, this._tempQuaternion );

					handle.quaternion.copy( this._tempQuaternion );

					if ( this._dirVector.copy( UNIT.Z ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

						handle.scale.z *= - 1;

					}

				}

				if ( handleTag === 'offset' ) {

					const rotationAngle = this.quaternionOffset.angleTo( this._tempQuaternion.identity() );

					this._dirVector.set( this.quaternionOffset.x, this.quaternionOffset.y, this.quaternionOffset.z ).normalize();

					handle.quaternion.copy( this._tempQuaternion.copy( quaternion ).invert() );
					handle.quaternion.multiply( this._tempQuaternion.setFromRotationMatrix( this._tempMatrix.lookAt( UNIT.ZERO, this._dirVector, UNIT.Y ) ) );
					handle.visible = !! rotationAngle && handleType === this.activeMode;

				}

			} else {

				// TODO: branch out translate and scale
				if ( handleType === 'translate' && handleTag === 'offset' ) {

					handle.position.copy( this.positionOffset ).applyQuaternion( this.worldQuaternionInv ).multiplyScalar( - 1 );
					handle.scale.copy( this.positionOffset ).applyQuaternion( this.worldQuaternionInv );

				} else {

					// Flip handle to prevent occlusion by other handles
					if ( handleAxis.search( 'X' ) !== - 1 || handleAxis === 'YZ' ) {

						if ( this._dirVector.copy( UNIT.X ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

							if ( handleTag === 'fwd' ) {

								handle.visible = false;

							} else {

								handle.scale.x *= - 1;

							}

						} else if ( handleTag === 'bwd' ) {

							handle.visible = false;

						}

					}

					if ( handleAxis.search( 'Y' ) !== - 1 || handleAxis === 'XZ' ) {

						if ( this._dirVector.copy( UNIT.Y ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

							if ( handleTag === 'fwd' ) {

								handle.visible = false;

							} else {

								handle.scale.y *= - 1;

							}

						} else if ( handleTag === 'bwd' ) {

							handle.visible = false;

						}

					}

					if ( handleAxis.search( 'Z' ) !== - 1 || handleAxis === 'XY' ) {

						if ( this._dirVector.copy( UNIT.Z ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

							if ( handleTag === 'fwd' ) {

								handle.visible = false;

							} else {

								handle.scale.z *= - 1;

							}

						} else if ( handleTag === 'bwd' ) {

							handle.visible = false;

						}

					}

				} // TODO: Design scale offset visualization. Make it work with inverse/flip axis.
				// if ( handleType === 'scale' && handleTag.search( 'offset' ) !== -1 ) {
				//   handle.visible = this.scaleOffset.length() !== 0 && handleType === this.activeMode;
				//   if (handleTag === 'offset') {
				//     handle.scale.multiply( this.scaleOffset ) );
				//   }
				// }

			} // Hide handles at grazing angles


			const hideAllignedToX = ( handleType === 'translate' || handleType === 'scale' ) && ( handleAxis === 'X' || handleAxis === 'XYZX' );
			const hideAllignedToY = ( handleType === 'translate' || handleType === 'scale' ) && ( handleAxis === 'Y' || handleAxis === 'XYZY' );
			const hideAllignedToZ = ( handleType === 'translate' || handleType === 'scale' ) && ( handleAxis === 'Z' || handleAxis === 'XYZZ' );
			const hideAllignedToXY = handleAxis === 'XY' || handleType === 'rotate' && handleAxis === 'Z' && ( this.showTranslate || this.showScale );
			const hideAllignedToYZ = handleAxis === 'YZ' || handleType === 'rotate' && handleAxis === 'X' && ( this.showTranslate || this.showScale );
			const hideAllignedToXZ = handleAxis === 'XZ' || handleType === 'rotate' && handleAxis === 'Y' && ( this.showTranslate || this.showScale );
			const hide_treshold = this.AXIS_HIDE_TRESHOLD * ( handleType === 'scale' ? this.AXIS_HIDE_TRESHOLD * 0.95 : this.AXIS_HIDE_TRESHOLD );
			const plane_hide_treshold = this.AXIS_HIDE_TRESHOLD * ( handleType === 'scale' ? this.PLANE_HIDE_TRESHOLD * 0.95 : this.PLANE_HIDE_TRESHOLD );

			if ( hideAllignedToX && Math.abs( this._dirVector.copy( UNIT.X ).applyQuaternion( quaternion ).dot( eye ) ) > hide_treshold ) {

				handle.visible = false;

			}

			if ( hideAllignedToY && Math.abs( this._dirVector.copy( UNIT.Y ).applyQuaternion( quaternion ).dot( eye ) ) > hide_treshold ) {

				handle.visible = false;

			}

			if ( hideAllignedToZ && Math.abs( this._dirVector.copy( UNIT.Z ).applyQuaternion( quaternion ).dot( eye ) ) > hide_treshold ) {

				handle.visible = false;

			}

			if ( hideAllignedToXY && Math.abs( this._dirVector.copy( UNIT.Z ).applyQuaternion( quaternion ).dot( eye ) ) < 1 - plane_hide_treshold ) {

				handle.visible = false;

			}

			if ( hideAllignedToYZ && Math.abs( this._dirVector.copy( UNIT.X ).applyQuaternion( quaternion ).dot( eye ) ) < 1 - plane_hide_treshold ) {

				handle.visible = false;

			}

			if ( hideAllignedToXZ && Math.abs( this._dirVector.copy( UNIT.Y ).applyQuaternion( quaternion ).dot( eye ) ) < 1 - plane_hide_treshold ) {

				handle.visible = false;

			}

			if ( handle.visible ) {

				const material = handle.material;
				material.dithering = handle instanceof THREE.LineSegments ? false : this.dithering;
				material.changed && material.changed();

			}

		}

		_animate( timestep ) {

			// TODO: make animation speed in XR same
			const damping = Math.pow( this.dampingFactor, timestep * 60 / 1000 );
			let needsUpdate = false; // Animate axis highlight

			for ( let i = 0; i < this.children.length; i ++ ) {

				const handle = this.children[ i ];
				const handleType = handle.userData.type;
				const handleAxis = handle.userData.axis;
				const handleTag = handle.userData.tag || '';
				let targetHighlight = 1;

				if ( handleTag === 'picker' ) {

					targetHighlight = 0;

				} else {

					const material = handle.material;

					if ( handleTag.search( 'offset' ) !== - 1 ) {

						handle.renderOrder = 1e10 + 20;

					} else if ( ! this.enabled || this.activeMode && handleType !== this.activeMode ) {

						targetHighlight = handle instanceof THREE.LineSegments ? 0 : 0.1;
						handle.renderOrder = 1e10 - 10;

					} else if ( this.activeAxis ) {

						if ( handleAxis === this.activeAxis ) {

							targetHighlight = 2;
							handle.renderOrder = 1e10 + 10;

						} else {

							targetHighlight = 0.25;
							handle.renderOrder = 1e10 - 10;

						}

						if ( [ 'translate', 'scale' ].indexOf( handleType ) !== - 1 ) {

							if ( this.activeAxis.split( '' ).some( a => {

								return handleAxis === a;

							} ) ) {

								targetHighlight = 2;
								handle.renderOrder = 1e10 + 10;

							}

						}

					}

					material.userData.highlight = material.userData.highlight || targetHighlight;
					const highlight = lerp( material.userData.highlight, targetHighlight, damping );

					if ( Math.abs( material.userData.highlight - highlight ) > EPS ) {

						material.userData.highlight = highlight;
						material.highlight = highlight;
						needsUpdate = true;

					}

				}

			} // Animate size


			this.userData.size = this.userData.size || this.size;
			const size = lerp( this.userData.size, this.size, damping );

			if ( Math.abs( this.userData.size - size ) > EPS ) {

				this.userData.size = size;
				needsUpdate = true;

			}

			if ( ! needsUpdate ) this.stopAnimation( this._animate );
			if ( this.parent ) this.parent.dispatchEvent( {
				type: 'change'
			} );

		}

		updateMatrixWorld() {

			super.updateMatrixWorld();

			for ( let i = 0; i < this.children.length; i ++ ) {

				this.updateHandle( this.children[ i ] );

			}

		}

	}

	TransformHelper.isTransformHelper = true;
	TransformHelper.type = 'TransformHelper';

	function getFirstIntersection( intersections, includeInvisible ) {

		for ( let i = 0; i < intersections.length; i ++ ) {

			if ( intersections[ i ].object.visible || includeInvisible ) {

				return intersections[ i ];

			}

		}

		return null;

	} // TODO: fix inverted scale rotation axis


	class TransformControls extends ControlsInteractive {

		constructor( camera, domElement ) {

			super( camera, domElement ); // TransformHelper API

			this.size = 1;
			this.space = 'local';
			this.showX = true;
			this.showY = true;
			this.showZ = true;
			this.showE = true;
			this.showTranslate = true;
			this.showRotate = true;
			this.showScale = true;
			this.showOffset = true;
			this.dithering = false;
			this.dragging = false;
			this.active = false;
			this.activeMode = '';
			this.activeAxis = '';
			this.translationSnap = 0;
			this.rotationSnap = 0;
			this.scaleSnap = 0;
			this.minGrazingAngle = 30;
			this._pointStart = new THREE.Vector3();
			this._pointStartNorm = new THREE.Vector3();
			this._point = new THREE.Vector3();
			this._pointNorm = new THREE.Vector3();
			this._pointOffset = new THREE.Vector3();
			this._worldPositionStart = new THREE.Vector3();
			this._worldQuaternionStart = new THREE.Quaternion();
			this._worldScaleStart = new THREE.Vector3();
			this._worldMatrix = new THREE.Matrix4();
			this._worldPosition = new THREE.Vector3();
			this._worldQuaternion = new THREE.Quaternion();
			this._worldQuaternionInv = new THREE.Quaternion();
			this._worldScale = new THREE.Vector3();
			this._matrixStart = new THREE.Matrix4();
			this._positionStart = new THREE.Vector3();
			this._quaternionStart = new THREE.Quaternion();
			this._quaternionStartInv = new THREE.Quaternion();
			this._scaleStart = new THREE.Vector3();
			this._matrix = new THREE.Matrix4();
			this._position = new THREE.Vector3();
			this._quaternion = new THREE.Quaternion();
			this._scale = new THREE.Vector3();
			this._rotationAxis = new THREE.Vector3();
			this._parentWorldPosition = new THREE.Vector3();
			this._parentWorldQuaternion = new THREE.Quaternion();
			this._parentWorldQuaternionInv = new THREE.Quaternion();
			this._parentWorldScale = new THREE.Vector3();
			this._tempVector1 = new THREE.Vector3();
			this._tempVector2 = new THREE.Vector3();
			this._tempQuaternion = new THREE.Quaternion();
			this._dirX = new THREE.Vector3( 1, 0, 0 );
			this._dirY = new THREE.Vector3( 0, 1, 0 );
			this._dirZ = new THREE.Vector3( 0, 0, 1 );
			this._normalVector = new THREE.Vector3();
			this._identityQuaternion = Object.freeze( new THREE.Quaternion() );
			this._viewportCameraPosition = new THREE.Vector3();
			this._viewportCameraQuaternion = new THREE.Quaternion();
			this._viewportCameraScale = new THREE.Vector3();
			this._viewportEye = new THREE.Vector3();
			this._cameraHelpers = new Map(); // Define properties with getters/setter
			// Setting the defined property will automatically trigger change event

			this.observeProperty( 'object' );
			this.observeProperty( 'activeAxis' );
			this.observeProperty( 'activeMode' );
			this.observeProperty( 'space' );
			this.observeProperty( 'size' );
			this.observeProperty( 'active' );
			this.observeProperty( 'dragging' );
			this.observeProperty( 'showX' );
			this.observeProperty( 'showY' );
			this.observeProperty( 'showZ' );
			this.observeProperty( 'showE' );
			this.observeProperty( 'showTranslate' );
			this.observeProperty( 'showRotate' );
			this.observeProperty( 'showScale' );
			this.observeProperty( 'showOffset' );
			this.observeProperty( 'dithering' ); // Deprecation warnings

			Object.defineProperty( this, 'mode', {
				set: () => {

					console.warn( 'THREE.TransformControls: "mode" has been deprecated. Use showTranslate, showScale and showRotate.' );

				}
			} );
			Object.defineProperty( this, 'camera', {
				get() {

					return camera;

				},

				set( newCamera ) {

					const oldCamera = camera;
					camera = newCamera;
					newCamera !== oldCamera && this.cameraChanged( newCamera );

				}

			} );
			this.cameraChanged( camera );

		}

		cameraChanged( newCamera ) {

			if ( this.children.length ) this.remove( this.children[ 0 ] );
			this.add( this.getHelper( newCamera ) );

		}

		getHelper( camera ) {

			// TODO: set helper camera and domElement automatically before onBeforeRender.
			const helper = this._cameraHelpers.get( camera ) || new TransformHelper( camera, this.domElement );

			this._cameraHelpers.set( camera, helper );

			return helper;

		}

		dispose() {

			super.dispose();

			this._cameraHelpers.forEach( helper => {

				helper.dispose();

			} );

			this._cameraHelpers.clear();

		}

		decomposeViewportCamera( camera ) {

			camera.matrixWorld.decompose( this._viewportCameraPosition, this._viewportCameraQuaternion, this._viewportCameraScale );

			if ( camera instanceof THREE.OrthographicCamera ) {

				this._viewportEye.set( 0, 0, 1 ).applyQuaternion( this._viewportCameraQuaternion );

			} else {

				this._viewportEye.copy( this._viewportCameraPosition ).sub( this._worldPosition ).normalize();

			}

			return this._viewportEye;

		}

		decomposeMatrices() {

			super.decomposeMatrices();

			if ( this.object ) {

				this.object.updateMatrixWorld();

				if ( this.object.parent === null ) {

					console.error( 'TransformControls: The attached 3D object must be a part of the scene graph.' );

				} else {

					this.object.parent.matrixWorld.decompose( this._parentWorldPosition, this._parentWorldQuaternion, this._parentWorldScale );

					this._parentWorldQuaternionInv.copy( this._parentWorldQuaternion ).invert();

				}

				this._matrix.copy( this.object.matrix );

				this._matrix.decompose( this._position, this._quaternion, this._scale );

				this._worldMatrix.copy( this.object.matrixWorld );

				this._worldMatrix.decompose( this._worldPosition, this._worldQuaternion, this._worldScale );

				this._worldQuaternionInv.copy( this._worldQuaternion ).invert();

			} // This assumes TransformControls instance is in world frame.


			this.position.copy( this._worldPosition );
			this.quaternion.copy( this.space === 'local' ? this._worldQuaternion : this._identityQuaternion );

		}

		changed() {

			this._cameraHelpers.forEach( helper => {

				helper.space = this.space;
				helper.showX = this.showX;
				helper.showY = this.showY;
				helper.showZ = this.showZ;
				helper.showE = this.showE;
				helper.showTranslate = this.showTranslate;
				helper.showRotate = this.showRotate;
				helper.showScale = this.showScale;
				helper.showOffset = this.showOffset;
				helper.dithering = this.dithering;
				helper.enabled = this.enabled;
				helper.activeMode = this.activeMode;
				helper.activeAxis = this.activeAxis;
				helper.size = this.size;

			} );

		}

		getPlaneNormal( cameraQuaternion ) {

			this._dirX.set( 1, 0, 0 ).applyQuaternion( this.space === 'local' ? this._worldQuaternion : this._identityQuaternion );

			this._dirY.set( 0, 1, 0 ).applyQuaternion( this.space === 'local' ? this._worldQuaternion : this._identityQuaternion );

			this._dirZ.set( 0, 0, 1 ).applyQuaternion( this.space === 'local' ? this._worldQuaternion : this._identityQuaternion ); // Align the plane for current transform mode, axis and space.


			switch ( this.activeMode ) {

				case 'translate':
				case 'scale':
					switch ( this.activeAxis ) {

						case 'X':
							this._normalVector.set( 0, 0, 1 ).applyQuaternion( cameraQuaternion ).normalize().cross( this._dirX ).cross( this._dirX );

							break;

						case 'Y':
							this._normalVector.set( 0, 0, 1 ).applyQuaternion( cameraQuaternion ).normalize().cross( this._dirY ).cross( this._dirY );

							break;

						case 'Z':
							this._normalVector.set( 0, 0, 1 ).applyQuaternion( cameraQuaternion ).normalize().cross( this._dirZ ).cross( this._dirZ );

							break;

						case 'XY':
							this._normalVector.copy( this._dirZ );

							break;

						case 'YZ':
							this._normalVector.copy( this._dirX );

							break;

						case 'XZ':
							this._normalVector.copy( this._dirY );

							break;

						case 'XYZ':
						case 'XYZX':
						case 'XYZY':
						case 'XYZZ':
						case 'E':
							this._normalVector.set( 0, 0, 1 ).applyQuaternion( cameraQuaternion ).normalize();

							break;

					}

					break;

				case 'rotate':
				default:
					// special case for rotate
					this._normalVector.set( 0, 0, 1 ).applyQuaternion( cameraQuaternion ).normalize();

			}

			return this._normalVector;

		}

		onTrackedPointerHover( pointer ) {

			if ( ! this.object || this.active === true ) return;
			const camera = this.xr && this.xr.isPresenting ? this.camera : pointer.camera;
			const helper = this.getHelper( camera );
			const pickers = helper.children.filter( child => {

				return child.userData.tag === 'picker';

			} );
			const intersect = getFirstIntersection( pointer.intersectObjects( pickers ), false );

			if ( intersect && ! pointer.isSimulated ) {

				this.activeMode = intersect.object.userData.type;
				this.activeAxis = intersect.object.userData.axis;

			} else {

				this.activeMode = '';
				this.activeAxis = '';

			}

		}

		onTrackedPointerDown( pointer ) {

			// TODO: Unhack! This enables axis reset/interrupt when simulated pointer is driving gesture with inertia.
			this.activeAxis = ''; // TODO: consider triggering hover from Controls.js
			// Simulates hover before down on touchscreen

			this.onTrackedPointerHover( pointer ); // TODO: Unhack! This enables axis reset/interrupt when simulated pointer is driving gesture with inertia.

			if ( this.activeAxis === '' ) {

				this.active = false;
				this.dragging = false;

			}

			if ( ! this.object || this.dragging === true || pointer.button !== 0 ) return;

			if ( this.activeAxis !== '' ) {

				let space = this.space;

				if ( this.activeMode === 'scale' ) {

					space = 'local';

				} else if ( this.activeAxis === 'E' || this.activeAxis === 'XYZE' || this.activeAxis === 'XYZ' ) {

					space = 'world';

				}

				if ( space === 'local' && this.activeMode === 'rotate' ) {

					const snap = this.rotationSnap;
					if ( this.activeAxis === 'X' && snap ) this.object.rotation.x = Math.round( this.object.rotation.x / snap ) * snap;
					if ( this.activeAxis === 'Y' && snap ) this.object.rotation.y = Math.round( this.object.rotation.y / snap ) * snap;
					if ( this.activeAxis === 'Z' && snap ) this.object.rotation.z = Math.round( this.object.rotation.z / snap ) * snap;

				}

				this.object.updateMatrixWorld();
				if ( this.object.parent ) this.object.parent.updateMatrixWorld();

				this._matrixStart.copy( this.object.matrix );

				this._matrixStart.decompose( this._positionStart, this._quaternionStart, this._scaleStart );

				this._quaternionStartInv.copy( this._quaternionStart ).invert();

				this._matrix.copy( this.object.matrix );

				this._matrix.decompose( this._position, this._quaternion, this._scale );

				this.object.matrixWorld.decompose( this._worldPositionStart, this._worldQuaternionStart, this._worldScaleStart );

				this._rotationAxis.set( 0, 0, 0 );

				this._cameraHelpers.forEach( helper => {

					helper.positionOffset.set( 0, 0, 0 );
					helper.quaternionOffset.identity();
					helper.scaleOffset.set( 0, 0, 0 );

				} );

				this.dispatchEvent( {
					type: 'start',
					object: this.object,
					matrixStart: this._matrixStart,
					positionStart: this._positionStart,
					quaternionStart: this._quaternionStart,
					scaleStart: this._scaleStart,
					matrix: this._matrix,
					position: this._position,
					quaternion: this._quaternion,
					scale: this._scale,
					axis: this.activeAxis,
					mode: this.activeMode
				} );
				this.dragging = true;
				this.active = true;

			}

		}

		onTrackedPointerMove( pointer ) {

			const axis = this.activeAxis;
			const mode = this.activeMode;
			const object = this.object;
			const camera = this.xr && this.xr.isPresenting ? this.camera : pointer.camera;
			this.decomposeViewportCamera( camera );
			let space = this.space;

			if ( mode === 'scale' ) {

				space = 'local';

			} else if ( axis === 'E' || axis === 'XYZE' || axis === 'XYZ' ) {

				space = 'world';

			}

			if ( pointer.isSimulated ) this.dragging = false;
			if ( ! object || axis === '' || this.active === false || pointer.button !== 0 ) return;

			this._plane.setFromNormalAndCoplanarPoint( this.getPlaneNormal( this._viewportCameraQuaternion ), this._worldPositionStart );

			const intersection = pointer.projectOnPlane( this._plane, this.minGrazingAngle );
			if ( ! intersection ) return; // TODO: handle intersection miss

			this._pointStart.copy( intersection.start ).sub( this._worldPositionStart );

			this._point.copy( intersection.current ).sub( this._worldPositionStart );

			this._pointStartNorm.copy( this._pointStart ).normalize();

			this._pointNorm.copy( this._point ).normalize();

			this._pointOffset.copy( this._point ).sub( this._pointStart );

			if ( mode === 'translate' ) {

				// Apply translate
				this._tempVector2.copy( this._pointOffset );

				if ( space === 'local' ) {

					this._tempVector2.applyQuaternion( this._quaternionStartInv );

				}

				if ( axis.indexOf( 'X' ) === - 1 ) this._tempVector2.x = 0;
				if ( axis.indexOf( 'Y' ) === - 1 ) this._tempVector2.y = 0;
				if ( axis.indexOf( 'Z' ) === - 1 ) this._tempVector2.z = 0;

				if ( space === 'local' ) {

					this._tempVector2.applyQuaternion( this._quaternionStart ).divide( this._parentWorldScale );

				} else {

					this._tempVector2.applyQuaternion( this._parentWorldQuaternionInv ).divide( this._parentWorldScale );

				}

				object.position.copy( this._tempVector2 ).add( this._positionStart ); // Apply translation snap

				if ( this.translationSnap ) {

					if ( space === 'local' ) {

						object.position.applyQuaternion( this._tempQuaternion.copy( this._quaternionStart ).invert() );

						if ( axis.search( 'X' ) !== - 1 ) {

							object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;

						}

						if ( axis.search( 'Y' ) !== - 1 ) {

							object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;

						}

						if ( axis.search( 'Z' ) !== - 1 ) {

							object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;

						}

						object.position.applyQuaternion( this._quaternionStart );

					}

					if ( space === 'world' ) {

						if ( object.parent ) {

							object.position.add( this._parentWorldPosition );

						}

						if ( axis.search( 'X' ) !== - 1 ) {

							object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;

						}

						if ( axis.search( 'Y' ) !== - 1 ) {

							object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;

						}

						if ( axis.search( 'Z' ) !== - 1 ) {

							object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;

						}

						if ( object.parent ) {

							object.position.sub( this._parentWorldPosition );

						}

					}

				}

			} else if ( mode === 'scale' ) {

				if ( axis.search( 'XYZ' ) !== - 1 ) {

					let d = this._point.length() / this._pointStart.length();

					if ( this._point.dot( this._pointStart ) < 0 ) d *= - 1;

					this._tempVector2.set( d, d, d );

				} else {

					this._tempVector1.copy( this._pointStart );

					this._tempVector2.copy( this._point );

					this._tempVector1.applyQuaternion( this._worldQuaternionInv );

					this._tempVector2.applyQuaternion( this._worldQuaternionInv );

					this._tempVector2.divide( this._tempVector1 );

					if ( axis.search( 'X' ) === - 1 ) {

						this._tempVector2.x = 1;

					}

					if ( axis.search( 'Y' ) === - 1 ) {

						this._tempVector2.y = 1;

					}

					if ( axis.search( 'Z' ) === - 1 ) {

						this._tempVector2.z = 1;

					}

				} // Apply scale


				object.scale.copy( this._scaleStart ).multiply( this._tempVector2 );

				if ( this.scaleSnap ) {

					if ( axis.search( 'X' ) !== - 1 ) {

						object.scale.x = Math.round( object.scale.x / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

					}

					if ( axis.search( 'Y' ) !== - 1 ) {

						object.scale.y = Math.round( object.scale.y / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

					}

					if ( axis.search( 'Z' ) !== - 1 ) {

						object.scale.z = Math.round( object.scale.z / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

					}

				}

			} else if ( mode === 'rotate' ) {

				let ROTATION_SPEED = pointer.domElement.clientHeight / 720;
				if ( this.xr && this.xr.isPresenting ) ROTATION_SPEED *= 5;
				let angle = 0;

				if ( axis === 'E' ) {

					this._rotationAxis.copy( this._viewportEye );

					angle = this._point.angleTo( this._pointStart );
					angle *= this._pointNorm.cross( this._pointStartNorm ).dot( this._viewportEye ) < 0 ? 1 : - 1;

				} else if ( axis === 'XYZE' ) {

					this._tempVector2.copy( this._pointStart ).add( this._pointOffset );

					const helper = this.getHelper( pointer.camera );
					let lerp = this._tempVector2.length() / helper.sizeAttenuation;
					lerp = Math.min( 1, Math.pow( 2 * Math.max( 0, lerp - 0.03 ), 2 ) );

					this._tempVector2.cross( this._viewportEye ).normalize();

					this._tempVector1.copy( this._tempVector2 ).multiplyScalar( - 1 );

					if ( this._rotationAxis.length() === 0 ) lerp = 1;

					const flip = this._rotationAxis.dot( this._tempVector2 ) > this._rotationAxis.dot( this._tempVector1 );

					this._rotationAxis.lerp( flip ? this._tempVector2 : this._tempVector1, lerp ).normalize();

					angle = this._pointOffset.dot( this._tempVector2.copy( this._rotationAxis ).cross( this._viewportEye ) ) * ROTATION_SPEED;

				} else if ( axis === 'X' || axis === 'Y' || axis === 'Z' ) {

					this._rotationAxis.copy( UNIT[ axis ] );

					this._tempVector1.copy( UNIT[ axis ] );

					if ( space === 'local' ) {

						this._tempVector1.applyQuaternion( this._worldQuaternion );

					}

					angle = this._pointOffset.dot( this._tempVector1.cross( this._viewportEye ).normalize() ) * ROTATION_SPEED;

				} // Apply rotation snap


				if ( this.rotationSnap ) angle = Math.round( angle / this.rotationSnap ) * this.rotationSnap; // Apply rotat

				if ( space === 'local' && axis !== 'E' && axis !== 'XYZE' ) {

					object.quaternion.copy( this._quaternionStart );
					object.quaternion.multiply( this._tempQuaternion.setFromAxisAngle( this._rotationAxis, angle ) ).normalize();

				} else {

					this._rotationAxis.applyQuaternion( this._parentWorldQuaternionInv );

					object.quaternion.copy( this._tempQuaternion.setFromAxisAngle( this._rotationAxis, angle ) );
					object.quaternion.multiply( this._quaternionStart ).normalize();

				}

			}

			this.updateMatrixWorld();

			this._matrix.copy( object.matrix );

			this._matrix.decompose( this._position, this._quaternion, this._scale );

			this._tempQuaternion.copy( this._quaternionStart ).invert();

			this._cameraHelpers.forEach( helper => {

				helper.positionOffset.copy( this._position ).sub( this._positionStart );
				helper.quaternionOffset.copy( this._quaternion ).multiply( this._tempQuaternion ).normalize();
				helper.scaleOffset.copy( this._scale ).divide( this._scaleStart );

			} );

			this.dispatchEvent( {
				type: 'transform',
				object: this.object,
				matrixStart: this._matrixStart,
				positionStart: this._positionStart,
				quaternionStart: this._quaternionStart,
				scaleStart: this._scaleStart,
				matrix: this._matrix,
				position: this._position,
				quaternion: this._quaternion,
				scale: this._scale,
				axis: this.activeAxis,
				mode: this.activeMode
			} );
			this.dispatchEvent( {
				type: 'change'
			} );

		}

		onTrackedPointerUp( pointer ) {

			if ( pointer.button > 0 || ! this.object ) return;

			if ( this.active ) {

				this._matrix.copy( this.object.matrix );

				this._matrix.decompose( this._position, this._quaternion, this._scale );

				this._cameraHelpers.forEach( helper => {

					helper.positionOffset.set( 0, 0, 0 );
					helper.quaternionOffset.identity();
					helper.scaleOffset.set( 0, 0, 0 );

				} );

				this.dispatchEvent( {
					type: 'end',
					object: this.object,
					matrixStart: this._matrixStart,
					positionStart: this._positionStart,
					quaternionStart: this._quaternionStart,
					scaleStart: this._scaleStart,
					matrix: this._matrix,
					position: this._position,
					quaternion: this._quaternion,
					scale: this._scale,
					axis: this.activeAxis,
					mode: this.activeMode
				} );

			}

			this.active = false;
			this.dragging = false;
			this.activeAxis = '';
			this.activeMode = '';

		} // Set current object


		attach( object ) {

			this.object = object;
			this.visible = true;
			this.updateMatrixWorld();
			return this;

		} // Detatch from object


		detach() {

			this.object = undefined;
			this.visible = false;
			this.activeAxis = '';
			return this;

		} // TODO: deprecate


		getMode() {

			console.warn( 'THREE.TransformControls: getMode function has been deprecated. Use showTranslate, showScale and showRotate.' );

		}

		setMode( mode ) {

			console.warn( 'THREE.TransformControls: setMode function has been deprecated. Use showTranslate, showScale and showRotate.' );
			this.showTranslate = mode === 'translate';
			this.showRotate = mode === 'rotate';
			this.showScale = mode === 'scale';

		}

		setTranslationSnap( translationSnap ) {

			console.warn( 'THREE.TransformControls: setTranslationSnap function has been deprecated.' );
			this.translationSnap = translationSnap;

		}

		setRotationSnap( rotationSnap ) {

			console.warn( 'THREE.TransformControls: setRotationSnap function has been deprecated.' );
			this.rotationSnap = rotationSnap;

		}

		setScaleSnap( scaleSnap ) {

			console.warn( 'THREE.TransformControls: setScaleSnap function has been deprecated.' );
			this.scaleSnap = scaleSnap;

		}

		setSize( size ) {

			console.warn( 'THREE.TransformControls: setSize function has been deprecated.' );
			this.size = size;

		}

		setSpace( space ) {

			console.warn( 'THREE.TransformControls: setSpace function has been deprecated.' );
			this.space = space;

		}

		update() {

			console.warn( 'THREE.TransformControls: update function has been deprecated.' );

		}

		addEventListener( type, listener ) {

			if ( type === 'mouseDown' ) {

				console.warn( `You are using deprecated "${type}" event. Use "start" event instead.` );
				super.addEventListener( 'start', listener );
				return;

			}

			if ( type === 'mouseUp' ) {

				console.warn( `You are using deprecated "${type}" event. Use "end" event instead.` );
				super.addEventListener( 'end', listener );
				return;

			}

			if ( type === 'objectChange' ) {

				console.warn( `You are using deprecated "${type}" event. Use "changed" event instead.` );
				super.addEventListener( 'changed', listener );
				return;

			}

			super.addEventListener( type, listener );

		}

	}

	TransformControls.isTransformControls = true;
	TransformControls.type = 'TransformControls';

	THREE.TransformControls = TransformControls;

} )();
