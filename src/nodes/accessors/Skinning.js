
import { Fn, add, uniform, int, ivec2, mat3, mat4 } from '../tsl/TSLBase.js';
import { attribute } from '../core/AttributeNode.js';
import { OnObjectUpdate } from '../utils/EventNode.js';
import { normalLocal } from './Normal.js';
import { positionLocal, positionPrevious } from './Position.js';
import { tangentLocal } from './Tangent.js';
import { reference, referenceBuffer } from './ReferenceNode.js';
import { buffer } from './BufferNode.js';
import { storage } from './StorageBufferNode.js';
import { texture } from './TextureNode.js';
import { textureSize } from './TextureSizeNode.js';
import { instanceIndex } from '../core/IndexNode.js';

import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';
import { DataTexture } from '../../textures/DataTexture.js';
import { RGBAFormat, FloatType } from '../../constants.js';

const _skeletonsUpdated = /*@__PURE__*/ new WeakMap();

/**
 * Creates an accessor for bone matrices stored in a bone texture.
 *
 * @param {TextureNode} boneTexture - The bone texture node.
 * @returns {Object} An accessor with the same `element()` interface as a buffer node.
 */
function getBoneTextureMatrices( boneTexture ) {

	return {
		element: ( i ) => {

			const size = int( textureSize( boneTexture ).x ).toConst();
			const j = int( i ).mul( 4 ).toConst();
			const y = j.div( size ).toConst();
			const x = j.sub( y.mul( size ) ).toConst();

			return mat4(
				boneTexture.load( ivec2( x, y ) ),
				boneTexture.load( ivec2( x.add( 1 ), y ) ),
				boneTexture.load( ivec2( x.add( 2 ), y ) ),
				boneTexture.load( ivec2( x.add( 3 ), y ) )
			);

		}
	};

}

/**
 * Creates the bone matrices node. Skeletons that fit within the uniform buffer limit
 * use a uniform buffer, larger skeletons fall back to a bone texture.
 *
 * @param {NodeBuilder} builder - The current node builder.
 * @param {Skeleton} skeleton - The skeleton.
 * @returns {Object} The bone matrices node.
 */
function getBoneMatricesNode( builder, skeleton ) {

	let node;

	const uniformBufferSize = skeleton.bones.length * 16 * 4;

	if ( uniformBufferSize <= builder.getUniformBufferLimit() ) {

		node = referenceBuffer( 'skeleton.boneMatrices', 'mat4', skeleton.bones.length );

	} else {

		if ( skeleton.boneTexture === null ) skeleton.computeBoneTexture();

		const boneTexture = texture( skeleton.boneTexture );

		OnObjectUpdate( ( { object } ) => {

			const skeleton = object.skeleton;

			if ( skeleton.boneTexture === null ) skeleton.computeBoneTexture();

			boneTexture.value = skeleton.boneTexture;

		} );

		node = getBoneTextureMatrices( boneTexture );

	}

	return node;

}

/**
 * Computes the skinned position by applying bone matrices based on weights.
 *
 * @param {Node} boneMatrices - The bone matrices buffer or storage node.
 * @param {Node<vec3>} position - The vertex position to transform.
 * @param {Node<mat4>} bindMatrix - The bind matrix node.
 * @param {Node<mat4>} bindMatrixInverse - The inverse bind matrix node.
 * @param {Node<uvec4>} skinIndex - The skin index attribute.
 * @param {Node<vec4>} skinWeight - The skin weight attribute.
 * @returns {Node<vec3>} The skinned position.
 */
function getSkinnedPosition( boneMatrices, position, bindMatrix, bindMatrixInverse, skinIndex, skinWeight ) {

	const boneMatX = boneMatrices.element( skinIndex.x );
	const boneMatY = boneMatrices.element( skinIndex.y );
	const boneMatZ = boneMatrices.element( skinIndex.z );
	const boneMatW = boneMatrices.element( skinIndex.w );

	// POSITION

	const skinVertex = bindMatrix.mul( position );

	const skinned = add(
		boneMatX.mul( skinWeight.x ).mul( skinVertex ),
		boneMatY.mul( skinWeight.y ).mul( skinVertex ),
		boneMatZ.mul( skinWeight.z ).mul( skinVertex ),
		boneMatW.mul( skinWeight.w ).mul( skinVertex )
	);

	return bindMatrixInverse.mul( skinned ).xyz;

}

