import InputNode from '../core/InputNode.js';
import { addMethodChaining, mat3, mat4 } from '../tsl/TSLCore.js';
import { varying } from '../core/VaryingNode.js';

import { InterleavedBufferAttribute } from '../../core/InterleavedBufferAttribute.js';
import { InterleavedBuffer } from '../../core/InterleavedBuffer.js';
import { StaticDrawUsage, DynamicDrawUsage } from '../../constants.js';

/**
 * Internal buffer attribute library.
 *
 * @private
 * @type {WeakMap<TypedArray, InterleavedBuffer>}
 */
const _bufferLib = new WeakMap();

/**
 * Internal method for retrieving or creating interleaved buffers.
 *
 * @private
 * @param {TypedArray} value - The attribute data.
 * @param {number} itemSize - The attribute item size.
 * @returns {InterleavedBuffer} The interleaved buffer.
 */
function _getBufferAttribute( value, itemSize ) {

	let buffer = _bufferLib.get( value );

	if ( buffer === undefined ) {

		buffer = new InterleavedBuffer( value, itemSize );

		_bufferLib.set( value, buffer );

	}

	return buffer;

}

/**
 * In earlier `three.js` versions it was only possible to define attribute data
 * on geometry level. With `BufferAttributeNode`, it is also possible to do this
 * on the node level.
 * ```js
 * const geometry = new THREE.PlaneGeometry();
 * const positionAttribute = geometry.getAttribute( 'position' );
 *
 * const colors = [];
 * for ( let i = 0; i < position.count; i ++ ) {
 * 	colors.push( 1, 0, 0 );
 * }
 *
 * material.colorNode = bufferAttribute( new THREE.Float32BufferAttribute( colors, 3 ) );
 * ```
 * This new approach is especially interesting when geometry data are generated via
 * compute shaders. The below line converts a storage buffer into an attribute node.
 * ```js
 * material.positionNode = positionBuffer.toAttribute();
 * ```
 * @augments InputNode
 */
class BufferAttributeNode extends InputNode {

	static get type() {

		return 'BufferAttributeNode';

	}

