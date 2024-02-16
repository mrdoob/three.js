import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';

export class Vector4Editor extends BaseNodeEditor {

	constructor() {

		const { element, inputNode } = createElementFromJSON( {
			inputType: 'vec4',
			inputConnection: false
		} );

		super( 'Vector 4', inputNode, 350 );

		element.addEventListener( 'changeInput', () => this.invalidate() );

		this.add( element );

	}

}
