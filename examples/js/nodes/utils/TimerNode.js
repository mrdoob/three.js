/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.TimerNode = function ( scale, scope ) {

	THREE.FloatNode.call( this );

	this.scale = scale !== undefined ? scale : 1;
	this.scope = scope || THREE.TimerNode.GLOBAL;

	this.timeScale = this.scale !== 1;

};

THREE.TimerNode.GLOBAL = 'global';
THREE.TimerNode.LOCAL = 'local';
THREE.TimerNode.DELTA = 'delta';

THREE.TimerNode.prototype = Object.create( THREE.FloatNode.prototype );
THREE.TimerNode.prototype.constructor = THREE.TimerNode;
THREE.TimerNode.prototype.nodeType = "Timer";

THREE.TimerNode.prototype.isReadonly = function ( builder ) {

	return false;

};

THREE.TimerNode.prototype.isUnique = function ( builder ) {

	// share TimerNode "uniform" input if is used on more time with others TimerNode
	return this.timeScale && ( this.scope === THREE.TimerNode.GLOBAL || this.scope === THREE.TimerNode.DELTA );

};

THREE.TimerNode.prototype.updateFrame = function ( frame ) {

	var scale = this.timeScale ? this.scale : 1;

	switch( this.scope ) {

		case THREE.TimerNode.LOCAL:

			this.value += frame.delta * scale;

			break;

		case THREE.TimerNode.DELTA:

			this.value = frame.delta * scale;

			break;

		default:

			this.value = frame.time * scale;

	}

};

THREE.TimerNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.scope = this.scope;
		data.scale = this.scale;
		data.timeScale = this.timeScale;

	}

	return data;

};
