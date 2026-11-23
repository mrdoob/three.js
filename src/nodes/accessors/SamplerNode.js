import Node from '../core/Node.js';
import TextureNode, { textureMatrix } from './TextureNode.js';
import { textureSize } from './TextureSizeNode.js';
import { colorSpaceToWorking } from '../display/ColorSpaceNode.js';
import { expression } from '../code/ExpressionNode.js';
import { maxMipLevel } from '../utils/MaxMipLevelNode.js';
import { nodeObject, Fn, vec3 } from '../tsl/TSLBase.js';
import { step } from '../math/MathNode.js';
import { hash } from '../core/NodeUtils.js';

import { Compatibility, GreaterCompare, GreaterEqualCompare, IntType, LessCompare, LessEqualCompare, NearestFilter, UnsignedIntType } from '../../constants.js';

import { warn, warnOnce } from '../../utils.js';

/**
 * Represents a sample of a texture: the texture coordinates and the parameters of
 * the sampling, like the mip level, bias or depth comparison. The binding of the
 * texture is a {@link TextureNode} that can be shared by many samples.
 *
 * If the sampler node is created with a texture node, it always samples that texture
 * node. If it is created with a texture, e.g. via `texture( map )`, it shares a single
 * binding with the other samples of the same texture.
 *
 * ```js
 * const map = uniformTexture( texture );
 *
 * const color = map.sample( uv().mul( 2 ) ).level( 1 );
 * ```
 *
 * @augments Node
 */
class SamplerNode extends Node {

	static get type() {

		return 'SamplerNode';

	}

	/**
	 * Constructs a new sampler node.
	 *
	 * @param {?(TextureNode|Texture)} textureNode - The texture node or the texture to sample.
	 * @param {?Node<vec2|vec3>} [uvNode=null] - The uv node.
	 * @param {?Node<int>} [levelNode=null] - The level node.
	 * @param {?Node<float>} [biasNode=null] - The bias node.
	 */
	constructor( textureNode, uvNode = null, levelNode = null, biasNode = null ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSamplerNode = true;

		/**
		 * Whether the node is a texture that can be sampled, e.g. via `sample()`. Shared by
		 * texture nodes and sampler nodes, which both provide the texture via `value`.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampleable = true;

		/**
		 * The texture node or the texture to sample. The samples of a texture share
		 * a single binding with the other samples of the same texture. The current
		 * texture is the {@link SamplerNode#value}.
		 *
		 * @type {?(TextureNode|Texture)}
		 */
		this.textureNode = textureNode;

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
		 * Represents the optional index constant of the channel to gather.
		 * This must be in range [0, 3] and a compile-time constant.
		 *
		 * @type {?Node<int>}
		 * @default null
		 */
		this.gatherNode = null;

		/**
		 * Represents the optional texel offset applied to the unnormalized texture
		 * coordinate before sampling the texture.
		 *
		 * @type {?Node<ivec2|ivec3>}
		 * @default null
		 */
		this.offsetNode = null;

		/**
		 * Whether texture values should be sampled or fetched.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.sampler = true;

		/**
		 * The texture node created for the texture, if the sampler node samples a texture.
		 *
		 * @private
		 * @type {?TextureNode}
		 * @default null
		 */
		this._textureNode = null;

	}

	/**
	 * Whether the UV transformation matrix should be applied: only with the default UVs and
	 * only if the texture node allows it, see {@link TextureNode#updateMatrix}. Use
	 * {@link textureMatrix} to apply the matrix to custom UVs.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get updateMatrix() {

		return this.uvNode === null;

	}

	set value( value ) {

		this._getTextureNode().value = value;

	}

	/**
	 * The texture value.
	 *
	 * @type {Texture}
	 */
	get value() {

		return this._getTextureNode().value;

	}

	/**
	 * Returns the default uvs of the texture node.
	 *
	 * @return {Node} The default uvs.
	 */
	getDefaultUV() {

		return this._getTextureNode().getDefaultUV();

	}

	/**
	 * Defines the update of the texture node, e.g. via `onRenderUpdate()`. A sampler node
	 * of a texture samples its own texture node afterwards, since it has its own update.
	 *
	 * @param {Function} callback - The update method.
	 * @param {string} updateType - The update type.
	 * @return {SamplerNode} A reference to this node.
	 */
	onUpdate( callback, updateType ) {

		this.textureNode = this._getTextureNode();
		this.textureNode.onUpdate( callback, updateType );

		return this;

	}

