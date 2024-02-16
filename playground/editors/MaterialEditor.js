import { BaseNodeEditor } from '../BaseNodeEditor.js';

export class MaterialEditor extends BaseNodeEditor {

	constructor( name, material, width = 300 ) {

		super( name, material, width );

	}

	get material() {

		return this.value;

	}

}
