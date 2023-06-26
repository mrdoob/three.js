import UniformNode, { uniform } from '../core/UniformNode.js';
import { uv } from './UVNode.js';
import { textureSize } from './TextureSizeNode.js';
import { colorSpaceToLinear } from '../display/ColorSpaceNode.js';
import { context } from '../core/ContextNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';

class TextureNode extends UniformNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( value );

		this.isTextureNode = true;

		this.uvNode = uvNode;
		this.levelNode = levelNode;

		this.updateType = NodeUpdateType.FRAME;

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

		const texture = this.value;

		return uniform( texture.matrix ).mul( vec3( uv( texture.channel ), 1 ) );

	}

	construct( builder ) {

		const properties = builder.getNodeProperties( this );

		//

		let uvNode = this.uvNode;

		if ( uvNode === null && builder.context.getUVNode ) {

			uvNode = builder.context.getUVNode( this );

		}

		uvNode || ( uvNode = this.getDefaultUV() );

		//

		let levelNode = this.levelNode;

		if ( levelNode === null && builder.context.getSamplerLevelNode ) {

			levelNode = builder.context.getSamplerLevelNode( this );

		}

		//

		properties.uvNode = uvNode;
		properties.levelNode = levelNode ? builder.context.getMIPLevelAlgorithmNode( this, levelNode ) : null;

	}

	generate( builder, output ) {

		const { uvNode, levelNode } = builder.getNodeProperties( this );

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

			const nodeType = this.getNodeType( builder );
			const nodeData = builder.getDataFromNode( this );

			let propertyName = nodeData.propertyName;

			if ( propertyName === undefined ) {

				const uvSnippet = uvNode.build( builder, 'vec2' );
				const nodeVar = builder.getVarFromNode( this, nodeType );

				propertyName = builder.getPropertyName( nodeVar );

				let snippet = null;

				if ( levelNode && levelNode.isNode === true ) {

					const levelSnippet = levelNode.build( builder, 'float' );

					snippet = builder.getTextureLevel( texture, textureProperty, uvSnippet, levelSnippet );

				} else {

					snippet = builder.getTexture( texture, textureProperty, uvSnippet );

				}

				builder.addLineFlowCode( `${propertyName} = ${snippet}` );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

			}

			let snippet = propertyName;

			if ( builder.needsColorSpaceToLinear( this.value ) ) {

				snippet = colorSpaceToLinear( expression( snippet, nodeType ), this.value.colorSpace ).construct( builder ).build( builder, nodeType );

			}

			return builder.format( snippet, nodeType, output );

		}

	}

	uv( uvNode ) {

		const textureNode = this.clone();
		textureNode.uvNode = uvNode;

		return textureNode;

	}

	level( levelNode ) {

		const textureNode = this.clone();
		textureNode.levelNode = levelNode;

		return context( textureNode, {
			getMIPLevelAlgorithmNode: ( textureNode, levelNode ) => levelNode
		} );

	}

	size( levelNode ) {

		return textureSize( this, levelNode );

	}

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

		return new this.constructor( this.value, this.uvNode, this.levelNode );

	}

}

export default TextureNode;

export const texture = nodeProxy( TextureNode );
//export const textureLevel = ( value, uv, level ) => texture( value, uv ).level( level );

export const sampler = ( aTexture ) => ( aTexture.isNode === true ? aTexture : texture( aTexture ) ).convert( 'sampler' );

addNodeElement( 'texture', texture );
//addNodeElement( 'textureLevel', textureLevel );

addNodeClass( TextureNode );
