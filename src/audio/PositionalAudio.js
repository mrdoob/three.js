/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { Audio } from './Audio.js';
import { Object3D } from '../core/Object3D.js';

class PositionalAudio extends Audio {

	constructor( listener ) {

		super( listener );

		this.panner = this.context.createPanner();
		this.panner.connect( this.gain );

	}

	getOutput() {

		return this.panner;

	}

	getRefDistance() {

		return this.panner.refDistance;

	}

	setRefDistance( value ) {

		this.panner.refDistance = value;

		return this;

	}

	getRolloffFactor() {

		return this.panner.rolloffFactor;

	}

	setRolloffFactor( value ) {

		this.panner.rolloffFactor = value;

		return this;

	}

	getDistanceModel() {

		return this.panner.distanceModel;

	}

	setDistanceModel( value ) {

		this.panner.distanceModel = value;

		return this;

	}

	getMaxDistance() {

		return this.panner.maxDistance;

	}

	setMaxDistance( value ) {

		this.panner.maxDistance = value;

		return this;

	}

	setDirectionalCone( coneInnerAngle, coneOuterAngle, coneOuterGain ) {

		this.panner.coneInnerAngle = coneInnerAngle;
		this.panner.coneOuterAngle = coneOuterAngle;
		this.panner.coneOuterGain = coneOuterGain;

		return this;

	}

}

PositionalAudio.prototype.updateMatrixWorld = ( function () {

	var position = new Vector3();
	var quaternion = new Quaternion();
	var scale = new Vector3();

	var orientation = new Vector3();

	return function updateMatrixWorld( force ) {

		Object3D.prototype.updateMatrixWorld.call( this, force );

		var panner = this.panner;
		this.matrixWorld.decompose( position, quaternion, scale );

		orientation.set( 0, 0, 1 ).applyQuaternion( quaternion );

		panner.setPosition( position.x, position.y, position.z );
		panner.setOrientation( orientation.x, orientation.y, orientation.z );

	};

} )();

export { PositionalAudio };
