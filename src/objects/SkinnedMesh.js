/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SkinnedMesh = function ( geometry, material, useVertexTexture ) {

	THREE.Mesh.call( this, geometry, material );

	this.skeleton = new THREE.Skeleton( this.geometry && this.geometry.bones, useVertexTexture );

  // Add root level bones as children of the mesh

	for ( var b = 0; b < this.skeleton.bones.length; ++b ) {

		var bone = this.skeleton.bones[ b ];

		if ( bone.parent === undefined ) {

			this.add( bone );

		}

	}

	this.identityMatrix = new THREE.Matrix4();

	this.pose();

};


THREE.SkinnedMesh.prototype = Object.create( THREE.Mesh.prototype );

THREE.SkinnedMesh.prototype.updateMatrixWorld = function () {

	var offsetMatrix = new THREE.Matrix4();

	return function ( force ) {

		this.matrixAutoUpdate && this.updateMatrix();

		// update matrixWorld

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.parent ) {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			} else {

				this.matrixWorld.copy( this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			var child = this.children[ i ];

			if ( child instanceof THREE.Bone ) {

				child.update( this.identityMatrix, false );

			} else {

				child.updateMatrixWorld( true );

			}

		}

		// make a snapshot of the bones' rest position

		if ( this.skeleton.boneInverses === undefined ) {

			this.skeleton.calculateInverses();

		}

		// flatten bone matrices to array

		for ( var b = 0, bl = this.skeleton.bones.length; b < bl; b ++ ) {

			// compute the offset between the current and the original transform;

			// TODO: we could get rid of this multiplication step if the skinMatrix
			// was already representing the offset; however, this requires some
			// major changes to the animation system

			offsetMatrix.multiplyMatrices( this.skeleton.bones[ b ].skinMatrix, this.skeleton.boneInverses[ b ] );
			offsetMatrix.flattenToArrayOffset( this.skeleton.boneMatrices, b * 16 );

		}

		if ( this.skeleton.useVertexTexture ) {

			this.skeleton.boneTexture.needsUpdate = true;

		}

	};

}();

THREE.SkinnedMesh.prototype.pose = function () {

	this.updateMatrixWorld( true );

	this.normalizeSkinWeights();

};

THREE.SkinnedMesh.prototype.normalizeSkinWeights = function () {

	if ( this.geometry instanceof THREE.Geometry ) {

		for ( var i = 0; i < this.geometry.skinIndices.length; i ++ ) {

			var sw = this.geometry.skinWeights[ i ];

			var scale = 1.0 / sw.lengthManhattan();

			if ( scale !== Infinity ) {

				sw.multiplyScalar( scale );

			} else {

				sw.set( 1 ); // this will be normalized by the shader anyway

			}

		}

	} else {

		// skinning weights assumed to be normalized for THREE.BufferGeometry

	}

};

THREE.SkinnedMesh.prototype.clone = function ( object ) {

	if ( object === undefined ) {

		object = new THREE.SkinnedMesh( this.geometry, this.material, this.useVertexTexture );

	}

	THREE.Mesh.prototype.clone.call( this, object );

	return object;

};
