import Node from '../core/Node.js';
import Matrix4Node from '../inputs/Matrix4Node.js';
import Matrix3Node from '../inputs/Matrix3Node.js';
import { NodeUpdateType } from '../core/constants.js';

class ModelNode extends Node {

	static VIEW = 'view';
	static NORMAL = 'normal';

	constructor( scope = ModelNode.VIEW ) {

		super();

		this.scope = scope;

		this.updateType = NodeUpdateType.Object;

		this._inputNode = null;

	}

	getType() {

		const scope = this.scope;

		if ( scope === ModelNode.VIEW ) {

			return 'mat4';

		} else if ( scope === ModelNode.NORMAL ) {

			return 'mat3';

		}

	}

	update( frame ) {

		const object = frame.object;
		const inputNode = this._inputNode;
		const scope = this.scope;

		if ( scope === ModelNode.VIEW ) {

			inputNode.value = object.modelViewMatrix;

		} else if ( scope === ModelNode.NORMAL ) {

			inputNode.value = object.normalMatrix;

		}

	}

	generate( builder, output ) {

		const nodeData = builder.getDataFromNode( this );

		let inputNode = this._inputNode;

		if ( nodeData.inputNode === undefined ) {

			const scope = this.scope;

			if ( scope === ModelNode.VIEW ) {

				if ( inputNode === null || inputNode.isMatrix4Node !== true ) {

					inputNode = new Matrix4Node( null );

				}

			} else if ( scope === ModelNode.NORMAL ) {

				if ( inputNode === null || inputNode.isMatrix3Node !== true ) {

					inputNode = new Matrix3Node( null );

				}

			}

			this._inputNode = inputNode;

			nodeData.inputNode = inputNode;

		}

		return inputNode.build( builder, output );

	}

}

export default ModelNode;
