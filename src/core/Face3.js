/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Face3 = function ( a, b, c, normal, color, material ) {

	this.a = a;
	this.b = b;
	this.c = c;

	this.centroid = new THREE.Vector3();
    this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();

	this.color = color || new THREE.Color( 0xff000000 );
    
	this.vertexNormals =  normal instanceof Array ? normal : [];
    this.material = material || 0;

};

THREE.Face3.prototype = {

	// TODO: Dupe? (Geometry/computeCentroid)

	getCenter : function(){

		return this.a.clone().addSelf( this.b ).addSelf( this.c ).divideScalar( 3 );

	},

	toString: function () {

		return 'THREE.Face3 ( ' + this.a + ', ' + this.b + ', ' + this.c + ' )';

	}

}
