import ReferenceNode from './ReferenceNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { addNodeClass } from '../core/Node.js';
import { nodeObject } from '../shadernode/ShaderNode.js';

class MaterialReferenceNode extends ReferenceNode {

	constructor( property, inputType, material = null ) {

		super( property, inputType, material );

		this.material = material;

		this.updateType = NodeUpdateType.RENDER;

	}

	updateReference( frame ) {

		this.reference = this.material !== null ? this.material : frame.material;

		return this.reference;

	}

	setup( builder ) {

		const material = this.material !== null ? this.material : builder.material;

		this.node.value = material[ this.property ];

		return super.setup( builder );

	}

}

export default MaterialReferenceNode;

export const materialReference = ( name, type, material ) => nodeObject( new MaterialReferenceNode( name, type, material ) );

addNodeClass( 'MaterialReferenceNode', MaterialReferenceNode );
