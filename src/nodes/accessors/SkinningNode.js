import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeObject } from '../tsl/TSLBase.js';
import { attribute } from '../core/AttributeNode.js';
import { reference, referenceBuffer } from './ReferenceNode.js';
import { add } from '../math/OperatorNode.js';
import { normalLocal } from './Normal.js';
import { positionLocal, positionPrevious } from './Position.js';
import { tangentLocal } from './Tangent.js';
import { uniform } from '../core/UniformNode.js';
import { buffer } from './BufferNode.js';
import { storage } from './StorageBufferNode.js';
import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';
import { instanceIndex } from '../core/IndexNode.js';

const _frameId = new WeakMap();

/**
 * This node implements the vertex transformation shader logic which is required
 * for skinning/skeletal animation.
 *
 * @augments Node
 */
class SkinningNode extends Node {

	static get type() {

		return 'SkinningNode';

	}

	/**
	 * Constructs a new skinning node.
	 *
	 * @param {SkinnedMesh} skinnedMesh - The skinned mesh.
	 */
	constructor( skinnedMesh ) {

		super( 'void' );

		/**
		 * The skinned mesh.
		 *
		 * @type {SkinnedMesh}
		 */
		this.skinnedMesh = skinnedMesh;

		/**
		 * The update type overwritten since skinning nodes are updated per object.
		 *
		 * @type {string}
		 */
		this.updateType = NodeUpdateType.OBJECT;

		//

		/**
		 * The skin index attribute.
		 *
		 * @type {AttributeNode}
		 */
		this.skinIndexNode = attribute( 'skinIndex', 'uvec4' );

		/**
		 * The skin weight attribute.
		 *
		 * @type {AttributeNode}
		 */
		this.skinWeightNode = attribute( 'skinWeight', 'vec4' );

		/**
		 * The bind matrix node.
		 *
		 * @type {Node<mat4>}
		 */
		this.bindMatrixNode = reference( 'bindMatrix', 'mat4' );

		/**
		 * The bind matrix inverse node.
		 *
		 * @type {Node<mat4>}
		 */
		this.bindMatrixInverseNode = reference( 'bindMatrixInverse', 'mat4' );

		/**
		 * The bind matrices as a uniform buffer node.
		 *
		 * @type {Node}
		 */
		this.boneMatricesNode = referenceBuffer( 'skeleton.boneMatrices', 'mat4', skinnedMesh.skeleton.bones.length );

		/**
		 * The current vertex position in local space.
		 *
		 * @type {Node<vec3>}
		 */
		this.positionNode = positionLocal;

		/**
		 * The result of vertex position in local space.
		 *
		 * @type {Node<vec3>}
		 */
		this.toPositionNode = positionLocal;

		/**
		 * The previous bind matrices as a uniform buffer node.
		 * Required for computing motion vectors.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.previousBoneMatricesNode = null;

	}

	/**
	 * Transforms the given vertex position via skinning.
	 *
	 * @param {Node} [boneMatrices=this.boneMatricesNode] - The bone matrices
	 * @param {Node<vec3>} [position=this.positionNode] - The vertex position in local space.
	 * @return {Node<vec3>} The transformed vertex position.
	 */
	getSkinnedPosition( boneMatrices = this.boneMatricesNode, position = this.positionNode ) {

		const { skinIndexNode, skinWeightNode, bindMatrixNode, bindMatrixInverseNode } = this;

		const boneMatX = boneMatrices.element( skinIndexNode.x );
		const boneMatY = boneMatrices.element( skinIndexNode.y );
		const boneMatZ = boneMatrices.element( skinIndexNode.z );
		const boneMatW = boneMatrices.element( skinIndexNode.w );

		// POSITION

		const skinVertex = bindMatrixNode.mul( position );

		const skinned = add(
			boneMatX.mul( skinWeightNode.x ).mul( skinVertex ),
			boneMatY.mul( skinWeightNode.y ).mul( skinVertex ),
			boneMatZ.mul( skinWeightNode.z ).mul( skinVertex ),
			boneMatW.mul( skinWeightNode.w ).mul( skinVertex )
		);

		return bindMatrixInverseNode.mul( skinned ).xyz;

	}

	/**
	 * Transforms the given vertex normal and tangent via skinning.
	 *
	 * @param {Node} [boneMatrices=this.boneMatricesNode] - The bone matrices
	 * @param {Node<vec3>} [normal=normalLocal] - The vertex normal in local space.
	 * @param {Node<vec3>} [tangent=tangentLocal] - The vertex tangent in local space.
	 * @return {{skinNormal: Node<vec3>, skinTangent:Node<vec3>}} The transformed vertex normal and tangent.
	 */
	getSkinnedNormalAndTangent( boneMatrices = this.boneMatricesNode, normal = normalLocal, tangent = tangentLocal ) {

		const { skinIndexNode, skinWeightNode, bindMatrixNode, bindMatrixInverseNode } = this;

		const boneMatX = boneMatrices.element( skinIndexNode.x );
		const boneMatY = boneMatrices.element( skinIndexNode.y );
		const boneMatZ = boneMatrices.element( skinIndexNode.z );
		const boneMatW = boneMatrices.element( skinIndexNode.w );

		// NORMAL and TANGENT

		let skinMatrix = add(
			skinWeightNode.x.mul( boneMatX ),
			skinWeightNode.y.mul( boneMatY ),
			skinWeightNode.z.mul( boneMatZ ),
			skinWeightNode.w.mul( boneMatW )
		);

		skinMatrix = bindMatrixInverseNode.mul( skinMatrix ).mul( bindMatrixNode );

		const skinNormal = skinMatrix.transformDirection( normal ).xyz;
		const skinTangent = skinMatrix.transformDirection( tangent ).xyz;

		return { skinNormal, skinTangent };

	}

	/**
	 * Computes the transformed/skinned vertex position of the previous frame.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec3>} The skinned position from the previous frame.
	 */
	getPreviousSkinnedPosition( builder ) {

		const skinnedMesh = builder.object;

		if ( this.previousBoneMatricesNode === null ) {

			skinnedMesh.skeleton.previousBoneMatrices = new Float32Array( skinnedMesh.skeleton.boneMatrices );

			this.previousBoneMatricesNode = referenceBuffer( 'skeleton.previousBoneMatrices', 'mat4', skinnedMesh.skeleton.bones.length );

		}

		return this.getSkinnedPosition( this.previousBoneMatricesNode, positionPrevious );

	}

	/**
	 * Setups the skinning node by assigning the transformed vertex data to predefined node variables.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec3>} The transformed vertex position.
	 */
	setup( builder ) {

		if ( builder.needsPreviousData() ) {

			positionPrevious.assign( this.getPreviousSkinnedPosition( builder ) );

		}

		const skinPosition = this.getSkinnedPosition();

		if ( this.toPositionNode ) this.toPositionNode.assign( skinPosition );

		//

		if ( builder.hasGeometryAttribute( 'normal' ) ) {

			const { skinNormal, skinTangent } = this.getSkinnedNormalAndTangent();

			normalLocal.assign( skinNormal );

			if ( builder.hasGeometryAttribute( 'tangent' ) ) {

				tangentLocal.assign( skinTangent );

			}

		}

		return skinPosition;

	}

	/**
	 * Generates the code snippet of the skinning node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} output - The current output.
	 * @return {string} The generated code snippet.
	 */
	generate( builder, output ) {

		if ( output !== 'void' ) {

			return super.generate( builder, output );

		}

	}

	/**
	 * Updates the state of the skinned mesh by updating the skeleton once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	update( frame ) {

		const skeleton = frame.object && frame.object.skeleton ? frame.object.skeleton : this.skinnedMesh.skeleton;

		if ( _frameId.get( skeleton ) === frame.frameId ) return;

		_frameId.set( skeleton, frame.frameId );

		if ( this.previousBoneMatricesNode !== null ) {

			if ( skeleton.previousBoneMatrices === null ) {

				// cloned skeletons miss "previousBoneMatrices" in their first updated

				skeleton.previousBoneMatrices = new Float32Array( skeleton.boneMatrices );

			}

			skeleton.previousBoneMatrices.set( skeleton.boneMatrices );


		}

		skeleton.update();

	}

}

export default SkinningNode;

/**
 * TSL function for creating a skinning node.
 *
 * @tsl
 * @function
 * @param {SkinnedMesh} skinnedMesh - The skinned mesh.
 * @returns {SkinningNode}
 */
export const skinning = ( skinnedMesh ) => new SkinningNode( skinnedMesh );

/**
 * TSL function for computing skinning.
 *
 * @tsl
 * @function
 * @param {SkinnedMesh} skinnedMesh - The skinned mesh.
 * @param {Node<vec3>} [toPosition=null] - The target position.
 * @returns {SkinningNode}
 */
export const computeSkinning = ( skinnedMesh, toPosition = null ) => {

	const node = new SkinningNode( skinnedMesh );
	node.positionNode = storage( new InstancedBufferAttribute( skinnedMesh.geometry.getAttribute( 'position' ).array, 3 ), 'vec3' ).setPBO( true ).toReadOnly().element( instanceIndex ).toVar();
	node.skinIndexNode = storage( new InstancedBufferAttribute( new Uint32Array( skinnedMesh.geometry.getAttribute( 'skinIndex' ).array ), 4 ), 'uvec4' ).setPBO( true ).toReadOnly().element( instanceIndex ).toVar();
	node.skinWeightNode = storage( new InstancedBufferAttribute( skinnedMesh.geometry.getAttribute( 'skinWeight' ).array, 4 ), 'vec4' ).setPBO( true ).toReadOnly().element( instanceIndex ).toVar();
	node.bindMatrixNode = uniform( skinnedMesh.bindMatrix, 'mat4' );
	node.bindMatrixInverseNode = uniform( skinnedMesh.bindMatrixInverse, 'mat4' );
	node.boneMatricesNode = buffer( skinnedMesh.skeleton.boneMatrices, 'mat4', skinnedMesh.skeleton.bones.length );
	node.toPositionNode = toPosition;

	return nodeObject( node );

};
