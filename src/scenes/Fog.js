/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Fog = function ( color, near, far ) {

	this.color = color || new THREE.Color( 0xffffff );
	this.near = near || 1;
	this.far = far || 2000;

};
