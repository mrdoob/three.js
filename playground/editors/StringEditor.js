import { StringInput, Element } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { string } from 'three/nodes';

export class StringEditor extends BaseNodeEditor {

	constructor() {

		const stringNode = string();

		super( 'String', stringNode, 350 );

		const stringInput = new StringInput().onChange( () => {

			const input = stringInput.getValue();

			if ( input !== stringNode.value ) {

				stringNode.value = input;

				this.invalidate();

			}

		} );

		this.add( new Element().add( stringInput ) );

	}

	get stringNode() {

		return this.value;

	}

	getURL() {

		return this.stringNode.value;

	}

}
