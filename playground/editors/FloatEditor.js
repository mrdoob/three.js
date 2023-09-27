import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';

export class FloatEditor extends BaseNodeEditor {

	constructor() {

		const { element, inputNode } = createElementFromJSON( {
			inputType: 'float',
			inputConnection: false
		} );

		super( 'Float', inputNode, 150 );

		this.setOutputLength( 1 );

		element.addEventListener( 'changeInput', () => this.invalidate() );

		this.add( element );

	}

}
