/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.TimerNode = function ( scale, scope ) {

	THREE.FloatNode.call( this );

	this.scale = scale !== undefined ? scale : 1;
	this.scope = scope || THREE.TimerNode.GLOBAL;

};

THREE.TimerNode.GLOBAL = 'global';
THREE.TimerNode.LOCAL = 'local';
THREE.TimerNode.DELTA = 'delta';

THREE.TimerNode.prototype = Object.create( THREE.FloatNode.prototype );
THREE.TimerNode.prototype.constructor = THREE.TimerNode;
THREE.TimerNode.prototype.nodeType = "Timer";

THREE.TimerNode.prototype.updateFrame = function ( frame ) {

	switch( this.scope ) {

		case THREE.TimerNode.LOCAL:

			this.number += frame.delta * this.scale;

			break;

		case THREE.TimerNode.DELTA:

			this.number = frame.delta * this.scale;

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
