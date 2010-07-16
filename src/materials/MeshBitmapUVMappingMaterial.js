/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.MeshBitmapUVMappingMaterial = function ( bitmap ) {

	this.bitmap = bitmap;

	this.toString = function () {

		return 'THREE.MeshBitmapUVMappingMaterial ( bitmap: ' + this.bitmap + ' )';

	};

};
