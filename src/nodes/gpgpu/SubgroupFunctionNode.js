import TempNode from '../core/TempNode.js';
import { nodeProxyIntent } from '../tsl/TSLCore.js';


/**
 * This class represents a set of built in WGSL shader functions that sync
 * synchronously execute an operation across a subgroup, or 'warp', of compute
 * or fragment shader invocations within a workgroup. Typically, these functions
 * will synchronously execute an operation using data from all active invocations
 * within the subgroup, then broadcast that result to all active invocations. In
 * other graphics APIs, subgroup functions are also referred to as wave intrinsics
 * (DirectX/HLSL) or warp intrinsics (CUDA).
 *
 * @augments TempNode
 */
class SubgroupFunctionNode extends TempNode {

	static get type() {

		return 'SubgroupFunctionNode';

	}

	/**
	 * Constructs a new function node.
	 *
	 * @param {string} method - The subgroup/wave intrinsic method to construct.
	 * @param {Node} [aNode=null] - The method's first argument.
	 * @param {Node} [bNode=null] - The method's second argument.
	 */
	constructor( method, aNode = null, bNode = null ) {

		super();

		/**
		 * The subgroup/wave intrinsic method to construct.
		 *
		 * @type {string}
		 */
		this.method = method;

		/**
		 * The method's first argument.
		 *
		 * @type {Node}
		 */
		this.aNode = aNode;

		/**
		 * The method's second argument.
		 *
		 * @type {Node}
		 */
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

		const paramsString = params.length === 0 ? '()' : `( ${params.join( ', ' )} )`;

		return builder.format( `${ builder.getMethod( method, type ) }${paramsString}`, type, output );



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



/**
 * Returns true if this invocation has the lowest subgroup_invocation_id
 * among active invocations in the subgroup.
 *
 * @tsl
 * @method
 * @return {bool} The result of the computation.
 */
export const subgroupElect = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_ELECT ).setParameterLength( 0 );

/**
 * Returns a set of bitfields where the bit corresponding to subgroup_invocation_id
 * is 1 if pred is true for that active invocation and 0 otherwise.
 *
 * @tsl
 * @method
 * @param {bool} pred - A boolean that sets the bit corresponding to the invocations subgroup invocation id.
 * @return {vec4<u32>}- A bitfield corresponding to the pred value of each subgroup invocation.
 */
export const subgroupBallot = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_BALLOT ).setParameterLength( 1 );

/**
 * A reduction that adds e among all active invocations and returns that result.
 *
 * @tsl
 * @method
 * @param {number} e - The value provided to the reduction by the current invocation.
 * @return {number} The accumulated result of the reduction operation.
 */
export const subgroupAdd = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_ADD ).setParameterLength( 1 );

/**
 * An inclusive scan returning the sum of e for all active invocations with subgroup_invocation_id less than or equal to this invocation.
 *
 * @tsl
 * @method
 * @param {number} e - The value provided to the inclusive scan by the current invocation.
 * @return {number} The accumulated result of the inclusive scan operation.
 */
export const subgroupInclusiveAdd = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_INCLUSIVE_ADD ).setParameterLength( 1 );

/**
 * An exclusive scan that returns the sum of e for all active invocations with subgroup_invocation_id less than this invocation.
 *
 * @tsl
 * @method
 * @param {number} e - The value provided to the exclusive scan by the current invocation.
 * @return {number} The accumulated result of the exclusive scan operation.
 */
export const subgroupExclusiveAdd = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_EXCLUSIVE_AND ).setParameterLength( 1 );

/**
 * A reduction that multiplies e among all active invocations and returns that result.
 *
 * @tsl
 * @method
 * @param {number} e - The value provided to the reduction by the current invocation.
 * @return {number} The accumulated result of the reduction operation.
 */
export const subgroupMul = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_MUL ).setParameterLength( 1 );

/**
 * An inclusive scan returning the product of e for all active invocations with subgroup_invocation_id less than or equal to this invocation.
 *
 * @tsl
 * @method
 * @param {number} e - The value provided to the inclusive scan by the current invocation.
 * @return {number} The accumulated result of the inclusive scan operation.
 */
export const subgroupInclusiveMul = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_INCLUSIVE_MUL ).setParameterLength( 1 );

/**
 * An exclusive scan that returns the product of e for all active invocations with subgroup_invocation_id less than this invocation.
 *
 * @tsl
 * @method
 * @param {number} e - The value provided to the exclusive scan by the current invocation.
 * @return {number} The accumulated result of the exclusive scan operation.
 */
export const subgroupExclusiveMul = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_EXCLUSIVE_MUL ).setParameterLength( 1 );

/**
 * A reduction that performs a bitwise and of e among all active invocations and returns that result.
 *
 * @tsl
 * @method
 * @param {number} e - The value provided to the reduction by the current invocation.
 * @return {number} The result of the reduction operation.
 */
export const subgroupAnd = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_AND ).setParameterLength( 1 );

/**
 * A reduction that performs a bitwise or of e among all active invocations and returns that result.
 *
 * @tsl
 * @method
 * @param {number} e - The value provided to the reduction by the current invocation.
 * @return {number} The result of the reduction operation.
 */
export const subgroupOr = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_OR ).setParameterLength( 1 );

