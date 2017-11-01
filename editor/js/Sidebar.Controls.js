/**
 * @author TyLindberg / https://github.com/TyLindberg
 */

Sidebar.Controls = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );

	container.add( new UI.Text( 'CONTROLS' ) );

	var controlNames = [
		'translate',
		'rotate',
		'scale'
	];

	// Create rows here

	if ( config.getKey( 'controls/translate' ) !== undefined ) {



	}

	return container;

};
