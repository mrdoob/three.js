/**
 * @author Maxime Quiblier / http://github.com/maximeq
 * Material packing depth as rgba values.
 * It is basically just MeshDepthMaterial with depthPacking at THREE.RGBADepthPacking
 */
THREE.MeshRGBADepthMaterial = function ( parameters ) {

	parameters = parameters || {};
	parameters.depthPacking = THREE.RGBADepthPacking;

	THREE.MeshDepthMaterial.call( this, parameters );

};

THREE.MeshRGBADepthMaterial.prototype = Object.create( THREE.MeshDepthMaterial.prototype );
THREE.MeshRGBADepthMaterial.prototype.constructor = THREE.MeshRGBADepthMaterial;
