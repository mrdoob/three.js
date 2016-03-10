/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.TimerNode = function( value, scale ) {

	THREE.FloatNode.call( this, value );

	this.requestUpdate = true;

	this.scale = scale !== undefined ? scale : 1;

};

THREE.TimerNode.prototype = Object.create( THREE.FloatNode.prototype );
THREE.TimerNode.prototype.constructor = THREE.TimerNode;

THREE.TimerNode.prototype.updateAnimation = function( delta ) {

	this.number += delta * this.scale;

};
