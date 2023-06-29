import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { uniform } from '../core/UniformNode.js';
import { reference } from './ReferenceNode.js';
import { bufferAttribute } from './BufferAttributeNode.js';
import { positionLocal } from './PositionNode.js';

class MorphNode extends Node {

	constructor( mesh ) {

		super( 'void' );

		this.mesh = mesh;
		this.morphBaseInfluence = uniform( 1 );

		this.updateType = NodeUpdateType.OBJECT;

	}

	constructAttribute( builder, name, assignNode = positionLocal ) {

		const mesh = this.mesh;
		const attributes = mesh.geometry.morphAttributes[ name ];

		builder.stack.assign( assignNode, assignNode.mul( this.morphBaseInfluence ) );

		for ( let i = 0; i < attributes.length; i ++ ) {

			const attribute = attributes[ i ];

			const bufferAttrib = bufferAttribute( attribute.array, 'vec3' );
			const influence = reference( i, 'float', mesh.morphTargetInfluences );

			builder.stack.assign( assignNode, assignNode.add( bufferAttrib.mul( influence ) ) );

		}

	}

	construct( builder ) {

		this.constructAttribute( builder, 'position' );

	}

	update() {

		const morphBaseInfluence = this.morphBaseInfluence;

		if ( this.mesh.geometry.morphTargetsRelative ) {

			morphBaseInfluence.value = 1;

		} else {

			morphBaseInfluence.value = 1 - this.mesh.morphTargetInfluences.reduce( ( a, b ) => a + b, 0 );

		}

	}

}

export default MorphNode;

export const morph = nodeProxy( MorphNode );

addNodeClass( MorphNode );
