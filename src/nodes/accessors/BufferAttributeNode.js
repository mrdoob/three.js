import InputNode from '../core/InputNode.js';
import { nodeObject, addMethodChaining } from '../tsl/TSLCore.js';
import { varying } from '../core/VaryingNode.js';

import { InterleavedBufferAttribute } from '../../core/InterleavedBufferAttribute.js';
import { InterleavedBuffer } from '../../core/InterleavedBuffer.js';
import { StaticDrawUsage, DynamicDrawUsage } from '../../constants.js';

/** @module BufferAttributeNode **/

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
	 * @param {String?} [bufferType=null] - The buffer type (e.g. `'vec3'`).
	 * @param {Number} [bufferStride=0] - The buffer stride.
	 * @param {Number} [bufferOffset=0] - The buffer offset.
	 */
	constructor( value, bufferType = null, bufferStride = 0, bufferOffset = 0 ) {

		super( value, bufferType );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isBufferNode = true;

		/**
		 * The buffer type (e.g. `'vec3'`).
		 *
		 * @type {String}
		 * @default null
		 */
		this.bufferType = bufferType;

		/**
		 * The buffer stride.
		 *
		 * @type {Number}
		 * @default 0
		 */
		this.bufferStride = bufferStride;

		/**
		 * The buffer offset.
		 *
		 * @type {Number}
		 * @default 0
		 */
		this.bufferOffset = bufferOffset;

		/**
		 * The usage property. Set this to `THREE.DynamicDrawUsage` via `.setUsage()`,
		 * if you are planning to update the attribute data per frame.
		 *
		 * @type {Number}
		 * @default StaticDrawUsage
		 */
		this.usage = StaticDrawUsage;

		/**
		 * Whether the attribute is instanced or not.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.instanced = false;

		/**
		 * A reference to the buffer attribute.
		 *
		 * @type {BufferAttribute?}
		 * @default null
		 */
		this.attribute = null;

		/**
		 * `BufferAttributeNode` sets this property to `true` by default.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.global = true;

		if ( value && value.isBufferAttribute === true ) {

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
	 * @return {String} The hash.
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
	 * @return {String} The node type.
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

		const type = this.getNodeType( builder );
		const array = this.value;
		const itemSize = builder.getTypeLength( type );
		const stride = this.bufferStride || itemSize;
		const offset = this.bufferOffset;

		const buffer = array.isInterleavedBuffer === true ? array : new InterleavedBuffer( array, stride );
		const bufferAttribute = new InterleavedBufferAttribute( buffer, itemSize, offset );

		buffer.setUsage( this.usage );

		this.attribute = bufferAttribute;
		this.attribute.isInstancedBufferAttribute = this.instanced; // @TODO: Add a possible: InstancedInterleavedBufferAttribute

	}

	/**
	 * Generates the code snippet of the buffer attribute node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The generated code snippet.
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
	 * @return {String} The input type.
	 */
	getInputType( /*builder*/ ) {

		return 'bufferAttribute';

	}

	/**
	 * Sets the `usage` property to the given value.
	 *
	 * @param {Number} value - The usage to set.
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
	 * @param {Number} value - The value to set.
	 * @return {BufferAttributeNode} A reference to this node.
	 */
	setInstanced( value ) {

		this.instanced = value;

		return this;

	}

}

export default BufferAttributeNode;

/**
 * TSL function for creating a buffer attribute node.
 *
 * @function
 * @param {BufferAttribute|InterleavedBuffer|TypedArray} array - The attribute data.
 * @param {String?} [type=null] - The buffer type (e.g. `'vec3'`).
 * @param {Number} [stride=0] - The buffer stride.
 * @param {Number} [offset=0] - The buffer offset.
 * @returns {BufferAttributeNode}
 */
export const bufferAttribute = ( array, type = null, stride = 0, offset = 0 ) => nodeObject( new BufferAttributeNode( array, type, stride, offset ) );

/**
 * TSL function for creating a buffer attribute node but with dynamic draw usage.
 * Use this function if attribute data are updated per frame.
 *
 * @function
 * @param {BufferAttribute|InterleavedBuffer|TypedArray} array - The attribute data.
 * @param {String?} [type=null] - The buffer type (e.g. `'vec3'`).
 * @param {Number} [stride=0] - The buffer stride.
 * @param {Number} [offset=0] - The buffer offset.
 * @returns {BufferAttributeNode}
 */
export const dynamicBufferAttribute = ( array, type = null, stride = 0, offset = 0 ) => bufferAttribute( array, type, stride, offset ).setUsage( DynamicDrawUsage );

/**
 * TSL function for creating a buffer attribute node but with enabled instancing
 *
 * @function
 * @param {BufferAttribute|InterleavedBuffer|TypedArray} array - The attribute data.
 * @param {String?} [type=null] - The buffer type (e.g. `'vec3'`).
 * @param {Number} [stride=0] - The buffer stride.
 * @param {Number} [offset=0] - The buffer offset.
 * @returns {BufferAttributeNode}
 */
export const instancedBufferAttribute = ( array, type = null, stride = 0, offset = 0 ) => bufferAttribute( array, type, stride, offset ).setInstanced( true );

/**
 * TSL function for creating a buffer attribute node but with dynamic draw usage and enabled instancing
 *
 * @function
 * @param {BufferAttribute|InterleavedBuffer|TypedArray} array - The attribute data.
 * @param {String?} [type=null] - The buffer type (e.g. `'vec3'`).
 * @param {Number} [stride=0] - The buffer stride.
 * @param {Number} [offset=0] - The buffer offset.
 * @returns {BufferAttributeNode}
 */
export const instancedDynamicBufferAttribute = ( array, type = null, stride = 0, offset = 0 ) => dynamicBufferAttribute( array, type, stride, offset ).setInstanced( true );

addMethodChaining( 'toAttribute', ( bufferNode ) => bufferAttribute( bufferNode.value ) );
