import { MeshPhongMaterial } from './MeshPhongMaterial.js';

/**
 * @author takahirox / http://github.com/takahirox
 *
 * parameters = {
 *  gradientMap: new THREE.Texture( <Image> )
 * }
 */

class MeshToonMaterial extends MeshPhongMaterial {

	constructor( parameters ) {

		super();

		this.defines = { 'TOON': '' };

		this.type = 'MeshToonMaterial';

		this.gradientMap = null;

		this.setValues( parameters );

	}

}




MeshToonMaterial.prototype.isMeshToonMaterial = true;

MeshToonMaterial.prototype.copy = function ( source ) {

	MeshPhongMaterial.prototype.copy.call( this, source );

	this.gradientMap = source.gradientMap;

	return this;

};


export { MeshToonMaterial };
