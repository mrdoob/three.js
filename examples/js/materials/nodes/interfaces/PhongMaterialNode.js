/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.PhongMaterialNode = function() {
	
	this.node = new THREE.PhongNode();
	
	THREE.MaterialNode.call( this, this.node, this.node );
	
};

THREE.PhongMaterialNode.prototype = Object.create( THREE.MaterialNode.prototype );
THREE.PhongMaterialNode.prototype.constructor = THREE.PhongMaterialNode;

THREE.MaterialNode.Shortcuts( THREE.PhongMaterialNode.prototype, 'node', 
[ 'color',  'alpha', 'specular', 'shininess', 'normal', 'normalScale', 'emissive', 'ambient', 'shadow', 'ao', 'environment', 'reflectivity', 'transform' ] );