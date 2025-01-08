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
import { getDataFromObject } from '../core/NodeUtils.js';

/** @module SkinningNode **/

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
	 * @param {Boolean} [useReference=false] - Whether to use reference nodes for internal skinned mesh related data or not.
	 */
	constructor( skinnedMesh, useReference = false ) {

		super( 'void' );

		/**
		 * The skinned mesh.
		 *
		 * @type {SkinnedMesh}
		 */
		this.skinnedMesh = skinnedMesh;

		/**
		 * Whether to use reference nodes for internal skinned mesh related data or not.
		 * TODO: Explain the purpose of the property.
		 *
		 * @type {Boolean}
		 */
		this.useReference = useReference;

		/**
		 * The update type overwritten since skinning nodes are updated per object.
		 *
		 * @type {String}
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

		let bindMatrixNode, bindMatrixInverseNode, boneMatricesNode;

		if ( useReference ) {

			bindMatrixNode = reference( 'bindMatrix', 'mat4' );
			bindMatrixInverseNode = reference( 'bindMatrixInverse', 'mat4' );
			boneMatricesNode = referenceBuffer( 'skeleton.boneMatrices', 'mat4', skinnedMesh.skeleton.bones.length );

		} else {

			bindMatrixNode = uniform( skinnedMesh.bindMatrix, 'mat4' );
			bindMatrixInverseNode = uniform( skinnedMesh.bindMatrixInverse, 'mat4' );
			boneMatricesNode = buffer( skinnedMesh.skeleton.boneMatrices, 'mat4', skinnedMesh.skeleton.bones.length );

		}

		/**
		 * The bind matrix node.
		 *
		 * @type {Node<mat4>}
		 */
		this.bindMatrixNode = bindMatrixNode;

		/**
		 * The bind matrix inverse node.
		 *
		 * @type {Node<mat4>}
		 */
		this.bindMatrixInverseNode = bindMatrixInverseNode;

		/**
		 * The bind matrices as a uniform buffer node.
		 *
		 * @type {Node}
		 */
		this.boneMatricesNode = boneMatricesNode;

		/**
		 * The previous bind matrices as a uniform buffer node.
		 * Required for computing motion vectors.
		 *
		 * @type {Node?}
		 * @default null
		 */
		this.previousBoneMatricesNode = null;

	}

	/**
	 * Transforms the given vertex position via skinning.
	 *
	 * @param {Node} [boneMatrices=this.boneMatricesNode] - The bone matrices
	 * @param {Node<vec3>} [position=positionLocal] - The vertex position in local space.
	 * @return {Node<vec3>} The transformed vertex position.
	 */
	getSkinnedPosition( boneMatrices = this.boneMatricesNode, position = positionLocal ) {

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
	 * Transforms the given vertex normal via skinning.
	 *
	 * @param {Node} [boneMatrices=this.boneMatricesNode] - The bone matrices
	 * @param {Node<vec3>} [normal=normalLocal] - The vertex normal in local space.
	 * @return {Node<vec3>} The transformed vertex normal.
	 */
	getSkinnedNormal( boneMatrices = this.boneMatricesNode, normal = normalLocal ) {

		const { skinIndexNode, skinWeightNode, bindMatrixNode, bindMatrixInverseNode } = this;

		const boneMatX = boneMatrices.element( skinIndexNode.x );
		const boneMatY = boneMatrices.element( skinIndexNode.y );
		const boneMatZ = boneMatrices.element( skinIndexNode.z );
		const boneMatW = boneMatrices.element( skinIndexNode.w );

		// NORMAL

		let skinMatrix = add(
			skinWeightNode.x.mul( boneMatX ),
			skinWeightNode.y.mul( boneMatY ),
			skinWeightNode.z.mul( boneMatZ ),
			skinWeightNode.w.mul( boneMatW )
		);

		skinMatrix = bindMatrixInverseNode.mul( skinMatrix ).mul( bindMatrixNode );

		return skinMatrix.transformDirection( normal ).xyz;

	}

	/**
	 * Transforms the given vertex normal via skinning.
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
	 * Returns `true` if bone matrices from the previous frame are required.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Boolean} Whether bone matrices from the previous frame are required or not.
	 */
	needsPreviousBoneMatrices( builder ) {

		const mrt = builder.renderer.getMRT();

		return ( mrt && mrt.has( 'velocity' ) ) || getDataFromObject( builder.object ).useVelocity === true;

	}

	/**
	 * Setups the skinning node by assigning the transformed vertex data to predefined node variables.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		if ( this.needsPreviousBoneMatrices( builder ) ) {

			positionPrevious.assign( this.getPreviousSkinnedPosition( builder ) );

		}

		const skinPosition = this.getSkinnedPosition();


		positionLocal.assign( skinPosition );

		if ( builder.hasGeometryAttribute( 'normal' ) ) {

			const skinNormal = this.getSkinnedNormal();

			normalLocal.assign( skinNormal );

			if ( builder.hasGeometryAttribute( 'tangent' ) ) {

				tangentLocal.assign( skinNormal );

			}

		}

	}

	/**
	 * Generates the code snippet of the skinning node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {String} output - The current output.
	 * @return {String} The generated code snippet.
	 */
	generate( builder, output ) {

		if ( output !== 'void' ) {

			return positionLocal.build( builder, output );

		}

	}

	/**
	 * Updates the state of the skinned mesh by updating the skeleton once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	update( frame ) {

		const object = this.useReference ? frame.object : this.skinnedMesh;
		const skeleton = object.skeleton;

		if ( _frameId.get( skeleton ) === frame.frameId ) return;

		_frameId.set( skeleton, frame.frameId );

		if ( this.previousBoneMatricesNode !== null ) skeleton.previousBoneMatrices.set( skeleton.boneMatrices );

		skeleton.update();

	}

}

export default SkinningNode;

/**
 * TSL function for creating a skinning node.
 *
 * @function
 * @param {SkinnedMesh} skinnedMesh - The skinned mesh.
 * @returns {SkinningNode}
 */
export const skinning = ( skinnedMesh ) => nodeObject( new SkinningNode( skinnedMesh ) );

/**
 * TSL function for creating a skinning node with reference usage.
 *
 * @function
 * @param {SkinnedMesh} skinnedMesh - The skinned mesh.
 * @returns {SkinningNode}
 */
export const skinningReference = ( skinnedMesh ) => nodeObject( new SkinningNode( skinnedMesh, true ) );
