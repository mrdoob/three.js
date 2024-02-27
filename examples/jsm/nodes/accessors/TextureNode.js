import UniformNode, { uniform } from '../core/UniformNode.js';
import { uv } from './UVNode.js';
import { textureSize } from './TextureSizeNode.js';
import { colorSpaceToLinear } from '../display/ColorSpaceNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeClass } from '../core/Node.js';
import { maxMipLevel } from '../utils/MaxMipLevelNode.js';
import { addNodeElement, nodeProxy, vec3, nodeObject } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';

class TextureNode extends UniformNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( value );

		this.isTextureNode = true;

		this.uvNode = uvNode;
		this.levelNode = levelNode;
		this.compareNode = null;
		this.depthNode = null;

		this.sampler = true;
		this.updateMatrix = false;
		this.updateType = NodeUpdateType.NONE;

		this.setUpdateMatrix( uvNode === null );

	}

	getUniformHash( /*builder*/ ) {

		return this.value.uuid;

	}

	getNodeType( /*builder*/ ) {

		if ( this.value.isDepthTexture === true ) return 'float';

		return 'vec4';

	}

	getInputType( /*builder*/ ) {

		return 'texture';

	}

	getDefaultUV() {

		return uv( this.value.channel );

	}

	setReference( /*state*/ ) {

		return this.value;

	}

	getTransformedUV( uvNode ) {

		const texture = this.value;

		return uniform( texture.matrix ).mul( vec3( uvNode, 1 ) ).xy;

	}

	setUpdateMatrix( value ) {

		this.updateMatrix = value;
		this.updateType = value ? NodeUpdateType.FRAME : NodeUpdateType.NONE;

		return this;

	}

	setupUV( builder, uvNode ) {

		const texture = this.value;

		if ( builder.isFlipY() && ( texture.isRenderTargetTexture === true || texture.isFramebufferTexture === true || texture.isDepthTexture === true ) ) {

			uvNode = uvNode.setY( uvNode.y.oneMinus() );

		}

		return uvNode;

	}

	setup( builder ) {

		const properties = builder.getNodeProperties( this );

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

		if ( levelNode !== null && builder.context.getTextureLevelAlgorithm !== undefined ) {

			levelNode = builder.context.getTextureLevelAlgorithm( this, levelNode );

		}

		//

		properties.uvNode = uvNode;
		properties.levelNode = levelNode;
		properties.compareNode = this.compareNode;
		properties.depthNode = this.depthNode;

	}

	generateUV( builder, uvNode ) {

		return uvNode.build( builder, this.sampler === true ? 'vec2' : 'ivec2' );

	}

	generateSnippet( builder, textureProperty, uvSnippet, levelSnippet, depthSnippet, compareSnippet ) {

		const texture = this.value;

		let snippet;

		if ( levelSnippet ) {

			snippet = builder.generateTextureLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet );

		} else if ( compareSnippet ) {

			snippet = builder.generateTextureCompare( texture, textureProperty, uvSnippet, compareSnippet, depthSnippet );

		} else if ( this.sampler === false ) {

			snippet = builder.generateTextureLoad( texture, textureProperty, uvSnippet, depthSnippet );

		} else {

			snippet = builder.generateTexture( texture, textureProperty, uvSnippet, depthSnippet );

		}

		return snippet;

	}

	generate( builder, output ) {

		const properties = builder.getNodeProperties( this );

		const texture = this.value;

		if ( ! texture || texture.isTexture !== true ) {

			throw new Error( 'TextureNode: Need a three.js texture.' );

		}

		const textureProperty = super.generate( builder, 'property' );

		if ( output === 'sampler' ) {

			return textureProperty + '_sampler';

		} else if ( builder.isReference( output ) ) {

			return textureProperty;

		} else {

			const nodeData = builder.getDataFromNode( this );

			let propertyName = nodeData.propertyName;

			if ( propertyName === undefined ) {

				const { uvNode, levelNode, compareNode, depthNode } = properties;

				const uvSnippet = this.generateUV( builder, uvNode );
				const levelSnippet = levelNode ? levelNode.build( builder, 'float' ) : null;
				const depthSnippet = depthNode ? depthNode.build( builder, 'int' ) : null;
				const compareSnippet = compareNode ? compareNode.build( builder, 'float' ) : null;

				const nodeVar = builder.getVarFromNode( this );

				propertyName = builder.getPropertyName( nodeVar );

				const snippet = this.generateSnippet( builder, textureProperty, uvSnippet, levelSnippet, depthSnippet, compareSnippet );

				builder.addLineFlowCode( `${propertyName} = ${snippet}` );

				if ( builder.context.tempWrite !== false ) {

					nodeData.snippet = snippet;
					nodeData.propertyName = propertyName;

				}

			}

			let snippet = propertyName;
			const nodeType = this.getNodeType( builder );

			if ( builder.needsColorSpaceToLinear( texture ) ) {

				snippet = colorSpaceToLinear( expression( snippet, nodeType ), texture.colorSpace ).setup( builder ).build( builder, nodeType );

			}

			return builder.format( snippet, nodeType, output );

		}

	}

	setSampler( value ) {

		this.sampler = value;

		return this;

	}

	getSampler() {

		return this.sampler;

	}

	// @TODO: Move to TSL

	uv( uvNode ) {

		const textureNode = this.clone();
		textureNode.uvNode = uvNode;

		return nodeObject( textureNode );

	}

	blur( levelNode ) {

		const textureNode = this.clone();
		textureNode.levelNode = levelNode.mul( maxMipLevel( textureNode ) );

		return nodeObject( textureNode );

	}

	level( levelNode ) {

		const textureNode = this.clone();
		textureNode.levelNode = levelNode;

		return textureNode;

	}

	size( levelNode ) {

		return textureSize( this, levelNode );

	}

	compare( compareNode ) {

		const textureNode = this.clone();
		textureNode.compareNode = nodeObject( compareNode );

		return nodeObject( textureNode );

	}

	depth( depthNode ) {

		const textureNode = this.clone();
		textureNode.depthNode = nodeObject( depthNode );

		return nodeObject( textureNode );

	}

	// --

	serialize( data ) {

		super.serialize( data );

		data.value = this.value.toJSON( data.meta ).uuid;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.value = data.meta.textures[ data.value ];

	}

	update() {

		const texture = this.value;

		if ( texture.matrixAutoUpdate === true ) {

			texture.updateMatrix();

		}

	}

	clone() {

		const newNode = new this.constructor( this.value, this.uvNode, this.levelNode );
		newNode.sampler = this.sampler;

		return newNode;

	}

}

export default TextureNode;

export const texture = nodeProxy( TextureNode );
export const textureLoad = ( ...params ) => texture( ...params ).setSampler( false );

//export const textureLevel = ( value, uv, level ) => texture( value, uv ).level( level );

export const sampler = ( aTexture ) => ( aTexture.isNode === true ? aTexture : texture( aTexture ) ).convert( 'sampler' );

addNodeElement( 'texture', texture );
//addNodeElement( 'textureLevel', textureLevel );

addNodeClass( 'TextureNode', TextureNode );
