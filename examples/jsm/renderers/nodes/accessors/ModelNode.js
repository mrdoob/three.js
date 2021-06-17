import Object3DNode from './Object3DNode.js';

class ModelNode extends Object3DNode {

	constructor( scope = ModelNode.VIEW_MATRIX ) {

		super( scope );

	}

}

export default ModelNode;
