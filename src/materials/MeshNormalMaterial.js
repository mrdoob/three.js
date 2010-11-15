/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 *  blending: THREE.NormalBlending
 * } 
 */

THREE.MeshNormalMaterial = function ( parameters ) {

	this.opacity = 1;
	this.blending = THREE.NormalBlending;


	if ( parameters ) {

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

	}

	this.toString = function () {

		return 'THREE.MeshNormalMaterial';

	};

}
