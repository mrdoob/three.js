/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

import { Mesh } from './Mesh.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';

function SkinnedMesh( geometry, material ) {

	if ( geometry && geometry.isGeometry ) {

		console.error( 'THREE.SkinnedMesh no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.' );

	}

	Mesh.call( this, geometry, material );

	this.type = 'SkinnedMesh';

	this.bindMode = 'attached';
	this.bindMatrix = new Matrix4();
	this.bindMatrixInverse = new Matrix4();

}

SkinnedMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {

	constructor: SkinnedMesh,

	isSkinnedMesh: true,

	bind: function ( skeleton, bindMatrix ) {

		this.skeleton = skeleton;

		if ( bindMatrix === undefined ) {

			this.updateMatrixWorld( true );

			this.skeleton.calculateInverses();

			bindMatrix = this.matrixWorld;

		}

		this.bindMatrix.copy( bindMatrix );
		this.bindMatrixInverse.getInverse( bindMatrix );

	},

	pose: function () {

		this.skeleton.pose();

	},

	normalizeSkinWeights: function () {

		var vector = new Vector4();

		var skinWeight = this.geometry.attributes.skinWeight;

		for ( var i = 0, l = skinWeight.count; i < l; i ++ ) {

			vector.x = skinWeight.getX( i );
			vector.y = skinWeight.getY( i );
			vector.z = skinWeight.getZ( i );
			vector.w = skinWeight.getW( i );

			var scale = 1.0 / vector.manhattanLength();

			if ( scale !== Infinity ) {

				vector.multiplyScalar( scale );

			} else {

				vector.set( 1, 0, 0, 0 ); // do something reasonable

			}

			skinWeight.setXYZW( i, vector.x, vector.y, vector.z, vector.w );

		}

	},

	updateMatrixWorld: function ( force ) {

		Mesh.prototype.updateMatrixWorld.call( this, force );

		if ( this.bindMode === 'attached' ) {

			this.bindMatrixInverse.getInverse( this.matrixWorld );

		} else if ( this.bindMode === 'detached' ) {

			this.bindMatrixInverse.getInverse( this.bindMatrix );

		} else {

			console.warn( 'THREE.SkinnedMesh: Unrecognized bindMode: ' + this.bindMode );

		}

	},

	clone: function () {

		return new this.constructor( this.geometry, this.material ).copy( this );

	},

	boneTransform: ( function () {

		var basePosition = new Vector3();

		var skinIndex = new Vector4();
		var skinWeight = new Vector4();

		var vector = new Vector3();
		var matrix = new Matrix4();

		return function ( index, target ) {

			var skeleton = this.skeleton;
			var geometry = this.geometry;

			skinIndex.fromBufferAttribute( geometry.attributes.skinIndex, index );
			skinWeight.fromBufferAttribute( geometry.attributes.skinWeight, index );

			basePosition.fromBufferAttribute( geometry.attributes.position, index ).applyMatrix4( this.bindMatrix );

			target.set( 0, 0, 0 );

			for ( var i = 0; i < 4; i ++ ) {

				var weight = skinWeight.getComponent( i );

				if ( weight !== 0 ) {

					var boneIndex = skinIndex.getComponent( i );

					matrix.multiplyMatrices( skeleton.bones[ boneIndex ].matrixWorld, skeleton.boneInverses[ boneIndex ] );

					target.addScaledVector( vector.copy( basePosition ).applyMatrix4( matrix ), weight );

				}

			}

			return target.applyMatrix4( this.bindMatrixInverse );

		};

	}() )

} );


export { SkinnedMesh };
