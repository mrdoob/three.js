import { Timer } from '../core/Timer.js';
import { Object3D } from '../core/Object3D.js';
import { mat4Decompose } from '../math/Matrix4Functions.js';
import { quatCreate } from '../math/QuaternionFunctions.js';
import { vec3ApplyQuaternion, vec3Create, vec3Set } from '../math/Vector3Functions.js';
import { AudioContext } from './AudioContext.js';

const _position = /*@__PURE__*/ vec3Create();
const _quaternion = /*@__PURE__*/ quatCreate();
const _scale = /*@__PURE__*/ vec3Create();

const _forward = /*@__PURE__*/ vec3Create();
const _up = /*@__PURE__*/ vec3Create();

/**
 * The class represents a virtual listener of the all positional and non-positional audio effects
 * in the scene. A three.js application usually creates a single listener. It is a mandatory
 * constructor parameter for audios entities like {@link Audio} and {@link PositionalAudio}.
 *
 * In most cases, the listener object is a child of the camera. So the 3D transformation of the
 * camera represents the 3D transformation of the listener.
 *
 * @augments Object3D
 */
class AudioListener extends Object3D {

	/**
	 * Constructs a new audio listener.
	 */
	constructor() {

		super();

		this.type = 'AudioListener';

		/**
		 * The native audio context.
		 *
		 * @type {AudioContext}
		 * @readonly
		 */
		this.context = AudioContext.getContext();

		/**
		 * The gain node used for volume control.
		 *
		 * @type {GainNode}
		 * @readonly
		 */
		this.gain = this.context.createGain();
		this.gain.connect( this.context.destination );

		/**
		 * An optional filter.
		 *
		 * Defined via {@link AudioListener#setFilter}.
		 *
		 * @type {?AudioNode}
		 * @default null
		 * @readonly
		 */
		this.filter = null;

		/**
		 * Time delta values required for `linearRampToValueAtTime()` usage.
		 *
		 * @type {number}
		 * @default 0
		 * @readonly
		 */
		this.timeDelta = 0;

		// private

		this._timer = new Timer();

	}

	/**
	 * Returns the listener's input node.
	 *
	 * This method is used by other audio nodes to connect to this listener.
	 *
	 * @return {GainNode} The input node.
	 */
	getInput() {

		return this.gain;

	}

	/**
	 * Removes the current filter from this listener.
	 *
	 * @return {AudioListener} A reference to this listener.
	 */
	removeFilter() {

		if ( this.filter !== null ) {

			this.gain.disconnect( this.filter );
			this.filter.disconnect( this.context.destination );
			this.gain.connect( this.context.destination );
			this.filter = null;

		}

		return this;

	}

	/**
	 * Returns the current set filter.
	 *
	 * @return {?AudioNode} The filter.
	 */
	getFilter() {

		return this.filter;

	}

	/**
	 * Sets the given filter to this listener.
	 *
	 * @param {AudioNode} value - The filter to set.
	 * @return {AudioListener} A reference to this listener.
	 */
	setFilter( value ) {

		if ( this.filter !== null ) {

			this.gain.disconnect( this.filter );
			this.filter.disconnect( this.context.destination );

		} else {

			this.gain.disconnect( this.context.destination );

		}

		this.filter = value;
		this.gain.connect( this.filter );
		this.filter.connect( this.context.destination );

		return this;

	}

	/**
	 * Returns the applications master volume.
	 *
	 * @return {number} The master volume.
	 */
	getMasterVolume() {

		return this.gain.gain.value;

	}

	/**
	 * Sets the applications master volume. This volume setting affects
	 * all audio nodes in the scene.
	 *
	 * @param {number} value - The master volume to set.
	 * @return {AudioListener} A reference to this listener.
	 */
	setMasterVolume( value ) {

		this.gain.gain.setTargetAtTime( value, this.context.currentTime, 0.01 );

		return this;

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		this._timer.update();

		const listener = this.context.listener;

		this.timeDelta = this._timer.getDelta();

		mat4Decompose( this.matrixWorld, _position, _quaternion, _scale );

		// the initial forward and up directions must be orthogonal
		vec3ApplyQuaternion( vec3Set( _forward, 0, 0, - 1 ), _quaternion, _forward );
		vec3ApplyQuaternion( vec3Set( _up, 0, 1, 0 ), _quaternion, _up );

		if ( listener.positionX ) {

			// code path for Chrome (see #14393)

			const endTime = this.context.currentTime + this.timeDelta;

			listener.positionX.linearRampToValueAtTime( _position.x, endTime );
			listener.positionY.linearRampToValueAtTime( _position.y, endTime );
			listener.positionZ.linearRampToValueAtTime( _position.z, endTime );
			listener.forwardX.linearRampToValueAtTime( _forward.x, endTime );
			listener.forwardY.linearRampToValueAtTime( _forward.y, endTime );
			listener.forwardZ.linearRampToValueAtTime( _forward.z, endTime );
			listener.upX.linearRampToValueAtTime( _up.x, endTime );
			listener.upY.linearRampToValueAtTime( _up.y, endTime );
			listener.upZ.linearRampToValueAtTime( _up.z, endTime );

		} else {

			listener.setPosition( _position.x, _position.y, _position.z );
			listener.setOrientation( _forward.x, _forward.y, _forward.z, _up.x, _up.y, _up.z );

		}

	}

}

export { AudioListener };
