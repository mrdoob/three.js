import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { attribute } from '../core/AttributeNode.js';
import { reference, referenceBuffer } from './ReferenceNode.js';
import { add } from '../math/OperatorNode.js';
import { normalLocal } from './NormalNode.js';
import { positionLocal } from './PositionNode.js';
import { tangentLocal } from './TangentNode.js';
import { uniform } from '../core/UniformNode.js';
import { buffer } from './BufferNode.js';

class SkinningNode extends Node {

	constructor( skinnedMesh, useReference = false ) {

		super( 'void' );

		this.skinnedMesh = skinnedMesh;
		this.useReference = useReference;

		this.updateType = NodeUpdateType.OBJECT;

		//

		this.skinIndexNode = attribute( 'skinIndex', 'uvec4' );
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

		this.bindMatrixNode = bindMatrixNode;
		this.bindMatrixInverseNode = bindMatrixInverseNode;
		this.boneMatricesNode = boneMatricesNode;

	}

	setup( builder ) {

		const { skinIndexNode, skinWeightNode, bindMatrixNode, bindMatrixInverseNode, boneMatricesNode } = this;

		const boneMatX = boneMatricesNode.element( skinIndexNode.x );
		const boneMatY = boneMatricesNode.element( skinIndexNode.y );
		const boneMatZ = boneMatricesNode.element( skinIndexNode.z );
		const boneMatW = boneMatricesNode.element( skinIndexNode.w );

		// POSITION

		const skinVertex = bindMatrixNode.mul( positionLocal );

		const skinned = add(
			boneMatX.mul( skinWeightNode.x ).mul( skinVertex ),
			boneMatY.mul( skinWeightNode.y ).mul( skinVertex ),
			boneMatZ.mul( skinWeightNode.z ).mul( skinVertex ),
			boneMatW.mul( skinWeightNode.w ).mul( skinVertex )
		);

		const skinPosition = bindMatrixInverseNode.mul( skinned ).xyz;

		// NORMAL

		let skinMatrix = add(
			skinWeightNode.x.mul( boneMatX ),
			skinWeightNode.y.mul( boneMatY ),
			skinWeightNode.z.mul( boneMatZ ),
			skinWeightNode.w.mul( boneMatW )
		);

		skinMatrix = bindMatrixInverseNode.mul( skinMatrix ).mul( bindMatrixNode );

		const skinNormal = skinMatrix.transformDirection( normalLocal ).xyz;

		// ASSIGNS

		positionLocal.assign( skinPosition );
		normalLocal.assign( skinNormal );

		if ( builder.hasGeometryAttribute( 'tangent' ) ) {

			tangentLocal.assign( skinNormal );

		}

	}

	generate( builder, output ) {

		if ( output !== 'void' ) {

			return positionLocal.build( builder, output );

		}

	}

	update( frame ) {

		const object = this.useReference ? frame.object : this.skinnedMesh;

		object.skeleton.update();

	}

}

export default SkinningNode;

export const skinning = ( skinnedMesh ) => nodeObject( new SkinningNode( skinnedMesh ) );
export const skinningReference = ( skinnedMesh ) => nodeObject( new SkinningNode( skinnedMesh, true ) );

addNodeClass( 'SkinningNode', SkinningNode );
