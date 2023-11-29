import TextureNode from './TextureNode.js';
import { reflectVector } from './ReflectVectorNode.js';
import { addNodeClass } from '../core/Node.js';
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

	generateUV( builder, uvNode ) {

		const cubeUV = vec3( uvNode.x.negate(), uvNode.yz );
		return cubeUV.build( builder, 'vec3' );

	}

}

export default CubeTextureNode;

export const cubeTexture = nodeProxy( CubeTextureNode );

addNodeElement( 'cubeTexture', cubeTexture );

addNodeClass( 'CubeTextureNode', CubeTextureNode );
