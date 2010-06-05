/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Face3 = function (a, b, c, uv, normal, color) {

	this.a = a;
	this.b = b;
	this.c = c;
	
	this.normal = normal || new THREE.Vector3();
	this.screen = new THREE.Vector3();
	
	this.uv = uv || [ [0,0], [0,0], [0,0] ];
	this.color = color || new THREE.Color();

	this.toString = function () {
	
		return 'THREE.Face3 ( ' + this.a + ', ' + this.b + ', ' + this.c + ' )';
	}
}
