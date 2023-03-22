import { NumberInput, Element } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { UniformNode } from 'three/nodes';

export class FloatEditor extends BaseNodeEditor {

	constructor() {

		const node = new UniformNode( 0 );

		super( 'Float', node, 150 );

		const field = new NumberInput().onChange( () => {

			node.value = field.getValue();

			this.invalidate(); // it's important to scriptable nodes ( cpu nodes needs update )

		} );

		this.add( new Element().add( field ) );

	}

}
