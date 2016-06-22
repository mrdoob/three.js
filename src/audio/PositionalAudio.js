/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PositionalAudio = function ( listener ) {

	THREE.Audio.call( this, listener );

	this.panner = this.context.createPanner();
	this.panner.connect( this.gain );

};

THREE.PositionalAudio.prototype = Object.assign( Object.create( THREE.Audio.prototype ), {

	constructor: THREE.PositionalAudio,

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

		var position = new THREE.Vector3();

		return function updateMatrixWorld( force ) {

			THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

			position.setFromMatrixPosition( this.matrixWorld );

			this.panner.setPosition( position.x, position.y, position.z );

		};

	} )()


} );
