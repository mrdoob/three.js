import TextureNode from './TextureNode.js';
import { reflectVector } from './ReflectVectorNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';

class CubeTextureNode extends TextureNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( value, uvNode, levelNode );

		this.isCubeTextureNode = true;

	}

	getDefaultUV() {

		return reflectVector;

	}

	setUpdateMatrix( /*updateMatrix*/ ) { } // Ignore .updateMatrix for CubeTextureNode

	setup( builder ) {

		super.setup( builder );

		const properties = builder.getNodeProperties( this );
		properties.uvNode = vec3( properties.uvNode.x.negate(), properties.uvNode.yz );

	}

	generate( builder, output ) {

		if ( ! this.texture.value || this.texture.value.isCubeTexture !== true ) {

			throw new Error( 'CubeTextureNode: Need a three.js cube texture.' );

		}

		return super.generate( builder, output );

	}

}

export default CubeTextureNode;

export const cubeTexture = nodeProxy( CubeTextureNode );

addNodeElement( 'cubeTexture', cubeTexture );

addNodeClass( 'CubeTextureNode', CubeTextureNode );
