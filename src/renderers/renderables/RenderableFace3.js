/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.RenderableFace3 = function () {

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();
	this.v3 = new THREE.RenderableVertex();

	this.centroidModel = new THREE.Vector3();

	this.normalModel = new THREE.Vector3();
	this.normalModelView = new THREE.Vector3();

	this.vertexNormalsLength = 0;
	this.vertexNormalsModel = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
	this.vertexNormalsModelView = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

	this.color = null;
	this.material = null;
	this.uvs = [[]];

	this.z = null;

};
