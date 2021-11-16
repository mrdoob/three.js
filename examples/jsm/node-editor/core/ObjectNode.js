import { Node, TitleElement, ButtonInput } from '../../libs/flow.module.js';

export class ObjectNode extends Node {

	constructor( name, inputLength, extra = null ) {

		super();

		const title = new TitleElement( name )
			.setExtra( extra )
			.setOutput( inputLength );

		const closeButton = new ButtonInput( '✖' ).onClick( () => {

			this.dispose();

		} );

		title.addButton( closeButton );

		this.add( title );

		this.title = title;
		this.closeButton = closeButton;

	}

	invalidate() {

		this.title.dispatchEvent( new Event( 'connect' ) );

	}

}
