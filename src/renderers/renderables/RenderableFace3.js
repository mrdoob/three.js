/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.RenderableFace3 = function () {

	this.z = null;

	this.v1 = new THREE.Vertex();
	this.v2 = new THREE.Vertex();
	this.v3 = new THREE.Vertex();

	this.centroidWorld = new THREE.Vector3();
	this.centroidScreen = new THREE.Vector3();

	this.normalWorld = new THREE.Vector3();
	this.vertexNormalsWorld = [];

	this.meshMaterials = null;
	this.faceMaterials = null;
	this.overdraw = false;
	this.uvs = [ null, null, null ];

};
