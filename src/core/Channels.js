/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Channels = function () {

	this.mask = 1;

};

THREE.Channels.prototype = {

	constructor: THREE.Channels,

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

	}

};
