/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Camera = function ( fov, aspect, near, far ) {

	this.fov = fov;
	this.aspect = aspect;
	this.near = near;
	this.far = far;

	this.position = new THREE.Vector3();
	this.target = { position: new THREE.Vector3() };

	this.autoUpdateMatrix = true;

	this.projectionMatrix = null;
	this.matrix = new THREE.Matrix4();

	this.up = new THREE.Vector3( 0, 1, 0 );

	this.translateX = function ( amount ) {

		var vector = this.target.position.clone().subSelf( this.position ).normalize().multiplyScalar( amount );
		vector.cross( vector.clone(), this.up );

		this.position.addSelf( vector );
		this.target.position.addSelf( vector );

	};

	/* TODO
	this.translateY = function ( amount ) {

	};
	*/

	this.translateZ = function ( amount ) {

		var vector = this.target.position.clone().subSelf( this.position ).normalize().multiplyScalar( amount );

		this.position.subSelf( vector );
		this.target.position.subSelf( vector );

	};

	this.updateMatrix = function () {

		this.matrix.lookAt( this.position, this.target.position, this.up );

	};

	this.updateProjectionMatrix = function () {

		this.projectionMatrix = THREE.Matrix4.makePerspective( this.fov, this.aspect, this.near, this.far );

	};

	this.updateProjectionMatrix();

};

THREE.Camera.prototype = {

	toString: function () {

		return 'THREE.Camera ( ' + this.position + ', ' + this.target.position + ' )';

	}

};
