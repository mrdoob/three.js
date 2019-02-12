/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { Audio } from './Audio.js';
import { Object3D } from '../core/Object3D.js';

function PositionalAudio( listener ) {

	Audio.call( this, listener );

	this.panner = this.context.createPanner();
	this.panner.connect( this.gain );

}

PositionalAudio.prototype = Object.assign( Object.create( Audio.prototype ), {

	constructor: PositionalAudio,

	getOutput: function () {

		return this.panner;

	},

	getRefDistance: function () {

		return this.panner.refDistance;

	},

	setRefDistance: function ( value ) {

		this.panner.refDistance = value;

		return this;

	},

	getRolloffFactor: function () {

		return this.panner.rolloffFactor;

	},

	setRolloffFactor: function ( value ) {

		this.panner.rolloffFactor = value;

		return this;

	},

	getDistanceModel: function () {

		return this.panner.distanceModel;

	},

	setDistanceModel: function ( value ) {

		this.panner.distanceModel = value;

		return this;

	},

	getMaxDistance: function () {

		return this.panner.maxDistance;

	},

	setMaxDistance: function ( value ) {

		this.panner.maxDistance = value;

		return this;

	},

	setDirectionalCone: function ( coneInnerAngle, coneOuterAngle, coneOuterGain ) {

		this.panner.coneInnerAngle = coneInnerAngle;
		this.panner.coneOuterAngle = coneOuterAngle;
		this.panner.coneOuterGain = coneOuterGain;

		return this;

	},

	updateMatrixWorld: ( function () {

		var position = new Vector3();
		var quaternion = new Quaternion();
		var scale = new Vector3();

		var orientation = new Vector3();

		return function updateMatrixWorld( force ) {

			Object3D.prototype.updateMatrixWorld.call( this, force );

			if ( this.isPlaying === false ) return;

			this.matrixWorld.decompose( position, quaternion, scale );

			orientation.set( 0, 0, 1 ).applyQuaternion( quaternion );

			var panner = this.panner;

			if ( panner.positionX ) {

				// code path for Chrome and Firefox (see #14393)

				var endTime = this.context.currentTime + this.listener.timeDelta;

				panner.positionX.linearRampToValueAtTime( position.x, endTime );
				panner.positionY.linearRampToValueAtTime( position.y, endTime );
				panner.positionZ.linearRampToValueAtTime( position.z, endTime );
				panner.orientationX.linearRampToValueAtTime( orientation.x, endTime );
				panner.orientationY.linearRampToValueAtTime( orientation.y, endTime );
				panner.orientationZ.linearRampToValueAtTime( orientation.z, endTime );

			} else {

				panner.setPosition( position.x, position.y, position.z );
				panner.setOrientation( orientation.x, orientation.y, orientation.z );

			}

		};

	} )()


} );

export { PositionalAudio };
