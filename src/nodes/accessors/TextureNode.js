import UniformNode, { uniform } from '../core/UniformNode.js';
import { uv } from './UV.js';
import { textureSize } from './TextureSizeNode.js';
import { colorSpaceToWorking } from '../display/ColorSpaceNode.js';
import { expression } from '../code/ExpressionNode.js';
import { maxMipLevel } from '../utils/MaxMipLevelNode.js';
import { nodeProxy, vec3, nodeObject, int } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';

import { IntType, UnsignedIntType } from '../../constants.js';

/**
 * This type of uniform node represents a 2D texture.
 *
 * @augments UniformNode
 */
class TextureNode extends UniformNode {

	static get type() {

		return 'TextureNode';

	}

	/**
	 * Constructs a new texture node.
	 *
	 * @param {Texture} value - The texture.
	 * @param {?Node<vec2|vec3>} [uvNode=null] - The uv node.
	 * @param {?Node<int>} [levelNode=null] - The level node.
	 * @param {?Node<float>} [biasNode=null] - The bias node.
	 */
	constructor( value, uvNode = null, levelNode = null, biasNode = null ) {

		super( value );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isTextureNode = true;

		/**
		 * Represents the texture coordinates.
		 *
		 * @type {?Node<vec2|vec3>}
		 * @default null
		 */
		this.uvNode = uvNode;

		/**
		 * Represents the mip level that should be selected.
		 *
		 * @type {?Node<int>}
		 * @default null
		 */
		this.levelNode = levelNode;

		/**
		 * Represents the bias to be applied during level-of-detail computation.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.biasNode = biasNode;

		/**
		 * Represents a reference value a texture sample is compared to.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.compareNode = null;

		/**
		 * When using texture arrays, the depth node defines the layer to select.
		 *
		 * @type {?Node<int>}
		 * @default null
		 */
		this.depthNode = null;

		/**
		 * When defined, a texture is sampled using explicit gradients.
		 *
		 * @type {?Array<Node<vec2>>}
		 * @default null
		 */
		this.gradNode = null;

		/**
		 * Whether texture values should be sampled or fetched.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.sampler = true;

		/**
		 * Whether the uv transformation matrix should be
		 * automatically updated or not. Use `setUpdateMatrix()`
		 * if you want to change the value of the property.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.updateMatrix = false;

		/**
		 * By default the `update()` method is not executed. `setUpdateMatrix()`
		 * sets the value to `frame` when the uv transformation matrix should
		 * automatically be updated.
		 *
		 * @type {string}
		 * @default 'none'
		 */
		this.updateType = NodeUpdateType.NONE;

		/**
		 * The reference node.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.referenceNode = null;

		/**
		 * The texture value is stored in a private property.
		 *
		 * @private
		 * @type {Texture}
		 */
		this._value = value;

		/**
		 * The uniform node that represents the uv transformation matrix.
		 *
		 * @private
		 * @type {?UniformNode<mat3>}
		 */
		this._matrixUniform = null;

		this.setUpdateMatrix( uvNode === null );

	}

	set value( value ) {

		if ( this.referenceNode ) {

			this.referenceNode.value = value;

		} else {

			this._value = value;

		}

	}

	/**
	 * The texture value.
	 *
	 * @type {Texture}
	 */
	get value() {

		return this.referenceNode ? this.referenceNode.value : this._value;

	}

	/**
	 * Overwritten since the uniform hash is defined by the texture's UUID.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The uniform hash.
	 */
	getUniformHash( /*builder*/ ) {

		return this.value.uuid;

	}

