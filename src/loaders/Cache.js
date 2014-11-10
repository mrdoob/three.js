/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Cache = function () {

	this.files = {};

};

THREE.Cache.prototype = {

	constructor: THREE.Cache,

	add: function ( key, file ) {

		// console.log( 'THREE.Cache', 'Adding key:', key );

		this.files[ key ] = file;

	},

	get: function ( key ) {

		// console.log( 'THREE.Cache', 'Checking key:', key );

		return this.files[ key ];

	},

	remove: function ( key ) {

		delete this.files[ key ];

	},

	clear: function () {

		this.files = {}

	}

};