	/**
	 * Sets the name of the texture uniform.
	 *
	 * @param {string} name - The name of the uniform.
	 * @return {SamplerNode} A reference to this node.
	 */
	setName( name ) {

		this._getTextureNode().setName( name );

		return this;

	}

	/**
	 * Creates the texture node of the given texture, see {@link SamplerNode#textureNode}.
	 *
	 * @param {?Texture} texture - The texture.
	 * @return {TextureNode} The texture node.
	 */
	createTextureNode( texture ) {

		return new TextureNode( texture );

	}

	/**
	 * Returns the texture node that is sampled in the given builder. The samples of
	 * a texture use the first texture node of the same texture in the builder.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {TextureNode} The texture node.
	 */
	getTextureNode( builder ) {

		const textureNode = this._getTextureNode();
		const texture = textureNode.value;

		if ( this._isTexture() === false || ! texture || texture.isTexture !== true ) return textureNode;

		let sharedNode = builder.getNodeFromHash( texture.uuid );

		if ( sharedNode === undefined ) {

			builder.setHashNode( textureNode, texture.uuid );

			sharedNode = textureNode;

		}

		return sharedNode;

	}

	/**
	 * Returns the texture node of this sampler node: the given one, or the one created
	 * for the texture, which holds the current texture and is shared by the clones.
	 *
	 * @private
	 * @return {TextureNode} The texture node.
	 */
	_getTextureNode() {

		if ( this._isTexture() === false ) return this.textureNode;

		if ( this._textureNode === null ) {

			this._textureNode = this.createTextureNode( this.textureNode );

		}

		return this._textureNode;

	}

	/**
	 * Returns `true` if the sampler node samples a texture instead of a texture node.
	 *
	 * @private
	 * @return {boolean} Whether the sampler node samples a texture.
	 */
	_isTexture() {

		return this.textureNode === null || this.textureNode.isTextureNode !== true;

	}

	/**
	 * Overwritten since the texture's type and filters influence the generated shader code.
	 * The cache key of a texture node is part of the cache key of its children.
	 *
	 * @return {number} The custom cache key.
	 */
	customCacheKey() {

		const texture = this.value;

		if ( this._isTexture() === false || ! texture ) return this.id;

		return hash( this.id, texture.type, texture.minFilter, texture.magFilter );

	}

	/**
	 * Overwritten since each sample generates its own code snippet,
	 * and the color space conversion is applied to each usage.
	 *
	 * @return {boolean} Whether this node is cacheable or not.
	 */
	isCacheable( /*builder*/ ) {

		return false;

	}

