/**
 * @author Sean Griffin / http://twitter.com/sgrif
 * @author Michael Guerrero / http://realitymeltdown.com
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SkeletonHelper = function ( object ) {

	var skeleton = object.skeleton;

	var geometry = new THREE.Geometry();

	for ( var i = 0; i < skeleton.bones.length; i ++ ) {

		var bone = skeleton.bones[ i ];

		if ( bone.parent instanceof THREE.Bone ) {

			geometry.vertices.push( new THREE.Vector3() );
			geometry.vertices.push( new THREE.Vector3() );
			geometry.colors.push( new THREE.Color( 0, 0, 1 ) );
			geometry.colors.push( new THREE.Color( 0, 1, 0 ) );

		}

	}

	var material = new THREE.LineBasicMaterial( { vertexColors: true, depthTest: false, depthWrite: false, transparent: true } );

	THREE.Line.call( this, geometry, material, THREE.LinePieces );

	this.skeleton = skeleton;

	this.matrixWorld = object.matrixWorld;
	this.matrixAutoUpdate = false;

	this.update();

};


THREE.SkeletonHelper.prototype = Object.create( THREE.Line.prototype );

THREE.SkeletonHelper.prototype.update = function () {

	var geometry = this.geometry;

	var j = 0;

	for ( var i = 0; i < this.skeleton.bones.length; i ++ ) {

		var bone = this.skeleton.bones[ i ];

		if ( bone.parent instanceof THREE.Bone ) {

			geometry.vertices[ j ].setFromMatrixPosition( bone.skinMatrix );
			geometry.vertices[ j + 1 ].setFromMatrixPosition( bone.parent.skinMatrix );

			j += 2;

		}

	}

	geometry.verticesNeedUpdate = true;

	geometry.computeBoundingSphere();

};
