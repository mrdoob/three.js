import { Vector3 } from '../math/Vector3';
import { Audio } from './Audio';
import { Object3D } from '../core/Object3D';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function PositionalAudio ( listener ) {
	this.isPositionalAudio = true;

	Audio.call( this, listener );

	this.panner = this.context.createPanner();
	this.panner.connect( this.gain );

};

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

	},

	getRolloffFactor: function () {

		return this.panner.rolloffFactor;

	},

	setRolloffFactor: function ( value ) {

		this.panner.rolloffFactor = value;

	},

	getDistanceModel: function () {

		return this.panner.distanceModel;

	},

	setDistanceModel: function ( value ) {

		this.panner.distanceModel = value;

	},

	getMaxDistance: function () {

		return this.panner.maxDistance;

	},

	setMaxDistance: function ( value ) {

		this.panner.maxDistance = value;

	},

	updateMatrixWorld: ( function () {

		var position = new Vector3();

		return function updateMatrixWorld( force ) {

			Object3D.prototype.updateMatrixWorld.call( this, force );

			position.setFromMatrixPosition( this.matrixWorld );

			this.panner.setPosition( position.x, position.y, position.z );

		};

	} )()


} );


export { PositionalAudio };