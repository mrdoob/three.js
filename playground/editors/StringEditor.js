import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';

export class StringEditor extends BaseNodeEditor {

	constructor() {

		const { element, inputNode } = createElementFromJSON( {
			inputType: 'string',
			inputConnection: false
		} );

		super( 'String', inputNode, 350 );

		element.addEventListener( 'changeInput', () => this.invalidate() );

		this.add( element );

	}

	get stringNode() {

		return this.value;

	}

	getURL() {

		return this.stringNode.value;

	}

}
