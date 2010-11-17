/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Vertex = function ( position, normal ) {

	this.position = position || new THREE.Vector3();
	this.positionWorld = new THREE.Vector3();
	this.positionScreen = new THREE.Vector4();

	this.normal = normal || new THREE.Vector3();
	this.normalWorld = new THREE.Vector3();
	this.normalScreen = new THREE.Vector3();

	this.__visible = true;

}

THREE.Vertex.prototype = {

	toString: function () {

		return 'THREE.Vertex ( position: ' + this.position + ', normal: ' + this.normal + ' )';
	}
};
