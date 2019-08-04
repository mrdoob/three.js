/**
 * @author sunag / http://www.sunag.com.br/
 */

function NodeContext() {

	this.data = {};

}

NodeContext.GAMMA = 'gamma';
NodeContext.INCLUDE = 'include';
NodeContext.IGNORE_CACHE = 'ignoreCache';

NodeContext.prototype = {

	constructor: NodeContext,

	setProperty: function ( name, value ) {

		this.data[ name ] = value;

		return this;

	},

	setClass: function ( name, value ) {

		return this.setProperty( name + 'Class', value );

	},

	setGamma: function ( value ) {

		return this.setProperty( NodeContext.GAMMA, value );

	},

	setInclude: function ( value ) {

		return this.setProperty( NodeContext.INCLUDE, value );

	},

	setIgnoreCache: function ( value ) {

		return this.setProperty( NodeContext.IGNORE_CACHE, value );

	}

};

export { NodeContext };
