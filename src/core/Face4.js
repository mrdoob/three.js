/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Face4 = function ( a, b, c, d, normal, color ) {

	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;

	this.normal = normal || new THREE.Vector3();
	this.screen = new THREE.Vector3();

	this.color = color || new THREE.Color( 0x000000 );

	this.toString = function () {

		return 'THREE.Face4 ( ' + this.a + ', ' + this.b + ', ' + this.c + ' ' + this.d + ' )';

	};

};
