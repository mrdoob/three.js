/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Points = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.PointsMaterial( { color: Math.random() * 0xffffff } );

	this.sortParticles = false;

};

THREE.Points.prototype = Object.create( THREE.Object3D.prototype );

THREE.Points.prototype.clone = function ( object ) {

	if ( object === undefined ) object = new THREE.Points( this.geometry, this.material );

	object.sortParticles = this.sortParticles;

	THREE.Object3D.prototype.clone.call( this, object );

	return object;

};

// Backwards compatibility

THREE.ParticleSystem = function ( geometry, material ) {

	console.warn( 'THREE.ParticleSystem has been DEPRECATED. Use THREE.Points instead.' );
	return new THREE.Points( geometry, material );

};