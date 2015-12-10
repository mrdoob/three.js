/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeVector3 = function( x, y, z ) {
	
	THREE.NodeInput.call( this, 'v3', {share:false} );
	
	this.type = 'v3';
	this.value = new THREE.Vector3( x, y, z );
	
};

THREE.NodeVector3.prototype = Object.create( THREE.NodeInput.prototype );
THREE.NodeVector3.prototype.constructor = THREE.NodeVector3;

THREE.NodeMaterial.Shortcuts( THREE.NodeVector3.prototype, 'value', [ 'x', 'y', 'z' ] );