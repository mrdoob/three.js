import { addNodeClass } from './Node.js';
import OutputStructNode from './OutputStructNode.js';
import { nodeProxy, vec4 } from '../shadernode/ShaderNode.js';

function getTextureIndex( textures, name ) {

	for ( let i = 0; i < textures.length; i ++ ) {

		if ( textures[ i ].name === name ) {

			return i;

		}

	}

	return - 1;

}

class MRTNode extends OutputStructNode {

	constructor( outputNodes ) {

		super();

		this.outputNodes = outputNodes;

		this.isMRTNode = true;

	}

	merge( mrtNode ) {

		const outputs = { ...this.outputNodes, ...mrtNode.outputNodes };

		return mrt( outputs );

	}

	setup( builder ) {

		const outputNodes = this.outputNodes;
		const mrt = builder.renderer.getRenderTarget();

		const members = [];

		if ( Array.isArray( outputNodes ) ) {

			for ( let i = 0; i < outputNodes.length; i ++ ) {

				members.push( vec4( outputNodes[ i ] ) );

			}

		} else {

			const textures = mrt.textures;

			for ( const name in outputNodes ) {

				const index = getTextureIndex( textures, name );

				members[ index ] = vec4( outputNodes[ name ] );

			}

		}

		this.members = members;

		return super.setup( builder );

	}

}

export default MRTNode;

export const mrt = nodeProxy( MRTNode );

addNodeClass( 'MRTNode', MRTNode );
