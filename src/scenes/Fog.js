/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Fog = function ( hex, density ) {

	this.color = new THREE.Color( hex );
	this.density = density || 0.00025;

};
