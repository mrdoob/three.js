/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author michael guerrero / http://realitymeltdown.com
 */

THREE.Skeleton = function ( boneList, useVertexTexture ) {

	this.useVertexTexture = useVertexTexture !== undefined ? useVertexTexture : true;

	// init bones

	this.bones = [];
	this.boneMatrices = [];

	var bone, gbone, p, q, s;

	if ( boneList !== undefined ) {

		for ( var b = 0; b < boneList.length; ++b ) {

			gbone = boneList[ b ];

			p = gbone.pos;
			q = gbone.rotq;
			s = gbone.scl;

			bone = this.addBone();

			bone.name = gbone.name;
			bone.position.set( p[0], p[1], p[2] );
			bone.quaternion.set( q[0], q[1], q[2], q[3] );

			if ( s !== undefined ) {

				bone.scale.set( s[0], s[1], s[2] );

			} else {

				bone.scale.set( 1, 1, 1 );

			}

		}

		for ( var b = 0; b < boneList.length; ++b ) {

			gbone = boneList[ b ];

			if ( gbone.parent !== -1 ) {

				this.bones[ gbone.parent ].add( this.bones[ b ] );

			}

		}

		//

		var nBones = this.bones.length;

		if ( this.useVertexTexture ) {

			// layout (1 matrix = 4 pixels)
			//  RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
			//  with  8x8  pixel texture max   16 bones  (8 * 8  / 4)
			//     16x16 pixel texture max   64 bones (16 * 16 / 4)
			//     32x32 pixel texture max  256 bones (32 * 32 / 4)
			//     64x64 pixel texture max 1024 bones (64 * 64 / 4)

			var size;

			if ( nBones > 256 )
				size = 64;
			else if ( nBones > 64 )
				size = 32;
			else if ( nBones > 16 )
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

			this.boneMatrices = new Float32Array( 16 * nBones );

		}

	}

};


THREE.Skeleton.prototype = Object.create( THREE.Mesh.prototype );


THREE.Skeleton.prototype.addBone = function( bone ) {

	if ( bone === undefined ) {

		bone = new THREE.Bone( this );

	}

	this.bones.push( bone );

	return bone;

};


THREE.Skeleton.prototype.calculateInverses = function( bone ) {

	this.boneInverses = [];

	for ( var b = 0, bl = this.bones.length; b < bl; ++b ) {

		var inverse = new THREE.Matrix4();

		inverse.getInverse( this.bones[ b ].skinMatrix );

		this.boneInverses.push( inverse );

	}

};
