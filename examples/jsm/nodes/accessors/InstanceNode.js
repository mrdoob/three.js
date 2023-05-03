import Node, { addNodeClass } from '../core/Node.js';
import { instanceIndex } from '../core/InstanceIndexNode.js';
import { temp } from '../core/VarNode.js';
import { buffer } from './BufferNode.js';
import { normalLocal } from './NormalNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy, vec3, mat3 } from '../shadernode/ShaderNode.js';

class InstanceNode extends Node {

	constructor( instanceMesh ) {

		super( 'void' );

		this.instanceMesh = instanceMesh;

		//

		const instanceBufferNode = buffer( instanceMesh.instanceMatrix.array, 'mat4', instanceMesh.count );

		this.instanceMatrixNode = temp( instanceBufferNode.element( instanceIndex ) ); // @TODO: a possible caching issue here?

	}

	generate( builder ) {

		const { instanceMatrixNode } = this;

		// POSITION

		const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;

		// NORMAL

		const m = mat3( instanceMatrixNode[ 0 ].xyz, instanceMatrixNode[ 1 ].xyz, instanceMatrixNode[ 2 ].xyz );

		const transformedNormal = normalLocal.div( vec3( m[ 0 ].dot( m[ 0 ] ), m[ 1 ].dot( m[ 1 ] ), m[ 2 ].dot( m[ 2 ] ) ) );

		const instanceNormal = m.mul( transformedNormal ).xyz;

		// ASSIGNS

		positionLocal.assign( instancePosition ).build( builder );
		normalLocal.assign( instanceNormal ).build( builder );

	}

}

export default InstanceNode;

export const instance = nodeProxy( InstanceNode );

addNodeClass( InstanceNode );
