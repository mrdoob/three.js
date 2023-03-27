import { LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { nodeObject, float } from 'three/nodes';

export class SplitEditor extends BaseNodeEditor {

	constructor() {

		super( 'Split', null, 175 );

		let node = null;

		const inputElement = new LabelElement( 'Input' ).setInput( 1 ).onConnect( () => {

			node = inputElement.getLinkedObject();

			if ( node !== null ) {

				xElement.setObject( nodeObject( node ).x );
				yElement.setObject( nodeObject( node ).y );
				zElement.setObject( nodeObject( node ).z );
				wElement.setObject( nodeObject( node ).w );

			} else {

				xElement.setObject( float() );
				yElement.setObject( float() );
				zElement.setObject( float() );
				wElement.setObject( float() );

			}

		} );

		this.add( inputElement );

		const xElement = new LabelElement( 'x | r' ).setOutput( 1 ).setObject( float() );
		const yElement = new LabelElement( 'y | g' ).setOutput( 1 ).setObject( float() );
		const zElement = new LabelElement( 'z | b' ).setOutput( 1 ).setObject( float() );
		const wElement = new LabelElement( 'w | a' ).setOutput( 1 ).setObject( float() );

		this.add( inputElement )
			.add( xElement )
			.add( yElement )
			.add( zElement )
			.add( wElement );

	}

}