/**
 * Computes the skinned normal and tangent vectors by applying bone matrices based on weights.
 *
 * @param {Node} boneMatrices - The bone matrices buffer or storage node.
 * @param {Node<vec3>} normal - The normal vector in local space.
 * @param {Node<vec3>} tangent - The tangent vector in local space.
 * @param {Node<mat4>} bindMatrix - The bind matrix node.
 * @param {Node<mat4>} bindMatrixInverse - The inverse bind matrix node.
 * @param {Node<uvec4>} skinIndex - The skin index attribute.
 * @param {Node<vec4>} skinWeight - The skin weight attribute.
 * @returns {{skinNormal: Node<vec3>, skinTangent: Node<vec3>}} The skinned normal and tangent.
 */
function getSkinnedNormalAndTangent( boneMatrices, normal, tangent, bindMatrix, bindMatrixInverse, skinIndex, skinWeight ) {

	const boneMatX = boneMatrices.element( skinIndex.x );
	const boneMatY = boneMatrices.element( skinIndex.y );
	const boneMatZ = boneMatrices.element( skinIndex.z );
	const boneMatW = boneMatrices.element( skinIndex.w );

	// NORMAL and TANGENT

	let skinMatrix = add(
		skinWeight.x.mul( boneMatX ),
		skinWeight.y.mul( boneMatY ),
		skinWeight.z.mul( boneMatZ ),
		skinWeight.w.mul( boneMatW )
	);

	skinMatrix = bindMatrixInverse.mul( skinMatrix ).mul( bindMatrix );

	const skinMatrix3 = mat3( skinMatrix );

	const skinNormal = skinMatrix3.mul( normal );
	const skinTangent = skinMatrix3.mul( tangent );

	return { skinNormal, skinTangent };

}

/**
 * Creates the bone data of the previous frame if they do not exist yet.
 *
 * @param {Skeleton} skeleton - The skeleton.
 */
function setupPreviousBoneData( skeleton ) {

	if ( skeleton.previousBoneMatrices === null ) {

		skeleton.update();

		skeleton.previousBoneMatrices = new Float32Array( skeleton.boneMatrices );

	}

	if ( skeleton.previousBoneTexture === null && skeleton.boneTexture !== null ) {

		const { width, height } = skeleton.boneTexture.image;

		skeleton.previousBoneTexture = new DataTexture( skeleton.previousBoneMatrices, width, height, RGBAFormat, FloatType );
		skeleton.previousBoneTexture.needsUpdate = true;

	}

}

/**
 * Creates the bone matrices node of the previous frame.
 *
 * @param {NodeBuilder} builder - The current node builder.
 * @param {Skeleton} skeleton - The skeleton.
 * @returns {Object} The previous bone matrices node.
 */
function getPreviousBoneMatricesNode( builder, skeleton ) {

	let node;

	setupPreviousBoneData( skeleton );

	const uniformBufferSize = skeleton.bones.length * 16 * 4;

	if ( uniformBufferSize <= builder.getUniformBufferLimit() ) {

		node = referenceBuffer( 'skeleton.previousBoneMatrices', 'mat4', skeleton.bones.length );

	} else {

		const previousBoneTexture = texture( skeleton.previousBoneTexture );

		OnObjectUpdate( ( { object } ) => {

			previousBoneTexture.value = object.skeleton.previousBoneTexture;

		} );

		node = getBoneTextureMatrices( previousBoneTexture );

	}

	return node;

}

/**
 * TSL function representing the standard skeletal animation vertex shader setup.
 * Transforms positionLocal, normalLocal, and tangentLocal in-place.
 *
 * @tsl
 * @function
 * @param {SkinnedMesh} skinnedMesh - The skinned mesh.
 */
