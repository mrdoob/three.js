/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.TimeNode = function( value ) {

	THREE.FloatNode.call( this, value );

	this.requestUpdate = true;
	this.scale = 1;

};

THREE.TimeNode.prototype = Object.create( THREE.FloatNode.prototype );
THREE.TimeNode.prototype.constructor = THREE.TimeNode;

THREE.TimeNode.prototype.updateAnimation = function( delta ) {

	this.number += delta * this.scale;

};
