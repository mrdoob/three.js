/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.ClockNode = function( value ) {

	THREE.FloatNode.call( this, value );

	this.requestUpdate = true;
	this.scale = 1;

};

THREE.ClockNode.prototype = Object.create( THREE.FloatNode.prototype );
THREE.ClockNode.prototype.constructor = THREE.ClockNode;

THREE.ClockNode.prototype.updateAnimation = function( delta ) {

	this.number += delta * this.scale;

};
