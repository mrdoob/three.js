import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { attribute } from '../core/AttributeNode.js';
import { uniform } from '../core/UniformNode.js';
import { add } from '../math/OperatorNode.js';
import { buffer } from './BufferNode.js';
import { normalLocal } from './NormalNode.js';
import { positionLocal } from './PositionNode.js';
import { tangentLocal } from './TangentNode.js';

class SkinningNode extends Node {

	constructor( skinnedMesh ) {

		super( 'void' );

		this.skinnedMesh = skinnedMesh;

		this.updateType = NodeUpdateType.OBJECT;

		//

		this.skinIndexNode = attribute( 'skinIndex', 'uvec4' );
		this.skinWeightNode = attribute( 'skinWeight', 'vec4' );

		this.bindMatrixNode = uniform( skinnedMesh.bindMatrix, 'mat4' );
		this.bindMatrixInverseNode = uniform( skinnedMesh.bindMatrixInverse, 'mat4' );
		this.boneMatricesNode = buffer( skinnedMesh.skeleton.boneMatrices, 'mat4', skinnedMesh.skeleton.bones.length );

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

		builder.stack.assign( positionLocal, skinPosition );
		builder.stack.assign( normalLocal, skinNormal );

		if ( builder.hasGeometryAttribute( 'tangent' ) ) {

			builder.stack.assign( tangentLocal, skinNormal );

		}

	}

	update() {

		this.skinnedMesh.skeleton.update();

	}

}

export default SkinningNode;

export const skinning = nodeProxy( SkinningNode );

addNodeClass( 'SkinningNode', SkinningNode );
