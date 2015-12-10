/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.StandardMaterialNode = function() {
	
	this.node = new THREE.StandardNode();
	
	THREE.MaterialNode.call( this, this.node, this.node );
	
};

THREE.StandardMaterialNode.prototype = Object.create( THREE.MaterialNode.prototype );
THREE.StandardMaterialNode.prototype.constructor = THREE.StandardMaterialNode;

THREE.MaterialNode.Shortcuts( THREE.StandardMaterialNode.prototype, 'node', 
[ 'color',  'alpha', 'roughness', 'metalness', 'normal', 'normalScale', 'emissive', 'ambient', 'shadow', 'ao', 'environment', 'reflectivity', 'transform' ] );