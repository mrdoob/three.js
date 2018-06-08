/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.StandardNodeMaterial = function () {

	this.node = new THREE.StandardNode();

	THREE.NodeMaterial.call( this, this.node, this.node );

	this.type = "StandardNodeMaterial";

};

THREE.StandardNodeMaterial.prototype = Object.create( THREE.NodeMaterial.prototype );
THREE.StandardNodeMaterial.prototype.constructor = THREE.StandardNodeMaterial;

THREE.NodeMaterial.addShortcuts( THREE.StandardNodeMaterial.prototype, 'node',
	[ 'color', 'alpha', 'roughness', 'metalness', 'reflectivity', 'clearCoat', 'clearCoatRoughness', 'normal', 'normalScale', 'emissive', 'ambient', 'light', 'shadow', 'ao', 'environment', 'transform' ] );
