import {
	EventDispatcher,
	Vector2,
	Vector3,
	Plane,
	Camera,
	Raycaster
} from "../../../build/three.module.js";

/**
 * Generic superclass for various interactive controls. 
 * - Adds/removes event listeners during lifecycle and on `enabled` property change.
 * - Forwards pointer and keyboard events:
 *   "contextmenu", "wheel", "pointerdown", "pointermove", "pointerup", "keydown", "keyup".
 * - Emits synthetic pointer events:
 *   "enabled", "disabled", "dispose"
 * - Evokes methods with tracked pointer and keyCode data:
 *   onTrackedPointerDown, onTrackedPointerMove, onTrackedPointerUp, onTrackedKeyDown, onTrackedKeyUp, onTrackedKeyChange.
 */

const raycaster = new Raycaster();
const intersectedObjects = [];
const intersectedPoint = new Vector3();

const EPS = 0.000001;

const changeEvent = { type: 'change' };

const ControlsMixin = ( superclass ) => {

	const classConstructor = class extends superclass {

		constructor( camera, domElement ) {

			super();

			if ( domElement === undefined ) console.warn( 'THREE.Controls: "domElement" parameter is now mandatory!' );
			if ( domElement === document ) console.error( 'THREE.Controls: "domElement" should be "renderer.domElement"!' );

			this.domElement = domElement;

			if ( camera === undefined ) console.warn( 'THREE.Controls: "camera" parameter is now mandatory!' );
			if ( !(camera instanceof Camera) ) console.warn( 'THREE.Controls: Unsupported camera type!' );

			this.camera = camera;

			//
			// Camera target used for camera controls and pointer view -> world space conversion. 
			//

			const target = new Vector3();

			// TODO encode target in camera matrix + focus.

			Object.defineProperty( this, 'target', {

				get: () => {

					return target;

				},

				set: ( value ) => {

					target.copy( value );

				}

			} );

			target.set = ( x, y, z ) => {

				Vector3.prototype.set.call( target, x, y, z );
				this.camera.lookAt( target );
				this.dispatchEvent( changeEvent );

			}

			target.copy = ( value ) => {

				Vector3.prototype.copy.call( target, value );
				this.camera.lookAt( target );
				this.dispatchEvent( changeEvent );

			}

			target.set( 0, 0, 0 );

			this.saveCameraState();

			//
			// Api
			//

			this._defineProperty( 'enabled', true, value => {

				value ? _connect() : _disconnect();

			} );

			this.enableDamping = false;

			this.dampingFactor = 0.05;

			//
			// Internals
			//

			Object.defineProperty( this, '_hover', {
				enumerable: false,
				writable: true,
			});

			Object.defineProperty( this, '_center', {
				enumerable: false,
				writable: true,
			});

			Object.defineProperty( this, '_pointers', {
				value: [],
				enumerable: false,
			});

			Object.defineProperty( this, '_animations', {
				value: [],
				enumerable: false,
			});

			Object.defineProperty( this, '_keys', {
				value: [],
				enumerable: false,
			});

			const _onContextMenu = ( event ) => {

				this.dispatchEvent( event );

			}

			const _onWheel = ( event ) => {

				this.dispatchEvent( event );

			}

			const _onPointerDown = ( event ) => {

				this._interacting = true;

				if ( _simulatedPointerWithInertia && _simulatedPointerWithInertia.pointerId == event.pointerId ) {

					_simulatedPointerWithInertia = null;
					this.stopAnimation( _onPointerSimulation );

				}

				this.domElement.focus ? this.domElement.focus() : window.focus();

				this.domElement.setPointerCapture( event.pointerId );

				const pointers = this._pointers;
				const pointer = new Pointer( event, this.camera, this.target );

				pointers.push( pointer );

				this.onTrackedPointerDown( pointer, pointers );

				this.dispatchEvent( event );

			}

			const _onPointerMove = ( event ) => {

				const pointers = this._pointers;
				let pointer;

				const i = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );

				if ( pointers[ i ] ) {

					pointer = pointers[ i ];

					pointer.update( event, this.camera, this.target );

					const x = Math.abs( pointer.view.current.x );
					const y = Math.abs( pointer.view.current.y );

					// Workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=1131348

					if ( pointer.button !== 0 && ( x > 1 || x < 0 || y > 1 || y < 0 ) ) {

						pointers.splice( i, 1 );

						this.domElement.releasePointerCapture( event.pointerId );

						this.dispatchEvent( event );

						this.onTrackedPointerUp( pointer, pointers );

						return;

					}

					this._center = this._center || new CenterPointer( event, this.camera, this.target );
					this._center.update( pointers );

					// TODO: consider throttling once per frame. On Mac pointermove fires up to 120 Hz.
					this.onTrackedPointerMove( pointer, pointers, this._center );

					// TODO: investigate multi-poiter update accumulation. Possibly fixed.

					for (let j = 0; j < pointers.length; j++) {

						if ( pointer.pointerId !== pointers[j].pointerId ) {

							pointers[j].clear();

						}

					}

					// pointer.clear();

				} else if ( this._hover && this._hover.pointerId === event.pointerId ) {

					pointer = this._hover;

					pointer.update( event, this.camera, this.target );

					this.onTrackedPointerHover( pointer, [ pointer ] );

				} else {

					pointer = this._hover = new Pointer( event, this.camera, this.target );

					this.onTrackedPointerHover( pointer, [ pointer ] );

				}

				// Fix MovementX/Y for Safari
				Object.defineProperty( event, 'movementX', { writable: true, value: pointer.movement.x } );
				Object.defineProperty( event, 'movementY', { writable: true, value: pointer.movement.y } );

				this.dispatchEvent( event );

			}

			let _simulatedPointerWithInertia = null;

			const _onPointerUp = ( event ) => {

				// TODO: three-finger drag on Mac producing delayed pointerup.

				const pointers = this._pointers;

				const i = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );

				if ( i !== -1 ) {

					const pointer = pointers[ i ];

					pointers.splice( i, 1 );

					this.domElement.releasePointerCapture( event.pointerId );

					if ( pointers.length === 0 && this.enableDamping ) {

						this._interacting = false;

						_simulatedPointerWithInertia = pointer;

						this.startAnimation( _onPointerSimulation );

					} else {

						this.onTrackedPointerUp( pointer, pointers );

					}

				}

				this.dispatchEvent( event );

			}

			const _onPointerLeave = ( event ) => {

				const pointers = this._pointers;

				const i = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );

				const pointer = pointers[ i ];

				if ( pointer ) {

					pointers.splice( i, 1 );

					this.domElement.releasePointerCapture( event.pointerId );

					this.onTrackedPointerUp( pointer, pointers );

				}

				this.dispatchEvent( event );

			}

			const _onPointerCancel = ( event ) => {

				const pointers = this._pointers;

				const i = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );

				const pointer = pointers[ i ];

				if ( pointer ) {

					pointers.splice( i, 1 );

					this.domElement.releasePointerCapture( event.pointerId );

					this.onTrackedPointerUp( pointer, pointers );

				}

				this.dispatchEvent( event );

			}

			const _onPointerOver = ( event ) => {

				this.dispatchEvent( event );

			}

			const _onPointerEnter = ( event ) => {

				this.dispatchEvent( event );

			}

			const _onPointerOut = ( event ) => {

				this.dispatchEvent( event );

			}

			const _onPointerSimulation = ( timeDelta ) => {

				if ( _simulatedPointerWithInertia ) {

					_simulatedPointerWithInertia.applyDamping( this.dampingFactor, timeDelta );

					if ( _simulatedPointerWithInertia.movement.length() > EPS ) {

						this.onTrackedPointerMove( _simulatedPointerWithInertia, [ _simulatedPointerWithInertia ], _simulatedPointerWithInertia );

					} else {

						this.onTrackedPointerUp( _simulatedPointerWithInertia, [] );

						_simulatedPointerWithInertia = null;

					}

				} else {

					this.stopAnimation( _onPointerSimulation );

				}


			}

			const _onKeyDown = ( event ) => {

				const keys = this._keys;
				const i = keys.findIndex( key => key.keyCode === event.keyCode );

				if ( i === -1 ) keys.push( event );

				if ( !event.repeat ) {

					this.onTrackedKeyDown( event.keyCode, keys );
					this.onTrackedKeyChange( event.keyCode, keys );

				}

				this.dispatchEvent( event );

			}

			const _onKeyUp = ( event ) => {

				const keys = this._keys;
				const i = keys.findIndex( key => key.keyCode === event.keyCode );

				if ( i !== -1 ) keys.splice( i, 1 );

				this.onTrackedKeyUp( event.keyCode, keys );
				this.onTrackedKeyChange( event.keyCode, keys );

				this.dispatchEvent( event );

			}

			const _connect = () => {

				this.domElement.addEventListener( 'contextmenu', _onContextMenu, false );
				this.domElement.addEventListener( 'wheel', _onWheel, { capture: false, passive: false } );

				this.domElement.addEventListener( 'pointerdown', _onPointerDown, false );
				this.domElement.addEventListener( 'pointermove', _onPointerMove, false );
				this.domElement.addEventListener( 'pointerleave', _onPointerLeave, false );
				this.domElement.addEventListener( 'pointercancel', _onPointerCancel, false );
				this.domElement.addEventListener( 'pointerover', _onPointerOver, false );
				this.domElement.addEventListener( 'pointerenter', _onPointerEnter, false );
				this.domElement.addEventListener( 'pointerout', _onPointerOut, false );
				this.domElement.addEventListener( 'pointerup', _onPointerUp, false );

				this.domElement.addEventListener( 'keydown', _onKeyDown, false );
				this.domElement.addEventListener( 'keyup', _onKeyUp, false );

				// make sure element can receive keys.

				if ( this.domElement.tabIndex === - 1 ) {

					this.domElement.tabIndex = 0;

				}

				// make sure element has disabled touch-actions.

				if ( window.getComputedStyle( this.domElement ).touchAction !== 'none' ) {

					this.domElement.style.touchAction = 'none';

				}

				// TODO: consider reverting "tabIndex" and "style.touchAction" attributes on disconnect.

			}

			const _disconnect = () => {

				this.domElement.removeEventListener( 'contextmenu', _onContextMenu, false );
				this.domElement.removeEventListener( 'wheel', _onWheel, { capture: false, passive: false } );

				this.domElement.removeEventListener( 'pointerdown', _onPointerDown, false );
				this.domElement.removeEventListener( 'pointermove', _onPointerMove, false );
				this.domElement.removeEventListener( 'pointerleave', _onPointerLeave, false );
				this.domElement.removeEventListener( 'pointercancel', _onPointerCancel, false );
				this.domElement.removeEventListener( 'pointerup', _onPointerUp, false );

				this.domElement.removeEventListener( 'keydown', _onKeyDown, false );
				this.domElement.removeEventListener( 'keyup', _onKeyUp, false );

				for ( let i = 0; i < this._pointers.length; i++ ) {

					this.domElement.releasePointerCapture( this._pointers[i].pointerId );

				}

				for ( let i = 0; i < this._animations.length; i++ ) {

					this.stopAnimation( this._animations[ i ] );

				}

				this._pointers.length = 0;
				this._keys.length = 0;

			}

			_connect();

		}

		_defineProperty( prop, initValue, onChange ) {

			let propValue = initValue;

			Object.defineProperty( this, prop, {

				enumerable: true,

				get: () => {

					return propValue;

				},

				set: value => {

					if ( propValue !== value ) {

						propValue = value;

						if ( onChange ) onChange( value );

						this.dispatchEvent( { type: prop + '-changed', value: value } );

					}

				}

			} );

		}

		onTrackedPointerDown( pointer, pointers ) {
		}

		onTrackedPointerMove( pointer, pointers, center ) {
		}

		onTrackedPointerHover( pointer, pointers ) {
		}

		onTrackedPointerUp( pointer, pointers ) {
		}

		onTrackedKeyDown( keyCode, keyCodes ) {
		}

		onTrackedKeyUp( keyCode, keyCodes ) {
		}

		onTrackedKeyChange( keyCode, keyCodes ) {
		}

		dispose() {

			this.enabled = false;

			this.dispatchEvent( { type: 'dispose' } );

		}

		addEventListener( type, listener ) {

			if ( type === 'enabled' ) {

				console.warn( `THREE.Controls: "enabled" event is now "enabled-changed"!` );

				type = 'enabled-changed';

			}

			if ( type === 'disabled' ) {

				console.warn( `THREE.Controls: "disabled" event is now "enabled-changed"!` );

				type = 'enabled-changed';

			}

			super.addEventListener( type, listener );

		}

		dispatchEvent( event ) {

			Object.defineProperty( event, 'target', { writable: true } );

			super.dispatchEvent( event );

		}

		startAnimation( callback ) {

			const i = this._animations.findIndex( animation => animation === callback );

			if ( i === -1 ) this._animations.push( callback );

			_animationQueue.add( callback );

		}

		stopAnimation( callback ) {

			const i = this._animations.findIndex( animation => animation === callback );

			if ( i !== -1 ) this._animations.splice( i, 1 );

			_animationQueue.remove( callback );

		}

		saveState() {

			console.warn( 'THREE.Controls: "saveState" is now "saveCameraState"!' );

			this.saveCameraState();

		}

		reset() {

			console.warn( 'THREE.Controls: "reset" is now "resetCameraState"!' );

			this.resetCameraState();

		}

		saveCameraState() {

			this._resetQuaternion = this.camera.quaternion.clone();
			this._resetPosition = this.camera.position.clone();
			this._resetUp = this.camera.up.clone();
			this._resetTarget = this.target.clone();
			this._resetZoom = this.camera.zoom;
			this._resetFocus = this.camera.focus;

		}

		resetCameraState() {

			this.camera.quaternion.copy( this._resetQuaternion );
			this.camera.position.copy( this._resetPosition );
			this.camera.up.copy( this._resetUp );
			this.target.copy( this._resetTarget );
			this.camera.zoom = this._resetZoom;
			this.camera.focus = this._resetFocus;

			this.camera.updateProjectionMatrix();

			this.dispatchEvent( changeEvent );

		}

	}

	return classConstructor;

}

