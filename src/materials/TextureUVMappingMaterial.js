/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.TextureUVMappingMaterial = function ( bitmap ) {

	this.bitmap = bitmap;

	this.toString = function () {

		return 'THREE.TextureUVMappingMaterial ( bitmap: ' + this.bitmap + ' )';

	}

}
