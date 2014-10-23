/**
 * @author mrdoob / http://mrdoob.com/
 */

var Player = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'player' );
	container.setPosition( 'absolute' );
	container.setDisplay( 'none' );

	//

	var player = new APP.Player();

	signals.startPlayer.add( function ( json ) {

		container.setDisplay( '' );

		player.load( json );
		player.setCamera( editor.camera );
		player.setSize( container.dom.offsetWidth, container.dom.offsetHeight );
		player.play();

		container.dom.appendChild( player.dom );

	} );

	signals.stopPlayer.add( function () {

		container.setDisplay( 'none' );

		player.stop();

		container.dom.removeChild( player.dom );

	} );

	return container;

};
