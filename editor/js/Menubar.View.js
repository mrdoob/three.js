/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIPanel, UIRow } from './libs/ui.js';

function MenubarView( editor ) {

	var container = new UIPanel();
	container.setClass( 'menu' );

	var title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( 'View' );
	container.add( title );

	var options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// VR mode

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( 'VR mode' );
	option.onClick( function () {

		editor.signals.enterVR.dispatch();

	} );
	options.add( option );

	return container;

}

export { MenubarView };
