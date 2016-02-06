/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.Vector3Node = function( x, y, z ) {

	THREE.InputNode.call( this, 'v3', { share: false } );

	this.type = 'v3';
	this.value = new THREE.Vector3( x, y, z );

};

THREE.Vector3Node.prototype = Object.create( THREE.InputNode.prototype );
THREE.Vector3Node.prototype.constructor = THREE.Vector3Node;

THREE.NodeMaterial.addShortcuts( THREE.Vector3Node.prototype, 'value', [ 'x', 'y', 'z' ] );
