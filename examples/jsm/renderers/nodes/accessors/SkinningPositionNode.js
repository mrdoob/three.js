import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import FloatNode from '../inputs/FloatNode.js';
import Matrix4Node from '../inputs/Matrix4Node.js';
import TextureNode from '../inputs/TextureNode.js';
import PositionNode from './PositionNode.js';

import { NodeUpdateType } from '../core/constants.js';
import { SkinningPosition } from '../functions/Common.js';

class SkinningPositionNode extends Node {

	constructor( skinnedMesh ) {

		super( 'vec3' );

		this.skinnedMesh = skinnedMesh;

		this.updateType = NodeUpdateType.Object;

		//

		this.bindMatrixNode = new Matrix4Node( skinnedMesh.bindMatrix );
		this.bindMatrixInverseNode = new Matrix4Node( skinnedMesh.bindMatrixInverse );
		this.boneTextureSizeNode = new FloatNode();
		this.boneTextureNode = new TextureNode();
		this.position = new PositionNode();

	}

	generate( builder, output ) {

		const type = this.getType( builder );
		const nodeData = builder.getDataFromNode( this, builder.shaderStage );

		let getSkinningCallNode = nodeData.getSkinningCallNode;

		if ( getSkinningCallNode === undefined ) {

			const skinIndexNode = new AttributeNode( 'skinIndex', 'uvec4' );
			const skinWeightNode = new AttributeNode( 'skinWeight', 'vec4' );

			getSkinningCallNode = SkinningPosition.call( {
				index: skinIndexNode,
				weight: skinWeightNode,
				position: this.position,
				bindMatrix: this.bindMatrixNode,
				bindMatrixInverse: this.bindMatrixInverseNode,
				boneTexture: this.boneTextureNode,
				boneSampler: this.boneTextureNode,
				boneTextureSize: this.boneTextureSizeNode
			} );

			nodeData.getSkinningCallNode = getSkinningCallNode;

		}

		const skinningSnipped = getSkinningCallNode.build( builder, type );

		return builder.format( skinningSnipped, type, output );

	}

	update() {

		const skeleton = this.skinnedMesh.skeleton;

		skeleton.update();

		if ( skeleton.boneTexture === null ) skeleton.computeBoneTexture();

		this.boneTextureSizeNode.value = skeleton.boneTextureSize;
		this.boneTextureNode.value = skeleton.boneTexture;

	}

}

export default SkinningPositionNode;
