import ReferenceNode from './ReferenceNode.js';

class MaterialReferenceNode extends ReferenceNode {

	constructor( property, inputType, material = null ) {

		super( property, inputType, material );

		this.material = material;

	}

	construct( builder ) {

		const material = this.material !== null ? this.material : builder.material;

		this.node.value = material[ this.property ];

		return super.construct( builder );

	}

	update( frame ) {

		this.object = this.material !== null ? this.material : frame.material;

		super.update( frame );

	}

}

export default MaterialReferenceNode;
