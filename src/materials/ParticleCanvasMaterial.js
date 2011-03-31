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

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );
	this.program = parameters.program !== undefined ? parameters.program : function ( context, color ) {};

};

THREE.ParticleCanvasMaterial.prototype = new THREE.Material();
THREE.ParticleCanvasMaterial.prototype.constructor = THREE.ParticleCanvasMaterial;