	/**
	 * Overwritten since the node type is inferred from the texture type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	getNodeType( /*builder*/ ) {

		if ( this.value.isDepthTexture === true ) return 'float';

		if ( this.value.type === UnsignedIntType ) {

			return 'uvec4';

		} else if ( this.value.type === IntType ) {

			return 'ivec4';

		}

		return 'vec4';

	}

	/**
	 * Overwrites the default implementation to return a fixed value `'texture'`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( /*builder*/ ) {

		return 'texture';

	}

	/**
	 * Returns a default uvs based on the current texture's channel.
	 *
	 * @return {AttributeNode<vec2>} The default uvs.
	 */
	getDefaultUV() {

		return uv( this.value.channel );

	}

	/**
	 * Overwritten to always return the texture reference of the node.
	 *
	 * @param {any} state - This method can be invocated in different contexts so `state` can refer to any object type.
	 * @return {Texture} The texture reference.
	 */
	updateReference( /*state*/ ) {

		return this.value;

	}

	/**
	 * Transforms the given uv node with the texture transformation matrix.
	 *
	 * @param {Node} uvNode - The uv node to transform.
	 * @return {Node} The transformed uv node.
	 */
	getTransformedUV( uvNode ) {

		if ( this._matrixUniform === null ) this._matrixUniform = uniform( this.value.matrix );

		return this._matrixUniform.mul( vec3( uvNode, 1 ) ).xy;

	}

	/**
	 * Defines whether the uv transformation matrix should automatically be updated or not.
	 *
	 * @param {boolean} value - The update toggle.
	 * @return {TextureNode} A reference to this node.
	 */
	setUpdateMatrix( value ) {

		this.updateMatrix = value;
		this.updateType = value ? NodeUpdateType.RENDER : NodeUpdateType.NONE;

		return this;

	}

	/**
	 * Setups the uv node. Depending on the backend as well as texture's image and type, it might be necessary
	 * to modify the uv node for correct sampling.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node} uvNode - The uv node to setup.
	 * @return {Node} The updated uv node.
	 */
	setupUV( builder, uvNode ) {

		const texture = this.value;

		if ( builder.isFlipY() && ( ( texture.image instanceof ImageBitmap && texture.flipY === true ) || texture.isRenderTargetTexture === true || texture.isFramebufferTexture === true || texture.isDepthTexture === true ) ) {

			if ( this.sampler ) {

				uvNode = uvNode.flipY();

			} else {

				uvNode = uvNode.setY( int( textureSize( this, this.levelNode ).y ).sub( uvNode.y ).sub( 1 ) );

			}

		}

		return uvNode;

	}

	/**
	 * Setups texture node by preparing the internal nodes for code generation.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		const properties = builder.getNodeProperties( this );
		properties.referenceNode = this.referenceNode;

		//

		const texture = this.value;

		if ( ! texture || texture.isTexture !== true ) {

			throw new Error( 'THREE.TSL: `texture( value )` function expects a valid instance of THREE.Texture().' );

		}

		//

		let uvNode = this.uvNode;

		if ( ( uvNode === null || builder.context.forceUVContext === true ) && builder.context.getUV ) {

			uvNode = builder.context.getUV( this );

		}

		if ( ! uvNode ) uvNode = this.getDefaultUV();

		if ( this.updateMatrix === true ) {

			uvNode = this.getTransformedUV( uvNode );

		}

		uvNode = this.setupUV( builder, uvNode );

		//

		let levelNode = this.levelNode;

		if ( levelNode === null && builder.context.getTextureLevel ) {

			levelNode = builder.context.getTextureLevel( this );

		}

		//

		properties.uvNode = uvNode;
		properties.levelNode = levelNode;
		properties.biasNode = this.biasNode;
		properties.compareNode = this.compareNode;
		properties.gradNode = this.gradNode;
		properties.depthNode = this.depthNode;

	}

	/**
	 * Generates the uv code snippet.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node} uvNode - The uv node to generate code for.
	 * @return {string} The generated code snippet.
	 */
	generateUV( builder, uvNode ) {

		return uvNode.build( builder, this.sampler === true ? 'vec2' : 'ivec2' );

	}

	/**
	 * Generates the snippet for the texture sampling.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} textureProperty - The texture property.
	 * @param {string} uvSnippet - The uv snippet.
	 * @param {?string} levelSnippet - The level snippet.
	 * @param {?string} biasSnippet - The bias snippet.
	 * @param {?string} depthSnippet - The depth snippet.
	 * @param {?string} compareSnippet - The compare snippet.
	 * @param {?Array<string>} gradSnippet - The grad snippet.
	 * @return {string} The generated code snippet.
	 */
	generateSnippet( builder, textureProperty, uvSnippet, levelSnippet, biasSnippet, depthSnippet, compareSnippet, gradSnippet ) {

		const texture = this.value;

		let snippet;

		if ( levelSnippet ) {

			snippet = builder.generateTextureLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet );

		} else if ( biasSnippet ) {

			snippet = builder.generateTextureBias( texture, textureProperty, uvSnippet, biasSnippet, depthSnippet );

		} else if ( gradSnippet ) {

			snippet = builder.generateTextureGrad( texture, textureProperty, uvSnippet, gradSnippet, depthSnippet );

		} else if ( compareSnippet ) {

			snippet = builder.generateTextureCompare( texture, textureProperty, uvSnippet, compareSnippet, depthSnippet );

		} else if ( this.sampler === false ) {

			snippet = builder.generateTextureLoad( texture, textureProperty, uvSnippet, depthSnippet );

		} else {

			snippet = builder.generateTexture( texture, textureProperty, uvSnippet, depthSnippet );

		}

		return snippet;

	}

	/**
	 * Generates the code snippet of the texture node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} output - The current output.
	 * @return {string} The generated code snippet.
	 */
	generate( builder, output ) {

		const texture = this.value;

		const properties = builder.getNodeProperties( this );
		const textureProperty = super.generate( builder, 'property' );

		if ( output === 'sampler' ) {

			return textureProperty + '_sampler';

		} else if ( builder.isReference( output ) ) {

			return textureProperty;

		} else {

			const nodeData = builder.getDataFromNode( this );

			let propertyName = nodeData.propertyName;

			if ( propertyName === undefined ) {

				const { uvNode, levelNode, biasNode, compareNode, depthNode, gradNode } = properties;

				const uvSnippet = this.generateUV( builder, uvNode );
				const levelSnippet = levelNode ? levelNode.build( builder, 'float' ) : null;
				const biasSnippet = biasNode ? biasNode.build( builder, 'float' ) : null;
				const depthSnippet = depthNode ? depthNode.build( builder, 'int' ) : null;
				const compareSnippet = compareNode ? compareNode.build( builder, 'float' ) : null;
				const gradSnippet = gradNode ? [ gradNode[ 0 ].build( builder, 'vec2' ), gradNode[ 1 ].build( builder, 'vec2' ) ] : null;

				const nodeVar = builder.getVarFromNode( this );

				propertyName = builder.getPropertyName( nodeVar );

				const snippet = this.generateSnippet( builder, textureProperty, uvSnippet, levelSnippet, biasSnippet, depthSnippet, compareSnippet, gradSnippet );

				builder.addLineFlowCode( `${propertyName} = ${snippet}`, this );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

			}

			let snippet = propertyName;
			const nodeType = this.getNodeType( builder );

			if ( builder.needsToWorkingColorSpace( texture ) ) {

				snippet = colorSpaceToWorking( expression( snippet, nodeType ), texture.colorSpace ).setup( builder ).build( builder, nodeType );

			}

			return builder.format( snippet, nodeType, output );

		}

	}

	/**
	 * Sets the sampler value.
	 *
	 * @param {boolean} value - The sampler value to set.
	 * @return {TextureNode} A reference to this texture node.
	 */
	setSampler( value ) {

		this.sampler = value;

		return this;

	}

	/**
	 * Returns the sampler value.
	 *
	 * @return {boolean} The sampler value.
	 */
	getSampler() {

		return this.sampler;

	}

	// @TODO: Move to TSL

	/**
	 * @function
	 * @deprecated since r172. Use {@link TextureNode#sample} instead.
	 *
	 * @param {Node} uvNode - The uv node.
	 * @return {TextureNode} A texture node representing the texture sample.
	 */
	uv( uvNode ) { // @deprecated, r172

		console.warn( 'THREE.TextureNode: .uv() has been renamed. Use .sample() instead.' );

		return this.sample( uvNode );

	}

	/**
	 * Samples the texture with the given uv node.
	 *
	 * @param {Node} uvNode - The uv node.
	 * @return {TextureNode} A texture node representing the texture sample.
	 */
	sample( uvNode ) {

		const textureNode = this.clone();
		textureNode.uvNode = nodeObject( uvNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	/**
	 * Samples a blurred version of the texture by defining an internal bias.
	 *
	 * @param {Node<float>} amountNode - How blurred the texture should be.
	 * @return {TextureNode} A texture node representing the texture sample.
	 */
	blur( amountNode ) {

		const textureNode = this.clone();
		textureNode.biasNode = nodeObject( amountNode ).mul( maxMipLevel( textureNode ) );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	/**
	 * Samples a specific mip of the texture.
	 *
	 * @param {Node<int>} levelNode - The mip level to sample.
	 * @return {TextureNode} A texture node representing the texture sample.
	 */
	level( levelNode ) {

		const textureNode = this.clone();
		textureNode.levelNode = nodeObject( levelNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	/**
	 * Returns the texture size of the requested level.
	 *
	 * @param {Node<int>} levelNode - The level to compute the size for.
	 * @return {TextureSizeNode} The texture size.
	 */
	size( levelNode ) {

		return textureSize( this, levelNode );

	}

	/**
	 * Samples the texture with the given bias.
	 *
	 * @param {Node<float>} biasNode - The bias node.
	 * @return {TextureNode} A texture node representing the texture sample.
	 */
	bias( biasNode ) {

		const textureNode = this.clone();
		textureNode.biasNode = nodeObject( biasNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	/**
	 * Samples the texture by executing a compare operation.
	 *
	 * @param {Node<float>} compareNode - The node that defines the compare value.
	 * @return {TextureNode} A texture node representing the texture sample.
	 */
	compare( compareNode ) {

		const textureNode = this.clone();
		textureNode.compareNode = nodeObject( compareNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	/**
	 * Samples the texture using an explicit gradient.
	 *
	 * @param {Node<vec2>} gradNodeX - The gradX node.
	 * @param {Node<vec2>} gradNodeY - The gradY node.
	 * @return {TextureNode} A texture node representing the texture sample.
	 */
	grad( gradNodeX, gradNodeY ) {

		const textureNode = this.clone();
		textureNode.gradNode = [ nodeObject( gradNodeX ), nodeObject( gradNodeY ) ];
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	/**
	 * Samples the texture by defining a depth node.
	 *
	 * @param {Node<int>} depthNode - The depth node.
	 * @return {TextureNode} A texture node representing the texture sample.
	 */
	depth( depthNode ) {

		const textureNode = this.clone();
		textureNode.depthNode = nodeObject( depthNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	// --

	serialize( data ) {

		super.serialize( data );

		data.value = this.value.toJSON( data.meta ).uuid;
		data.sampler = this.sampler;
		data.updateMatrix = this.updateMatrix;
		data.updateType = this.updateType;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.value = data.meta.textures[ data.value ];
		this.sampler = data.sampler;
		this.updateMatrix = data.updateMatrix;
		this.updateType = data.updateType;

	}

	/**
	 * The update is used to implement the update of the uv transformation matrix.
	 */
	update() {

		const texture = this.value;
		const matrixUniform = this._matrixUniform;

		if ( matrixUniform !== null ) matrixUniform.value = texture.matrix;

		if ( texture.matrixAutoUpdate === true ) {

			texture.updateMatrix();

		}

	}

	/**
	 * Clones the texture node.
	 *
	 * @return {TextureNode} The cloned texture node.
	 */
	clone() {

		const newNode = new this.constructor( this.value, this.uvNode, this.levelNode, this.biasNode );
		newNode.sampler = this.sampler;

		return newNode;

	}

}

export default TextureNode;

/**
 * TSL function for creating a texture node.
 *
 * @tsl
 * @function
 * @param {Texture} value - The texture.
 * @param {?Node<vec2|vec3>} [uvNode=null] - The uv node.
 * @param {?Node<int>} [levelNode=null] - The level node.
 * @param {?Node<float>} [biasNode=null] - The bias node.
 * @returns {TextureNode}
 */
export const texture = /*@__PURE__*/ nodeProxy( TextureNode );

/**
 * TSL function for creating a texture node that fetches/loads texels without interpolation.
 *
 * @tsl
 * @function
 * @param {Texture} value - The texture.
 * @param {?Node<vec2|vec3>} [uvNode=null] - The uv node.
 * @param {?Node<int>} [levelNode=null] - The level node.
 * @param {?Node<float>} [biasNode=null] - The bias node.
 * @returns {TextureNode}
 */
export const textureLoad = ( ...params ) => texture( ...params ).setSampler( false );

//export const textureLevel = ( value, uv, level ) => texture( value, uv ).level( level );

/**
 * Converts a texture or texture node to a sampler.
 *
 * @tsl
 * @function
 * @param {TextureNode|Texture} aTexture - The texture or texture node to convert.
 * @returns {Node}
 */
export const sampler = ( aTexture ) => ( aTexture.isNode === true ? aTexture : texture( aTexture ) ).convert( 'sampler' );
