/**
 * @author sunag / http://www.sunag.com.br/
 */

function ResolverNodeClass( nodeClass ) {

	this.callback = function() {

		return Reflect.construct(nodeClass, arguments);

	}

}

function ResolverCallbackFunction( method, callback ) {

	this.callback = function() {

		return callback( method, arguments );

	}

}

var NodeLib = {

	nodes: {},
	keywords: {},
	includes: {},

	addInclude: function ( node ) {

		this.includes[ node.name ] = node;

	},

	addKeyword: function ( name, callback, cache ) {

		cache = cache !== undefined ? cache : true;

		this.keywords[ name ] = { callback: callback, cache: cache };

	},

	addNode: function ( name, callbackNode ) {

		if ( this.containsNode( name ) ) {
			
			console.warn( `Node ${name} already exist.` );
			
		}

		this.nodes[ name ] = callbackNode;

	},

	addNodeClass: function ( name, nodeClass ) {

		this.addNode( name, new ResolverNodeClass( nodeClass ).callback );

	},

	addNodes: function ( nodeClass, callback ) {

		for( var property in nodeClass ) {
			
			// detect if the property is static
			
			if ( property === property.toUpperCase() ) {
				
				var method = nodeClass[property];
				
				this.addNode( method, new ResolverCallbackFunction( method, callback ).callback );
				
			}
			
		}
		
	},

	removeInclude: function ( node ) {

		delete this.nodes[ node.name ];

	},

	removeKeyword: function ( name ) {

		delete this.keywords[ name ];

	},

	removeNode: function ( name ) {

		delete this.nodes[ name ];

	},

	getInclude: function ( name ) {

		return this.includes[ name ];

	},

	getKeyword: function ( name, builder ) {

		return this.keywords[ name ].callback.call( this, builder );

	},

	getKeywordData: function ( name ) {

		return this.keywords[ name ];

	},

	getNode: function ( name ) {

		return this.nodes[ name ];

	},

	containsInclude: function ( name ) {

		return this.includes[ name ] !== undefined;

	},

	containsKeyword: function ( name ) {

		return this.keywords[ name ] !== undefined;

	},

	containsNode: function ( name ) {

		return this.includes[ name ] !== undefined;

	}

};

export { NodeLib };
