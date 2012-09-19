/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ParticleDOMMaterial = function ( element ) {

	this.element = element;

};

THREE.ParticleDOMMaterial.prototype.clone = function(){

	return new THREE.ParticleDOMMaterial( this.element );

};
