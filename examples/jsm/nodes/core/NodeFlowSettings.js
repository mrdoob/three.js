/**
 * @author sunag / http://www.sunag.com.br/
 */

function NodeFlowSettings() {

	this.slot = '';
	this.cache = '';
	this.context = undefined;

}

NodeFlowSettings.prototype = {

	constructor: NodeFlowSettings,

	setSlot: function ( slot ) {

		this.slot = slot;

		return this;

	},

	setCache: function ( cache ) {

		this.cache = cache;

		return this;

	},

	setContext: function ( context ) {

		this.context = context;

		return this;

	}

};

export { NodeFlowSettings };
