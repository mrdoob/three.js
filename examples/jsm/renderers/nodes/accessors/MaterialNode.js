import Node from '../core/Node.js';
import ColorNode from '../inputs/ColorNode.js';
import { NodeUpdateType } from '../core/constants.js';

class MaterialNode extends Node {

	static COLOR = 'color';

	constructor( scope = MaterialNode.COLOR ) {

		super( 'vec3' );

		this.scope = scope;

		this.updateType = NodeUpdateType.Object;

		this._inputNode = new ColorNode( null );

	}
	
	update( frame ) {

		const material = frame.material;
		
		this._inputNode.value = material.color;

	}

	generate( builder, output ) {

		const type = this.getType( builder );

		return this._inputNode.build( builder, output );

	}

}

export default MaterialNode;
