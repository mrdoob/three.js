/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Fog = function ( hex, density ) {

	this.color = new THREE.Color( hex );
	this.density = density || 0.00025;

};
