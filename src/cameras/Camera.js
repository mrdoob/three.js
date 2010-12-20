/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Camera = function ( fov, aspect, near, far ) {

	this.position = new THREE.Vector3();
	this.target = { position: new THREE.Vector3() };

	this.up = new THREE.Vector3( 0, 1, 0 );

	this.matrix = new THREE.Matrix4();
	this.projectionMatrix = THREE.Matrix4.makePerspective( fov, aspect, near, far );

	this.autoUpdateMatrix = true;

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

	this.toString = function () {

		return 'THREE.Camera ( ' + this.position + ', ' + this.target.position + ' )';

	};

};