class Controls extends ControlsMixin( EventDispatcher ) {}

// Pointer class to keep track of pointer movements

const viewMultiplier = new Vector2();
const viewOffset = new Vector2();
const plane = new Plane();
const unitY = new Vector3( 0, 1, 0 );
const eye0 = new Vector3();

class Pointer {

	constructor( pointerEvent, camera, target ) {

		this._camera = camera;
		this._target = target;

		this.domElement = pointerEvent.srcElement;

		this.pointerId = pointerEvent.pointerId;

		this.type = pointerEvent.pointerType;

		this.button = pointerEvent.button;
		this.buttons = pointerEvent.buttons;

		this.altKey = pointerEvent.altKey;
		this.ctrlKey = pointerEvent.ctrlKey;
		this.metaKey = pointerEvent.metaKey;
		this.shiftKey = pointerEvent.shiftKey;

		this.start = new Vector2( pointerEvent.clientX, pointerEvent.clientY );
		this.current = new Vector2( pointerEvent.clientX, pointerEvent.clientY );
		this.previous = new Vector2( pointerEvent.clientX, pointerEvent.clientY );
		this.movement = new Vector2();
		this.offset = new Vector2();

		this.view = {
			start: new Vector2(),
			current: new Vector2(),
			previous: new Vector2(),
			movement: new Vector2(),
			offset: new Vector2(),
		};

		this.world = {
			start: new Vector3(),
			current: new Vector3(),
			previous: new Vector3(),
			movement: new Vector3(),
			offset: new Vector3(),
		};

		this.planar = {
			start: new Vector3(),
			current: new Vector3(),
			previous: new Vector3(),
			movement: new Vector3(),
			offset: new Vector3(),
		};

		this._calculateView();
		this._calculateWorld( camera, target );
		this._calculatePlanar( camera, target );

	}

