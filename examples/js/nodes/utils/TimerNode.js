/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.TimerNode = function ( scope, scale ) {

	THREE.FloatNode.call( this );

	this.scope = scope || THREE.TimerNode.GLOBAL;
	this.scale = scale !== undefined ? scale : 1;

};

THREE.TimerNode.GLOBAL = 'global';
THREE.TimerNode.LOCAL = 'local';

THREE.TimerNode.prototype = Object.create( THREE.FloatNode.prototype );
THREE.TimerNode.prototype.constructor = THREE.TimerNode;
THREE.TimerNode.prototype.nodeType = "Timer";

THREE.TimerNode.prototype.updateFrame = function ( frame ) {

	switch( this.scope ) {

		case THREE.TimerNode.LOCAL:

			this.number += frame.delta * this.scale;

			break;

		default:

			this.number = frame.time * this.scale;

	}

};

THREE.TimerNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.scope = this.scope;
		data.scale = this.scale;

	}

	return data;

};
