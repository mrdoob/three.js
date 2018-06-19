/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.MeshStandardNodeMaterial = function () {

	var node = new THREE.MeshStandardNode();

	THREE.NodeMaterial.call( this, node, node );

	this.type = "MeshStandardNodeMaterial";

};

THREE.MeshStandardNodeMaterial.prototype = Object.create( THREE.NodeMaterial.prototype );
THREE.MeshStandardNodeMaterial.prototype.constructor = THREE.StandardNodeMaterial;

Object.defineProperties( THREE.MeshStandardNodeMaterial.prototype, {

	properties: {
		
		get: function () {

			return this.fragment.properties;

		}
		
	}

} );

THREE.NodeMaterial.addShortcuts( THREE.MeshStandardNodeMaterial.prototype, 'properties', [
	"color.value",
	"roughness.value",
	"metalness.value",
	"map",
	"normalMap",
	"metalnessMap",
	"roughnessMap",
	"envMap"
] );