export const skinning = /*@__PURE__*/ Fn( ( [ skinnedMesh ], builder ) => {

	const skinIndexNode = attribute( 'skinIndex', 'uvec4' );
	const skinWeightNode = attribute( 'skinWeight', 'vec4' );
	const bindMatrixNode = reference( 'bindMatrix', 'mat4' );
	const bindMatrixInverseNode = reference( 'bindMatrixInverse', 'mat4' );
	const boneMatricesNode = getBoneMatricesNode( builder, skinnedMesh.skeleton );
	const needsPreviousData = builder.needsPreviousData();

	OnObjectUpdate( ( { object, frameId } ) => {

		const skeleton = object.skeleton;

		if ( needsPreviousData ) setupPreviousBoneData( skeleton );

		if ( _skeletonsUpdated.get( skeleton ) !== frameId ) {

			_skeletonsUpdated.set( skeleton, frameId );

			if ( skeleton.previousBoneMatrices !== null ) {

				skeleton.previousBoneMatrices.set( skeleton.boneMatrices );

				if ( skeleton.previousBoneTexture !== null ) {

					skeleton.previousBoneTexture.needsUpdate = true;

				}

			}

			skeleton.update();

		}

	} );

	if ( needsPreviousData ) {

		const previousBoneMatricesNode = getPreviousBoneMatricesNode( builder, skinnedMesh.skeleton );
		const previousSkinnedPosition = getSkinnedPosition( previousBoneMatricesNode, positionPrevious, bindMatrixNode, bindMatrixInverseNode, skinIndexNode, skinWeightNode );

		positionPrevious.assign( previousSkinnedPosition );

	}

	const skinPosition = getSkinnedPosition( boneMatricesNode, positionLocal, bindMatrixNode, bindMatrixInverseNode, skinIndexNode, skinWeightNode );
	positionLocal.assign( skinPosition );

	if ( builder.hasGeometryAttribute( 'normal' ) ) {

		const { skinNormal, skinTangent } = getSkinnedNormalAndTangent( boneMatricesNode, normalLocal, tangentLocal, bindMatrixNode, bindMatrixInverseNode, skinIndexNode, skinWeightNode );

		normalLocal.assign( skinNormal );

		if ( builder.hasGeometryAttribute( 'tangent' ) ) {

			tangentLocal.assign( skinTangent );

		}

	}

}, 'void' );

/**
 * TSL function that computes skeletal animation for custom compute passes.
 *
 * @tsl
 * @function
 * @param {SkinnedMesh} skinnedMesh - The skinned mesh.
 * @param {Node<vec3>} [toPosition=null] - The target position node to assign.
 * @returns {Node<vec3>} The computed skinned position node.
 */
export const computeSkinning = /*@__PURE__*/ Fn( ( [ skinnedMesh, toPosition = null ], builder ) => {

	const positionNode = storage( new InstancedBufferAttribute( skinnedMesh.geometry.getAttribute( 'position' ).array, 3 ), 'vec3' ).setPBO( true ).toReadOnly().element( instanceIndex ).toVar();
	const skinIndexNode = storage( new InstancedBufferAttribute( new Uint32Array( skinnedMesh.geometry.getAttribute( 'skinIndex' ).array ), 4 ), 'uvec4' ).setPBO( true ).toReadOnly().element( instanceIndex ).toVar();
	const skinWeightNode = storage( new InstancedBufferAttribute( skinnedMesh.geometry.getAttribute( 'skinWeight' ).array, 4 ), 'vec4' ).setPBO( true ).toReadOnly().element( instanceIndex ).toVar();
	const bindMatrixNode = uniform( skinnedMesh.bindMatrix, 'mat4' );
	const bindMatrixInverseNode = uniform( skinnedMesh.bindMatrixInverse, 'mat4' );
	const boneMatricesNode = buffer( skinnedMesh.skeleton.boneMatrices, 'mat4', skinnedMesh.skeleton.bones.length );

	const skeleton = skinnedMesh.skeleton;

	OnObjectUpdate( ( { frameId } ) => {

		if ( _skeletonsUpdated.get( skeleton ) !== frameId ) {

			_skeletonsUpdated.set( skeleton, frameId );

			if ( skeleton.previousBoneMatrices !== null ) {

				skeleton.previousBoneMatrices.set( skeleton.boneMatrices );

				if ( skeleton.previousBoneTexture !== null ) {

					skeleton.previousBoneTexture.needsUpdate = true;

				}

			}

			skeleton.update();

		}

	} );

	if ( builder.needsPreviousData() ) {

		setupPreviousBoneData( skeleton );

		const previousBoneMatricesNode = buffer( skeleton.previousBoneMatrices, 'mat4', skeleton.bones.length );
		const previousSkinnedPosition = getSkinnedPosition( previousBoneMatricesNode, positionPrevious, bindMatrixNode, bindMatrixInverseNode, skinIndexNode, skinWeightNode );

		positionPrevious.assign( previousSkinnedPosition );

	}

	const skinPosition = getSkinnedPosition( boneMatricesNode, positionNode, bindMatrixNode, bindMatrixInverseNode, skinIndexNode, skinWeightNode );

	if ( toPosition !== null ) {

		toPosition.assign( skinPosition );

	}

	if ( builder.hasGeometryAttribute( 'normal' ) ) {

		const { skinNormal, skinTangent } = getSkinnedNormalAndTangent( boneMatricesNode, normalLocal, tangentLocal, bindMatrixNode, bindMatrixInverseNode, skinIndexNode, skinWeightNode );

		normalLocal.assign( skinNormal );

		if ( builder.hasGeometryAttribute( 'tangent' ) ) {

			tangentLocal.assign( skinTangent );

		}

	}

	return skinPosition;

} );


