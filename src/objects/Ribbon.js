/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Ribbon = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.material = material;

};

THREE.Ribbon.prototype = Object.create( THREE.Object3D.prototype );

THREE.Ribbon.prototype.clone = function ( object ) {

	if ( object === undefined ) object = new THREE.Ribbon( this.geometry, this.material );

	THREE.Object3D.prototype.clone.call( this, object );

	return object;

};
