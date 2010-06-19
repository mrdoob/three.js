/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Vertex = function ( position, normal ) {

	this.position = position || new THREE.Vector3();
	this.normal = normal || new THREE.Vector3();
	this.screen = new THREE.Vector3();

	this.__visible = true;

	this.toString = function () {

		return 'THREE.Vertex ( position: ' + this.position + ', normal: ' + this.normal + ' )';
	};
};
