import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { Clock } from '../core/Clock.js';
import { Object3D } from '../core/Object3D.js';
import { AudioContext } from './AudioContext.js';

const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _orientation = new Vector3();

function AudioListener() {

	Object3D.call( this );

	this.type = 'AudioListener';

	this.context = AudioContext.getContext();

	this.gain = this.context.createGain();
	this.gain.connect( this.context.destination );

	this.filter = null;

	this.timeDelta = 0;

	// private

	this._clock = new Clock();

}

AudioListener.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: AudioListener,

	getInput: function () {

		return this.gain;

	},

	removeFilter: function ( ) {

		if ( this.filter !== null ) {

			this.gain.disconnect( this.filter );
			this.filter.disconnect( this.context.destination );
			this.gain.connect( this.context.destination );
			this.filter = null;

		}

		return this;

	},

	getFilter: function () {

		return this.filter;

	},

	setFilter: function ( value ) {

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

	},

	getMasterVolume: function () {

		return this.gain.gain.value;

	},

	setMasterVolume: function ( value ) {

		this.gain.gain.setTargetAtTime( value, this.context.currentTime, 0.01 );

		return this;

	},

	updateMatrixWorld: function ( force ) {

		Object3D.prototype.updateMatrixWorld.call( this, force );

		const listener = this.context.listener;
		const up = this.up;

		this.timeDelta = this._clock.getDelta();

		this.matrixWorld.decompose( _position, _quaternion, _scale );

		_orientation.set( 0, 0, - 1 ).applyQuaternion( _quaternion );

		if ( listener.positionX ) {

			// code path for Chrome (see #14393)

			const endTime = this.context.currentTime + this.timeDelta;

			listener.positionX.linearRampToValueAtTime( _position.x, endTime );
			listener.positionY.linearRampToValueAtTime( _position.y, endTime );
			listener.positionZ.linearRampToValueAtTime( _position.z, endTime );
			listener.forwardX.linearRampToValueAtTime( _orientation.x, endTime );
			listener.forwardY.linearRampToValueAtTime( _orientation.y, endTime );
			listener.forwardZ.linearRampToValueAtTime( _orientation.z, endTime );
			listener.upX.linearRampToValueAtTime( up.x, endTime );
			listener.upY.linearRampToValueAtTime( up.y, endTime );
			listener.upZ.linearRampToValueAtTime( up.z, endTime );

		} else {

			listener.setPosition( _position.x, _position.y, _position.z );
			listener.setOrientation( _orientation.x, _orientation.y, _orientation.z, up.x, up.y, up.z );

		}

	}

} );

export { AudioListener };
