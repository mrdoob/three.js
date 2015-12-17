/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeTime = function( value ) {
	
	THREE.NodeFloat.call( this, value );
	
	this.requestUpdate = true;
	
};

THREE.NodeTime.prototype = Object.create( THREE.NodeFloat.prototype );
THREE.NodeTime.prototype.constructor = THREE.NodeTime;

THREE.NodeTime.prototype.updateAnimation = function( delta ) {
	
	this.number += delta;
	
};