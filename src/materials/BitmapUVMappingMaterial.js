/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.BitmapUVMappingMaterial = function ( bitmap ) {

	this.bitmap = bitmap;

	this.toString = function () {

		return 'THREE.BitmapUVMappingMaterial ( bitmap: ' + this.bitmap + ' )';

	}

}
