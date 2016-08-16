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

	this.clearCoat = 0.0;
	this.clearCoatRoughness = 0.0;

	this.setValues( parameters );

};

THREE.MeshPhysicalMaterial.prototype = Object.create( THREE.MeshStandardMaterial.prototype );
THREE.MeshPhysicalMaterial.prototype.constructor = THREE.MeshPhysicalMaterial;

THREE.MeshPhysicalMaterial.prototype.copy = function ( source ) {

	THREE.MeshStandardMaterial.prototype.copy.call( this, source );

	this.defines = { 'PHYSICAL': '' };

	this.reflectivity = source.reflectivity;

	this.clearCoat = source.clearCoat;
	this.clearCoatRoughness = source.clearCoatRoughness;

	return this;

};
