import { MeshStandardMaterialCommon } from './MeshStandardMaterialCommon';
import { Vector2 } from '../math/Vector2';
import { Color } from '../math/Color';

/**
 * @author takahiro / http://github.com/takahirox
 *
 * parameters = {
 *  glossiness: <float>,
 *  specular: <hex>,
 *
 *  glossinessMap: new THREE.Texture( <Image> ),
 *
 *  specularMap: new THREE.Texture( <Image> ),
 * }
 */

function MeshStandardMaterialSG( parameters ) {

	MeshStandardMaterialCommon.call( this );

	this.defines[ 'STANDARD_SG' ] = '';

	this.type = 'MeshStandardMaterialSG';

	this.glossiness = 0.5;
	this.specular = new Color( 0x111111 );

	this.glossinessMap = null;

	this.specularMap = null;

	this.setValues( parameters );

}

MeshStandardMaterialSG.prototype = Object.create( MeshStandardMaterialCommon.prototype );
MeshStandardMaterialSG.prototype.constructor = MeshStandardMaterialSG;

MeshStandardMaterialSG.prototype.isMeshStandardMaterialSG = true;

MeshStandardMaterialSG.prototype.copy = function ( source ) {

	MeshStandardMaterialCommon.prototype.copy.call( this, source );

	this.defines[ 'STANDARD_SG' ] = '';

	this.glossiness = source.glossiness;
	this.specular.copy( source.specular );

	this.glossinessMap = source.glossinessMap;

	this.specularMap = source.specularMap;

	return this;

};


export { MeshStandardMaterialSG };
