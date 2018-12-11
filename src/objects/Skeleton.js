import { Matrix4 } from '../math/Matrix4.js';
import { _Math } from '../math/Math.js';
import { Bone } from './Bone.js';

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author michael guerrero / http://realitymeltdown.com
 * @author ikerr / http://verold.com
 */

function Skeleton( bones, boneInverses ) {

	this.uuid = _Math.generateUUID();

	this.type = 'Skeleton';

	this.bones = bones || [];
	this.boneInverses = boneInverses;

	this.boneMatrices = undefined;
	this.boneTexture = undefined;
	this.boneTextureSize = undefined;

	this.init();

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

			var bones = this.bones;
			var boneInverses = this.boneInverses;
			var boneMatrices = this.boneMatrices;
			var boneTexture = this.boneTexture;

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

	init: function () {

		var bones = this.bones;
		var boneInverses = this.boneInverses;

		this.boneMatrices = new Float32Array( bones.length * 16 );

		// calculate inverse bone matrices if necessary

		if ( boneInverses === undefined ) {

			this.calculateInverses();

		} else {

			// handle special case

			if ( bones.length !== boneInverses.length ) {

				console.warn( 'THREE.Skeleton: Amount of inverse bone matrices does not match amount of bones.' );

				this.boneInverses = [];

				for ( var i = 0, il = this.bones.length; i < il; i ++ ) {

					this.boneInverses.push( new Matrix4() );

				}

			}

		}

		return this;

	},

	fromJSON: function ( json, object ) {

		this.uuid = json.uuid;

		this.boneInverses = [];

		var bones = this.bones;
		var boneInverses = this.boneInverses;

		for ( var i = 0, l = json.bones.length; i < l; i ++ ) {

			var boneUUID = json.bones[ i ];
			var bone = object.getObjectByProperty( 'uuid', boneUUID );

			if ( bone === undefined ) {

				console.warn( 'THREE.Skeleton: No bone found with UUID:', boneUUID );
				bone = new Bone();

			}

			bones.push( bone );
			boneInverses.push( new Matrix4().fromArray( json.boneInverses[ i ] ) );

		}

		this.init();

		return this;

	},

	toJSON: function () {

		var data = {
			metadata: {
				version: 4.5,
				type: 'Skeleton',
				generator: 'Skeleton.toJSON'
			},
			bones: [],
			boneInverses: []
		};

		data.uuid = this.uuid;

		var bones = this.bones;
		var boneInverses = this.boneInverses;

		for ( var i = 0, l = bones.length; i < l; i ++ ) {

			var bone = bones[ i ];
			data.bones.push( bone.uuid );

			var boneInverse = boneInverses[ i ];
			data.boneInverses.push( boneInverse.toArray() );

		}

		return data;

	}

} );


export { Skeleton };
