import { MeshStandardMaterial } from './MeshStandardMaterial.js';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  reflectivity: <float>
 * }
 */

class MeshPhysicalMaterial extends MeshStandardMaterial {

	constructor( parameters ) {

		super();

		this.defines = { 'PHYSICAL': '' };

		this.type = 'MeshPhysicalMaterial';

		this.reflectivity = 0.5; // maps to F0 = 0.04

		this.clearCoat = 0.0;
		this.clearCoatRoughness = 0.0;

		this.setValues( parameters );

	}

}




MeshPhysicalMaterial.prototype.isMeshPhysicalMaterial = true;

MeshPhysicalMaterial.prototype.copy = function ( source ) {

	MeshStandardMaterial.prototype.copy.call( this, source );

	this.defines = { 'PHYSICAL': '' };

	this.reflectivity = source.reflectivity;

	this.clearCoat = source.clearCoat;
	this.clearCoatRoughness = source.clearCoatRoughness;

	return this;

};


export { MeshPhysicalMaterial };
