import UniformNode from '../core/UniformNode.js';
import { uv } from './UVNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

let defaultUV;

class TextureNode extends UniformNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( value, 'vec4' );

		this.isTextureNode = true;

		this.uvNode = uvNode;
		this.levelNode = levelNode;

	}

	getUniformHash( /*builder*/ ) {

		return this.value.uuid;

	}

	getInputType( /*builder*/ ) {

		return 'texture';

	}

	getDefaultUV() {

		return defaultUV || ( defaultUV = uv() );

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

		const textureProperty = super.generate( builder, 'texture' );

		if ( output === 'sampler' ) {

			return textureProperty + '_sampler';

		} else if ( builder.isReference( output ) ) {

			return textureProperty;

		} else {

			const nodeData = builder.getDataFromNode( this );

			let propertyName = nodeData.propertyName;

			if ( propertyName === undefined ) {

				const uvSnippet = uvNode.build( builder, 'vec2' );
				const nodeVar = builder.getVarFromNode( this, 'vec4' );

				propertyName = builder.getPropertyName( nodeVar );

				let snippet = null;

				if ( levelNode && levelNode.isNode === true ) {

					const levelSnippet = levelNode.build( builder, 'float' );

					snippet = builder.getTextureLevel( textureProperty, uvSnippet, levelSnippet );

				} else {

					snippet = builder.getTexture( textureProperty, uvSnippet );

				}

				builder.addFlowCode( `${propertyName} = ${snippet}` );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

			}

			return builder.format( propertyName, 'vec4', output );

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.value = this.value.toJSON( data.meta ).uuid;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.value = data.meta.textures[ data.value ];

	}

}

export default TextureNode;

export const texture = nodeProxy( TextureNode );
export const sampler = ( aTexture ) => ( aTexture.isNode === true ? aTexture : texture( aTexture ) ).convert( 'sampler' );

addNodeElement( 'texture', texture );

addNodeClass( TextureNode );
