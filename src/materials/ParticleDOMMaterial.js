/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.ParticleDOMMaterial = function ( domElement ) {

	THREE.Material.call( this );

	this.domElement = domElement;

};


THREE.ParticleDOMMaterial.prototype.clone = function(){ 
	var returnValue = new THREE.ParticleDOMMaterial(this);
	return returnValue;
};