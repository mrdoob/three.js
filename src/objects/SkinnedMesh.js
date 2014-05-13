/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SkinnedMesh = function ( geometry, material, useVertexTexture ) {

	THREE.Mesh.call( this, geometry, material );

	this.useVertexTexture = useVertexTexture;

	this.identityMatrix = new THREE.Matrix4();

	this.bones = [];

	this.boneMatrices = null;

	// init bones

	// TODO: remove bone creation as there is no reason (other than
	// convenience) for THREE.SkinnedMesh to do this.

	var bone, gbone, p, q, s;

	var bones = [];

	if ( this.geometry && this.geometry.bones !== undefined ) {

		for ( var b = 0, bl = this.geometry.bones.length; b < bl; ++b ) {

			gbone = this.geometry.bones[ b ];

			p = gbone.pos;
			q = gbone.rotq;
			s = gbone.scl;

			bone = new Bone( this );
			bones.push( bone );

			bone.name = gbone.name;
			bone.position.set( p[0], p[1], p[2] );
			bone.quaternion.set( q[0], q[1], q[2], q[3] );

			if ( s !== undefined ) {

				bone.scale.set( s[0], s[1], s[2] );

			} else {

				bone.scale.set( 1, 1, 1 );

			}

		}

		for ( var b = 0, bl = this.geometry.bones.length; b < bl; ++b ) {

			gbone = this.geometry.bones[ b ];

			if ( gbone.parent !== -1 ) {

				bones[ gbone.parent ].add( bones[ b ] );

			}

		}

	}

	this.bind( bones );

};


THREE.SkinnedMesh.prototype = Object.create( THREE.Mesh.prototype );

THREE.SkinnedMesh.prototype.bind = function( bones ) {

	bones = bones || [];
	this.bones = bones.slice( 0 );
	this.boneInverses = undefined;

	// update bone matrices and/or texture

	this.initBoneMatrices();

	// update bone inverses

	this.pose();

};

THREE.SkinnedMesh.prototype.initBoneInverses = function () {

	this.boneInverses = [];

	for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

		var inverse = new THREE.Matrix4();

		if ( this.bones[ b ] ) {

			inverse.getInverse( this.bones[ b ].matrixWorld );

		}

		inverse.multiply( this.matrixWorld );

		this.boneInverses.push( inverse );

	}

};

THREE.SkinnedMesh.prototype.initBoneMatrices = function () {

	var nBones = this.bones.length;

	// clear the old bone texture and float array

	this.boneMatrices = null;
	this.boneTextureWidth = undefined;
	this.boneTextureHeight = undefined;

	if ( this.boneTexture ) {

		this.boneTexture.dispose();
		this.boneTexture = undefined;

	}

	// create a bone texture or an array of floats

	if ( this.useVertexTexture ) {

		// layout (1 matrix = 4 pixels)
		//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
		//  with  8x8  pixel texture max   16 bones  (8 * 8  / 4)
		//       16x16 pixel texture max   64 bones (16 * 16 / 4)
		//       32x32 pixel texture max  256 bones (32 * 32 / 4)
		//       64x64 pixel texture max 1024 bones (64 * 64 / 4)

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

};

THREE.SkinnedMesh.prototype.updateBoneMatrices = function () {

	var offsetMatrix = new THREE.Matrix4();

	var invMatrixWorld = new THREE.Matrix4().getInverse( this.matrixWorld );

	// make a snapshot of the bones' rest position

	if ( this.boneInverses === undefined ) {

		this.initBoneInverses();

	}

	// flatten bone matrices to array

	for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

		// compute the offset between the current and the original transform;

		var matrix = this.bones[ b ] ? this.bones[ b ].matrixWorld : this.identityMatrix;

		offsetMatrix.multiplyMatrices( invMatrixWorld, matrix );
		offsetMatrix.multiply( this.boneInverses[ b ] );
		offsetMatrix.flattenToArrayOffset( this.boneMatrices, b * 16 );

	}

	if ( this.useVertexTexture ) {

		this.boneTexture.needsUpdate = true;

	}

};

THREE.SkinnedMesh.prototype.pose = function () {

	this.updateMatrixWorld( true );

	// force recomputation of bone inverses

	this.boneInverses = undefined;
	this.updateBoneMatrices();

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

