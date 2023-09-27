import { UIPanel } from './libs/ui.js';

import { ViewHelper as ViewHelperBase } from '../../examples/jsm/helpers/ViewHelper.js';

class ViewHelper extends ViewHelperBase {

	constructor( editorCamera, container ) {

		super( editorCamera, container.dom );

		const panel = new UIPanel();
		panel.setId( 'viewHelper' );
		panel.setPosition( 'absolute' );
		panel.setRight( '0px' );
		panel.setBottom( '0px' );
		panel.setHeight( '128px' );
		panel.setWidth( '128px' );

		panel.dom.addEventListener( 'pointerup', ( event ) => {

			event.stopPropagation();

			this.handleClick( event );

		} );

		panel.dom.addEventListener( 'pointerdown', function ( event ) {

			event.stopPropagation();

		} );

		container.add( panel );

	}

}

export { ViewHelper };
