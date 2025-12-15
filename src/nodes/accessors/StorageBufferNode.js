import BufferNode from './BufferNode.js';
import { bufferAttribute } from './BufferAttributeNode.js';
import { varying } from '../tsl/TSLBase.js';
import { storageElement } from '../utils/StorageArrayElementNode.js';
import { NodeAccess } from '../core/constants.js';
import { getTypeFromLength } from '../core/NodeUtils.js';
import { warn } from '../../utils.js';

/**
 * This node is used in context of compute shaders and allows to define a
 * storage buffer for data. A typical workflow is to create instances of
 * this node with the convenience functions `attributeArray()` or `instancedArray()`,
 * setup up a compute shader that writes into the buffers and then convert
 * the storage buffers to attribute nodes for rendering.
 *
 * ```js
 * const positionBuffer = instancedArray( particleCount, 'vec3' ); // the storage buffer node
 *
 * const computeInit = Fn( () => { // the compute shader
 *
 * 	const position = positionBuffer.element( instanceIndex );
 *
 * 	// compute position data
 *
 * 	position.x = 1;
 * 	position.y = 1;
 * 	position.z = 1;
 *
 * } )().compute( particleCount );
 *
 * const particleMaterial = new THREE.SpriteNodeMaterial();
 * particleMaterial.positionNode = positionBuffer.toAttribute();
 *
 * renderer.computeAsync( computeInit );
 *
 * ```
 *
 * @augments BufferNode
 */
class StorageBufferNode extends BufferNode {

	static get type() {

		return 'StorageBufferNode';

	}

	/**
	 * Constructs a new storage buffer node.
	 *
	 * @param {StorageBufferAttribute|StorageInstancedBufferAttribute|BufferAttribute} value - The buffer data.
	 * @param {?(string|Struct)} [bufferType=null] - The buffer type (e.g. `'vec3'`).
	 * @param {number} [bufferCount=0] - The buffer count.
	 */
	constructor( value, bufferType = null, bufferCount = 0 ) {

		let nodeType, structTypeNode = null;

		if ( bufferType && bufferType.isStruct ) {

			nodeType = 'struct';
			structTypeNode = bufferType.layout;

			if ( value.isStorageBufferAttribute || value.isStorageInstancedBufferAttribute ) {

				bufferCount = value.count;

			}

		} else if ( bufferType === null && ( value.isStorageBufferAttribute || value.isStorageInstancedBufferAttribute ) ) {

			nodeType = getTypeFromLength( value.itemSize );
			bufferCount = value.count;

		} else {

			nodeType = bufferType;

		}

		super( value, nodeType, bufferCount );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStorageBufferNode = true;


		/**
		 * The buffer struct type.
		 *
		 * @type {?StructTypeNode}
		 * @default null
		 */
		this.structTypeNode = structTypeNode;

		/**
		 * The access type of the texture node.
		 *
		 * @type {string}
		 * @default 'readWrite'
		 */
		this.access = NodeAccess.READ_WRITE;

		/**
		 * Whether the node is atomic or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.isAtomic = false;

		/**
		 * Whether the node represents a PBO or not.
		 * Only relevant for WebGL.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.isPBO = false;

		/**
		 * A reference to the internal buffer attribute node.
		 *
		 * @private
		 * @type {?BufferAttributeNode}
		 * @default null
		 */
		this._attribute = null;

		/**
		 * A reference to the internal varying node.
		 *
		 * @private
		 * @type {?VaryingNode}
		 * @default null
		 */
		this._varying = null;

		/**
		 * `StorageBufferNode` sets this property to `true` by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.global = true;

		if ( value.isStorageBufferAttribute !== true && value.isStorageInstancedBufferAttribute !== true ) {

			// TODO: Improve it, possibly adding a new property to the BufferAttribute to identify it as a storage buffer read-only attribute in Renderer

			if ( value.isInstancedBufferAttribute ) value.isStorageInstancedBufferAttribute = true;
			else value.isStorageBufferAttribute = true;

		}

	}

	/**
	 * This method is overwritten since the buffer data might be shared
	 * and thus the hash should be shared as well.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The hash.
	 */
	getHash( builder ) {

		if ( this.bufferCount === 0 ) {

			let bufferData = builder.globalCache.getData( this.value );

			if ( bufferData === undefined ) {

				bufferData = {
					node: this
				};

				builder.globalCache.setData( this.value, bufferData );

			}

			return bufferData.node.uuid;

		}

		return this.uuid;

	}

	/**
	 * Overwrites the default implementation to return a fixed value `'indirectStorageBuffer'` or `'storageBuffer'`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( /*builder*/ ) {

		return this.value.isIndirectStorageBufferAttribute ? 'indirectStorageBuffer' : 'storageBuffer';

	}

