/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Play = function ( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var isPlaying = false;

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/play' ) );
	title.onClick( function () {

		if ( isPlaying === false ) {

			isPlaying = true;
			title.setTextContent( 'Stop' );
			signals.startPlayer.dispatch();

		} else {

			isPlaying = false;
			title.setTextContent( 'Play' );
			signals.stopPlayer.dispatch();

		}

	} );
	container.add( title );

	return container;

};