	update( pointerEvent, camera, target ) {

		if ( this.pointerId !== pointerEvent.pointerId ) {

			console.error( 'Invalid pointerId!' );

			return;

		}

		this._camera = camera;
		this._target = target;

		this.button = this.button;
		this.buttons = this.buttons;

		this.altKey = pointerEvent.altKey;
		this.ctrlKey = pointerEvent.ctrlKey;
		this.metaKey = pointerEvent.metaKey;
		this.shiftKey = pointerEvent.shiftKey;

		this.previous.copy( this.current );
		this.current.set( pointerEvent.clientX, pointerEvent.clientY );
		// Calculate movement because Safari movement is broken
		this.movement.copy( this.current ).sub( this.previous );
		if ( pointerEvent.movementX && pointerEvent.movementX !== this.movement.x ) this.movement.x = pointerEvent.movementX;
		if ( pointerEvent.movementY && pointerEvent.movementY !== this.movement.y ) this.movement.y = pointerEvent.movementY;
		this.offset.set( pointerEvent.clientX, pointerEvent.clientY ).sub( this.start );

		this._calculateView();
		this._calculateWorld();
		this._calculatePlanar();

	}

	clear() {

		this.previous.copy( this.current );
		this.movement.set( 0, 0 );

		this._calculateView();
		this._calculateWorld();
		this._calculatePlanar();

	}

