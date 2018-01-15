import { MeshStandardMaterial } from './MeshStandardMaterial.js';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  reflectivity: <float>
 * }
 */

function MeshPhysicalMaterial( parameters ) {

	MeshStandardMaterial.call( this );

	this.defines = { 'PHYSICAL': '' };

	this.type = 'MeshPhysicalMaterial';

	this.reflectivity = 0.5; // maps to F0 = 0.04

	this.clearCoat = 0.0;
	this.clearCoatRoughness = 0.0;

	this.setValues( parameters );

}

MeshPhysicalMaterial.prototype = Object.create( MeshStandardMaterial.prototype );
MeshPhysicalMaterial.prototype.constructor = MeshPhysicalMaterial;

MeshPhysicalMaterial.prototype.isMeshPhysicalMaterial = true;

MeshPhysicalMaterial.prototype.copy = function ( source ) {

	MeshStandardMaterial.prototype.copy.call( this, source );

	this.defines = { 'PHYSICAL': '' };

	if ( source.reflectivity !== undefined ) this.reflectivity = source.reflectivity;

	if ( source.clearCoat !== undefined ) this.clearCoat = source.clearCoat;
	if ( source.clearCoatRoughness !== undefined ) this.clearCoatRoughness = source.clearCoatRoughness;

	return this;

};


export { MeshPhysicalMaterial };
