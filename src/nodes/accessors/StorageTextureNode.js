import TextureNode from './TextureNode.js';
import SamplerNode from './SamplerNode.js';
import { nodeObject } from '../tsl/TSLBase.js';
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
	 * @param {Node<uvec2|uvec3>} uvNode - The integer texel coordinates (not normalized uvs).
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
		 * The mip level to write to for storage textures.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.mipLevel = 0;

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
	 * Returns `false` to keep the UV matrix from remapping texel coordinates passed to `textureStore()`.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get updateMatrix() {

		return false;

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

	/**
	 * Overwrites the default implementation since storage texture
	 * coordinates are texel coordinates and should not be transformed
	 * by the texture uv matrix.
	 *
	 * @param {Node} uvNode - The uv node.
	 * @return {Node} The unmodified uv node.
	 */
	getTransformedUV( uvNode ) {

		return uvNode;

	}

	setup( builder ) {

		super.setup( builder );

		const properties = builder.getNodeProperties( this );
		properties.uvNode = this.uvNode;
		properties.storeNode = this.storeNode;
		properties.depthNode = this.depthNode;

		return properties;

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
	 * Sets the mip level to write to.
	 *
	 * @param {number} level - The mip level.
	 * @return {StorageTextureNode} A reference to this node.
	 */
	setMipLevel( level ) {

		this.mipLevel = level;
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

		if ( this.storeNode !== null ) {

			this.generateStore( builder );
			return '';

		}

		return super.generate( builder, output );

	}

	/**
	 * Generates the snippet for the storage texture.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} textureProperty - The texture property.
	 * @param {string} uvSnippet - The uv snippet.
	 * @param {?string} levelSnippet - The level snippet.
	 * @param {?string} biasSnippet - The bias snippet.
	 * @param {?string} depthSnippet - The depth snippet.
	 * @param {?string} compareSnippet - The compare snippet.
	 * @param {?Array<string>} gradSnippet - The grad snippet.
	 * @param {?string} offsetSnippet - The offset snippet.
	 * @return {string} The generated code snippet.
	 */
	generateSnippet( builder, textureProperty, uvSnippet, levelSnippet, biasSnippet, depthSnippet, compareSnippet, gradSnippet, offsetSnippet ) {

		const texture = this.value;

		return builder.generateStorageTextureLoad( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet, offsetSnippet );

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
	 * Stores a value in this storage texture at the given coordinates.
	 *
	 * @param {Node<uvec2|uvec3>} uvNode - The integer texel coordinates (not normalized uvs).
	 * @param {?Node} [storeNode=null] - The value node that should be stored in the texture.
	 * @return {StorageSamplerNode} A node representing the store operation.
	 */
	store( uvNode, storeNode ) {

		const node = new StorageSamplerNode( this, uvNode, storeNode );

		if ( storeNode !== null ) node.toStack();

		return node;

	}

	/**
	 * Generates the code snippet of the storage texture node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	generateStore( builder ) {

		const properties = builder.getNodeProperties( this );

		const { uvNode, storeNode, depthNode } = properties;

		const textureProperty = super.generate( builder, 'property' );
		const uvSnippet = uvNode.build( builder, this.value.is3DTexture === true ? 'uvec3' : 'uvec2' );
		const storeType = builder.getTypeFromLength( 4, builder.getComponentTypeFromTexture( this.value ) );
		const storeSnippet = storeNode.build( builder, storeType );
		const depthSnippet = depthNode ? depthNode.build( builder, 'int' ) : null;

		const snippet = builder.generateTextureStore( this.value, textureProperty, uvSnippet, depthSnippet, storeSnippet );

		builder.addLineFlowCode( snippet, this );

	}

	clone() {

		const newNode = super.clone();
		newNode.storeNode = this.storeNode;
		newNode.mipLevel = this.mipLevel;
		newNode.access = this.access;
		return newNode;

	}

}

/**
 * Represents a sample or a store of a storage texture node. Unlike {@link SamplerNode},
 * the access methods of the storage texture node are available too.
 *
 * @augments SamplerNode
 */
class StorageSamplerNode extends SamplerNode {

	static get type() {

		return 'StorageSamplerNode';

	}

	/**
	 * Constructs a new storage sampler node.
	 *
	 * @param {StorageTextureNode|StorageTexture} textureNode - The storage texture node or the storage texture.
	 * @param {?Node<uvec2|uvec3>} [uvNode=null] - The integer texel coordinates (not normalized uvs).
	 * @param {?Node} [storeNode=null] - The value node that should be stored in the texture.
	 */
	constructor( textureNode, uvNode = null, storeNode = null ) {

		super( textureNode, uvNode );

		/**
		 * The value node that should be stored in the texture.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.storeNode = storeNode;

	}

	createTextureNode( texture ) {

		return new StorageTextureNode( texture );

	}

	generateNodeType( builder ) {

		return this.storeNode !== null ? 'void' : super.generateNodeType( builder );

	}

	setup( builder ) {

		if ( this.storeNode === null ) return super.setup( builder );

		const properties = builder.getNodeProperties( this );
		properties.textureNode = this.getTextureNode( builder );
		properties.uvNode = this.uvNode;
		properties.storeNode = this.storeNode;
		properties.depthNode = this.depthNode;

	}

	generate( builder, output ) {

		if ( this.storeNode === null ) return super.generate( builder, output );

		const { textureNode, uvNode, storeNode, depthNode } = builder.getNodeProperties( this );

		const texture = textureNode.value;
		const textureProperty = textureNode.build( builder, 'property' );

		const uvSnippet = uvNode.build( builder, texture.is3DTexture === true ? 'uvec3' : 'uvec2' );
		const storeType = builder.getTypeFromLength( 4, builder.getComponentTypeFromTexture( texture ) );
		const storeSnippet = storeNode.build( builder, storeType );
		const depthSnippet = depthNode ? depthNode.build( builder, 'int' ) : null;

		const snippet = builder.generateTextureStore( texture, textureProperty, uvSnippet, depthSnippet, storeSnippet );

		builder.addLineFlowCode( snippet, this );

		return '';

	}

	/**
	 * Defines the node access of the storage texture node.
	 *
	 * @param {string} value - The node access.
	 * @return {StorageSamplerNode} A reference to this node.
	 */
	setAccess( value ) {

		this._getTextureNode().setAccess( value );
		return this;

	}

	/**
	 * Sets the mip level of the storage texture node.
	 *
	 * @param {number} level - The mip level.
	 * @return {StorageSamplerNode} A reference to this node.
	 */
	setMipLevel( level ) {

		this._getTextureNode().setMipLevel( level );
		return this;

	}

	/**
	 * Convenience method for configuring a read/write node access of the storage texture node.
	 *
	 * @return {StorageSamplerNode} A reference to this node.
	 */
	toReadWrite() {

		return this.setAccess( NodeAccess.READ_WRITE );

	}

	/**
	 * Convenience method for configuring a read-only node access of the storage texture node.
	 *
	 * @return {StorageSamplerNode} A reference to this node.
	 */
	toReadOnly() {

		return this.setAccess( NodeAccess.READ_ONLY );

	}

	/**
	 * Convenience method for configuring a write-only node access of the storage texture node.
	 *
	 * @return {StorageSamplerNode} A reference to this node.
	 */
	toWriteOnly() {

		return this.setAccess( NodeAccess.WRITE_ONLY );

	}

	clone() {

		const newNode = super.clone();
		newNode.storeNode = this.storeNode;

		return newNode;

	}

}

export default StorageTextureNode;

/**
 * TSL function for creating a storage texture node.
 *
 * @tsl
 * @function
 * @param {StorageTexture} value - The storage texture.
 * @param {?Node<uvec2|uvec3>} [uvNode=null] - The integer texel coordinates (not normalized uvs).
 * @param {?Node} [storeNode=null] - The value node that should be stored in the texture.
 * @returns {StorageTextureNode|StorageSamplerNode} The storage texture node, or its sample or store if a uv node is given.
 */
export const storageTexture = ( value, uvNode = null, storeNode = null ) => {

	if ( uvNode === null && storeNode === null ) return new StorageTextureNode( value );

	// samples and stores of a storage texture share a single binding

	return new StorageSamplerNode( value, nodeObject( uvNode ), storeNode !== null ? nodeObject( storeNode ) : null );

};


/**
 * TSL function for storing a value in a storage texture.
 *
 * Unlike {@link storageTexture}, this function also accepts an existing storage
 * texture node and is intended for performing the store operation itself.
 *
 * @tsl
 * @function
 * @param {StorageTexture|StorageTextureNode} value - The storage texture or storage texture node.
 * @param {Node<uvec2|uvec3>} uvNode - The integer texel coordinates (not normalized uvs).
 * @param {?Node} [storeNode=null] - The value node that should be stored in the texture.
 * @returns {StorageSamplerNode}
 */
export const textureStore = ( value, uvNode, storeNode ) => {

	let node;

	if ( value.isStorageTextureNode === true ) {

		node = value.store( uvNode, storeNode );

	} else {

		node = storageTexture( value, uvNode, storeNode );

		if ( storeNode !== null ) node.toStack();

	}

	return node;

};
