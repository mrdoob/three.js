/**
 * @author TyLindberg / https://github.com/TyLindberg
 */

Sidebar.Controls = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;

	var container = new UI.Panel();
	container.add( new UI.Text( 'CONTROLS' ) );

	// Use this to add a line break above the panel
	container.add( new UI.Break(), new UI.Break() );

	var controlNames = [
		'translate',
		'rotate',
		'scale'
	];

	for ( var i = 0; i < controlNames.length; i++ ) {

		let name = controlNames[ i ];
		let configName = 'controls/' + name;
		let controlRow = new UI.Row();

		let controlInput = new UI.Input().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

			config.setKey( configName, controlInput.getValue()[ 0 ] );

		} );
		controlInput.dom.addEventListener( 'focus', function () {

			controlInput.dom.select();

		} );

		if( config.getKey( configName ) !== undefined ) {

			controlInput.setValue( config.getKey( configName ) );

		}

		controlInput.dom.maxLength = 1;
		controlRow.add( new UI.Text( name.charAt( 0 ).toUpperCase() + name.slice( 1 ) ).setWidth( '90px' ) );
		controlRow.add( controlInput );
		container.add( controlRow );

	}

	return container;

};
