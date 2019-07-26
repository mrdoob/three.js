/**
 * @author sunag / http://www.sunag.com.br/
 */

//import { NodeBuilder } from './NodeBuilder.js';
//console.log( NodeBuilder );

var NodeLib = {

	nodes: {},
	keywords: {},
	functions: {},

	add: function ( node ) {

		this.nodes[ node.name ] = node;

	},

	addKeyword: function ( name, callback, cache ) {

		cache = cache !== undefined ? cache : true;

		this.keywords[ name ] = { callback: callback, cache: cache };

	},

	addFunction: function ( name, callback ) {

		this.functions[ name ] = callback;

	},

	addFunctionNode: function ( name, node ) {

		this.functions[ name ] = node;

	},

	addFunctionNodeClass: function ( name, nodeClass ) {

		function callback() {
			
			return Reflect.construct(nodeClass, arguments)
			
		}

		this.functions[ name ] = callback;

	},

	addFunctions: ( function () {

		//var builder = new NodeBuilder();

		function ResolverCallbackFunction( method, callback ) {
			
			return function() {
			
				var params = Array.prototype.slice.call(arguments);
				params.unshift( method );
				
				return callback.apply( undefined, params );

			}
			
		}
		
		return function( nodeClass, callback ) {

			for( var property in nodeClass ) {
				
				// detect if the property is static
				
				if ( property === property.toUpperCase() ) {
					
					var method = nodeClass[property];
					
					this.addFunction( nodeClass[property], ResolverCallbackFunction( method, callback ) );
					
				}
				
			}
			
		}

	} )(),

	remove: function ( node ) {

		delete this.nodes[ node.name ];

	},

	removeKeyword: function ( name ) {

		delete this.keywords[ name ];

	},

	removeFunction: function ( name ) {

		delete this.functions[ name ];

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

	getFunction: function ( name ) {

		return this.functions[ name ];

	},

	contains: function ( name ) {

		return this.nodes[ name ] !== undefined;

	},

	containsKeyword: function ( name ) {

		return this.keywords[ name ] !== undefined;

	},

	containsFunction: function ( name ) {

		return this.functions[ name ] !== undefined;

	}

};

export { NodeLib };
