/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  blending: THREE.NormalBlending, 
 *  linewidth: <float>
 * }
 */

THREE.LineBasicMaterial = function ( parameters ) {

	this.color = new THREE.Color( 0xeeeeee );
	this.opacity = 1;
	this.blending = THREE.NormalBlending;
	this.linewidth = 1;

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.linewidth !== undefined ) this.linewidth = parameters.linewidth;

	}

	this.toString = function () {

		return 'THREE.LineBasicMaterial ( params: ' + this.params + ' )';

	};

};
