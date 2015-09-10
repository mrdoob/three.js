/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = {

	enabled: false,

	files: {},

	add: function ( key, file ) {

		if ( this.enabled === false ) { return; }

		// console.log( "Cache", "Adding key:", key );

		this.files[ key ] = file;

	},

	get: function ( key ) {

		if ( this.enabled === false ) { return; }

		// console.log( "Cache", "Checking key:", key );

		return this.files[ key ];

	},

	remove: function ( key ) {

		delete this.files[ key ];

	},

	clear: function () {

		this.files = {};

	}

};
