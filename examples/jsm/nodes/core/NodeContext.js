/**
 * @author sunag / http://www.sunag.com.br/
 */

function NodeContext() {

	this.slot = '';
	this.cache = '';
	this.data = {};

}

NodeContext.GAMMA = 'gamma';
NodeContext.INCLUDE = 'include';
NodeContext.CACHING = 'caching';
NodeContext.UV = 'uv';

NodeContext.prototype = {

	constructor: NodeContext,

	setSlot: function ( slot ) {

		this.slot = slot;

		return this;

	},

	setCache: function ( cache ) {

		this.cache = cache;

		return this;

	},

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

	setSampler: function ( uv ) {

		var cacheId = `sampler-uv-${uv.uuid}`;

		return this.setCache( cacheId ).setProperty( NodeContext.UV, uv );

	},

	setCaching: function ( value ) {

		return this.setProperty( NodeContext.CACHING, value );

	}

};

export { NodeContext };
