import { nodeProxy } from '../tsl/TSLBase.js';
import ArrayElementNode from './ArrayElementNode.js';
import IndexNode from '../core/IndexNode.js';
import { warnOnce } from '../../utils.js';

/**
 * This class enables element access on instances of {@link StorageBufferNode}.
 * In most cases, it is indirectly used when accessing elements with the
 * {@link StorageBufferNode#element} method.
 *
 * ```js
 * const position = positionStorage.element( instanceIndex );
 * ```
 *
 * @augments ArrayElementNode
 */
class StorageArrayElementNode extends ArrayElementNode {

	static get type() {

		return 'StorageArrayElementNode';

	}

	/**
	 * Constructs storage buffer element node.
	 *
	 * @param {StorageBufferNode} storageBufferNode - The storage buffer node.
	 * @param {Node} indexNode - The index node that defines the element access.
	 */
	constructor( storageBufferNode, indexNode ) {

		super( storageBufferNode, indexNode );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStorageArrayElementNode = true;

	}

	/**
	 * The storage buffer node.
	 *
	 * @param {Node} value
	 * @type {StorageBufferNode}
	 */
	set storageBufferNode( value ) {

		this.node = value;

	}

	get storageBufferNode() {

		return this.node;

	}

	getMemberType( builder, name ) {

		const structTypeNode = this.storageBufferNode.structTypeNode;

		if ( structTypeNode ) {

			return structTypeNode.getMemberType( builder, name );

		}

		return 'void';

	}

	setup( builder ) {

		if ( builder.isAvailable( 'storageBuffer' ) === false ) {

			if ( this.node.isPBO === true ) {

				builder.setupPBO( this.node );

			}

		}

		return super.setup( builder );

	}

	/**
	 * Without storage buffers, an element that is not read through a PBO is the attribute
	 * value of the current vertex or instance, so the index node is not used. This method
	 * warns when the index node is something else, since the value read would silently be
	 * a different element.
	 *
	 * @private
	 */
	_warnIfIndexIgnored() {

		let indexNode = this.indexNode;

		while ( indexNode.isVarNode === true ) indexNode = indexNode.node;

		if ( indexNode.isIndexNode === true && ( indexNode.scope === IndexNode.VERTEX || indexNode.scope === IndexNode.INSTANCE ) ) return;

		if ( this.node.isPBO !== true ) {

			warnOnce( 'TSL: The WebGL backend ignores the index of ".element()" on a storage buffer without PBO. Use ".setPBO( true )" to read other elements.', this.stackTrace );

		} else {

			warnOnce( 'TSL: The WebGL backend ignores the index of ".element()" in a compute shader unless the storage buffer is an "instancedArray()".', this.stackTrace );

		}

	}

	generate( builder, output ) {

		let snippet;

		const isAssignContext = builder.isContextAssign();

		//

		if ( builder.isAvailable( 'storageBuffer' ) === false ) {

			if ( this.node.isPBO === true && isAssignContext !== true && ( this.node.value.isInstancedBufferAttribute || builder.shaderStage !== 'compute' ) ) {

				snippet = builder.generatePBO( this );

			} else {

				if ( isAssignContext !== true ) this._warnIfIndexIgnored();

				snippet = this.node.build( builder );

			}

		} else {

			snippet = super.generate( builder );

		}

		if ( isAssignContext !== true ) {

			const type = this.getNodeType( builder );

			snippet = builder.format( snippet, type, output );

		}

		return snippet;

	}

}

export default StorageArrayElementNode;

/**
 * TSL function for creating a storage element node.
 *
 * @tsl
 * @function
 * @param {StorageBufferNode} storageBufferNode - The storage buffer node.
 * @param {Node} indexNode - The index node that defines the element access.
 * @returns {StorageArrayElementNode}
 */
export const storageElement = /*@__PURE__*/ nodeProxy( StorageArrayElementNode ).setParameterLength( 2 );
