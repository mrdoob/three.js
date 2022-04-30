import Node from '../core/Node.js';
import {
	ShaderNode,
	attribute,
	buffer,
	mat4,
	uniform,
	positionLocal,
	normalLocal,
	assign,
	element,
	add,
	mul,
	transformDirection
} from '../shadernode/ShaderNodeBaseElements.js';

import { NodeUpdateType } from '../core/constants.js';

const Skinning = new ShaderNode( ( inputs, builder ) => {

	const { index, weight, bindMatrix, bindMatrixInverse, boneMatrices } = inputs;

	const boneMatX = element( boneMatrices, index.x );
	const boneMatY = element( boneMatrices, index.y );
	const boneMatZ = element( boneMatrices, index.z );
	const boneMatW = element( boneMatrices, index.w );

	// POSITION

	const skinVertex = mul( bindMatrix, positionLocal );

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

	const skinNormal = transformDirection( skinMatrix, normalLocal ).xyz;

	// ASSIGNS

	assign( positionLocal, skinPosition ).build( builder );
	assign( normalLocal, skinNormal ).build( builder );

} );

class SkinningNode extends Node {

	constructor( skinnedMesh ) {

		super( 'void' );

		this.skinnedMesh = skinnedMesh;

		this.updateType = NodeUpdateType.Object;

		//

		this.skinIndexNode = attribute( 'skinIndex', 'uvec4' );
		this.skinWeightNode = attribute( 'skinWeight', 'vec4' );

		this.bindMatrixNode = uniform( mat4( skinnedMesh.bindMatrix ) );
		this.bindMatrixInverseNode = uniform( mat4( skinnedMesh.bindMatrixInverse ) );
		this.boneMatricesNode = buffer( skinnedMesh.skeleton.boneMatrices, 'mat4', skinnedMesh.skeleton.bones.length );

	}

	generate( builder ) {

		Skinning.call( {
			index: this.skinIndexNode,
			weight: this.skinWeightNode,
			bindMatrix: this.bindMatrixNode,
			bindMatrixInverse: this.bindMatrixInverseNode,
			boneMatrices: this.boneMatricesNode
		}, builder );

	}

	update() {

		this.skinnedMesh.skeleton.update();

	}

}

export default SkinningNode;
