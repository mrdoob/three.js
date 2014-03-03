/**
 * @author Sean Griffin / http://twitter.com/sgrif
 */

THREE.BoneHelper = function ( bone, baseCubeSize, scaleRatio ) {

	THREE.Object3D.call( this );

	this.scaleRatio = ( scaleRatio !== undefined ) ? scaleRatio : 1;
	this.bone = bone;

	var baseCubeSize = ( baseCubeSize !== undefined ) ? baseCubeSize : 1;
	var cubeSize = baseCubeSize * this.scaleRatio;
	var cubeGeometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
	var cubeMaterial = new THREE.MeshBasicMaterial();

	this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

	this.add(this.cube);
	this.update();
};

THREE.BoneHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.BoneHelper.prototype.update = function () {

	this.bone.skinMatrix.decompose( this.cube.position, this.cube.quaternion, this.cube.scale );
	this.cube.position.multiplyScalar( this.scaleRatio );

	if ( this.line !== undefined ) {
		this.remove(this.line);
	}

	if ( this.bone.parent instanceof THREE.Bone ) {

		var lineMaterial = new THREE.LineBasicMaterial();
		var lineGeometry = new THREE.Geometry();

		var bonePosition = new THREE.Vector3();
		bonePosition.setFromMatrixPosition( this.bone.skinMatrix );
		bonePosition.multiplyScalar( this.scaleRatio );

		var parentPosition = new THREE.Vector3();
		parentPosition.setFromMatrixPosition( this.bone.parent.skinMatrix );
		parentPosition.multiplyScalar( this.scaleRatio );

		lineGeometry.vertices.push( bonePosition );
		lineGeometry.vertices.push( parentPosition );

		this.line = new THREE.Line( lineGeometry, lineMaterial );
		this.add(this.line);
	}

};
