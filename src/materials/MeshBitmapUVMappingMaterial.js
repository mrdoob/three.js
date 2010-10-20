/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.MeshBitmapUVMappingMaterial = function ( bitmap ) {

	this.bitmap = bitmap;

    this.loaded = 0;
    this.decalIndex = -1;
    
	this.toString = function () {

		return 'THREE.MeshBitmapUVMappingMaterial ( bitmap: ' + this.bitmap + ' )';

	};

};
