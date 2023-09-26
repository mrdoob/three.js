import UniformNode, { uniform } from '../core/UniformNode.js';
import { uv } from './UVNode.js';
import { textureSize } from './TextureSizeNode.js';
import { colorSpaceToLinear } from '../display/ColorSpaceNode.js';
import { context } from '../core/ContextNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy, vec3, nodeObject } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';

class TextureNode extends UniformNode {

	constructor( value, uvNode = null, levelNode = null, compareNode = null ) {

		super( value );

		this.isTextureNode = true;

		this.uvNode = uvNode;
		this.levelNode = levelNode;
		this.compareNode = compareNode;

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

	updateReference( /*frame*/ ) {

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

	setup( builder ) {

		const properties = builder.getNodeProperties( this );

		//

		let uvNode = this.uvNode;

		if ( uvNode === null && builder.context.getUVNode ) {

			uvNode = builder.context.getUVNode( this );

		}

		if ( ! uvNode ) uvNode = this.getDefaultUV();

		if ( this.updateMatrix === true ) {

			uvNode = this.getTransformedUV( uvNode );

		}

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

		const compareNode = this.compareNode;
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

				} else if ( compareNode !== null ) {

					const compareSnippet = compareNode.build( builder, 'float' );

					snippet = builder.getTextureCompare( texture, textureProperty, uvSnippet, compareSnippet );

				} else {

					snippet = builder.getTexture( texture, textureProperty, uvSnippet );

				}

				builder.addLineFlowCode( `${propertyName} = ${snippet}` );

				if ( builder.context.tempWrite !== false ) {

					nodeData.snippet = snippet;
					nodeData.propertyName = propertyName;

				}

			}

			let snippet = propertyName;

			if ( builder.needsColorSpaceToLinear( this.value ) ) {

				snippet = colorSpaceToLinear( expression( snippet, nodeType ), this.value.colorSpace ).setup( builder ).build( builder, nodeType );

			}

			return builder.format( snippet, nodeType, output );

		}

	}

	uv( uvNode ) {

		const textureNode = this.clone();
		textureNode.uvNode = uvNode;

		return nodeObject( textureNode );

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

	compare( compareNode ) {

		const textureNode = this.clone();
		textureNode.compareNode = nodeObject( compareNode );

		return nodeObject( textureNode );

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

		return new this.constructor( this.value, this.uvNode, this.levelNode, this.compareNode );

	}

}

export default TextureNode;

export const texture = nodeProxy( TextureNode );
//export const textureLevel = ( value, uv, level ) => texture( value, uv ).level( level );

export const sampler = ( aTexture ) => ( aTexture.isNode === true ? aTexture : texture( aTexture ) ).convert( 'sampler' );

addNodeElement( 'texture', texture );
//addNodeElement( 'textureLevel', textureLevel );

addNodeClass( 'TextureNode', TextureNode );
