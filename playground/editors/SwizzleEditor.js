import { LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';
import { split, float } from 'three/nodes';
import { setInputAestheticsFromType } from '../DataTypeLib.js';

export class SwizzleEditor extends BaseNodeEditor {

	constructor() {

		const node = split( float(), 'x' );

		super( 'Swizzle', node, 175 );

		const inputElement = setInputAestheticsFromType( new LabelElement( 'Input' ), 'node' ).onConnect( () => {

			node.node = inputElement.getLinkedObject() || float();

		} );

		this.add( inputElement );

		//

		const { element: componentsElement } = createElementFromJSON( {
			inputType: 'String',
			allows: 'xyzwrgba',
			transform: 'lowercase',
			options: [ 'x', 'y', 'z', 'w', 'r', 'g', 'b', 'a' ],
			maxLength: 4
		} );

		componentsElement.addEventListener( 'changeInput', () => {

			const string = componentsElement.value.value;

			node.components = string || 'x';

			this.invalidate();

		} );

		this.add( componentsElement );

	}

}
