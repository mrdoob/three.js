import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

class SubgroupFunctionNode extends TempNode {

	static get type() {

		return 'SubgroupFunctionNode';

	}

	constructor( method, aNode = null, bNode = null ) {

		super();

		this.method = method;

		this.aNode = aNode;
		this.bNode = bNode;

	}

	getInputType( builder ) {

		const aType = this.aNode ? this.aNode.getNodeType( builder ) : null;
		const bType = this.bNode ? this.bNode.getNodeType( builder ) : null;

		const aLen = builder.isMatrix( aType ) ? 0 : builder.getTypeLength( aType );
		const bLen = builder.isMatrix( bType ) ? 0 : builder.getTypeLength( bType );

		if ( aLen > bLen ) {

			return aType;

		} else {

			return bType;

		}

	}

	getNodeType( builder ) {

		const method = this.method;

		if ( method === SubgroupFunctionNode.SUBGROUP_ELECT ) {

			return 'bool';

		} else if ( method === SubgroupFunctionNode.SUBGROUP_BALLOT ) {

			return 'uvec4';

		} else {

			return this.getInputType( builder );

		}

	}

	generate( builder, output ) {

		const method = this.method;

		const type = this.getNodeType( builder );
		const inputType = this.getInputType( builder );

		const a = this.aNode;
		const b = this.bNode;

		const params = [];

		if (
			method === SubgroupFunctionNode.SUBGROUP_BROADCAST ||
			method === SubgroupFunctionNode.SUBGROUP_SHUFFLE ||
			method === SubgroupFunctionNode.QUAD_BROADCAST
		) {

			const bType = b.getNodeType( builder );

			params.push(
				a.build( builder, type ),
				b.build( builder, bType === 'float' ? 'int' : type )
			);

		} else if (
			method === SubgroupFunctionNode.SUBGROUP_SHUFFLE_XOR ||
			method === SubgroupFunctionNode.SUBGROUP_SHUFFLE_DOWN ||
			method === SubgroupFunctionNode.SUBGROUP_SHUFFLE_UP
		) {

			params.push(
				a.build( builder, type ),
				b.build( builder, 'uint' )
			);

		} else {

			if ( a !== null ) params.push( a.build( builder, inputType ) );
			if ( b !== null ) params.push( b.build( builder, inputType ) );

		}

		console.log( builder.format( `${ builder.getMethod( method, type ) }( ${params.join( ', ' )} )`, type, output ) );

		return builder.format( `${ builder.getMethod( method, type ) }( ${params.join( ', ' )} )`, type, output );



	}

	serialize( data ) {

		super.serialize( data );

		data.method = this.method;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.method = data.method;

	}

}

// 0 inputs
SubgroupFunctionNode.SUBGROUP_ELECT = 'subgroupElect';

// 1 input
SubgroupFunctionNode.SUBGROUP_BALLOT = 'subgroupBallot';
SubgroupFunctionNode.SUBGROUP_ADD = 'subgroupAdd';
SubgroupFunctionNode.SUBGROUP_INCLUSIVE_ADD = 'subgroupInclusiveAdd';
SubgroupFunctionNode.SUBGROUP_EXCLUSIVE_AND = 'subgroupExclusiveAdd';
SubgroupFunctionNode.SUBGROUP_MUL = 'subgroupMul';
SubgroupFunctionNode.SUBGROUP_INCLUSIVE_MUL = 'subgroupInclusiveMul';
SubgroupFunctionNode.SUBGROUP_EXCLUSIVE_MUL = 'subgroupExclusiveMul';
SubgroupFunctionNode.SUBGROUP_AND = 'subgroupAnd';
SubgroupFunctionNode.SUBGROUP_OR = 'subgroupOr';
SubgroupFunctionNode.SUBGROUP_XOR = 'subgroupXor';
SubgroupFunctionNode.SUBGROUP_MIN = 'subgroupMin';
SubgroupFunctionNode.SUBGROUP_MAX = 'subgroupMax';
SubgroupFunctionNode.SUBGROUP_ALL = 'subgroupAll';
SubgroupFunctionNode.SUBGROUP_ANY = 'subgroupAny';
SubgroupFunctionNode.SUBGROUP_BROADCAST_FIRST = 'subgroupBroadcastFirst';
SubgroupFunctionNode.QUAD_SWAP_X = 'quadSwapX';
SubgroupFunctionNode.QUAD_SWAP_Y = 'quadSwapY';
SubgroupFunctionNode.QUAD_SWAP_DIAGONAL = 'quadSwapDiagonal';

// 2 inputs
SubgroupFunctionNode.SUBGROUP_BROADCAST = 'subgroupBroadcast';
SubgroupFunctionNode.SUBGROUP_SHUFFLE = 'subgroupShuffle';
SubgroupFunctionNode.SUBGROUP_SHUFFLE_XOR = 'subgroupShuffleXor';
SubgroupFunctionNode.SUBGROUP_SHUFFLE_UP = 'subgroupShuffleUp';
SubgroupFunctionNode.SUBGROUP_SHUFFLE_DOWN = 'subgroupShuffleDown';
SubgroupFunctionNode.QUAD_BROADCAST = 'quadBroadcast';

export default SubgroupFunctionNode;

export const subgroupElect = nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_ELECT );
export const subgroupBallot = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_BALLOT );
export const subgroupAdd = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_ADD );
export const subgroupInclusiveAdd = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_INCLUSIVE_ADD );
export const subgroupExclusiveAdd = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_EXCLUSIVE_AND );
export const subgroupMul = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_MUL );
export const subgroupInclusiveMul = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_INCLUSIVE_MUL );
export const subgroupExclusiveMul = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_EXCLUSIVE_MUL );
export const subgroupAnd = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_AND );
export const subgroupOr = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_OR );
export const subgroupXor = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_XOR );
export const subgroupMin = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_MIN );
export const subgroupMax = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_MAX );
export const subgroupAll = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_ALL );
export const subgroupAny = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_ANY );
export const subgroupBroadcastFirst = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_BROADCAST_FIRST );
export const quadSwapX = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.QUAD_SWAP_X );
export const quadSwapY = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.QUAD_SWAP_Y );
export const quadSwapDiagonal = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.QUAD_SWAP_DIAGONAL );
export const subgroupBroadcast = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_BROADCAST );
export const subgroupShuffle = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_SHUFFLE );
export const subgroupShuffleXor = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_SHUFFLE_XOR );
export const subgroupShuffleUp = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_SHUFFLE_UP );
export const subgroupShuffleDown = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_SHUFFLE_DOWN );
export const quadBroadcast = /*@__PURE__*/ nodeProxy( SubgroupFunctionNode, SubgroupFunctionNode.QUAD_BROADCAST );

addMethodChaining( 'subgroupElect', subgroupElect );
