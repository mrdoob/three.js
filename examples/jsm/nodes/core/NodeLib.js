/**
 * @author sunag / http://www.sunag.com.br/
 */

export const NodeLib = {

	nodes: {},
	keywords: {},
	resolvers: [],

	addResolver: function ( resolver ) {

		this.resolvers.push( resolver );

	},

	resolve: function( value ) {

		if ( value === undefined || value.isNode ) return value;
		else if ( typeof value === 'string' ) {

			if ( this.contains( value ) ) return this.get( value );
			else if ( this.containsKeyword( value ) ) return this.getKeyword( value );

		}

		var i = this.resolvers.length;

		// is necessary descending order to search from extended objects 

		while ( i -- ) {

			var node = this.resolvers[ i ]( value );

			if ( node ) return node;

		}

		return value;

	},

	add: function ( node ) {

		this.nodes[ node.name ] = node;

		return node;

	},

	addKeyword: function ( name, callback, cache ) {

		cache = cache !== undefined ? cache : true;

		this.keywords[ name ] = { callback: callback, cache: cache };

	},

	remove: function ( node ) {

		delete this.nodes[ node.name ];

	},

	removeKeyword: function ( name ) {

		delete this.keywords[ name ];

	},

	get: function ( name ) {

		return this.nodes[ name ];

	},

	getKeyword: function ( name, builder ) {

		return this.keywords[ name ].callback.call( this, builder );

	},

	getKeywordData: function ( name ) {

		return this.keywords[ name ];

	},

	contains: function ( name ) {

		return this.nodes[ name ] !== undefined;

	},

	containsKeyword: function ( name ) {

		return this.keywords[ name ] !== undefined;

	}

};
