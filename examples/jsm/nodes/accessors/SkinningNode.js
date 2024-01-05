import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { attribute } from '../core/AttributeNode.js';
import { uniform } from '../core/UniformNode.js';
import { buffer } from './BufferNode.js';
import { position, normal, tangent } from '../core/PropertyNode.js';

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

		const boneMatX = boneMatricesNode.element( skinIndexNode.x ).mul( skinWeightNode.x );
		const boneMatY = boneMatricesNode.element( skinIndexNode.y ).mul( skinWeightNode.y );
		const boneMatZ = boneMatricesNode.element( skinIndexNode.z ).mul( skinWeightNode.z );
		const boneMatW = boneMatricesNode.element( skinIndexNode.w ).mul( skinWeightNode.w );

		const skinMatrix = boneMatX.add( boneMatY, boneMatZ, boneMatW );

		const transformationMatrix = bindMatrixInverseNode.mul( skinMatrix ).mul( bindMatrixNode );

		position.assign( transformationMatrix.mul( position ) );

		normal.assign( transformationMatrix.transformDirection( normal ) );

		if ( builder.hasGeometryAttribute( 'tangent' ) ) {

			tangent.assign( normal );

		}

		builder.stack.outputNode = position;

	}

	update() {

		this.skinnedMesh.skeleton.update();

	}

}

export default SkinningNode;

export const skinning = nodeProxy( SkinningNode );

addNodeClass( 'SkinningNode', SkinningNode );
