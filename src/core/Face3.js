/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Face3 = function ( a, b, c, normal, color, materialIndex ) {

	this.a = a;
	this.b = b;
	this.c = c;

	this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [ ];

	this.color = color instanceof THREE.Color ? color : new THREE.Color();
	this.vertexColors = color instanceof Array ? color : [];

	this.vertexTangents = [];

	this.materialIndex = materialIndex;

	this.centroid = new THREE.Vector3();

};

THREE.Face3.prototype = {

	constructor: THREE.Face3,

	clone: function () {

		var tmp = new THREE.Face3( this.a, this.b, this.c );

		tmp.normal.copy( this.normal );
		tmp.color.copy( this.color );
		tmp.centroid.copy( this.centroid );

		tmp.materialIndex = this.materialIndex;

		var i, il;
		for ( i = 0, il = this.vertexNormals.length; i < il; i ++ ) tmp.vertexNormals[ i ] = this.vertexNormals[ i ].clone();
		for ( i = 0, il = this.vertexColors.length; i < il; i ++ ) tmp.vertexColors[ i ] = this.vertexColors[ i ].clone();
		for ( i = 0, il = this.vertexTangents.length; i < il; i ++ ) tmp.vertexTangents[ i ] = this.vertexTangents[ i ].clone();

		return tmp;

	}

};
