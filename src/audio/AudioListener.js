/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.AudioListener = function () {

	THREE.Object3D.call( this );

	this.type = 'AudioListener';

	this.context = THREE.AudioContext;

	this.gain = this.context.createGain();
	this.gain.connect( this.context.destination );

	this.filter = null;

};

THREE.AudioListener.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {

	constructor: THREE.AudioListener,

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

	},

	getMasterVolume: function () {

		return this.gain.gain.value;

	},

	setMasterVolume: function ( value ) {

		this.gain.gain.value = value;

	},

	updateMatrixWorld: ( function () {

		var position = new THREE.Vector3();
		var quaternion = new THREE.Quaternion();
		var scale = new THREE.Vector3();

		var orientation = new THREE.Vector3();

		return function updateMatrixWorld( force ) {

			THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

			var listener = this.context.listener;
			var up = this.up;

			this.matrixWorld.decompose( position, quaternion, scale );

			orientation.set( 0, 0, - 1 ).applyQuaternion( quaternion );

			listener.setPosition( position.x, position.y, position.z );
			listener.setOrientation( orientation.x, orientation.y, orientation.z, up.x, up.y, up.z );

		};

	} )()

} );
