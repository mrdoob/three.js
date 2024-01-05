import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { normalGeometry, normalLocal, normalView, normalWorld, transformedNormalView, transformedNormalWorld } from './NormalNode.js';
import { tangentGeometry, tangentLocal, tangentView, tangentWorld, transformedTangentView, transformedTangentWorld } from './TangentNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class BitangentNode extends TempNode {

	constructor( scope = BitangentNode.LOCAL ) {

		super( 'vec3' );

		this.scope = scope;

	}

	getHash( /*builder*/ ) {

		return `bitangent-${this.scope}`;

	}

	setup( /*builder*/ ) {

		const scope = this.scope;

		let crossNormalTangent;

		if ( scope === BitangentNode.GEOMETRY ) {

			crossNormalTangent = normalGeometry.cross( tangentGeometry );

		} else if ( scope === BitangentNode.LOCAL ) {

			crossNormalTangent = normalLocal.cross( tangentLocal );

		} else if ( scope === BitangentNode.VIEW ) {

			crossNormalTangent = normalView.cross( tangentView );

		} else if ( scope === BitangentNode.WORLD ) {

			crossNormalTangent = normalWorld.cross( tangentWorld );

		} else if ( scope === BitangentNode.TRANSFORMED_VIEW ) {

			crossNormalTangent = transformedNormalView.cross( transformedTangentView );

		} else if ( scope === BitangentNode.TRANSFORMED_WORLD ) {

			crossNormalTangent = transformedNormalWorld.cross( transformedTangentWorld );

		}

		const vertexNode = crossNormalTangent.mul( tangentGeometry.w ).xyz;

		return vertexNode.varying().normalize();

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

BitangentNode.GEOMETRY = 'geometry';
BitangentNode.LOCAL = 'local';
BitangentNode.VIEW = 'view';
BitangentNode.WORLD = 'world';
BitangentNode.TRANSFORMED_VIEW = 'transformedView';
BitangentNode.TRANSFORMED_WORLD = 'transformedWorld';

export default BitangentNode;

export const bitangentGeometry = nodeImmutable( BitangentNode, BitangentNode.GEOMETRY );
export const bitangentLocal = nodeImmutable( BitangentNode, BitangentNode.LOCAL );
export const bitangentView = nodeImmutable( BitangentNode, BitangentNode.VIEW );
export const bitangentWorld = nodeImmutable( BitangentNode, BitangentNode.WORLD );
export const transformedBitangentView = nodeImmutable( BitangentNode, BitangentNode.TRANSFORMED_VIEW );
export const transformedBitangentWorld = nodeImmutable( BitangentNode, BitangentNode.TRANSFORMED_WORLD );

addNodeClass( 'BitangentNode', BitangentNode );
