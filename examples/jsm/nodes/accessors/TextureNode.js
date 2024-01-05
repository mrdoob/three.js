import UniformNode, { uniform } from '../core/UniformNode.js';
import { addNodeClass } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { uv } from './UVNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeElement, nodeProxy, vec3, nodeObject } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';

class TextureUniformNode extends UniformNode {

	constructor( value ) {

		super( value, 'property' );

	}

	getHash( /*builder*/ ) {

		return this.value ? this.value.uuid : this.uuid;

	}

	getInputType( /*builder*/ ) {

		return this.value.isCubeTexture === true ? 'cubeTexture' : 'texture';

	}

	setUpdateMatrix( value ) {

		if ( value === true ) {

			this.updateType = NodeUpdateType.FRAME;

		}

	}

	update() {

		if ( this.value.matrixAutoUpdate === true ) {

			this.value.updateMatrix();

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

class TextureNode extends TempNode {

	constructor( value, uvNode = null, levelNode = null, compareNode = null ) {

		super( value && value.isDepthTexture === true ? 'float' : 'vec4' );

		this.isTextureNode = true;

		this.texture = nodeObject( new TextureUniformNode( value ) );

		this.uvNode = uvNode;
		this.levelNode = levelNode;
		this.compareNode = compareNode;

		this.setUpdateMatrix( uvNode === null );

	}

	get value() { // backwards compatibility, @TODO: remove this

		return this.texture.value;

	}

	set value( value ) { // backwards compatibility, @TODO: remove this

		this.texture.value = value;

	}

	getDefaultUV() {

		return uv( this.texture.value.channel );

	}

	getTransformedUV( uvNode ) {

		return uniform( this.texture.value.matrix ).mul( vec3( uvNode, 1 ) ).xy;

	}

	setUpdateMatrix( value ) {

		this.updateMatrix = value;
		this.texture.setUpdateMatrix( value );

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
		properties.levelNode = levelNode ? builder.context.getMipLevelAlgorithmNode( this, levelNode ) : null;
		properties.compareNode = this.compareNode;

	}

	generate( builder, output ) {

		const { uvNode, levelNode, compareNode } = builder.getNodeProperties( this );

		const texture = this.texture.value;

		if ( ! texture || texture.isTexture !== true ) {

			throw new Error( 'TextureNode: Need a three.js texture.' );

		}

		const textureProperty = this.texture.build( builder );

		if ( output === 'sampler' ) {

			return textureProperty + '_sampler';

		} else if ( builder.isReference( output ) ) {

			return textureProperty;

		}

		const uvSnippet = uvNode.build( builder, this.isCubeTextureNode === true ? 'vec3' : 'vec2' );

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

		const nodeType = this.getNodeType( builder );

		if ( builder.needsColorSpaceToLinear( this.texture.value ) ) {

			snippet = expression( snippet, nodeType ).temp().colorSpaceToLinear( this.texture.value.colorSpace ).fullBuild( builder, nodeType );

		}

		return builder.format( snippet, nodeType, output );

	}

	uv( uvNode ) {

		const textureNode = this.clone();
		textureNode.uvNode = uvNode;
		return textureNode;

	}

	level( levelNode ) {

		const textureNode = this.clone();
		textureNode.levelNode = levelNode;
		return textureNode.context( {
			getMipLevelAlgorithmNode: ( textureNode, levelNode ) => levelNode
		} );

	}

	size( levelNode ) {

		return this.textureSize( levelNode );

	}

	compare( compareNode ) {

		const textureNode = this.clone();
		textureNode.compareNode = nodeObject( compareNode );
		return textureNode;

	}

	clone() {

		return nodeObject( new this.constructor( this.texture.value, this.uvNode, this.levelNode, this.compareNode ) );

	}

}

export default TextureNode;

export const texture = nodeProxy( TextureNode );
//export const textureLevel = ( value, uv, level ) => texture( value, uv ).level( level );

export const sampler = ( aTexture ) => ( aTexture.isNode === true ? aTexture : texture( aTexture ) ).convert( 'sampler' );

addNodeElement( 'texture', texture );
//addNodeElement( 'textureLevel', textureLevel );

addNodeClass( 'TextureUniformNode', TextureUniformNode );
addNodeClass( 'TextureNode', TextureNode );
