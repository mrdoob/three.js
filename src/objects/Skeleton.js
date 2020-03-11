import { Matrix4 } from '../math/Matrix4.js';

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author michael guerrero / http://realitymeltdown.com
 * @author ikerr / http://verold.com
 */

var _offsetMatrix = new Matrix4();
var _identityMatrix = new Matrix4();

function Skeleton( bones, boneInverses ) {

	// copy the bone array

	bones = bones || [];

	this.bones = bones.slice( 0 );
	this.boneMatrices = new Float32Array( this.bones.length * 16 );

	this.frame = - 1;

	// use the supplied bone inverses or calculate the inverses

	if ( boneInverses === undefined ) {

		this.calculateInverses();

	} else {

		if ( this.bones.length === boneInverses.length ) {

			this.boneInverses = boneInverses.slice( 0 );

		} else {

			console.warn( 'THREE.Skeleton boneInverses is the wrong length.' );

			this.boneInverses = [];

			for ( var i = 0, il = this.bones.length; i < il; i ++ ) {

				this.boneInverses.push( new Matrix4() );

			}

		}

	}

}

Object.assign( Skeleton.prototype, {

	calculateInverses: function () {

		this.boneInverses = [];

		for ( var i = 0, il = this.bones.length; i < il; i ++ ) {

			var inverse = new Matrix4();

			if ( this.bones[ i ] ) {

				inverse.getInverse( this.bones[ i ].matrixWorld );

			}

			this.boneInverses.push( inverse );

		}

	},

	pose: function () {

		var bone, i, il;

		// recover the bind-time world matrices

		for ( i = 0, il = this.bones.length; i < il; i ++ ) {

			bone = this.bones[ i ];

			if ( bone ) {

				bone.matrixWorld.getInverse( this.boneInverses[ i ] );

			}

		}

		// compute the local matrices, positions, rotations and scales

		for ( i = 0, il = this.bones.length; i < il; i ++ ) {

			bone = this.bones[ i ];

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

	update: function () {

		var bones = this.bones;
		var boneInverses = this.boneInverses;
		var boneMatrices = this.boneMatrices;
		var boneTexture = this.boneTexture;

		// flatten bone matrices to array

		for ( var i = 0, il = bones.length; i < il; i ++ ) {

			// compute the offset between the current and the original transform

			var matrix = bones[ i ] ? bones[ i ].matrixWorld : _identityMatrix;

			_offsetMatrix.multiplyMatrices( matrix, boneInverses[ i ] );
			_offsetMatrix.toArray( boneMatrices, i * 16 );

		}

		if ( boneTexture !== undefined ) {

			boneTexture.needsUpdate = true;

		}

	},

	clone: function () {

		return new Skeleton( this.bones, this.boneInverses );

	},

	getBoneByName: function ( name ) {

		for ( var i = 0, il = this.bones.length; i < il; i ++ ) {

			var bone = this.bones[ i ];

			if ( bone.name === name ) {

				return bone;

			}

		}

		return undefined;

	},

	dispose: function ( ) {

		if ( this.boneTexture ) {

			this.boneTexture.dispose();

			this.boneTexture = undefined;

		}

	}

} );


export { Skeleton };
