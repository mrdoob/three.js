/**
 * @author sunag / http://www.sunag.com.br/
 */

function NodeContext( slot ) {

	this.slot = slot || '';
	this.cache = '';
	this.data = {};

}

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

	setSampler: function ( uv ) {

		var cacheId = `sampler-uv-${uv.uuid}`;

		return this.setCache( cacheId ).setProperty( 'uv', uv );

	}

};

export { NodeContext };
