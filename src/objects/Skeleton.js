import { Matrix4 } from '../math/Matrix4';

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author michael guerrero / http://realitymeltdown.com
 * @author ikerr / http://verold.com
 */

function Skeleton( bones, boneInverses ) {

	// copy the bone array

	bones = bones || [];

	this.bones = bones.slice( 0 );
	this.boneMatrices = new Float32Array( this.bones.length * 16 );
	this.boneParents = [];
	this.updated = false;

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

	update: ( function () {

		var offsetMatrix = new Matrix4();
		var identityMatrix = new Matrix4();

		return function update() {

			if ( this.updated ) return;

			this.updated = true;

			var bones = this.bones;
			var boneInverses = this.boneInverses;
			var boneMatrices = this.boneMatrices;
			var boneTexture = this.boneTexture;
			var boneParents = this.boneParents;

			for ( var i = 0, il = bones.length; i < il; i ++ ) {

				var parent = bones[ i ].parent;

				boneParents[ i ] = parent;

				if ( parent !== null && parent.isBone !== true ) {

					bones[ i ].parent.remove( bones[ i ] );
					bones[ i ].updateMatrixWorld( true );

				}

			}

			// flatten bone matrices to array

			for ( var i = 0, il = bones.length; i < il; i ++ ) {

				// compute the offset between the current and the original transform

				var matrix = bones[ i ] ? bones[ i ].matrixWorld : identityMatrix;

				offsetMatrix.multiplyMatrices( matrix, boneInverses[ i ] );
				offsetMatrix.toArray( boneMatrices, i * 16 );

			}

			if ( boneTexture !== undefined ) {

				boneTexture.needsUpdate = true;

			}

		};

	} )(),

	restoreParents: function () {

		if ( ! this.updated ) return;

		this.updated = false;

		var bones = this.bones;
		var boneParents = this.boneParents;

		for ( var i = 0, il = bones.length; i < il; i ++ ) {

			var parent = boneParents[ i ];

			if ( parent !== null && parent.isBone !== true ) {

				parent.add( bones[ i ] );
				parent.updateMatrixWorld( true );

			}

		}

	},

	clone: function () {

		return new Skeleton( this.bones, this.boneInverses );

	}

} );


export { Skeleton };
