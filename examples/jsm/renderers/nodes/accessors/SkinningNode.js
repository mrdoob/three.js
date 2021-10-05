import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import ConstNode from '../core/ConstNode.js';
import PositionNode from '../accessors/PositionNode.js';
import NormalNode from '../accessors/NormalNode.js';
import FunctionNode from '../core/FunctionNode.js';
import Matrix4Node from '../inputs/Matrix4Node.js';
import BufferNode from '../inputs/BufferNode.js';

import { NodeUpdateType } from '../core/constants.js';

const Skinning = new FunctionNode( `
	void ( inout vec3 position, inout vec3 normal, const in vec4 index, const in vec4 weight, const in mat4 bindMatrix, const in mat4 bindMatrixInverse ) {

		mat4 boneMatX = BoneMatrices[ int( index.x ) ];
		mat4 boneMatY = BoneMatrices[ int( index.y ) ];
		mat4 boneMatZ = BoneMatrices[ int( index.z ) ];
		mat4 boneMatW = BoneMatrices[ int( index.w ) ];

		// POSITION

		vec4 skinVertex = bindMatrix * vec4( position, 1.0 );

		vec4 skinned = vec4( 0.0 );
		skinned += boneMatX * skinVertex * weight.x;
		skinned += boneMatY * skinVertex * weight.y;
		skinned += boneMatZ * skinVertex * weight.z;
		skinned += boneMatW * skinVertex * weight.w;

		position = ( bindMatrixInverse * skinned ).xyz;

		// NORMAL

		mat4 skinMatrix = mat4( 0.0 );
		skinMatrix += skinWeight.x * boneMatX;
		skinMatrix += skinWeight.y * boneMatY;
		skinMatrix += skinWeight.z * boneMatZ;
		skinMatrix += skinWeight.w * boneMatW;
		skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;

		normal = vec4( skinMatrix * vec4( normal, 0.0 ) ).xyz;

	}`
);

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

		const keywords = builder.getContextValue( 'keywords' );

		keywords.addKeyword( 'BoneMatrices', () => {

			return new ConstNode( this.boneMatricesNode.build( builder ), 'mat4', 'BoneMatrices' );

		} );

		// inout nodes
		const position = new PositionNode( PositionNode.LOCAL );
		const normal = new NormalNode( NormalNode.LOCAL );

		const index = this.skinIndexNode;
		const weight = this.skinWeightNode;
		const bindMatrix = this.bindMatrixNode;
		const bindMatrixInverse = this.bindMatrixInverseNode;

		return Skinning.call( {
			position,
			normal,
			index,
			weight,
			bindMatrix,
			bindMatrixInverse
		} ).build( builder );

	}

	update() {

		this.skinnedMesh.skeleton.update();

	}

}

export default SkinningNode;
