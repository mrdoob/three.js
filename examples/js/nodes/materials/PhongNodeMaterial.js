/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.PhongNodeMaterial = function () {

	var node = new THREE.PhongNode();

	THREE.NodeMaterial.call( this, node, node );

	this.type = "PhongNodeMaterial";

};

THREE.PhongNodeMaterial.prototype = Object.create( THREE.NodeMaterial.prototype );
THREE.PhongNodeMaterial.prototype.constructor = THREE.PhongNodeMaterial;

THREE.NodeMaterial.addShortcuts( THREE.PhongNodeMaterial.prototype, 'fragment', [ 
	'color', 
	'alpha', 
	'specular', 
	'shininess', 
	'normal', 
	'emissive', 
	'ambient', 
	'light', 
	'shadow', 
	'ao', 
	'environment', 
	'environmentAlpha',
	'transform' 
] );
