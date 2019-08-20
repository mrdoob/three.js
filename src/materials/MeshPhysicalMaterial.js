import { Vector2 } from '../math/Vector2.js';
import { MeshStandardMaterial } from './MeshStandardMaterial.js';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  reflectivity: <float>
 *  clearCoat: <float>
 *  clearCoatRoughness: <float>
 *
 *  clearCoatNormalScale: <Vector2>,
 *  clearCoatNormalMap: new THREE.Texture( <Image> ),
 * }
 */

function MeshPhysicalMaterial( parameters ) {

	MeshStandardMaterial.call( this );

	this.defines = {

		'PHYSICAL': '',
		'ADVANCED_PHYSICAL': ''

	};

	this.type = 'MeshPhysicalMaterial';

	this.reflectivity = 0.5; // maps to F0 = 0.04

	this.clearCoat = 0.0;
	this.clearCoatRoughness = 0.0;

	this.clearCoatNormalScale = new Vector2( 1, 1 );
	this.clearCoatNormalMap = null;

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

	this.clearCoatNormalMap = source.clearCoatNormalMap;
	this.clearCoatNormalScale.copy( source.clearCoatNormalScale );

	return this;

};


export { MeshPhysicalMaterial };
