/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.MeshBitmapMaterial = function ( bitmap, mode ) {

	this.bitmap = bitmap;
	this.mode = mode || THREE.MeshBitmapMaterialMode.UVMAPPING;

	this.toString = function () {

		return 'THREE.MeshBitmapUVMappingMaterial ( bitmap: ' + this.bitmap + ', mode: ' + this.mode + ' )';

	};

};

THREE.MeshBitmapMaterialMode = { UVMAPPING: 0 };
