/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Object3D = function ( material ) {

	this.position = new THREE.Vector3();
	this.rotation = new THREE.Vector3();
	this.scale = new THREE.Vector3( 1, 1, 1 );

	this.matrix = new THREE.Matrix4();
	this.translationMatrix = new THREE.Matrix4();
	this.rotationMatrix = new THREE.Matrix4();
	this.scaleMatrix = new THREE.Matrix4();

	this.screen = new THREE.Vector3();

	this.visible = true;
	this.autoUpdateMatrix = true;

	this.updateMatrix = function () {

		this.matrixPosition = THREE.Matrix4.translationMatrix( this.position.x, this.position.y, this.position.z );

		this.rotationMatrix = THREE.Matrix4.rotationXMatrix( this.rotation.x );
		this.rotationMatrix.multiplySelf( THREE.Matrix4.rotationYMatrix( this.rotation.y ) );
		this.rotationMatrix.multiplySelf( THREE.Matrix4.rotationZMatrix( this.rotation.z ) );

		this.scaleMatrix = THREE.Matrix4.scaleMatrix( this.scale.x, this.scale.y, this.scale.z );

		this.matrix.copy( this.matrixPosition );
		this.matrix.multiplySelf( this.rotationMatrix );
		this.matrix.multiplySelf( this.scaleMatrix );

	};

};
