import Object3DNode from './Object3DNode.js';

class ModelNode extends Object3DNode {

	constructor( scope = ModelNode.ViewMatrix ) {

		super( scope );

	}

}

export default ModelNode;
