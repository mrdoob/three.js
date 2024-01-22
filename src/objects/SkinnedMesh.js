import { Mesh } from './Mesh.js';
import { Box3 } from '../math/Box3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Sphere } from '../math/Sphere.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';
import { Ray } from '../math/Ray.js';
import { AttachedBindMode, BoneIndexWeightsTextureAllow, BoneIndexWeightsTextureNever, DetachedBindMode, FloatType, IntType, RGFormat } from '../constants.js';
import { DataTexture } from '../textures/DataTexture.js';
import { BufferAttribute } from '../core/BufferAttribute.js';

const _basePosition = /*@__PURE__*/ new Vector3();

const _skinIndex = /*@__PURE__*/ new Vector4();
const _skinWeight = /*@__PURE__*/ new Vector4();

const _vector3 = /*@__PURE__*/ new Vector3();
const _matrix4 = /*@__PURE__*/ new Matrix4();
const _vertex = /*@__PURE__*/ new Vector3();

const _sphere = /*@__PURE__*/ new Sphere();
const _inverseMatrix = /*@__PURE__*/ new Matrix4();
const _ray = /*@__PURE__*/ new Ray();

class SkinnedMesh extends Mesh {

	constructor( geometry, material, options = {} ) {

		super( geometry, material );

		this.isSkinnedMesh = true;

		this.type = 'SkinnedMesh';

		this.bindMode = AttachedBindMode;
		this.bindMatrix = new Matrix4();
		this.bindMatrixInverse = new Matrix4();

		this.boundingBox = null;
		this.boundingSphere = null;

		this.useBoneIndexWeightsTexture =
			options.useBoneIndexWeightsTexture !== undefined ?
				options.useBoneIndexWeightsTexture : BoneIndexWeightsTextureAllow;

		this.boneIndexWeightsTexture = null;

		// Don't process geometry data if this constructor is being called as part
		// of a .clone() operation. The object's members will already be set but the
		// constructor parameters will be undefined.
		if ( geometry ) {

			this.normalizeSkinWeights();
			this.createBoneIndexWeightsTexture();

		}

	}

	createBoneIndexWeightsTexture() {

		if ( ! this.geometry
			|| this.useBoneIndexWeightsTexture === BoneIndexWeightsTextureNever
			|| ( this.useBoneIndexWeightsTexture === BoneIndexWeightsTextureAllow
				&& this.geometry.getSkinIndexBuffers().length <= 1 ) ) {

			return;

		}

		const indexBuffers = this.geometry.getSkinIndexBuffers();
		const weightBuffers = this.geometry.getSkinWeightBuffers();

		const vertexCount = indexBuffers[ 0 ].count;
		const boneStartIndex = new Int32Array( vertexCount );

		const influences = [];

		for ( let vi = 0; vi < vertexCount; ++ vi ) {

			boneStartIndex[ vi ] = influences.length / 2;

			for ( let attrIndex = 0; attrIndex < 4 * indexBuffers.length; ++ attrIndex ) {

				const bufferIndex = Math.trunc( attrIndex / 4 );
				const component = attrIndex % 4;

				const weight = weightBuffers[ bufferIndex ].getComponent( vi, component );

				if ( weight == 0 ) {

					// weights are sorted so once 0 is seen, there are no more weights
					break;

				}

				const boneIndex = indexBuffers[ bufferIndex ].getComponent( vi, component );
				influences.push( boneIndex, weight );

			}

			influences.push( - 1, - 1 );

		}

		// make the texture width a power of 2
		const influenceCount = influences.length / 2;
		const textureWidth = Math.pow( 2, Math.ceil( Math.log2( Math.sqrt( influenceCount ) ) ) );
		const textureHeight = Math.ceil( influenceCount / textureWidth );
		const influenceArray = new Float32Array( 2 * textureWidth * textureHeight );

		for ( let ii = 0; ii < influences.length; ++ ii ) {

			influenceArray[ ii ] = influences[ ii ];

		}

		for ( let ii = influences.length; ii < influenceArray.length; ++ ii ) {

			influenceArray[ ii ] = - 1;

		}

		if ( this.boneIndexWeightsTexture ) {

			this.boneIndexWeightsTexture.dispose();

		}

		this.boneIndexWeightsTexture = new DataTexture(
			influenceArray, textureWidth, textureHeight, RGFormat, FloatType );

		this.boneIndexWeightsTexture.needsUpdate = true;

		const attrib = new BufferAttribute( boneStartIndex, 1 );
		attrib.gpuType = IntType;

		this.geometry.setAttribute( 'bonePairTexStartIndex', attrib );

	}

