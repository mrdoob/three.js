import TextureNode from './TextureNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { NodeAccess } from '../core/constants.js';

/**
 * This special version of a texture node can be used to
 * write data into a storage texture with a compute shader.
 *
 * ```js
 * const storageTexture = new THREE.StorageTexture( width, height );
 *
 * const computeTexture = Fn( ( { storageTexture } ) => {
 *
 * 	const posX = instanceIndex.mod( width );
 * 	const posY = instanceIndex.div( width );
 * 	const indexUV = uvec2( posX, posY );
 *
 * 	// generate RGB values
 *
 * 	const r = 1;
 * 	const g = 1;
 * 	const b = 1;
 *
 * 	textureStore( storageTexture, indexUV, vec4( r, g, b, 1 ) ).toWriteOnly();
 *
 * } );
 *
 * const computeNode = computeTexture( { storageTexture } ).compute( width * height );
 * renderer.computeAsync( computeNode );
 * ```
 *
 * This node can only be used with a WebGPU backend.
 *
 * @augments TextureNode
 */
class StorageTextureNode extends TextureNode {

	static get type() {

		return 'StorageTextureNode';

	}

	/**
	 * Constructs a new storage texture node.
	 *
	 * @param {StorageTexture} value - The storage texture.
	 * @param {Node<vec2|vec3>} uvNode - The uv node.
	 * @param {?Node} [storeNode=null] - The value node that should be stored in the texture.
	 */
	constructor( value, uvNode, storeNode = null ) {

		super( value, uvNode );

		/**
		 * The value node that should be stored in the texture.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.storeNode = storeNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStorageTextureNode = true;

		/**
		 * The access type of the texture node.
		 *
		 * @type {string}
		 * @default 'writeOnly'
		 */
		this.access = NodeAccess.WRITE_ONLY;

	}

	/**
	 * Overwrites the default implementation to return a fixed value `'storageTexture'`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( /*builder*/ ) {

		return 'storageTexture';

	}

	setup( builder ) {

		super.setup( builder );

		const properties = builder.getNodeProperties( this );
		properties.storeNode = this.storeNode;

	}

	/**
	 * Defines the node access.
	 *
	 * @param {string} value - The node access.
	 * @return {StorageTextureNode} A reference to this node.
	 */
	setAccess( value ) {

		this.access = value;
		return this;

	}

	/**
	 * Generates the code snippet of the storage node. If no `storeNode`
	 * is defined, the texture node is generated as normal texture.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} output - The current output.
	 * @return {string} The generated code snippet.
	 */
	generate( builder, output ) {

		let snippet;

		if ( this.storeNode !== null ) {

			snippet = this.generateStore( builder );

		} else {

			snippet = super.generate( builder, output );

		}

		return snippet;

	}

	/**
	 * Convenience method for configuring a read/write node access.
	 *
	 * @return {StorageTextureNode} A reference to this node.
	 */
	toReadWrite() {

		return this.setAccess( NodeAccess.READ_WRITE );

	}

	/**
	 * Convenience method for configuring a read-only node access.
	 *
	 * @return {StorageTextureNode} A reference to this node.
	 */
	toReadOnly() {

		return this.setAccess( NodeAccess.READ_ONLY );

	}

	/**
	 * Convenience method for configuring a write-only node access.
	 *
	 * @return {StorageTextureNode} A reference to this node.
	 */
	toWriteOnly() {

		return this.setAccess( NodeAccess.WRITE_ONLY );

	}

	/**
	 * Generates the code snippet of the storage texture node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	generateStore( builder ) {

		const properties = builder.getNodeProperties( this );

		const { uvNode, storeNode } = properties;

		const textureProperty = super.generate( builder, 'property' );
		const uvSnippet = uvNode.build( builder, 'uvec2' );
		const storeSnippet = storeNode.build( builder, 'vec4' );

		const snippet = builder.generateTextureStore( builder, textureProperty, uvSnippet, storeSnippet );

		builder.addLineFlowCode( snippet, this );

	}

}

export default StorageTextureNode;

/**
 * TSL function for creating a storage texture node.
 *
 * @tsl
 * @function
 * @param {StorageTexture} value - The storage texture.
 * @param {?Node<vec2|vec3>} uvNode - The uv node.
 * @param {?Node} [storeNode=null] - The value node that should be stored in the texture.
 * @returns {StorageTextureNode}
 */
export const storageTexture = /*@__PURE__*/ nodeProxy( StorageTextureNode ).setParameterLength( 1, 3 );


/**
 * TODO: Explain difference to `storageTexture()`.
 *
 * @tsl
 * @function
 * @param {StorageTexture} value - The storage texture.
 * @param {Node<vec2|vec3>} uvNode - The uv node.
 * @param {?Node} [storeNode=null] - The value node that should be stored in the texture.
 * @returns {StorageTextureNode}
 */
export const textureStore = ( value, uvNode, storeNode ) => {

	const node = storageTexture( value, uvNode, storeNode );

	if ( storeNode !== null ) node.append();

	return node;

};
