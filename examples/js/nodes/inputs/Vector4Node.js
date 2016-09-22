/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.Vector4Node = function( x, y, z, w ) {

	THREE.InputNode.call( this, 'v4' );

	this.value = new THREE.Vector4( x, y, z, w );

};

THREE.Vector4Node.prototype = Object.create( THREE.InputNode.prototype );
THREE.Vector4Node.prototype.constructor = THREE.Vector4Node;

THREE.NodeMaterial.addShortcuts( THREE.Vector4Node.prototype, 'value', [ 'x', 'y', 'z', 'w' ] );
