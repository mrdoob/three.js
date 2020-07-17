/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIPanel } from './libs/ui.js';

function MenubarPlay( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UIPanel();
	container.setClass( 'menu' );

	var isPlaying = false;

	var title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/play' ) );
	title.onClick( function () {

		if ( isPlaying === false ) {

			isPlaying = true;
			title.setTextContent( strings.getKey( 'menubar/play/stop' ) );
			signals.startPlayer.dispatch();

		} else {

			isPlaying = false;
			title.setTextContent( strings.getKey( 'menubar/play/play' ) );
			signals.stopPlayer.dispatch();

		}

	} );
	container.add( title );

	return container;

}

export { MenubarPlay };
