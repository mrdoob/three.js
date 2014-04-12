/**
 * @author Sean Griffin / http://twitter.com/sgrif
 * @author Michael Guerrero / http://realitymeltdown.com
 */

THREE.SkeletonHelper = function ( skeleton, jointBoxSize, scaleRatio ) {

	THREE.Object3D.call( this );

	this.scaleRatio = ( scaleRatio !== undefined ) ? scaleRatio : 1;
	this.skeleton = skeleton;

	if ( jointBoxSize === undefined ) jointBoxSize = 1;
	
	var boxSize = jointBoxSize * this.scaleRatio;

	for ( var i = 0; i < skeleton.bones.length; ++i ) {

		var bone = skeleton.bones[ i ];
		var boxGeometry = new THREE.BoxGeometry( boxSize, boxSize, boxSize );
		var boxMaterial = new THREE.MeshBasicMaterial( { depthTest: false, depthWrite: false, transparent: true } );

		bone.helper = {};
		bone.helper.box = new THREE.Mesh( boxGeometry, boxMaterial );
		bone.helper.axes = new THREE.AxisHelper( jointBoxSize * 3 );

		this.add( bone.helper.box );
		this.add( bone.helper.axes );

		if ( bone.parent instanceof THREE.Bone ) {

			var lineMaterial = new THREE.LineBasicMaterial( { vertexColors: true, depthTest: false, depthWrite: false, transparent: true } );
			var lineGeometry = new THREE.Geometry();

			lineGeometry.vertices.push( new THREE.Vector3() );
			lineGeometry.vertices.push( new THREE.Vector3() );
			lineGeometry.colors.push( new THREE.Color( 0, 0, 1 ) );
			lineGeometry.colors.push( new THREE.Color( 0, 1, 0 ) );

			bone.helper.line = new THREE.Line( lineGeometry, lineMaterial );
			this.add( bone.helper.line );

		}

	}

	this.update();

};


THREE.SkeletonHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.SkeletonHelper.prototype.update = function () {

	for ( var i = 0; i < this.skeleton.bones.length; i ++ ) {

		var bone = this.skeleton.bones[ i ];

		if ( this.visible && bone.parent instanceof THREE.Bone ) {

			bone.skinMatrix.decompose( bone.helper.box.position, bone.helper.box.quaternion, bone.helper.box.scale );
			bone.helper.box.position.multiplyScalar( this.scaleRatio );

			bone.helper.axes.quaternion = bone.helper.box.quaternion;
			bone.helper.axes.position = bone.helper.box.position;
			bone.helper.axes.scale = bone.helper.box.scale;

			bone.helper.line.geometry.vertices[ 0 ].setFromMatrixPosition( bone.skinMatrix );
			bone.helper.line.geometry.vertices[ 0 ].multiplyScalar( this.scaleRatio );

			bone.helper.line.geometry.vertices[ 1 ].setFromMatrixPosition( bone.parent.skinMatrix );
			bone.helper.line.geometry.vertices[ 1 ].multiplyScalar( this.scaleRatio );

			bone.helper.line.geometry.verticesNeedUpdate = true;

		}

	}

};

THREE.SkeletonHelper.prototype.setVisible = function ( boolean ) {

	for ( var i = 0; i < this.skeleton.bones.length; i ++ ) {

		var bone = this.skeleton.bones[ i ];

		if ( bone.helper ) {

			bone.helper.box.visible = boolean;
			bone.helper.axes.visible = boolean;

			if ( bone.parent instanceof THREE.Bone ) {

				 bone.helper.line.visible = boolean;

			}

		}

	}
}