	applyDamping( dampingFactor, timeDelta ) {

		// TODO: use timeDelta

		this.movement.multiplyScalar( 1 - dampingFactor );
		this.previous.copy( this.current );
		this.current.add( this.movement );
		this.offset.set( this.current ).sub( this.start );

		this._calculateView();
		this._calculateWorld();
		this._calculatePlanar();

	}

	intersectObjects( objects ) {

		raycaster.setFromCamera( this.view.current, this._camera );

		intersectedObjects.length = 0;

		raycaster.intersectObjects( objects, true, intersectedObjects );

		return intersectedObjects;

	}

	intersectPlane( plane ) {

		raycaster.setFromCamera( this.view.current, this._camera );

		raycaster.ray.intersectPlane( plane, intersectedPoint );

		return intersectedPoint;

	}

	_calculateView() {

		viewMultiplier.set( this.domElement.clientWidth / 2, - 1 * this.domElement.clientHeight / 2 );
		viewOffset.set( 1, -1 );

		this.view.start.copy( this.start ).divide( viewMultiplier ).sub( viewOffset );
		this.view.current.copy( this.current ).divide( viewMultiplier ).sub( viewOffset );
		this.view.previous.copy( this.previous ).divide( viewMultiplier ).sub( viewOffset );
		this.view.movement.copy( this.movement ).divide( viewMultiplier );
		this.view.offset.copy( this.offset ).divide( viewMultiplier );

	}

