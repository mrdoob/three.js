/**
 * @author mrdoob / http://mrdoob.com/
 */

function Layers () {
	this.isLayers = true;

	this.mask = 1;

};

Layers.prototype = {

	constructor: Layers,

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


export { Layers };