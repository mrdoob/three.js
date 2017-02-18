import { Matrix4 } from '../math/Matrix4';

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author michael guerrero / http://realitymeltdown.com
 * @author ikerr / http://verold.com
 */

function Skeleton( bones, boneInverses ) {

	this.identityMatrix = new Matrix4();

	// copy the bone array

	bones = bones || [];

	this.bones = bones.slice( 0 );
	this.boneMatrices = new Float32Array( this.bones.length * 16 );

	// use the supplied bone inverses or calculate the inverses

	if ( boneInverses === undefined ) {

		this.calculateInverses();

	} else {

		if ( this.bones.length === boneInverses.length ) {

			this.boneInverses = boneInverses.slice( 0 );

		} else {

			console.warn( 'THREE.Skeleton boneInverses is the wrong length.' );

			this.boneInverses = [];

			for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

				this.boneInverses.push( new Matrix4() );

			}

		}

	}

}

Object.assign( Skeleton.prototype, {

	calculateInverses: function () {

		this.boneInverses = [];

		for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

			var inverse = new Matrix4();

			if ( this.bones[ b ] ) {

				inverse.getInverse( this.bones[ b ].matrixWorld );

			}

			this.boneInverses.push( inverse );

		}

	},

	pose: function () {

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

				if ( bone.parent && bone.parent.isBone ) {

					bone.matrix.getInverse( bone.parent.matrixWorld );
					bone.matrix.multiply( bone.matrixWorld );

				} else {

					bone.matrix.copy( bone.matrixWorld );

				}

				bone.matrix.decompose( bone.position, bone.quaternion, bone.scale );

			}

		}

	},

	update: ( function () {

		var offsetMatrix = new Matrix4();

		return function update() {

			var bones = this.bones;
			var boneInverses = this.boneInverses;
			var boneMatrices = this.boneMatrices;
			var boneTexture = this.boneTexture;

			// flatten bone matrices to array

			for ( var b = 0, bl = bones.length; b < bl; b ++ ) {

				// compute the offset between the current and the original transform

				var matrix = bones[ b ] ? bones[ b ].matrixWorld : this.identityMatrix;

				offsetMatrix.multiplyMatrices( matrix, boneInverses[ b ] );
				offsetMatrix.toArray( boneMatrices, b * 16 );

			}

			if ( boneTexture !== undefined ) {

				boneTexture.needsUpdate = true;

			}

		};

	} )(),

	clone: function () {

		return new Skeleton( this.bones, this.boneInverses );

	}

} );


export { Skeleton };
