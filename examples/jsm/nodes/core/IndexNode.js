import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class IndexNode extends TempNode {

	constructor( scope ) {

		super( 'uint' );

		this.scope = scope;

		this.isInstanceIndexNode = true;

	}

	setup( builder ) {

		if ( builder.getShaderStage() !== 'vertex' && builder.getShaderStage() !== 'compute' ) return this.varying();

	}

	generate( builder ) {

		if ( builder.getShaderStage() !== 'vertex' && builder.getShaderStage() !== 'compute' ) return super.generate( builder );

		const scope = this.scope;

		let propertyName;

		if ( scope === IndexNode.VERTEX ) {

			propertyName = builder.getVertexIndex();

		} else if ( scope === IndexNode.INSTANCE ) {

			propertyName = builder.getInstanceIndex();

		} else {

			throw new Error( 'THREE.IndexNode: Unknown scope: ' + scope );

		}

		return propertyName;

	}

}

IndexNode.VERTEX = 'vertex';
IndexNode.INSTANCE = 'instance';

export default IndexNode;

export const vertexIndex = nodeImmutable( IndexNode, IndexNode.VERTEX );
export const instanceIndex = nodeImmutable( IndexNode, IndexNode.INSTANCE );

addNodeClass( 'IndexNode', IndexNode );
