import { registerNode } from '../core/Node.js';
import ReferenceNode from './ReferenceNode.js';
//import { renderGroup } from '../core/UniformGroupNode.js';
//import { NodeUpdateType } from '../core/constants.js';
import { nodeObject } from '../tsl/TSLBase.js';

class MaterialReferenceNode extends ReferenceNode {

	constructor( property, inputType, material = null ) {

		super( property, inputType, material );

		this.material = material;

		//this.updateType = NodeUpdateType.RENDER;

		this.isMaterialReferenceNode = true;

	}

	/*setNodeType( node ) {

		super.setNodeType( node );

		this.node.groupNode = renderGroup;

	}*/

	updateReference( state ) {

		this.reference = this.material !== null ? this.material : state.material;

		return this.reference;

	}

}

export default MaterialReferenceNode;

MaterialReferenceNode.type = /*@__PURE__*/ registerNode( 'MaterialReference', MaterialReferenceNode );

export const materialReference = ( name, type, material ) => nodeObject( new MaterialReferenceNode( name, type, material ) );