	_calculateWorld() {

		plane.setFromNormalAndCoplanarPoint( eye0.set( 0, 0, 1 ).applyQuaternion( this._camera.quaternion ).normalize(), this._target );

		intersectedPoint.set( 0, 0, 0 );
		raycaster.setFromCamera( this.view.start, this._camera );
		raycaster.ray.intersectPlane( plane, intersectedPoint );
		this.world.start.copy( intersectedPoint );

		intersectedPoint.set( 0, 0, 0 );
		raycaster.setFromCamera( this.view.current, this._camera );
		raycaster.ray.intersectPlane( plane, intersectedPoint );
		this.world.current.copy( intersectedPoint );

		intersectedPoint.set( 0, 0, 0 );
		raycaster.setFromCamera( this.view.previous, this._camera );
		raycaster.ray.intersectPlane( plane, intersectedPoint );
		this.world.previous.copy( intersectedPoint );

		this.world.movement.copy( this.world.current ).sub( this.world.previous );
		this.world.offset.copy( this.world.current ).sub( this.world.start );

	}

	_calculatePlanar() {

		plane.setFromNormalAndCoplanarPoint( unitY, this._target );

		intersectedPoint.set( 0, 0, 0 );
		raycaster.setFromCamera( this.view.start, this._camera );
		raycaster.ray.intersectPlane( plane, intersectedPoint );
		this.planar.start.copy( intersectedPoint );
		
		intersectedPoint.set( 0, 0, 0 );
		raycaster.setFromCamera( this.view.current, this._camera );
		raycaster.ray.intersectPlane( plane, intersectedPoint );
		this.planar.current.copy( intersectedPoint );

		intersectedPoint.set( 0, 0, 0 );
		raycaster.setFromCamera( this.view.previous, this._camera );
		raycaster.ray.intersectPlane( plane, intersectedPoint );
		this.planar.previous.copy( intersectedPoint );
		
		this.planar.movement.copy( this.planar.current ).sub( this.planar.previous );
		this.planar.offset.copy( this.planar.current ).sub( this.planar.start );

	}

}

