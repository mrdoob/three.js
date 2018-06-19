/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.SpriteNodeMaterial = function () {

	var node = new THREE.SpriteNode();

	THREE.NodeMaterial.call( this, node, node );

	this.type = "SpriteNodeMaterial";

};

THREE.SpriteNodeMaterial.prototype = Object.create( THREE.NodeMaterial.prototype );
THREE.SpriteNodeMaterial.prototype.constructor = THREE.SpriteNodeMaterial;

THREE.NodeMaterial.addShortcuts( THREE.SpriteNodeMaterial.prototype, 'fragment', [ 
	'color', 
	'alpha', 
	'transform', 
	'spherical' 
] );
