import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';

export class Vector2Editor extends BaseNodeEditor {

	constructor() {

		const { element, inputNode } = createElementFromJSON( {
			inputType: 'vec2',
			inputConnection: false
		} );

		super( 'Vector 2', inputNode );

		element.addEventListener( 'changeInput', () => this.invalidate() );

		this.add( element );


	}

}