	/**
	 * Overwritten since the node type is inferred from the texture type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	generateNodeType( builder ) {

		if ( this.gatherNode !== null ) {

			return 'vec4';

		}

		return this._getTextureNode().getNodeType( builder );

	}

	/**
	 * Setups the sampler node by preparing the internal nodes for code generation.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		const textureNode = this.getTextureNode( builder );

		textureNode.build( builder ); // the texture node is set up first, e.g. to update its texture

		const properties = builder.getNodeProperties( this );
		properties.textureNode = textureNode;

		const texture = textureNode.value;
		const updateMatrix = this.updateMatrix === true && textureNode.updateMatrix === true;

		//

		const uvNode = Fn( () => {

			let uvNode = this.uvNode;

			if ( ( ! uvNode || builder.context.forceUVContext === true ) && builder.context.getUV ) {

				uvNode = builder.context.getUV( this, builder );

			}

			if ( ! uvNode ) uvNode = textureNode.getDefaultUV();

			if ( updateMatrix === true ) {

				uvNode = textureNode.getTransformedUV( uvNode );

			}

			uvNode = textureNode.setupUV( builder, uvNode, this );

			return uvNode;

		} )();

		//

		let levelNode = this.levelNode;

		if ( levelNode === null && builder.context.getTextureLevel ) {

			levelNode = builder.context.getTextureLevel( this );

		}

		//

		let compareNode = null;
		let compareStepNode = null;

		if ( this.compareNode !== null ) {

			if ( builder.renderer.hasCompatibility( Compatibility.TEXTURE_COMPARE ) ) {

				compareNode = this.compareNode;

			} else {

				const compareFunction = texture.compareFunction;

				if ( compareFunction === null || compareFunction === LessCompare || compareFunction === LessEqualCompare || compareFunction === GreaterCompare || compareFunction === GreaterEqualCompare ) {

					compareStepNode = this.compareNode;

				} else {

					compareNode = this.compareNode;

					warnOnce( 'TSL: Only "LessCompare", "LessEqualCompare", "GreaterCompare" and "GreaterEqualCompare" are supported for depth texture comparison fallback.' );

				}

			}

		}

		// the binding of the texture depends on how it is sampled

		if ( compareNode !== null ) textureNode._samplerComparison = true;
		if ( this.gatherNode !== null ) builder.addSamplerNode( textureNode );

		// the context can provide analytic gradients of the default uv, e.g. if the uv is reconstructed per fragment

		let gradNode = this.gradNode;

		if ( gradNode === null && ! this.uvNode && levelNode === null && this.biasNode === null && this.sampler === true && builder.context.getTextureGradient ) {

			const gradient = builder.context.getTextureGradient( this, builder );

			if ( gradient ) {

				gradNode = updateMatrix === true ? gradient.map( ( node ) => textureMatrix( textureNode ).mul( vec3( node, 0 ) ).xy ) : gradient;

			}

		}

		properties.uvNode = uvNode;
		properties.levelNode = levelNode;
		properties.biasNode = this.biasNode;
		properties.compareNode = compareNode;
		properties.compareStepNode = compareStepNode;
		// the gradients are properties of their own, so they are analyzed as the other inputs
		properties.gradNodeX = gradNode !== null ? gradNode[ 0 ] : null;
		properties.gradNodeY = gradNode !== null ? gradNode[ 1 ] : null;
		properties.gatherNode = this.gatherNode;
		properties.depthNode = this.depthNode;
		properties.offsetNode = this.offsetNode;

	}

	/**
	 * Generates the code snippet of the sampler node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} output - The current output.
	 * @return {string} The generated code snippet.
	 */
	generate( builder, output ) {

		const properties = builder.getNodeProperties( this );
		const textureNode = properties.textureNode;

		if ( /^sampler/.test( output ) || builder.isReference( output ) ) {

			return textureNode.build( builder, output );

		}

		const texture = textureNode.value;
		const textureProperty = textureNode.build( builder, 'property' );

		const nodeData = builder.getDataFromNode( this );

		const nodeType = this.getNodeType( builder );

		let propertyName = nodeData.propertyName;

		if ( propertyName === undefined ) {

			const { uvNode, levelNode, biasNode, compareNode, compareStepNode, depthNode, gradNodeX, gradNodeY, gatherNode, offsetNode } = properties;

			const uvSnippet = textureNode.generateUV( builder, uvNode, this );
			const levelSnippet = levelNode ? levelNode.build( builder, 'float' ) : null;
			const biasSnippet = biasNode ? biasNode.build( builder, 'float' ) : null;
			const depthSnippet = depthNode ? depthNode.build( builder, 'int' ) : null;
			const compareSnippet = compareNode ? compareNode.build( builder, 'float' ) : null;
			const compareStepSnippet = compareStepNode ? compareStepNode.build( builder, 'float' ) : null;
			const gradSnippet = gradNodeX ? [ gradNodeX.build( builder, 'vec2' ), gradNodeY.build( builder, 'vec2' ) ] : null;
			const gatherSnippet = gatherNode ? gatherNode.build( builder, 'int' ) : null;
			const offsetSnippet = offsetNode ? textureNode.generateOffset( builder, offsetNode ) : null;

			const flipYUniform = textureNode._flipYUniform;
			const flipYSnippet = flipYUniform ? flipYUniform.build( builder, 'bool' ) : null;

			let finalDepthSnippet = depthSnippet;

			if ( finalDepthSnippet === null && texture.isArrayTexture && textureNode.isTexture3DNode !== true ) {

				finalDepthSnippet = '0';

			}

			const nodeVar = builder.getVarFromNode( this );

			propertyName = builder.getPropertyName( nodeVar );

			let snippet = textureNode.generateSnippet( builder, textureProperty, uvSnippet, levelSnippet, biasSnippet, finalDepthSnippet, compareSnippet, gradSnippet, gatherSnippet, offsetSnippet, flipYSnippet, this );

			let snippetType;

			if ( texture.isDepthTexture === true && gatherSnippet === null ) {

				snippetType = 'float';

			} else {

				snippetType = texture.type === UnsignedIntType ? 'uvec4' : ( texture.type === IntType ? 'ivec4' : 'vec4' );

			}

			snippet = builder.format( snippet, snippetType, nodeType );

			if ( compareStepSnippet !== null ) {

				const compareFunction = texture.compareFunction;

				if ( compareFunction === GreaterCompare || compareFunction === GreaterEqualCompare ) {

					snippet = step( expression( snippet, nodeType ), expression( compareStepSnippet, 'float' ) ).build( builder, nodeType );

				} else {

					snippet = step( expression( compareStepSnippet, 'float' ), expression( snippet, nodeType ) ).build( builder, nodeType );

				}

			}

			builder.addLineFlowCode( `${propertyName} = ${snippet}`, this );

			nodeData.snippet = snippet;
			nodeData.propertyName = propertyName;

		}

		let snippet = propertyName;

		if ( builder.needsToWorkingColorSpace( texture ) ) {

			snippet = colorSpaceToWorking( expression( snippet, nodeType ), texture.colorSpace ).setup( builder ).build( builder, nodeType );

		}

		return builder.format( snippet, nodeType, output );

	}

