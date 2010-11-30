/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 *  shading: THREE.FlatShading,
 *  blending: THREE.NormalBlending
 * }
 */

THREE.MeshNormalMaterial = function ( parameters ) {

	this.opacity = 1;
	this.shading = THREE.FlatShading;
	this.blending = THREE.NormalBlending;


	if ( parameters ) {

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
        if ( parameters.shading !== undefined ) this.shading  = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

	}

	this.toString = function () {

		return 'THREE.MeshNormalMaterial';

	};

}