class CenterPointer extends Pointer {

	update( pointers ) {

		this.start.set( 0, 0 );
		this.current.set( 0, 0 );
		this.previous.set( 0, 0 );
		this.movement.set( 0, 0 );
		this.offset.set( 0, 0 );

		for (let i = 0; i < pointers.length; i++) {

			const pointer = pointers[i];
			this.start.add( pointer.start );
			this.current.add( pointer.current );
			this.previous.add( pointer.previous );
			this.movement.add( pointer.movement );
			this.offset.add( pointer.offset );

		}

		this.start.divideScalar( pointers.length );
		this.current.divideScalar( pointers.length );
		this.previous.divideScalar( pointers.length );
		this.movement.divideScalar( pointers.length );
		this.offset.divideScalar( pointers.length );

		this._calculateView();
		this._calculateWorld();
		this._calculatePlanar();

	}

}

class AnimationQueue {

	constructor() {

		this._queue = [];
		this._running = false;

		this._time = performance.now();

		this._update = this._update.bind( this );

	}

	add( callback ) {

		const i = this._queue.indexOf( callback );
		if ( i === -1 ) {

			this._queue.push( callback );
			if ( this._queue.length === 1 ) this._start();

		}

	}

	remove( callback ) {

		const i = this._queue.indexOf( callback );
		if ( i !== -1 ) {

			this._queue.splice( i, 1 );
			if ( this._queue.length === 0 ) this._stop();

		}

	}

	_start() {

		this._time = performance.now();
		this._running = true;

		requestAnimationFrame( this._update );

	}

	_stop() {

		this._running = false;

	}

	_update() {

		if ( this._queue.length === 0 ) {

			this._running = false;
			return;

		}

		if ( this._running ) requestAnimationFrame( this._update );

		const time = performance.now();

		const timestep = performance.now() - this._time;
		this._time = time;

		for ( let i = 0; i < this._queue.length; i++ ) {

			this._queue[i]( timestep, this._time );

		}

	}

}

const _animationQueue = new AnimationQueue();

export { ControlsMixin, Controls, Pointer };
