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

	copy: function ( source ) {

		Mesh.prototype.copy.call( this, source );

		this.bindMode = source.bindMode;
		this.bindMatrix.copy( source.bindMatrix );
		this.bindMatrixInverse.copy( source.bindMatrixInverse );

		this.skeleton = source.skeleton;

		return this;

	},

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

		const vector = new Vector4();

		const skinWeight = this.geometry.attributes.skinWeight;

		for ( let i = 0, l = skinWeight.count; i < l; i ++ ) {

			vector.x = skinWeight.getX( i );
			vector.y = skinWeight.getY( i );
			vector.z = skinWeight.getZ( i );
			vector.w = skinWeight.getW( i );

			const scale = 1.0 / vector.manhattanLength();

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

	boneTransform: ( function () {

		const basePosition = new Vector3();

		const skinIndex = new Vector4();
		const skinWeight = new Vector4();

		const vector = new Vector3();
		const matrix = new Matrix4();

		return function ( index, target ) {

			const skeleton = this.skeleton;
			const geometry = this.geometry;

			skinIndex.fromBufferAttribute( geometry.attributes.skinIndex, index );
			skinWeight.fromBufferAttribute( geometry.attributes.skinWeight, index );

			basePosition.fromBufferAttribute( geometry.attributes.position, index ).applyMatrix4( this.bindMatrix );

			target.set( 0, 0, 0 );

			for ( let i = 0; i < 4; i ++ ) {

				const weight = skinWeight.getComponent( i );

				if ( weight !== 0 ) {

					const boneIndex = skinIndex.getComponent( i );

					matrix.multiplyMatrices( skeleton.bones[ boneIndex ].matrixWorld, skeleton.boneInverses[ boneIndex ] );

					target.addScaledVector( vector.copy( basePosition ).applyMatrix4( matrix ), weight );

				}

			}

			return target.applyMatrix4( this.bindMatrixInverse );

		};

	}() )

} );


export { SkinnedMesh };