	/**
	 * This method has no effect.
	 *
	 * @deprecated Use {@link textureMatrix} to transform explicit UVs instead.
	 * @param {boolean} value - The previous UV matrix setting.
	 * @return {SamplerNode} A reference to this node.
	 */
	setUpdateMatrix( /* value */ ) {

		warnOnce( 'TSL: "TextureNode.setUpdateMatrix()" is deprecated and has no effect. Use "textureMatrix()" to transform explicit UVs instead.' ); // @deprecated r188

		return this;

	}

	/**
	 * Sets the sampler value.
	 *
	 * @param {boolean} value - The sampler value to set.
	 * @return {SamplerNode} A reference to this sampler node.
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

	/**
	 * Samples the texture with the given uv node.
	 *
	 * @param {Node} uvNode - The uv node.
	 * @return {SamplerNode} A sampler node representing the texture sample.
	 */
	sample( uvNode ) {

		const samplerNode = this.clone();
		samplerNode.uvNode = nodeObject( uvNode );

		return samplerNode;

	}

	/**
	 * Fetches/loads texels without interpolation.
	 *
	 * @param {Node<uvec2>} uvNode - The integer texel coordinates (not normalized uvs).
	 * @returns {SamplerNode} A sampler node representing the texture load.
	 */
	load( uvNode ) {

		return this.sample( uvNode ).setSampler( false );

	}

	/**
	 * Samples a blurred version of the texture by defining an internal bias.
	 *
	 * @param {Node<float>} amountNode - How blurred the texture should be.
	 * @return {SamplerNode} A sampler node representing the texture sample.
	 */
	blur( amountNode ) {

		const samplerNode = this.clone();
		samplerNode.biasNode = nodeObject( amountNode ).mul( maxMipLevel( samplerNode ) );

		const map = samplerNode.value;

		if ( samplerNode.generateMipmaps === false && ( map && map.generateMipmaps === false || map.minFilter === NearestFilter || map.magFilter === NearestFilter ) ) {

			warn( 'TSL: texture().blur() requires mipmaps and sampling. Use .generateMipmaps=true and .minFilter/.magFilter=THREE.LinearFilter in the Texture.' );

			samplerNode.biasNode = null;

		}

		return samplerNode;

	}

