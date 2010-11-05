/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Object3D = function ( material ) {

	this.position = new THREE.Vector3();
	this.rotation = new THREE.Vector3();
	this.scale = new THREE.Vector3( 1, 1, 1 );

	this.matrix = new THREE.Matrix4();
	this.matrixTranslation = new THREE.Matrix4();
	this.matrixRotation = new THREE.Matrix4();
	this.matrixScale = new THREE.Matrix4();

	this.screen = new THREE.Vector3();

	this.autoUpdateMatrix = true;

	this.updateMatrix = function () {

		this.matrixPosition = THREE.Matrix4.translationMatrix( this.position.x, this.position.y, this.position.z );

		this.matrixRotation = THREE.Matrix4.rotationXMatrix( this.rotation.x );
		this.matrixRotation.multiplySelf( THREE.Matrix4.rotationYMatrix( this.rotation.y ) );
		this.matrixRotation.multiplySelf( THREE.Matrix4.rotationZMatrix( this.rotation.z ) );

		this.matrixScale = THREE.Matrix4.scaleMatrix( this.scale.x, this.scale.y, this.scale.z );

		this.matrix.copy( this.matrixPosition );
		this.matrix.multiplySelf( this.matrixRotation );
		this.matrix.multiplySelf( this.matrixScale );

	};

};
