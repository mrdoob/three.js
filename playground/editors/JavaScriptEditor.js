import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { CodeEditorElement } from '../elements/CodeEditorElement.js';
import { js } from 'three/tsl';

export class JavaScriptEditor extends BaseNodeEditor {

	constructor( source = '' ) {

		const codeNode = js( source );

		super( 'JavaScript', codeNode, 500 );

		this.setResizable( true );

		//

		this.editorElement = new CodeEditorElement( source );
		this.editorElement.addEventListener( 'change', () => {

			codeNode.code = this.editorElement.source;

			this.invalidate();

			this.editorElement.focus();

		} );

		this.add( this.editorElement );

	}

	set source( value ) {

		this.codeNode.code = value;

	}

	get source() {

		return this.codeNode.code;

	}

	get codeNode() {

		return this.value;

	}

}
