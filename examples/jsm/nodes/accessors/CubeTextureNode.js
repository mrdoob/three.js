import TextureNode from './TextureNode.js';
import UniformNode from '../core/UniformNode.js';
import ReflectVectorNode from './ReflectVectorNode.js';

import { negate, vec3, nodeObject } from '../shadernode/ShaderNodeBaseElements.js';

let defaultUV;

class CubeTextureNode extends TextureNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( value, uvNode, levelNode );

		this.isCubeTextureNode = true;

	}

	getInputType( /*builder*/ ) {

		return 'cubeTexture';

	}

	getDefaultUV() {

		defaultUV ||= new ReflectVectorNode();

		return defaultUV;

	}

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

				const uvNodeObject = nodeObject( uvNode );
				const cubeUV = vec3( negate( uvNodeObject.x ), uvNodeObject.yz );
				const uvSnippet = cubeUV.build( builder, 'vec3' );

				const nodeVar = builder.getVarFromNode( this, 'vec4' );

				propertyName = builder.getPropertyName( nodeVar );

				let snippet = null;

				if ( levelNode?.isNode === true) {

					const levelSnippet = levelNode.build( builder, 'float' );

					snippet = builder.getCubeTextureLevel( textureProperty, uvSnippet, levelSnippet );

				} else {

					snippet = builder.getCubeTexture( textureProperty, uvSnippet );

				}

				builder.addFlowCode( `${propertyName} = ${snippet}` );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

			}

			return builder.format( propertyName, 'vec4', output );

		}

	}

}

export default CubeTextureNode;
