/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Object3D = function ( material ) {

	this.position = new THREE.Vector3();
	this.rotation = new THREE.Vector3();
	this.scale = new THREE.Vector3( 1, 1, 1 );

	this.matrix = new THREE.Matrix4();
	this.screen = new THREE.Vector3();

	this.material = material instanceof Array ? material : [ material ];

	this.autoUpdateMatrix = true;

	this.updateMatrix = function () {

		this.matrix.identity();

		this.matrix.multiplySelf( THREE.Matrix4.translationMatrix( this.position.x, this.position.y, this.position.z ) );
		this.matrix.multiplySelf( THREE.Matrix4.rotationXMatrix( this.rotation.x ) );
		this.matrix.multiplySelf( THREE.Matrix4.rotationYMatrix( this.rotation.y ) );
		this.matrix.multiplySelf( THREE.Matrix4.rotationZMatrix( this.rotation.z ) );
		this.matrix.multiplySelf( THREE.Matrix4.scaleMatrix( this.scale.x, this.scale.y, this.scale.z ) );

	};

};
