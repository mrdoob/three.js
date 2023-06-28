import { SelectInput, LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { uv } from 'three/nodes';

export class UVEditor extends BaseNodeEditor {

	constructor() {

		const node = uv();

		super( 'UV', node, 200 );

		this.setOutputLength( 2 );

		const options = Array.from( Array( 4 ).keys() ).map( String );

		const optionsField = new SelectInput( options, 0 ).onChange( () => {

			node.index = Number( optionsField.getValue() );

			this.invalidate();

		} );

		this.add( new LabelElement( 'Channel' ).add( optionsField ) );

	}

}
