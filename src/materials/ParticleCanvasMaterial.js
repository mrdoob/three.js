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

	THREE.Material.call( this );

	this.color = new THREE.Color( 0xffffff );
	this.program = function ( context, color ) {};

	this.setParameters( parameters );

};

THREE.ParticleCanvasMaterial.prototype = Object.create( THREE.Material.prototype );

THREE.ParticleCanvasMaterial.prototype.clone = function () {

	return new THREE.ParticleCanvasMaterial( this );

};
