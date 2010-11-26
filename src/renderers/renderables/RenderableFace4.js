/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.RenderableFace4 = function () {

	this.z = null;

	this.v1 = new THREE.Vertex();
	this.v2 = new THREE.Vertex();
	this.v3 = new THREE.Vertex();
	this.v4 = new THREE.Vertex();

	this.centroidWorld = new THREE.Vector3();
	this.centroidScreen = new THREE.Vector3();

	this.normalWorld = new THREE.Vector3();
	this.vertexNormalsWorld = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

	this.meshMaterial = null;
	this.faceMaterial = null;
	this.overdraw = false;
	this.uv = null;

};
