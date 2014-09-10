/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author michael guerrero / http://realitymeltdown.com
 * @author ikerr / http://verold.com
 */

THREE.Skeleton = function ( bones, boneInverses, useVertexTexture ) {

	this.useVertexTexture = useVertexTexture !== undefined ? useVertexTexture : true;

	this.identityMatrix = new THREE.Matrix4();

	// copy the bone array

	bones = bones || [];

	this.bones = bones.slice( 0 );

	// create a bone texture or an array of floats

	if ( this.useVertexTexture ) {

		// layout (1 matrix = 4 pixels)
		//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
		//  with  8x8  pixel texture max   16 bones  (8 * 8  / 4)
		//       16x16 pixel texture max   64 bones (16 * 16 / 4)
		//       32x32 pixel texture max  256 bones (32 * 32 / 4)
		//       64x64 pixel texture max 1024 bones (64 * 64 / 4)

		var size;

		if ( this.bones.length > 256 )
			size = 64;
		else if ( this.bones.length > 64 )
			size = 32;
		else if ( this.bones.length > 16 )
			size = 16;
		else
			size = 8;

		this.boneTextureWidth = size;
		this.boneTextureHeight = size;

		this.boneMatrices = new Float32Array( this.boneTextureWidth * this.boneTextureHeight * 4 ); // 4 floats per RGBA pixel
		this.boneTexture = new THREE.DataTexture( this.boneMatrices, this.boneTextureWidth, this.boneTextureHeight, THREE.RGBAFormat, THREE.FloatType );
		this.boneTexture.minFilter = THREE.NearestFilter;
		this.boneTexture.magFilter = THREE.NearestFilter;
		this.boneTexture.generateMipmaps = false;
		this.boneTexture.flipY = false;

	} else {

		this.boneMatrices = new Float32Array( 16 * this.bones.length );

	}

	// use the supplied bone inverses or calculate the inverses

	if ( boneInverses === undefined ) {

		this.calculateInverses();

	} else {

		if ( this.bones.length === boneInverses.length ) {

			this.boneInverses = boneInverses.slice( 0 );

		} else {

			console.warn( 'THREE.Skeleton bonInverses is the wrong length.' );

			this.boneInverses = [];

			for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

				this.boneInverses.push( new THREE.Matrix4() );

			}

		}

	}

};

THREE.Skeleton.prototype.calculateInverses = function () {

	this.boneInverses = [];

	for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

		var inverse = new THREE.Matrix4();

		if ( this.bones[ b ] ) {

			inverse.getInverse( this.bones[ b ].matrixWorld );

		}

		this.boneInverses.push( inverse );

	}

};

THREE.Skeleton.prototype.pose = function () {

	var bone;

	// recover the bind-time world matrices

	for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

		bone = this.bones[ b ];

		if ( bone ) {

			bone.matrixWorld.getInverse( this.boneInverses[ b ] );

		}

	}

	// compute the local matrices, positions, rotations and scales

	for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

		bone = this.bones[ b ];

		if ( bone ) {

			if ( bone.parent ) {

				bone.matrix.getInverse( bone.parent.matrixWorld );
				bone.matrix.multiply( bone.matrixWorld );

			} else {

				bone.matrix.copy( bone.matrixWorld );

			}

			bone.matrix.decompose( bone.position, bone.quaternion, bone.scale );

		}

	}

};

THREE.Skeleton.prototype.update = ( function () {

	var offsetMatrix = new THREE.Matrix4();
	
	return function () {

		// flatten bone matrices to array

		for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

			// compute the offset between the current and the original transform

			var matrix = this.bones[ b ] ? this.bones[ b ].matrixWorld : this.identityMatrix;

			offsetMatrix.multiplyMatrices( matrix, this.boneInverses[ b ] );
			offsetMatrix.flattenToArrayOffset( this.boneMatrices, b * 16 );

		}

		if ( this.useVertexTexture ) {

			this.boneTexture.needsUpdate = true;

		}
		
	};

} )();

