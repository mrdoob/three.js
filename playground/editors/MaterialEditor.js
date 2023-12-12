import { BaseNodeEditor } from '../BaseNodeEditor.js';

export class MaterialEditor extends BaseNodeEditor {

	constructor( name, material, outputlength, width = 300 ) {

		super( name, material, outputlength, width );

	}

	get material() {

		return this.value;

	}

}