	computeBoundingBox() {

		const geometry = this.geometry;

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		this.boundingBox.makeEmpty();

		const positionAttribute = geometry.getAttribute( 'position' );

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			this.getVertexPosition( i, _vertex );
			this.boundingBox.expandByPoint( _vertex );

		}

	}

	computeBoundingSphere() {

		const geometry = this.geometry;

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		this.boundingSphere.makeEmpty();

		const positionAttribute = geometry.getAttribute( 'position' );

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			this.getVertexPosition( i, _vertex );
			this.boundingSphere.expandByPoint( _vertex );

		}

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.bindMode = source.bindMode;
		this.bindMatrix.copy( source.bindMatrix );
		this.bindMatrixInverse.copy( source.bindMatrixInverse );

		this.skeleton = source.skeleton;
		this.useBoneIndexWeightsTexture = source.useBoneIndexWeightsTexture;

		if ( source.boneIndexWeightsTexture !== null ) this.boneIndexWeightsTexture = source.boneIndexWeightsTexture.clone();
		if ( source.boundingBox !== null ) this.boundingBox = source.boundingBox.clone();
		if ( source.boundingSphere !== null ) this.boundingSphere = source.boundingSphere.clone();

		return this;

	}

	raycast( raycaster, intersects ) {

		const material = this.material;
		const matrixWorld = this.matrixWorld;

		if ( material === undefined ) return;

		// test with bounding sphere in world space

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

		_sphere.copy( this.boundingSphere );
		_sphere.applyMatrix4( matrixWorld );

		if ( raycaster.ray.intersectsSphere( _sphere ) === false ) return;

		// convert ray to local space of skinned mesh

		_inverseMatrix.copy( matrixWorld ).invert();
		_ray.copy( raycaster.ray ).applyMatrix4( _inverseMatrix );

		// test with bounding box in local space

		if ( this.boundingBox !== null ) {

			if ( _ray.intersectsBox( this.boundingBox ) === false ) return;

		}

		// test for intersections with geometry

		this._computeIntersections( raycaster, intersects, _ray );

	}

	getVertexPosition( index, target ) {

		super.getVertexPosition( index, target );

		this.applyBoneTransform( index, target );

		return target;

	}

	bind( skeleton, bindMatrix ) {

		this.skeleton = skeleton;

		if ( bindMatrix === undefined ) {

			this.updateMatrixWorld( true );

			this.skeleton.calculateInverses();

			bindMatrix = this.matrixWorld;

		}

		this.bindMatrix.copy( bindMatrix );
		this.bindMatrixInverse.copy( bindMatrix ).invert();

	}

	pose() {

		this.skeleton.pose();

	}

	normalizeSkinWeights() {

		const weightBuffers = this.geometry.getSkinWeightBuffers();
		const indexBuffers = this.geometry.getSkinIndexBuffers();
		const vertexCount = weightBuffers[ 0 ].count;
		const maxInfluences =
			this.useBoneIndexWeightsTexture == BoneIndexWeightsTextureNever ? 4 : 4 * indexBuffers.length;

		const tempBoneIndexes = [ ...Array( maxInfluences ) ];
		const tempBoneWeights = [ ...Array( maxInfluences ) ];

		for ( let vi = 0; vi < vertexCount; vi ++ ) {

			const sortedSkinPairIndexes = [];

			for ( let jj = 0; jj < 4 * weightBuffers.length; ++ jj ) {

				sortedSkinPairIndexes.push( jj );

			}

			// Sort by descending weight so when weights are limited we only take the
			// highest ones
			sortedSkinPairIndexes.sort( ( a, b ) => {

				const bufIndexA = Math.trunc( a / 4 );
				const bufIndexB = Math.trunc( b / 4 );

				return weightBuffers[ bufIndexB ].getComponent( vi, b % 4 )
				     - weightBuffers[ bufIndexA ].getComponent( vi, a % 4 );

			} );

			let vertexWeight = 0;

			for ( let destAttrIndex = 0; destAttrIndex < maxInfluences; ++ destAttrIndex ) {

				const srcAttrIndex = sortedSkinPairIndexes[ destAttrIndex ];
				const bufIndex = Math.trunc( srcAttrIndex / 4 );
				const component = srcAttrIndex % 4;
				const weight = weightBuffers[ bufIndex ].getComponent( vi, component );
				vertexWeight += weight;

				tempBoneIndexes[ destAttrIndex ] = indexBuffers[ bufIndex ].getComponent( vi, component );
				tempBoneWeights[ destAttrIndex ] = weight;

			}

			if ( vertexWeight === 0 ) {

				// do something reasonable
				weightBuffers[ 0 ].setXYZW( 1, 0, 0, 0 );
				for ( let bufIndex = 1; bufIndex < weightBuffers.length; ++ bufIndex ) {

					weightBuffers[ bufIndex ].setXYZW( 0, 0, 0, 0 );

				}

			} else {

				for ( let attrIndex = 0; attrIndex < maxInfluences; ++ attrIndex ) {

					const bufIndex = Math.trunc( attrIndex / 4 );
					const component = attrIndex % 4;
					const normalizedWeight = tempBoneWeights[ attrIndex ] / vertexWeight;

					indexBuffers[ bufIndex ].setComponent( vi, component, tempBoneIndexes[ attrIndex ] );
					weightBuffers[ bufIndex ].setComponent( vi, component, normalizedWeight );

				}

			}

		}

		for ( let bufIndex = 0; bufIndex < maxInfluences / 4; ++ bufIndex ) {

			weightBuffers[ bufIndex ].needsUpdate = true;
			indexBuffers[ bufIndex ].needsUpdate = true;

		}

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		if ( this.bindMode === AttachedBindMode ) {

			this.bindMatrixInverse.copy( this.matrixWorld ).invert();

		} else if ( this.bindMode === DetachedBindMode ) {

			this.bindMatrixInverse.copy( this.bindMatrix ).invert();

		} else {

			console.warn( 'THREE.SkinnedMesh: Unrecognized bindMode: ' + this.bindMode );

		}

	}

	applyBoneTransform( index, vector ) {

		const skeleton = this.skeleton;
		const geometry = this.geometry;

		_skinIndex.fromBufferAttribute( geometry.attributes.skinIndex, index );
		_skinWeight.fromBufferAttribute( geometry.attributes.skinWeight, index );

		_basePosition.copy( vector ).applyMatrix4( this.bindMatrix );

		vector.set( 0, 0, 0 );

		for ( let i = 0; i < 4; i ++ ) {

			const weight = _skinWeight.getComponent( i );

			if ( weight !== 0 ) {

				const boneIndex = _skinIndex.getComponent( i );

				_matrix4.multiplyMatrices( skeleton.bones[ boneIndex ].matrixWorld, skeleton.boneInverses[ boneIndex ] );

				vector.addScaledVector( _vector3.copy( _basePosition ).applyMatrix4( _matrix4 ), weight );

			}

		}

		return vector.applyMatrix4( this.bindMatrixInverse );

	}

}

export { SkinnedMesh };
