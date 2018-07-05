/**
 * @author sunag / http://www.sunag.com.br/
 */

function NodeFrame( time ) {

	this.time = time !== undefined ? time : 0;

	this.frameId = 0;

};

NodeFrame.prototype = {

	constructor: NodeFrame,

	update: function ( delta ) {

		++this.frameId;

		this.time += delta;
		this.delta = delta;

		return this;

	},
	
	updateNode: function ( node ) {

		if ( node.frameId === this.frameId ) return this;

		node.updateFrame( this );

		node.frameId = this.frameId;

		return this;

	}
	
};

export { NodeFrame };
