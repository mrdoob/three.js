/**
 * @author mrdoob / http://mrdoob.com/
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

	this.setValues( parameters );

};

THREE.ParticleCanvasMaterial.prototype = Object.create( THREE.Material.prototype );

THREE.ParticleCanvasMaterial.prototype.clone = function () {

	var material = new THREE.ParticleCanvasMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.color.copy( this.color );
	material.program = this.program;

	return material;

};
