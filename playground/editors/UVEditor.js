import { SelectInput, LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { UVNode } from 'three/nodes';

export class UVEditor extends BaseNodeEditor {

	constructor() {

		const node = new UVNode();

		super( 'UV', node, 200 );

		this.setOutputLength( 2 );

		const optionsField = new SelectInput( [ '1', '2' ], 0 ).onChange( () => {

			node.index = Number( optionsField.getValue() );

			this.invalidate();

		} );

		this.add( new LabelElement( 'Channel' ).add( optionsField ) );

	}

}
