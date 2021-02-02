import Node from '../core/Node.js';
import Matrix4Node from '../inputs/Matrix4Node.js';
import { NodeUpdateType } from '../core/constants.js';

class ModelNode extends Node {

	static VIEW = 'view';

	constructor( scope = ModelNode.VIEW ) {

		super( 'mat4' );

		this.scope = scope;

		this.updateType = NodeUpdateType.Object;

		this._inputNode = new Matrix4Node( null );

	}

	update( frame ) {

		const object = frame.object;
		const inputNode = this._inputNode;

		inputNode.value = object.modelViewMatrix;

	}

	generate( builder, output ) {

		return this._inputNode.build( builder, output );

	}

}

export default ModelNode;
