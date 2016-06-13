/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  reflectivity: <float>
 * }
 */

THREE.MeshPhysicalMaterial = function ( parameters ) {

	THREE.MeshStandardMaterial.call( this );

	this.defines = { 'PHYSICAL': '' };

	this.type = 'MeshPhysicalMaterial';

	this.reflectivity = 0.5; // maps to F0 = 0.04

	this.setValues( parameters );

};

THREE.MeshPhysicalMaterial.prototype = Object.create( THREE.MeshStandardMaterial.prototype );
THREE.MeshPhysicalMaterial.prototype.constructor = THREE.MeshPhysicalMaterial;

THREE.MeshPhysicalMaterial.prototype.copy = function ( source ) {

	THREE.MeshStandardMaterial.prototype.copy.call( this, source );

	this.defines = { 'PHYSICAL': '' };

	this.reflectivity = source.reflectivity;

	return this;

};
