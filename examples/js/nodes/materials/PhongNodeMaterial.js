/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.PhongNodeMaterial = function() {

	this.node = new THREE.PhongNode();

	THREE.NodeMaterial.call( this, this.node, this.node );

};

THREE.PhongNodeMaterial.prototype = Object.create( THREE.NodeMaterial.prototype );
THREE.PhongNodeMaterial.prototype.constructor = THREE.PhongNodeMaterial;

THREE.NodeMaterial.Shortcuts( THREE.PhongNodeMaterial.prototype, 'node',
[ 'color', 'alpha', 'specular', 'shininess', 'normal', 'normalScale', 'emissive', 'ambient', 'shadow', 'ao', 'environment', 'reflectivity', 'transform' ] );
