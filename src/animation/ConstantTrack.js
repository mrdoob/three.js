

THREE.ConstantTrack = function ( name, value ) {

	this.value = value || null;

	THREE.Track.call( this, name );

};

THREE.ConstantTrack.prototype = {

	constructor: THREE.ConstantTrack,

	getAt: function( time ) {

		return this.value;

	}

};