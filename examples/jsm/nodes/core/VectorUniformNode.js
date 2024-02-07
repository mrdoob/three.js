import UniformNode from './UniformNode.js';
import { addNodeClass } from './Node.js';

class VectorUniformNode extends UniformNode {

	constructor( nodes = [] ) {

		super();

		this.isVectorUniformNode = true;

		this.nodes = nodes;

	}

	getNodeType( builder ) {

		return this.nodes[ 0 ].getNodeType( builder );

	}

}

export default VectorUniformNode;

addNodeClass( 'VectorUniformNode', VectorUniformNode );
