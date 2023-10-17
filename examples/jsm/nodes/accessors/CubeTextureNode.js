import TextureNode from './TextureNode.js';
import UniformNode from '../core/UniformNode.js';
import { reflectVector } from './ReflectVectorNode.js';
import { addNodeClass } from '../core/Node.js';
import { colorSpaceToLinear } from '../display/ColorSpaceNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeElement, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';

class CubeTextureNode extends TextureNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( value, uvNode, levelNode );

		this.isCubeTextureNode = true;

	}

	getInputType( /*builder*/ ) {

		return 'cubeTexture';

	}

	getDefaultUV() {

		return reflectVector;

	}

	setUpdateMatrix( /*updateMatrix*/ ) { } // Ignore .updateMatrix for CubeTextureNode

	generate( builder, output ) {

		const { uvNode, levelNode } = builder.getNodeProperties( this );

		const texture = this.value;

		if ( ! texture || texture.isCubeTexture !== true ) {

			throw new Error( 'CubeTextureNode: Need a three.js cube texture.' );

		}

		const textureProperty = UniformNode.prototype.generate.call( this, builder, 'cubeTexture' );

		if ( output === 'sampler' ) {

			return textureProperty + '_sampler';

		} else if ( builder.isReference( output ) ) {

			return textureProperty;

		} else {

			const nodeData = builder.getDataFromNode( this );

			let propertyName = nodeData.propertyName;

			if ( propertyName === undefined ) {

				const cubeUV = vec3( uvNode.x.negate(), uvNode.yz );
				const uvSnippet = cubeUV.build( builder, 'vec3' );

				const nodeVar = builder.getVarFromNode( this );

				propertyName = builder.getPropertyName( nodeVar );

				let snippet = null;

				if ( levelNode && levelNode.isNode === true ) {

					const levelSnippet = levelNode.build( builder, 'float' );

					snippet = builder.getTextureLevel( this, textureProperty, uvSnippet, levelSnippet );

				} else {

					snippet = builder.getTexture( this, textureProperty, uvSnippet );

				}

				builder.addLineFlowCode( `${propertyName} = ${snippet}` );

				if ( builder.context.tempWrite !== false ) {

					nodeData.snippet = snippet;
					nodeData.propertyName = propertyName;

				}

			}

			let snippet = propertyName;
			const nodeType = this.getNodeType( builder );

			if ( builder.needsColorSpaceToLinear( this.value ) ) {

				snippet = colorSpaceToLinear( expression( snippet, nodeType ), this.value.colorSpace ).setup( builder ).build( builder, nodeType );

			}

			return builder.format( snippet, nodeType, output );

		}

	}

}

export default CubeTextureNode;

export const cubeTexture = nodeProxy( CubeTextureNode );

addNodeElement( 'cubeTexture', cubeTexture );

addNodeClass( 'CubeTextureNode', CubeTextureNode );
