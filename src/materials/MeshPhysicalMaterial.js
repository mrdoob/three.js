import { Vector2 } from '../math/Vector2.js';
import { MeshStandardMaterial } from './MeshStandardMaterial.js';
import { Color } from '../math/Color.js';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  reflectivity: <float>
 *  clearCoat: <float>
 *  clearCoatRoughness: <float>
 *
 *  sheen: <Color>
 *
 *  clearCoatNormalScale: <Vector2>,
 *  clearCoatNormalMap: new THREE.Texture( <Image> ),
 * }
 */

function MeshPhysicalMaterial( parameters ) {

	MeshStandardMaterial.call( this );

	this.defines = { 'PHYSICAL': '' };

	this.type = 'MeshPhysicalMaterial';

	this.reflectivity = 0.5; // maps to F0 = 0.04

	this.clearCoat = 0.0;
	this.clearCoatRoughness = 0.0;

	this.sheen = null; // null will disable sheen bsdf

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

	if ( source.sheen ) this.sheen = ( this.sheen || new Color() ).copy( source.sheen );
	else this.sheen = null;

	this.clearCoatNormalMap = source.clearCoatNormalMap;
	this.clearCoatNormalScale.copy( source.clearCoatNormalScale );

	return this;

};


export { MeshPhysicalMaterial };
