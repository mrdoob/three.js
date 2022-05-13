import { UIPanel } from './libs/ui.js';

function MenubarPlay( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	let isPlaying = false;

	const title = new UIPanel();
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
