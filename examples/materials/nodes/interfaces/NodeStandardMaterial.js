/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeStandardMaterial = function() {
	
	this.node = new THREE.NodeStandard();
	
	THREE.NodeMaterial.call( this, this.node, this.node );
	
};

THREE.NodeStandardMaterial.prototype = Object.create( THREE.NodeMaterial.prototype );
THREE.NodeStandardMaterial.prototype.constructor = THREE.NodeStandardMaterial;

THREE.NodeMaterial.Shortcuts( THREE.NodeStandardMaterial.prototype, 'node', 
[ 'color',  'alpha', 'roughness', 'metalness', 'normal', 'normalScale', 'emissive', 'ambient', 'shadow', 'ao', 'environment', 'reflectivity', 'transform' ] );