/**
 * A reduction that performs a bitwise xor of e among all active invocations and returns that result.
 *
 * @tsl
 * @method
 * @param {number} e - The value provided to the reduction by the current invocation.
 * @return {number} The result of the reduction operation.
 */
export const subgroupXor = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_XOR ).setParameterLength( 1 );

/**
 * A reduction that performs a min of e among all active invocations and returns that result.
 *
 * @tsl
 * @method
 * @param {number} e - The value provided to the reduction by the current invocation.
 * @return {number} The result of the reduction operation.
 */
export const subgroupMin = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_MIN ).setParameterLength( 1 );

/**
 * A reduction that performs a max of e among all active invocations and returns that result.
 *
 * @tsl
 * @method
 * @param {number} e - The value provided to the reduction by the current invocation.
 * @return {number} The result of the reduction operation.
 */
export const subgroupMax = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_MAX ).setParameterLength( 1 );

/**
 * Returns true if e is true for all active invocations in the subgroup.
 *
 * @tsl
 * @method
 * @return {bool} The result of the computation.
 */
export const subgroupAll = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_ALL ).setParameterLength( 0 );

/**
 * Returns true if e is true for any active invocation in the subgroup
 *
 * @tsl
 * @method
 * @return {bool} The result of the computation.
 */
export const subgroupAny = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_ANY ).setParameterLength( 0 );

/**
 * Broadcasts e from the active invocation with the lowest subgroup_invocation_id in the subgroup to all other active invocations.
 *
 * @tsl
 * @method
 * @param {number} e - The value to broadcast from the lowest subgroup invocation.
 * @param {number} id - The subgroup invocation to broadcast from.
 * @return {number} The broadcast value.
 */
export const subgroupBroadcastFirst = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_BROADCAST_FIRST ).setParameterLength( 2 );

/**
 * Swaps e between invocations in the quad in the X direction.
 *
 * @tsl
 * @method
 * @param {number} e - The value to swap from the current invocation.
 * @return {number} The value received from the swap operation.
 */
export const quadSwapX = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.QUAD_SWAP_X ).setParameterLength( 1 );

/**
 * Swaps e between invocations in the quad in the Y direction.
 *
 * @tsl
 * @method
 * @param {number} e - The value to swap from the current invocation.
 * @return {number} The value received from the swap operation.
 */
export const quadSwapY = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.QUAD_SWAP_Y ).setParameterLength( 1 );

/**
 * Swaps e between invocations in the quad diagonally.
 *
 * @tsl
 * @method
 * @param {number} e - The value to swap from the current invocation.
 * @return {number} The value received from the swap operation.
 */
export const quadSwapDiagonal = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.QUAD_SWAP_DIAGONAL ).setParameterLength( 1 );

/**
 * Broadcasts e from the invocation whose subgroup_invocation_id matches id, to all active invocations.
 *
 * @tsl
 * @method
 * @param {number} e - The value to broadcast from subgroup invocation 'id'.
 * @param {number} id - The subgroup invocation to broadcast from.
 * @return {number} The broadcast value.
 */
export const subgroupBroadcast = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_BROADCAST ).setParameterLength( 2 );

/**
 * Returns v from the active invocation whose subgroup_invocation_id matches id
 *
 * @tsl
 * @method
 * @param {number} v - The value to return from subgroup invocation id^mask.
 * @param {number} id - The subgroup invocation which returns the value v.
 * @return {number} The broadcast value.
 */
export const subgroupShuffle = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_SHUFFLE ).setParameterLength( 2 );

/**
 * Returns v from the active invocation whose subgroup_invocation_id matches subgroup_invocation_id ^ mask.
 *
 * @tsl
 * @method
 * @param {number} v - The value to return from subgroup invocation id^mask.
 * @param {number} mask - A bitmask that determines the target invocation via a XOR operation.
 * @return {number} The broadcast value.
 */
export const subgroupShuffleXor = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_SHUFFLE_XOR ).setParameterLength( 2 );

/**
 * Returns v from the active invocation whose subgroup_invocation_id matches subgroup_invocation_id - delta
 *
 * @tsl
 * @method
 * @param {number} v - The value to return from subgroup invocation id^mask.
 * @param {number} delta - A value that offsets the current in.
 * @return {number} The broadcast value.
 */
export const subgroupShuffleUp = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_SHUFFLE_UP ).setParameterLength( 2 );

/**
 * Returns v from the active invocation whose subgroup_invocation_id matches subgroup_invocation_id + delta
 *
 * @tsl
 * @method
 * @param {number} v - The value to return from subgroup invocation id^mask.
 * @param {number} delta - A value that offsets the current subgroup invocation.
 * @return {number} The broadcast value.
 */
export const subgroupShuffleDown = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.SUBGROUP_SHUFFLE_DOWN ).setParameterLength( 2 );

/**
 * Broadcasts e from the quad invocation with id equal to id.
 *
 * @tsl
 * @method
 * @param {number} e - The value to broadcast.
 * @return {number} The broadcast value.
 */
export const quadBroadcast = /*@__PURE__*/ nodeProxyIntent( SubgroupFunctionNode, SubgroupFunctionNode.QUAD_BROADCAST ).setParameterLength( 1 );
