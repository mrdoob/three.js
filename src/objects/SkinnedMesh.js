/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

THREE.SkinnedMesh = function ( geometry, material, useVertexTexture ) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'SkinnedMesh';

	this.bindMode = "attached";
	this.bindMatrix = new THREE.Matrix4();
	this.bindMatrixInverse = new THREE.Matrix4();

	// init bones

	// TODO: remove bone creation as there is no reason (other than
	// convenience) for THREE.SkinnedMesh to do this.

	var bones = [];

	if ( this.geometry && this.geometry.bones !== undefined ) {

		var bone, gbone;

		for ( var b = 0, bl = this.geometry.bones.length; b < bl; ++ b ) {

			gbone = this.geometry.bones[ b ];

			bone = new THREE.Bone( this );
			bones.push( bone );

			bone.name = gbone.name;
			bone.position.fromArray( gbone.pos );
			bone.quaternion.fromArray( gbone.rotq );
			if ( gbone.scl !== undefined ) bone.scale.fromArray( gbone.scl );

		}

		for ( var b = 0, bl = this.geometry.bones.length; b < bl; ++ b ) {

			gbone = this.geometry.bones[ b ];

			if ( gbone.parent !== - 1 ) {

				bones[ gbone.parent ].add( bones[ b ] );

			} else {

				this.add( bones[ b ] );

			}

		}

	}

	this.normalizeSkinWeights();

	this.updateMatrixWorld( true );
	this.bind( new THREE.Skeleton( bones, undefined, useVertexTexture ) );

};


THREE.SkinnedMesh.prototype = Object.create( THREE.Mesh.prototype );
THREE.SkinnedMesh.prototype.constructor = THREE.SkinnedMesh;

THREE.SkinnedMesh.prototype.bind = function( skeleton, bindMatrix ) {

	this.skeleton = skeleton;

	if ( bindMatrix === undefined ) {

		this.updateMatrixWorld( true );

		bindMatrix = this.matrixWorld;

	}

	this.bindMatrix.copy( bindMatrix );
	this.bindMatrixInverse.getInverse( bindMatrix );

};

THREE.SkinnedMesh.prototype.pose = function () {

	this.skeleton.pose();

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

THREE.SkinnedMesh.prototype.updateMatrixWorld = function( force ) {

	THREE.Mesh.prototype.updateMatrixWorld.call( this, true );

	if ( this.bindMode === "attached" ) {

		this.bindMatrixInverse.getInverse( this.matrixWorld );

	} else if ( this.bindMode === "detached" ) {

		this.bindMatrixInverse.getInverse( this.bindMatrix );

	} else {

		console.warn( 'THREE.SkinnedMesh unrecognized bindMode: ' + this.bindMode );

	}

};

THREE.SkinnedMesh.prototype.clone = function() {

	var skinMesh = new THREE.SkinnedMesh( this.geometry, this.material, this.useVertexTexture );
	return skinMesh.copy( this );

};

THREE.SkinnedMesh.prototype.copy = function( source ) {

	THREE.Mesh.prototype.copy.call( this, source );
	return this;

};

THREE.SkinnedMesh.prototype.makeVertexGetter = function () {

	// calculate transformed vertex in the getter

	var result = new THREE.Vector3(), skinIndices = new THREE.Vector4(), skinWeights = new THREE.Vector4();
	var temp = new THREE.Vector3(), tempMatrix = new THREE.Matrix4(), properties = [ 'x', 'y', 'z', 'w' ];

	if ( this.geometry.attributes ) {
		var positions = this.geometry.attributes.position.array;
		var skinIndicesArray = this.geometry.attributes.skinIndex.array;
		var skinWeightsArray = this.geometry.attributes.skinWeights.array;

		this.getVertex = function getVertex( vector, index ) {
			var index4 = index << 2;
			skinIndices.fromArray( skinIndicesArray, index4 );
			skinWeights.fromArray( skinWeightsArray, index4 );
			vector.fromArray( positions, index * 3 );

			vector.applyMatrix4( this.bindMatrix ); result.set( 0, 0, 0 );
			for ( var i = 0; i < 4; i++ ) {
				var skinWeight = skinWeights[ properties[ i ] ];
				if (skinWeight != 0) {
					var boneIndex = skinIndices[ properties[ i ] ];
					tempMatrix.multiplyMatrices( this.skeleton.bones[ boneIndex ].matrixWorld, this.skeleton.boneInverses[ boneIndex ]);
					result.add( temp.copy( vector ).applyMatrix4( tempMatrix ).multiplyScalar( skinWeight ) );
				}
			}
			vector.copy( result.applyMatrix4( this.bindMatrixInverse ) );
		};
	} else {
		var vertices = this.geometry.vertices;
		var skinIndicesArray = this.geometry.skinIndices;
		var skinWeightsArray = this.geometry.skinWeights;

		this.getVertex = function getVertex( vector, index ) {
			vector.copy( vertices[ index ] );
			skinIndices.copy( skinIndicesArray[ index ] );
			skinWeights.copy( skinWeightsArray[ index ] );

			vector.applyMatrix4( this.bindMatrix ); result.set( 0, 0, 0 );
			for ( var i = 0; i < 4; i++ ) {
				var skinWeight = skinWeights[ properties[ i ] ];
				if (skinWeight != 0) {
					var boneIndex = skinIndices[ properties[ i ] ];
					tempMatrix.multiplyMatrices( this.skeleton.bones[ boneIndex ].matrixWorld, this.skeleton.boneInverses[ boneIndex ]);
					result.add( temp.copy( vector ).applyMatrix4( tempMatrix ).multiplyScalar( skinWeight ) );
				}
			}
			vector.copy( result.applyMatrix4( this.bindMatrixInverse ) );
		};
	}
};