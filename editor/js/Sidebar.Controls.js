/**
 * @author TyLindberg / https://github.com/TyLindberg
 */

Sidebar.Controls = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;

	const IS_MAC = navigator.platform.toUpperCase().indexOf( 'MAC' ) >= 0;

	var isValidKeyBinding = function ( key ) {

		return key.match( /^[A-Za-z0-9]$/i ); // Can't use z currently due to undo/redo

	};

	var container = new UI.Panel();
	container.add( new UI.Text( 'CONTROLS' ) );

	// Use this to add a line break above the panel
	container.add( new UI.Break(), new UI.Break() );

	var controlNames = [
		'translate',
		'rotate',
		'scale'
	];

	for ( var i = 0; i < controlNames.length; i ++ ) {

		let name = controlNames[ i ];
		let configName = 'controls/' + name;
		let controlRow = new UI.Row();

		let controlInput = new UI.Input().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

			if ( isValidKeyBinding( controlInput.getValue() ) ) {

				config.setKey( configName, controlInput.getValue()[ 0 ] );

			}

		} );

		// Automatically highlight when selecting an input field
		controlInput.dom.addEventListener( 'focus', function () {

			controlInput.dom.select();

		} );

		// If the value of the input field is invalid, revert the input field
		// to contain the key binding stored in config
		controlInput.dom.addEventListener( 'blur', function () {

			if ( ! isValidKeyBinding( controlInput.getValue() ) ) {

				controlInput.setValue( config.getKey( configName ) );

			}

		} );

		// If a valid key binding character is entered, blur the input field
		controlInput.dom.addEventListener( 'keyup', function ( event ) {

			if ( isValidKeyBinding( event.key ) ) {

				controlInput.dom.blur();

			}

		} );

		if ( config.getKey( configName ) !== undefined ) {

			controlInput.setValue( config.getKey( configName ) );

		}

		controlInput.dom.maxLength = 1;
		controlRow.add( new UI.Text( name.charAt( 0 ).toUpperCase() + name.slice( 1 ) ).setWidth( '90px' ) );
		controlRow.add( controlInput );
		container.add( controlRow );

	}

	document.addEventListener( 'keydown', function ( event ) {

		switch ( event.key ) {

			case 'Backspace':

				event.preventDefault(); // prevent browser back

			case 'Delete':

				var object = editor.selected;

				if ( confirm( 'Delete ' + object.name + '?' ) === false ) return;

				var parent = object.parent;
				if ( parent !== null ) editor.execute( new RemoveObjectCommand( object ) );

				break;

			case 'z': // Register Ctrl/Command-Z for Undo and Ctrl/Command-Shift-Z for Redo
			case 'Z': // Safari and Firefox register lowercase z when Ctrl-Shift-Z is pressed

				if ( IS_MAC ? event.metaKey : event.ctrlKey ) {

					if ( event.shiftKey ) {

						editor.redo();

					}					else {

						event.preventDefault(); // Prevent Safari reopen last tab
						editor.undo();

					}

				}

				break;

			case editor.config.getKey( 'controls/translate' ): // Translation transform mode

				editor.signals.transformModeChanged.dispatch( 'translate' );

				break;

			case editor.config.getKey( 'controls/rotate' ): // Rotation transform mode

				editor.signals.transformModeChanged.dispatch( 'rotate' );

				break;

			case editor.config.getKey( 'controls/scale' ): // Scaling transform mode

				editor.signals.transformModeChanged.dispatch( 'scale' );

				break;

		}

	}, false );

	return container;

};
