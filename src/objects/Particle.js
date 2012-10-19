/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Particle = function ( material ) {

	THREE.Object3D.call( this );

	this.material = material;

};

THREE.Particle.prototype = Object.create( THREE.Object3D.prototype );

THREE.Particle.prototype.clone = function ( object ) {

	if ( object === undefined ) object = new THREE.Particle( this.material );

	THREE.Object3D.prototype.clone.call( this, object );

	return object;

};
