import { MeshStandardMaterialCommon } from './MeshStandardMaterialCommon';
import { Vector2 } from '../math/Vector2';
import { Color } from '../math/Color';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  roughness: <float>,
 *  metalness: <float>,
 *
 *  roughnessMap: new THREE.Texture( <Image> ),
 *
 *  metalnessMap: new THREE.Texture( <Image> ),
 * }
 */

function MeshStandardMaterial( parameters ) {

	MeshStandardMaterialCommon.call( this );

	this.defines[ 'STANDARD' ] = '';

	this.type = 'MeshStandardMaterial';

	this.roughness = 0.5;
	this.metalness = 0.5;

	this.roughnessMap = null;

	this.metalnessMap = null;

	this.setValues( parameters );

}

MeshStandardMaterial.prototype = Object.create( MeshStandardMaterialCommon.prototype );
MeshStandardMaterial.prototype.constructor = MeshStandardMaterial;

MeshStandardMaterial.prototype.isMeshStandardMaterial = true;

MeshStandardMaterial.prototype.copy = function ( source ) {

	MeshStandardMaterialCommon.prototype.copy.call( this, source );

	this.defines[ 'STANDARD' ] = '';

	this.roughness = source.roughness;
	this.metalness = source.metalness;

	this.roughnessMap = source.roughnessMap;

	this.metalnessMap = source.metalnessMap;

	return this;

};


export { MeshStandardMaterial };
