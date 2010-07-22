/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.ParticleBitmapMaterial = function ( bitmap ) {

	this.bitmap = bitmap;
	this.offset = new THREE.Vector2();

	this.toString = function () {

		return 'THREE.ParticleBitmapMaterial ( bitmap: ' + this.bitmap + ' )';

	};

};
