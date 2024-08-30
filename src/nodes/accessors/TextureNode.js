import { registerNode } from '../core/Node.js';
import UniformNode, { uniform } from '../core/UniformNode.js';
import { uv } from './UV.js';
import { textureSize } from './TextureSizeNode.js';
import { toWorkingColorSpace } from '../display/ColorSpaceNode.js';
import { expression } from '../code/ExpressionNode.js';
import { maxMipLevel } from '../utils/MaxMipLevelNode.js';
import { nodeProxy, vec3, nodeObject } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';

import { IntType, UnsignedIntType } from '../../constants.js';

class TextureNode extends UniformNode {

	constructor( value, uvNode = null, levelNode = null, biasNode = null ) {

		super( value );

		this.isTextureNode = true;

		this.uvNode = uvNode;
		this.levelNode = levelNode;
		this.biasNode = biasNode;
		this.compareNode = null;
		this.depthNode = null;
		this.gradNode = null;

		this.sampler = true;
		this.updateMatrix = false;
		this.updateType = NodeUpdateType.NONE;

		this.referenceNode = null;

		this._value = value;
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

	get value() {

		return this.referenceNode ? this.referenceNode.value : this._value;

	}

	getUniformHash( /*builder*/ ) {

		return this.value.uuid;

	}

	getNodeType( /*builder*/ ) {

		if ( this.value.isDepthTexture === true ) return 'float';

		if ( this.value.type === UnsignedIntType ) {

			return 'uvec4';

		} else if ( this.value.type === IntType ) {

			return 'ivec4';

		}

		return 'vec4';

	}

	getInputType( /*builder*/ ) {

		return 'texture';

	}

	getDefaultUV() {

		return uv( this.value.channel );

	}

	updateReference( /*state*/ ) {

		return this.value;

	}

	getTransformedUV( uvNode ) {

		if ( this._matrixUniform === null ) this._matrixUniform = uniform( this.value.matrix );

		return this._matrixUniform.mul( vec3( uvNode, 1 ) ).xy;

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
		properties.referenceNode = this.referenceNode;

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

	generateUV( builder, uvNode ) {

		return uvNode.build( builder, this.sampler === true ? 'vec2' : 'ivec2' );

	}

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

				builder.addLineFlowCode( `${propertyName} = ${snippet}` );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

			}

			let snippet = propertyName;
			const nodeType = this.getNodeType( builder );

			if ( builder.needsToWorkingColorSpace( texture ) ) {

				snippet = toWorkingColorSpace( expression( snippet, nodeType ), texture.colorSpace ).setup( builder ).build( builder, nodeType );

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
		textureNode.uvNode = nodeObject( uvNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	blur( amountNode ) {

		const textureNode = this.clone();
		textureNode.biasNode = nodeObject( amountNode ).mul( maxMipLevel( textureNode ) );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	level( levelNode ) {

		const textureNode = this.clone();
		textureNode.levelNode = nodeObject( levelNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	size( levelNode ) {

		return textureSize( this, levelNode );

	}

	bias( biasNode ) {

		const textureNode = this.clone();
		textureNode.biasNode = nodeObject( biasNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	compare( compareNode ) {

		const textureNode = this.clone();
		textureNode.compareNode = nodeObject( compareNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	grad( gradNodeX, gradNodeY ) {

		const textureNode = this.clone();
		textureNode.gradNode = [ nodeObject( gradNodeX ), nodeObject( gradNodeY ) ];
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

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

	update() {

		const texture = this.value;
		const matrixUniform = this._matrixUniform;

		if ( matrixUniform !== null ) matrixUniform.value = texture.matrix;

		if ( texture.matrixAutoUpdate === true ) {

			texture.updateMatrix();

		}

	}

	clone() {

		const newNode = new this.constructor( this.value, this.uvNode, this.levelNode, this.biasNode );
		newNode.sampler = this.sampler;

		return newNode;

	}

}

export default TextureNode;

TextureNode.type = /*@__PURE__*/ registerNode( 'Texture', TextureNode );

export const texture = /*@__PURE__*/ nodeProxy( TextureNode );
export const textureLoad = ( ...params ) => texture( ...params ).setSampler( false );

//export const textureLevel = ( value, uv, level ) => texture( value, uv ).level( level );

export const sampler = ( aTexture ) => ( aTexture.isNode === true ? aTexture : texture( aTexture ) ).convert( 'sampler' );
