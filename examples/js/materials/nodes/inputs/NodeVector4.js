/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeVector4 = function( x, y, z, w ) {
	
	THREE.NodeInput.call( this, 'v4', {share:false} );
	
	this.value = new THREE.Vector4( x, y, z, w );
	
};

THREE.NodeVector4.prototype = Object.create( THREE.NodeInput.prototype );
THREE.NodeVector4.prototype.constructor = THREE.NodeVector4;

THREE.NodeMaterial.Shortcuts( THREE.NodeVector4.prototype, 'value', [ 'x', 'y', 'z', 'w' ] );