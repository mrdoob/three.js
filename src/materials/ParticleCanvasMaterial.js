/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  color: <hex>,
 *  program: <function>,
 *  opacity: <float>,
 *  blending: THREE.NormalBlending
 * }
 */

THREE.ParticleCanvasMaterial = function ( parameters ) {

	this.id = THREE.MaterialCounter.value ++;

	this.color = new THREE.Color( 0xffffff );
	this.program = function ( context, color ) {};
	this.opacity = 1;
	this.blending = THREE.NormalBlending;

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.program !== undefined ) this.program = parameters.program;
		if ( parameters.opacity !== undefined ) this.opacity = parameters.opacity;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

	}

};
