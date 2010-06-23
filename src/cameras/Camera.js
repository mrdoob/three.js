/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Camera = function ( fov, aspect, near, far ) {

	this.position = new THREE.Vector3( 0, 0, 0 );
	this.target = { position: new THREE.Vector3( 0, 0, 0 ) };

	this.projectionMatrix = THREE.Matrix4.makePerspective( fov, aspect, near, far );
	this.up = new THREE.Vector3( 0, 1, 0 );
	this.matrix = new THREE.Matrix4();

	this.autoUpdateMatrix = true;

	this.updateMatrix = function () {

		this.matrix.lookAt( this.position, this.target.position, this.up );

	};

	this.toString = function () {

		return 'THREE.Camera ( ' + this.position + ', ' + this.target.position + ' )';

	};

};
