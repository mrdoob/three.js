/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  reflectivity: <float>
 * }
 */

THREE.MeshPhysicalMaterial = function ( parameters ) {

	THREE.MeshStandardMaterial.call( this, parameters );

};

THREE.Asset.assignPrototype( THREE.MeshPhysicalMaterial, THREE.MeshStandardMaterial, {

	type: 'MeshPhysicalMaterial',
	defines: { 'PHYSICAL': '' },
	reflectivity: 0.5 // maps to F0 = 0.04

} );
