THREE.Face4 = function (a, b, c, d, uv, normal, color) {

	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	
	this.normal = normal || new THREE.Vector3();
	this.screen = new THREE.Vector3();
	
	this.uv = uv || [ [0,0], [0,0], [0,0], [0, 0] ];
	this.color = color || new THREE.Color();

	this.toString = function () {
	
		return 'THREE.Face4 ( ' + this.a + ', ' + this.b + ', ' + this.c + ' ' + this.d + ' )';
	}
}
