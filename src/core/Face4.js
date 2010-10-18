/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Face4 = function ( a, b, c, d, normal, color, material ) {

	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;

	this.centroid = new THREE.Vector3();
	this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();

	this.color = color || new THREE.Color( 0xff000000 );

	this.vertexNormals = normal instanceof Array ? normal : [];
    this.material = material || 0;
    
};


THREE.Face4.prototype = {

	// TODO: Dupe? (Geometry/computeCentroid)

	getCenter : function(){

		return this.a.clone().addSelf( this.b ).addSelf( this.c ).addSelf( this.d ).divideScalar( 4 );

	},

	toString: function () {

		return 'THREE.Face4 ( ' + this.a + ', ' + this.b + ', ' + this.c + ' ' + this.d + ' )';

	}

}