	/**
	 * Constructs a new buffer attribute node.
	 *
	 * @param {BufferAttribute|InterleavedBuffer|TypedArray} value - The attribute data.
	 * @param {?string} [bufferType=null] - The buffer type (e.g. `'vec3'`).
	 * @param {number} [bufferStride=0] - The buffer stride.
	 * @param {number} [bufferOffset=0] - The buffer offset.
	 */
	constructor( value, bufferType = null, bufferStride = 0, bufferOffset = 0 ) {

		super( value, bufferType );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isBufferNode = true;

		/**
		 * The buffer type (e.g. `'vec3'`).
		 *
		 * @type {?string}
		 * @default null
		 */
		this.bufferType = bufferType;

		/**
		 * The buffer stride.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.bufferStride = bufferStride;

		/**
		 * The buffer offset.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.bufferOffset = bufferOffset;

		/**
		 * The usage property. Set this to `THREE.DynamicDrawUsage` via `.setUsage()`,
		 * if you are planning to update the attribute data per frame.
		 *
		 * @type {number}
		 * @default StaticDrawUsage
		 */
		this.usage = StaticDrawUsage;

		/**
		 * Whether the attribute is instanced or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.instanced = false;

		/**
		 * A reference to the buffer attribute.
		 *
		 * @type {?BufferAttribute}
		 * @default null
		 */
		this.attribute = null;

		/**
		 * `BufferAttributeNode` sets this property to `true` by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.global = true;

		if ( value && value.isBufferAttribute === true && value.itemSize <= 4 ) {

			this.attribute = value;
			this.usage = value.usage;
			this.instanced = value.isInstancedBufferAttribute;

		}

	}

	/**
	 * This method is overwritten since the attribute data might be shared
	 * and thus the hash should be shared as well.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The hash.
	 */
	getHash( builder ) {

		if ( this.bufferStride === 0 && this.bufferOffset === 0 ) {

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
	 * This method is overwritten since the node type is inferred from
	 * the buffer attribute.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	getNodeType( builder ) {

		if ( this.bufferType === null ) {

			this.bufferType = builder.getTypeFromAttribute( this.attribute );

		}

		return this.bufferType;

	}

	/**
	 * Depending on which value was passed to the node, `setup()` behaves
	 * differently. If no instance of `BufferAttribute` was passed, the method
	 * creates an internal attribute and configures it respectively.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		if ( this.attribute !== null ) return;

		//

		const type = this.getNodeType( builder );
		const itemSize = builder.getTypeLength( type );
		const value = this.value;
		const stride = this.bufferStride || itemSize;
		const offset = this.bufferOffset;

		let buffer;

		if ( value.isInterleavedBuffer === true ) {

			buffer = value;

		} else if ( value.isBufferAttribute === true ) {

			buffer = _getBufferAttribute( value.array, stride );

		} else {

			buffer = _getBufferAttribute( value, stride );

		}

		const bufferAttribute = new InterleavedBufferAttribute( buffer, itemSize, offset );

		buffer.setUsage( this.usage );

		this.attribute = bufferAttribute;
		this.attribute.isInstancedBufferAttribute = this.instanced; // @TODO: Add a possible: InstancedInterleavedBufferAttribute

	}

	/**
	 * Generates the code snippet of the buffer attribute node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The generated code snippet.
	 */
	generate( builder ) {

		const nodeType = this.getNodeType( builder );

		const nodeAttribute = builder.getBufferAttributeFromNode( this, nodeType );
		const propertyName = builder.getPropertyName( nodeAttribute );

		let output = null;

		if ( builder.shaderStage === 'vertex' || builder.shaderStage === 'compute' ) {

			this.name = propertyName;

			output = propertyName;

		} else {

			const nodeVarying = varying( this );

			output = nodeVarying.build( builder, nodeType );

		}

		return output;

	}

	/**
	 * Overwrites the default implementation to return a fixed value `'bufferAttribute'`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( /*builder*/ ) {

		return 'bufferAttribute';

	}

	/**
	 * Sets the `usage` property to the given value.
	 *
	 * @param {number} value - The usage to set.
	 * @return {BufferAttributeNode} A reference to this node.
	 */
	setUsage( value ) {

		this.usage = value;

		if ( this.attribute && this.attribute.isBufferAttribute === true ) {

			this.attribute.usage = value;

		}

		return this;

	}

	/**
	 * Sets the `instanced` property to the given value.
	 *
	 * @param {boolean} value - The value to set.
	 * @return {BufferAttributeNode} A reference to this node.
	 */
	setInstanced( value ) {

		this.instanced = value;

		return this;

	}

}

export default BufferAttributeNode;

/**
 * Internal method for creating buffer attribute nodes.
 *
 * @private
 * @param {BufferAttribute|InterleavedBuffer|TypedArray} array - The attribute data.
 * @param {?string} [type=null] - The buffer type (e.g. `'vec3'`).
 * @param {number} [stride=0] - The buffer stride.
 * @param {number} [offset=0] - The buffer offset.
 * @param {number} [usage=StaticDrawUsage] - The buffer usage.
 * @param {boolean} [instanced=false] - Whether the buffer is instanced.
 * @returns {BufferAttributeNode|Node} The buffer attribute node.
 */
function createBufferAttribute( array, type = null, stride = 0, offset = 0, usage = StaticDrawUsage, instanced = false ) {

	if ( type === 'mat3' || ( type === null && array.itemSize === 9 ) ) {

		return mat3(
			new BufferAttributeNode( array, 'vec3', 9, 0 ).setUsage( usage ).setInstanced( instanced ),
			new BufferAttributeNode( array, 'vec3', 9, 3 ).setUsage( usage ).setInstanced( instanced ),
			new BufferAttributeNode( array, 'vec3', 9, 6 ).setUsage( usage ).setInstanced( instanced )
		);

	} else if ( type === 'mat4' || ( type === null && array.itemSize === 16 ) ) {

		return mat4(
			new BufferAttributeNode( array, 'vec4', 16, 0 ).setUsage( usage ).setInstanced( instanced ),
			new BufferAttributeNode( array, 'vec4', 16, 4 ).setUsage( usage ).setInstanced( instanced ),
			new BufferAttributeNode( array, 'vec4', 16, 8 ).setUsage( usage ).setInstanced( instanced ),
			new BufferAttributeNode( array, 'vec4', 16, 12 ).setUsage( usage ).setInstanced( instanced )
		);

	}

	return new BufferAttributeNode( array, type, stride, offset ).setUsage( usage );

}

/**
 * TSL function for creating a buffer attribute node.
 *
 * @tsl
 * @function
 * @param {BufferAttribute|InterleavedBuffer|TypedArray} array - The attribute data.
 * @param {?string} [type=null] - The buffer type (e.g. `'vec3'`).
 * @param {number} [stride=0] - The buffer stride.
 * @param {number} [offset=0] - The buffer offset.
 * @returns {BufferAttributeNode|Node}
 */
export const bufferAttribute = ( array, type = null, stride = 0, offset = 0 ) => createBufferAttribute( array, type, stride, offset );

/**
 * TSL function for creating a buffer attribute node but with dynamic draw usage.
 * Use this function if attribute data are updated per frame.
 *
 * @tsl
 * @function
 * @param {BufferAttribute|InterleavedBuffer|TypedArray} array - The attribute data.
 * @param {?string} [type=null] - The buffer type (e.g. `'vec3'`).
 * @param {number} [stride=0] - The buffer stride.
 * @param {number} [offset=0] - The buffer offset.
 * @returns {BufferAttributeNode|Node}
 */
export const dynamicBufferAttribute = ( array, type = null, stride = 0, offset = 0 ) => createBufferAttribute( array, type, stride, offset, DynamicDrawUsage );

/**
 * TSL function for creating a buffer attribute node but with enabled instancing
 *
 * @tsl
 * @function
 * @param {BufferAttribute|InterleavedBuffer|TypedArray} array - The attribute data.
 * @param {?string} [type=null] - The buffer type (e.g. `'vec3'`).
 * @param {number} [stride=0] - The buffer stride.
 * @param {number} [offset=0] - The buffer offset.
 * @returns {BufferAttributeNode|Node}
 */
export const instancedBufferAttribute = ( array, type = null, stride = 0, offset = 0 ) => createBufferAttribute( array, type, stride, offset, StaticDrawUsage, true );

/**
 * TSL function for creating a buffer attribute node but with dynamic draw usage and enabled instancing
 *
 * @tsl
 * @function
 * @param {BufferAttribute|InterleavedBuffer|TypedArray} array - The attribute data.
 * @param {?string} [type=null] - The buffer type (e.g. `'vec3'`).
 * @param {number} [stride=0] - The buffer stride.
 * @param {number} [offset=0] - The buffer offset.
 * @returns {BufferAttributeNode|Node}
 */
export const instancedDynamicBufferAttribute = ( array, type = null, stride = 0, offset = 0 ) => createBufferAttribute( array, type, stride, offset, DynamicDrawUsage, true );

addMethodChaining( 'toAttribute', ( bufferNode ) => bufferAttribute( bufferNode.value ) );
