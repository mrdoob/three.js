/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Camera = function (x, y, z) {

	this.position = new THREE.Vector3(x, y, z);
	this.target = {
		position: new THREE.Vector3(0, 0, 0)
	}

	this.matrix = new THREE.Matrix4();
	this.projectionMatrix = THREE.Matrix4.makePerspective(45, 1 /*SCREEN_WIDTH/SCREEN_HEIGHT*/, 0.001, 1000);
	
	this.up = new THREE.Vector3(0, 1, 0);
	this.roll = 0;
	
	// TODO: Need to remove this	
	this.zoom = 3;
	this.focus = 500;
	
	this.updateMatrix = function () {
	
		this.matrix.lookAt(this.position, this.target.position, this.up);
	}

	this.toString = function () {
	
		return 'THREE.Camera ( ' + this.position + ', ' + this.target.position + ' )';
	}
	
	this.updateMatrix();
}
