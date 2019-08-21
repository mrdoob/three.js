import { Vector2 } from '../math/Vector2.js';
import { MeshStandardMaterial } from './MeshStandardMaterial.js';
import { Color } from '../math/Color.js';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  reflectivity: <float>
 *  clearcoat: <float>
 *  clearcoatRoughness: <float>
 *
 *  sheen: <Color>
 *
 *  clearcoatNormalScale: <Vector2>,
 *  clearcoatNormalMap: new THREE.Texture( <Image> ),
 * }
 */

function MeshPhysicalMaterial( parameters ) {

	MeshStandardMaterial.call( this );

	this.defines = { 'PHYSICAL': '' };

	this.type = 'MeshPhysicalMaterial';

	this.reflectivity = 0.5; // maps to F0 = 0.04

	this.clearcoat = 0.0;
	this.clearcoatRoughness = 0.0;

	this.sheen = null; // null will disable sheen bsdf

	this.clearcoatNormalScale = new Vector2( 1, 1 );
	this.clearcoatNormalMap = null;

	this.setValues( parameters );

}

MeshPhysicalMaterial.prototype = Object.create( MeshStandardMaterial.prototype );
MeshPhysicalMaterial.prototype.constructor = MeshPhysicalMaterial;

MeshPhysicalMaterial.prototype.isMeshPhysicalMaterial = true;

MeshPhysicalMaterial.prototype.copy = function ( source ) {

	MeshStandardMaterial.prototype.copy.call( this, source );

	this.defines = { 'PHYSICAL': '' };

	this.reflectivity = source.reflectivity;

	this.clearcoat = source.clearcoat;
	this.clearcoatRoughness = source.clearcoatRoughness;

	if ( source.sheen ) this.sheen = ( this.sheen || new Color() ).copy( source.sheen );
	else this.sheen = null;

	this.clearcoatNormalMap = source.clearcoatNormalMap;
	this.clearcoatNormalScale.copy( source.clearcoatNormalScale );

	return this;

};


export { MeshPhysicalMaterial };
