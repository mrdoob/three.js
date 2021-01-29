import Node from '../core/Node.js';
import Vector3Node from '../inputs/Vector3Node.js';
import Matrix4Node from '../inputs/Matrix4Node.js';
import { NodeUpdateType } from '../core/constants.js';

class ModelNode extends Node {

	static VIEW = 'view';

	constructor( scope = ModelNode.VIEW ) {

		super( 'mat4' );

		this.scope = scope;

		this.updateType = NodeUpdateType.Object;

		this.inputNode = null;

	}

	update( frame ) {

		const object = frame.object;
		const inputNode = this.inputNode;

		inputNode.value = object.modelViewMatrix;

	}

	generate( builder, output ) {

		const nodeData = builder.getDataFromNode( this );

		if ( this.initialized !== true ) {
			
			this.inputNode = new Matrix4Node( null );

			nodeData.initialized = true;
			
		}

		return this.inputNode.build( builder, output );

	}

}

export default ModelNode;