	/**
	 * Enables element access with the given index node.
	 *
	 * @param {IndexNode} indexNode - The index node.
	 * @return {StorageArrayElementNode} A node representing the element access.
	 */
	element( indexNode ) {

		return storageElement( this, indexNode );

	}

	/**
	 * Defines whether this node is a PBO or not. Only relevant for WebGL.
	 *
	 * @param {boolean} value - The value so set.
	 * @return {StorageBufferNode} A reference to this node.
	 */
	setPBO( value ) {

		this.isPBO = value;

		return this;

	}

	/**
	 * Returns the `isPBO` value.
	 *
	 * @return {boolean} Whether the node represents a PBO or not.
	 */
	getPBO() {

		return this.isPBO;

	}

	/**
	 * Defines the node access.
	 *
	 * @param {string} value - The node access.
	 * @return {StorageBufferNode} A reference to this node.
	 */
	setAccess( value ) {

		this.access = value;

		return this;

	}

	/**
	 * Convenience method for configuring a read-only node access.
	 *
	 * @return {StorageBufferNode} A reference to this node.
	 */
	toReadOnly() {

		return this.setAccess( NodeAccess.READ_ONLY );

	}

	/**
	 * Defines whether the node is atomic or not.
	 *
	 * @param {boolean} value - The atomic flag.
	 * @return {StorageBufferNode} A reference to this node.
	 */
	setAtomic( value ) {

		this.isAtomic = value;

		return this;

	}

	/**
	 * Convenience method for making this node atomic.
	 *
	 * @return {StorageBufferNode} A reference to this node.
	 */
	toAtomic() {

		return this.setAtomic( true );

	}

	/**
	 * Returns attribute data for this storage buffer node.
	 *
	 * @return {{attribute: BufferAttributeNode, varying: VaryingNode}} The attribute data.
	 */
	getAttributeData() {

		if ( this._attribute === null ) {

			this._attribute = bufferAttribute( this.value );
			this._varying = varying( this._attribute );

		}

		return {
			attribute: this._attribute,
			varying: this._varying
		};

	}

	/**
	 * This method is overwritten since the node type from the availability of storage buffers
	 * and the attribute data.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	getNodeType( builder ) {

		if ( this.structTypeNode !== null ) {

			return this.structTypeNode.getNodeType( builder );

		}

		if ( builder.isAvailable( 'storageBuffer' ) || builder.isAvailable( 'indirectStorageBuffer' ) ) {

			return super.getNodeType( builder );

		}

		const { attribute } = this.getAttributeData();

		return attribute.getNodeType( builder );

	}

	/**
	 * Returns the type of a member of the struct.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} name - The name of the member.
	 * @return {string} The type of the member.
	 */
	getMemberType( builder, name ) {

		if ( this.structTypeNode !== null ) {

			return this.structTypeNode.getMemberType( builder, name );

		}

		return 'void';

	}

	/**
	 * Generates the code snippet of the storage buffer node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The generated code snippet.
	 */
	generate( builder ) {

		if ( this.structTypeNode !== null ) this.structTypeNode.build( builder );

		if ( builder.isAvailable( 'storageBuffer' ) || builder.isAvailable( 'indirectStorageBuffer' ) ) {

			return super.generate( builder );

		}

		const { attribute, varying } = this.getAttributeData();

		const output = varying.build( builder );

		builder.registerTransform( output, attribute );

		return output;

	}

}

export default StorageBufferNode;

/**
 * TSL function for creating a storage buffer node.
 *
 * @tsl
 * @function
 * @param {StorageBufferAttribute|StorageInstancedBufferAttribute|BufferAttribute} value - The buffer data.
 * @param {?(string|Struct)} [type=null] - The buffer type (e.g. `'vec3'`).
 * @param {number} [count=0] - The buffer count.
 * @returns {StorageBufferNode}
 */
export const storage = ( value, type = null, count = 0 ) => new StorageBufferNode( value, type, count );

/**
 * @tsl
 * @function
 * @deprecated since r171. Use `storage().setPBO( true )` instead.
 *
 * @param {StorageBufferAttribute|StorageInstancedBufferAttribute|BufferAttribute} value - The buffer data.
 * @param {?string} type - The buffer type (e.g. `'vec3'`).
 * @param {number} count - The buffer count.
 * @returns {StorageBufferNode}
 */
export const storageObject = ( value, type, count ) => { // @deprecated, r171

	warn( 'TSL: "storageObject()" is deprecated. Use "storage().setPBO( true )" instead.' );

	return storage( value, type, count ).setPBO( true );

};
