/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Face3 = function ( a, b, c, normal, materials ) {

	this.a = a;
	this.b = b;
	this.c = c;

	this.centroid = new THREE.Vector3();
	this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [];

	this.materials = materials instanceof Array ? materials : [ materials ];

};

THREE.Face3.prototype = {

	toString: function () {

		return 'THREE.Face3 ( ' + this.a + ', ' + this.b + ', ' + this.c + ' )';

	}

};
