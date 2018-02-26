/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.SpriteNodeMaterial = function () {

	this.node = new THREE.SpriteNode();

	THREE.NodeMaterial.call( this, this.node, this.node );

	this.type = "SpriteNodeMaterial";

};

THREE.SpriteNodeMaterial.prototype = Object.create( THREE.NodeMaterial.prototype );
THREE.SpriteNodeMaterial.prototype.constructor = THREE.SpriteNodeMaterial;

THREE.NodeMaterial.addShortcuts( THREE.SpriteNodeMaterial.prototype, 'node',
	[ 'color', 'alpha', 'transform', 'spherical' ] );
