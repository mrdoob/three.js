import { MeshStandardMaterialCommon } from './MeshStandardMaterialCommon';
import { Vector2 } from '../math/Vector2';
import { Color } from '../math/Color';

/**
 * @author takahiro / http://github.com/takahirox
 *
 * parameters = {
 *  glossiness: <float>,
 *  specular2: <hex>,
 *
 *  glossinessMap: new THREE.Texture( <Image> ),
 *
 *  specular2Map: new THREE.Texture( <Image> ),
 * }
 */

function MeshStandardMaterialSG( parameters ) {

	MeshStandardMaterialCommon.call( this );

	this.defines[ 'STANDARD_SG' ] = '';

	this.type = 'MeshStandardMaterialSG';

	this.glossiness = 0.5;
	this.specular2 = new Color ( 0x000000 );

	this.glossinessMap = null;

	this.specular2Map = null;

	this.setValues( parameters );

}

MeshStandardMaterialSG.prototype = Object.create( MeshStandardMaterialCommon.prototype );
MeshStandardMaterialSG.prototype.constructor = MeshStandardMaterialSG;

MeshStandardMaterialSG.prototype.isMeshStandardMaterialSG = true;

MeshStandardMaterialSG.prototype.copy = function ( source ) {

	MeshStandardMaterialCommon.prototype.copy.call( this, source );

	this.defines[ 'STANDARD_SG' ] = '';

	this.glossiness = source.glossiness;
	this.speculars.copy( source.specular2 );

	this.glossinessMap = source.glossinessMap;

	this.specular2Map = source.specular2Map;

	return this;

};


export { MeshStandardMaterialSG };
