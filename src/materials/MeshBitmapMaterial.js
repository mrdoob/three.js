/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.MeshBitmapMaterial = function ( bitmap, mode ) {

	this.bitmap = bitmap;
	this.mode = mode || THREE.MeshBitmapMaterialMode.UVMAPPING;
    
    this.id = THREE.MeshBitmapMaterialCounter.value++;
    
	this.toString = function () {

		return 'THREE.MeshBitmapMaterial ( bitmap: ' + this.bitmap + ', mode: ' + this.mode + ', id: ' + this.id + ' )';

	};

};

THREE.MeshBitmapMaterialCounter = { value:0 };

THREE.MeshBitmapMaterialMode = { UVMAPPING: 0 };
