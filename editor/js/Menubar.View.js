/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Panel, Row } from './libs/ui.js';

var MenubarView = function ( editor ) {

	var container = new Panel();
	container.setClass( 'menu' );

	var title = new Panel();
	title.setClass( 'title' );
	title.setTextContent( 'View' );
	container.add( title );

	var options = new Panel();
	options.setClass( 'options' );
	container.add( options );

	// VR mode

	var option = new Row();
	option.setClass( 'option' );
	option.setTextContent( 'VR mode' );
	option.onClick( function () {

		if ( WEBVR.isAvailable() === true ) {

			editor.signals.enterVR.dispatch();

		} else {

			alert( 'WebVR not available' );

		}

	} );
	options.add( option );

	return container;

};

export { MenubarView };
