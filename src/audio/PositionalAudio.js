import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { Audio } from './Audio.js';

const _position = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();
const _scale = /*@__PURE__*/ new Vector3();
const _orientation = /*@__PURE__*/ new Vector3();

/**
 * Represents a positional audio object.
 *
 * ```js
 * // create an AudioListener and add it to the camera
 * const listener = new THREE.AudioListener();
 * camera.add( listener );
 *
 * // create the PositionalAudio object (passing in the listener)
 * const sound = new THREE.PositionalAudio( listener );
 *
 * // load a sound and set it as the PositionalAudio object's buffer
 * const audioLoader = new THREE.AudioLoader();
 * audioLoader.load( 'sounds/song.ogg', function( buffer ) {
 * 	sound.setBuffer( buffer );
 * 	sound.setRefDistance( 20 );
 * 	sound.play();
 * });
 *
 * // create an object for the sound to play from
 * const sphere = new THREE.SphereGeometry( 20, 32, 16 );
 * const material = new THREE.MeshPhongMaterial( { color: 0xff2200 } );
 * const mesh = new THREE.Mesh( sphere, material );
 * scene.add( mesh );
 *
 * // finally add the sound to the mesh
 * mesh.add( sound );
 *
 * @augments Audio
 */
class PositionalAudio extends Audio {

	/**
	 * Constructs a positional audio.
	 *
	 * @param {AudioListener} listener - The global audio listener.
	 */
	constructor( listener ) {

		super( listener );

		/**
		 * The panner node represents the location, direction, and behavior of an audio
		 * source in 3D space.
		 *
		 * @type {PannerNode}
		 * @readonly
		 */
		this.panner = this.context.createPanner();
		this.panner.panningModel = 'HRTF';
		this.panner.connect( this.gain );

	}

	connect() {

		super.connect();

		this.panner.connect( this.gain );

		return this;

	}

	disconnect() {

		super.disconnect();

		this.panner.disconnect( this.gain );

		return this;

	}

	getOutput() {

		return this.panner;

	}

	/**
	 * Returns the current reference distance.
	 *
	 * @return {number} The reference distance.
	 */
	getRefDistance() {

		return this.panner.refDistance;

	}

	/**
	 * Defines the reference distance for reducing volume as the audio source moves
	 * further from the listener – i.e. the distance at which the volume reduction
	 * starts taking effect.
	 *
	 * @param {number} value - The reference distance to set.
	 * @return {Audio} A reference to this instance.
	 */
	setRefDistance( value ) {

		this.panner.refDistance = value;

		return this;

	}

	/**
	 * Returns the current rolloff factor.
	 *
	 * @return {number} The rolloff factor.
	 */
	getRolloffFactor() {

		return this.panner.rolloffFactor;

	}

	/**
	 * Defines how quickly the volume is reduced as the source moves away from the listener.
	 *
	 * @param {number} value - The rolloff factor.
	 * @return {Audio} A reference to this instance.
	 */
	setRolloffFactor( value ) {

		this.panner.rolloffFactor = value;

		return this;

	}

	/**
	 * Returns the current distance model.
	 *
	 * @return {('linear'|'inverse'|'exponential')} The distance model.
	 */
	getDistanceModel() {

		return this.panner.distanceModel;

	}

	/**
	 * Defines which algorithm to use to reduce the volume of the audio source
	 * as it moves away from the listener.
	 *
	 * Read [the spec]{@link https://www.w3.org/TR/webaudio-1.1/#enumdef-distancemodeltype}
	 * for more details.
	 *
	 * @param {('linear'|'inverse'|'exponential')} value - The distance model to set.
	 * @return {Audio} A reference to this instance.
	 */
	setDistanceModel( value ) {

		this.panner.distanceModel = value;

		return this;

	}

	/**
	 * Returns the current max distance.
	 *
	 * @return {number} The max distance.
	 */
	getMaxDistance() {

		return this.panner.maxDistance;

	}

	/**
	 * Defines the maximum distance between the audio source and the listener,
	 * after which the volume is not reduced any further.
	 *
	 * This value is used only by the `linear` distance model.
	 *
	 * @param {number} value - The max distance.
	 * @return {Audio} A reference to this instance.
	 */
	setMaxDistance( value ) {

		this.panner.maxDistance = value;

		return this;

	}

	/**
	 * Sets the directional cone in which the audio can be listened.
	 *
	 * @param {number} coneInnerAngle - An angle, in degrees, of a cone inside of which there will be no volume reduction.
	 * @param {number} coneOuterAngle - An angle, in degrees, of a cone outside of which the volume will be reduced by a constant value, defined by the `coneOuterGain` parameter.
	 * @param {number} coneOuterGain - The amount of volume reduction outside the cone defined by the `coneOuterAngle`. When set to `0`, no sound can be heard.
	 * @return {Audio} A reference to this instance.
	 */
	setDirectionalCone( coneInnerAngle, coneOuterAngle, coneOuterGain ) {

		this.panner.coneInnerAngle = coneInnerAngle;
		this.panner.coneOuterAngle = coneOuterAngle;
		this.panner.coneOuterGain = coneOuterGain;

		return this;

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		if ( this.hasPlaybackControl === true && this.isPlaying === false ) return;

		this.matrixWorld.decompose( _position, _quaternion, _scale );

		_orientation.set( 0, 0, 1 ).applyQuaternion( _quaternion );

		const panner = this.panner;

		if ( panner.positionX ) {

			// code path for Chrome and Firefox (see #14393)

			const endTime = this.context.currentTime + this.listener.timeDelta;

			panner.positionX.linearRampToValueAtTime( _position.x, endTime );
			panner.positionY.linearRampToValueAtTime( _position.y, endTime );
			panner.positionZ.linearRampToValueAtTime( _position.z, endTime );
			panner.orientationX.linearRampToValueAtTime( _orientation.x, endTime );
			panner.orientationY.linearRampToValueAtTime( _orientation.y, endTime );
			panner.orientationZ.linearRampToValueAtTime( _orientation.z, endTime );

		} else {

			panner.setPosition( _position.x, _position.y, _position.z );
			panner.setOrientation( _orientation.x, _orientation.y, _orientation.z );

		}

	}

}

export { PositionalAudio };