	/**
	 * Samples a specific mip of the texture.
	 *
	 * @param {Node<int>} levelNode - The mip level to sample.
	 * @return {SamplerNode} A sampler node representing the texture sample.
	 */
	level( levelNode ) {

		const samplerNode = this.clone();
		samplerNode.levelNode = nodeObject( levelNode );

		return samplerNode;

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
	 * @return {SamplerNode} A sampler node representing the texture sample.
	 */
	bias( biasNode ) {

		const samplerNode = this.clone();
		samplerNode.biasNode = nodeObject( biasNode );

		return samplerNode;

	}

	/**
	 * Samples the texture by executing a compare operation.
	 *
	 * @param {Node<float>} compareNode - The node that defines the compare value.
	 * @return {SamplerNode} A sampler node representing the texture sample.
	 */
	compare( compareNode ) {

		const samplerNode = this.clone();
		samplerNode.compareNode = nodeObject( compareNode );

		return samplerNode;

	}

	/**
	 * Samples the texture using an explicit gradient.
	 *
	 * @param {Node<vec2>} gradNodeX - The gradX node.
	 * @param {Node<vec2>} gradNodeY - The gradY node.
	 * @return {SamplerNode} A sampler node representing the texture sample.
	 */
	grad( gradNodeX, gradNodeY ) {

		const samplerNode = this.clone();
		samplerNode.gradNode = [ nodeObject( gradNodeX ), nodeObject( gradNodeY ) ];

		return samplerNode;

	}

	/**
	 * Gathers four texels from the texture.
	 *
	 * @param {Node<int>} gatherNode - The index of the channel to read. This must be in range [0, 3] and a compile-time constant.
	 * @return {SamplerNode} A sampler node representing the texture sample.
	 */
	gather( gatherNode = 0 ) {

		const samplerNode = this.clone();
		samplerNode.gatherNode = nodeObject( gatherNode );

		return samplerNode;

	}

	/**
	 * Samples the texture by defining a depth node.
	 *
	 * @param {Node<int>} depthNode - The depth node.
	 * @return {SamplerNode} A sampler node representing the texture sample.
	 */
	depth( depthNode ) {

		const samplerNode = this.clone();
		samplerNode.depthNode = nodeObject( depthNode );

		return samplerNode;

	}

	/**
	 * Samples the texture by defining an offset node.
	 *
	 * @param {Node<ivec2>} offsetNode - The offset node.
	 * @return {SamplerNode} A sampler node representing the texture sample.
	 */
	offset( offsetNode ) {

		const samplerNode = this.clone();
		samplerNode.offsetNode = nodeObject( offsetNode );

		return samplerNode;

	}

	// --

	serialize( data ) {

		super.serialize( data );

		data.sampler = this.sampler;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.sampler = data.sampler;

	}

	/**
	 * Clones the sampler node. The clone samples the same texture node or texture.
	 *
	 * @return {SamplerNode} The cloned sampler node.
	 */
	clone() {

		const newNode = new this.constructor( this.textureNode, this.uvNode, this.levelNode, this.biasNode );
		newNode._textureNode = this._isTexture() ? this._getTextureNode() : null; // the clones of a texture sample the same texture
		newNode.sampler = this.sampler;
		newNode.depthNode = this.depthNode;
		newNode.compareNode = this.compareNode;
		newNode.gradNode = this.gradNode;
		newNode.gatherNode = this.gatherNode;
		newNode.offsetNode = this.offsetNode;

		return newNode;

	}

}

export default SamplerNode;

/**
 * Returns a sampler node for the given texture, texture node or sampler node.
 *
 * @param {Function} SamplerNodeClass - The class of the sampler node created for a texture.
 * @param {Texture|TextureNode|SamplerNode} value - The texture, texture node or sampler node.
 * @param {?Node} [uvNode=null] - The uv node.
 * @param {?Node} [levelNode=null] - The level node.
 * @param {?Node} [biasNode=null] - The bias node.
 * @returns {SamplerNode}
 */
export function sampleTexture( SamplerNodeClass, value, uvNode = null, levelNode = null, biasNode = null ) {

	let samplerNode;

	if ( value && value.isSamplerNode === true ) {

		samplerNode = value.clone();

	} else if ( value && value.isTextureNode === true ) {

		samplerNode = value._getSamplerNode().clone();

	} else {

		samplerNode = new SamplerNodeClass( value, uvNode !== null ? nodeObject( uvNode ) : null );

		uvNode = null;

	}

	if ( uvNode !== null ) samplerNode.uvNode = nodeObject( uvNode );
	if ( levelNode !== null ) samplerNode.levelNode = nodeObject( levelNode );
	if ( biasNode !== null ) samplerNode.biasNode = nodeObject( biasNode );

	return samplerNode;

}
