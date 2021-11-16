import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import PositionNode from '../accessors/PositionNode.js';
import NormalNode from '../accessors/NormalNode.js';
import Matrix4Node from '../inputs/Matrix4Node.js';
import BufferNode from '../inputs/BufferNode.js';

import { ShaderNode, assign, element, add, mul, transformDirection } from '../ShaderNode.js';

import { NodeUpdateType } from '../core/constants.js';

const Skinning = new ShaderNode( ( inputs, builder ) => {

	const { position, normal, index, weight, bindMatrix, bindMatrixInverse, boneMatrices } = inputs;

	const boneMatX = element( boneMatrices, index.x );
	const boneMatY = element( boneMatrices, index.y );
	const boneMatZ = element( boneMatrices, index.z );
	const boneMatW = element( boneMatrices, index.w );

	// POSITION

	const skinVertex = mul( bindMatrix, position );

	const skinned = add(
		mul( mul( boneMatX, skinVertex ), weight.x ),
		mul( mul( boneMatY, skinVertex ), weight.y ),
		mul( mul( boneMatZ, skinVertex ), weight.z ),
		mul( mul( boneMatW, skinVertex ), weight.w )
	);

	const skinPosition = mul( bindMatrixInverse, skinned ).xyz;

	// NORMAL

	let skinMatrix = add(
		mul( weight.x, boneMatX ),
		mul( weight.y, boneMatY ),
		mul( weight.z, boneMatZ ),
		mul( weight.w, boneMatW )
	);

	skinMatrix = mul( mul( bindMatrixInverse, skinMatrix ), bindMatrix );

	const skinNormal = transformDirection( skinMatrix, normal ).xyz;

	// ASSIGNS

	assign( position, skinPosition ).build( builder );
	assign( normal, skinNormal ).build( builder );

} );

class SkinningNode extends Node {

	constructor( skinnedMesh ) {

		super( 'void' );

		this.skinnedMesh = skinnedMesh;

		this.updateType = NodeUpdateType.Object;

		//

		this.skinIndexNode = new AttributeNode( 'skinIndex', 'uvec4' );
		this.skinWeightNode = new AttributeNode( 'skinWeight', 'vec4' );

		this.bindMatrixNode = new Matrix4Node( skinnedMesh.bindMatrix );
		this.bindMatrixInverseNode = new Matrix4Node( skinnedMesh.bindMatrixInverse );
		this.boneMatricesNode = new BufferNode( skinnedMesh.skeleton.boneMatrices, 'mat4', skinnedMesh.skeleton.bones.length );

	}

	generate( builder ) {

		// inout nodes
		const position = new PositionNode( PositionNode.LOCAL );
		const normal = new NormalNode( NormalNode.LOCAL );

		const index = this.skinIndexNode;
		const weight = this.skinWeightNode;
		const bindMatrix = this.bindMatrixNode;
		const bindMatrixInverse = this.bindMatrixInverseNode;
		const boneMatrices = this.boneMatricesNode;

		Skinning( {
			position,
			normal,
			index,
			weight,
			bindMatrix,
			bindMatrixInverse,
			boneMatrices
		}, builder );

	}

	update() {

		this.skinnedMesh.skeleton.update();

	}

}

export default SkinningNode;
