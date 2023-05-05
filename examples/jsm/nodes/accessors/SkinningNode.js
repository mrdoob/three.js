import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { ShaderNode, nodeProxy } from '../shadernode/ShaderNode.js';
import { attribute } from '../core/AttributeNode.js';
import { uniform } from '../core/UniformNode.js';
import { add } from '../math/OperatorNode.js';
import { buffer } from './BufferNode.js';
import { normalLocal } from './NormalNode.js';
import { positionLocal } from './PositionNode.js';
import { tangentLocal } from './TangentNode.js';

const Skinning = new ShaderNode( ( inputs, {}, builder ) => {

	const { index, weight, bindMatrix, bindMatrixInverse, boneMatrices } = inputs;

	const boneMatX = boneMatrices.element( index.x );
	const boneMatY = boneMatrices.element( index.y );
	const boneMatZ = boneMatrices.element( index.z );
	const boneMatW = boneMatrices.element( index.w );

	// POSITION

	const skinVertex = bindMatrix.mul( positionLocal );

	const skinned = add(
		boneMatX.mul( weight.x ).mul( skinVertex ),
		boneMatY.mul( weight.y ).mul( skinVertex ),
		boneMatZ.mul( weight.z ).mul( skinVertex ),
		boneMatW.mul( weight.w ).mul( skinVertex )
	);

	const skinPosition = bindMatrixInverse.mul( skinned ).xyz;

	// NORMAL

	let skinMatrix = add(
		weight.x.mul( boneMatX ),
		weight.y.mul( boneMatY ),
		weight.z.mul( boneMatZ ),
		weight.w.mul( boneMatW )
	);

	skinMatrix = bindMatrixInverse.mul( skinMatrix ).mul( bindMatrix );

	const skinNormal = skinMatrix.transformDirection( normalLocal ).xyz;

	// ASSIGNS

	positionLocal.assign( skinPosition ).build( builder ); // @TODO: For some reason this doesn't work as stack.assign( positionLocal, skinPosition )?
	normalLocal.assign( skinNormal ).build( builder );

	if ( builder.hasGeometryAttribute( 'tangent' ) ) {

		tangentLocal.assign( skinNormal ).build( builder );

	}

} );

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

	generate( builder ) {

		/*return new ShaderNode( ( {}, stack, builder ) => Skinning.call( {
			index: this.skinIndexNode,
			weight: this.skinWeightNode,
			bindMatrix: this.bindMatrixNode,
			bindMatrixInverse: this.bindMatrixInverseNode,
			boneMatrices: this.boneMatricesNode
		}, stack, builder ) ).build( builder );*/
		Skinning.call( {
			index: this.skinIndexNode,
			weight: this.skinWeightNode,
			bindMatrix: this.bindMatrixNode,
			bindMatrixInverse: this.bindMatrixInverseNode,
			boneMatrices: this.boneMatricesNode
		}, {}, builder );

	}

	update() {

		this.skinnedMesh.skeleton.update();

	}

}

export default SkinningNode;

export const skinning = nodeProxy( SkinningNode );

addNodeClass( SkinningNode );
