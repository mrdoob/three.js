import ReferenceNode from './ReferenceNode.js';

class MaterialReferenceNode extends ReferenceNode {

	constructor( property, inputType, material = null ) {

		super( property, inputType, material );

		this.material = material;

	}

	update( frame ) {

		this.object = this.material !== null ? this.material : frame.material;

		super.update( frame );

	}

}

export default MaterialReferenceNode;
