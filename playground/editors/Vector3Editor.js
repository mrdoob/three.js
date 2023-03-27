import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';

export class Vector3Editor extends BaseNodeEditor {

	constructor() {

		const { element, inputNode } = createElementFromJSON( {
			inputType: 'vec3',
			inputConnection: false
		} );

		super( 'Vector 3', inputNode, 325 );

		this.setOutputLength( 3 );

		element.addEventListener( 'changeInput', () => this.invalidate() );

		this.add( element );

	}

}
