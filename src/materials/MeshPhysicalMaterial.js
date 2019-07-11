import { MeshStandardMaterial } from './MeshStandardMaterial.js';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  reflectivity: <float>
 *  clearCoat: <float>
 *  clearCoatRoughness: <float>
 *  clearCoatGeometryNormals: <boolean>
 * }
 */

function MeshPhysicalMaterial( parameters ) {

	MeshStandardMaterial.call( this );

	this.defines = { 'PHYSICAL': '' };

	this.type = 'MeshPhysicalMaterial';

	this.reflectivity = 0.5; // maps to F0 = 0.04

	this.clearCoat = 0.0;
	this.clearCoatRoughness = 0.0;

	this.clearCoatGeometryNormals = false;

	this.setValues( parameters );

}

MeshPhysicalMaterial.prototype = Object.create( MeshStandardMaterial.prototype );
MeshPhysicalMaterial.prototype.constructor = MeshPhysicalMaterial;

MeshPhysicalMaterial.prototype.isMeshPhysicalMaterial = true;

MeshPhysicalMaterial.prototype.copy = function ( source ) {

	MeshStandardMaterial.prototype.copy.call( this, source );

	this.defines = { 'PHYSICAL': '' };

	this.reflectivity = source.reflectivity;

	this.clearCoat = source.clearCoat;
	this.clearCoatRoughness = source.clearCoatRoughness;
	this.clearCoatGeometryNormals = source.clearCoatGeometryNormals;

	return this;

};


export { MeshPhysicalMaterial };
