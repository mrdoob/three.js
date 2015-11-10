/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Layers = function () {

	this.mask = 1;

};

THREE.Layers.prototype = {

	constructor: THREE.Layers,

	set: function ( channel ) {

		this.mask = 1 << channel;

	},

	enable: function ( channel ) {

		this.mask |= 1 << channel;

	},

	toggle: function ( channel ) {

		this.mask ^= 1 << channel;

	},

	disable: function ( channel ) {

		this.mask &= ~ ( 1 << channel );

	},

	test: function ( layers ) {

		return ( this.mask & layers.mask ) !== 0;

	}

};
