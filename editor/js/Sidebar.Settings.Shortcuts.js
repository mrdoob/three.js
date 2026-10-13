import { UIPanel, UIText, UIRow, UIInput } from './libs/ui.js';

import { MultiCmdsCommand } from './commands/MultiCmdsCommand.js';
import { RemoveObjectCommand } from './commands/RemoveObjectCommand.js';

function SidebarSettingsShortcuts( editor ) {

	const strings = editor.strings;

	const IS_MAC = navigator.platform.toUpperCase().indexOf( 'MAC' ) >= 0;

	function isValidKeyBinding( key ) {

		return key.match( /^[A-Za-z0-9]$/i ); // Can't use z currently due to undo/redo

	}

	const config = editor.config;
	const signals = editor.signals;

	const container = new UIPanel();

	const headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/settings/shortcuts' ).toUpperCase() ) );
	container.add( headerRow );

	const shortcuts = [ 'translate', 'rotate', 'scale', 'undo', 'focus', 'perspective', 'orthographic', 'selectAll' ];

	function createShortcutInput( name ) {

		const configName = 'settings/shortcuts/' + name;
		const shortcutRow = new UIRow();

		const shortcutInput = new UIInput().setWidth( '15px' ).setFontSize( '12px' );
		shortcutInput.setTextAlign( 'center' );
		shortcutInput.setTextTransform( 'lowercase' );
		shortcutInput.onChange( function () {

			const value = shortcutInput.getValue().toLowerCase();

			if ( isValidKeyBinding( value ) ) {

				config.setKey( configName, value );

			}

		} );

		// Automatically highlight when selecting an input field
		shortcutInput.dom.addEventListener( 'click', function () {

			shortcutInput.dom.select();

		} );

		// If the value of the input field is invalid, revert the input field
		// to contain the key binding stored in config
		shortcutInput.dom.addEventListener( 'blur', function () {

			if ( ! isValidKeyBinding( shortcutInput.getValue() ) ) {

				shortcutInput.setValue( config.getKey( configName ) );

			}

		} );

		// If a valid key binding character is entered, blur the input field
		shortcutInput.dom.addEventListener( 'keyup', function ( event ) {

			if ( isValidKeyBinding( event.key ) ) {

				shortcutInput.dom.blur();

			}

		} );

		if ( config.getKey( configName ) !== undefined ) {

			shortcutInput.setValue( config.getKey( configName ) );

		}

		shortcutInput.dom.maxLength = 1;
		shortcutRow.add( new UIText( strings.getKey( 'sidebar/settings/shortcuts/' + name ) ).setTextTransform( 'capitalize' ).setClass( 'Label' ) );
		shortcutRow.add( shortcutInput );

		container.add( shortcutRow );

	}

	for ( let i = 0; i < shortcuts.length; i ++ ) {

		createShortcutInput( shortcuts[ i ] );

	}

	document.addEventListener( 'keydown', function ( event ) {

		switch ( event.key.toLowerCase() ) {

			case 'backspace':

				event.preventDefault(); // prevent browser back

				// fall-through

			case 'delete': {

				const objects = editor.selector.selection;

				const commands = [];

				for ( let i = 0; i < objects.length; i ++ ) {

					const object = objects[ i ];

					if ( object.parent === null ) continue; // avoid deleting the camera or scene

					if ( object.isSpotLight || object.isDirectionalLight ) {

						commands.push( new RemoveObjectCommand( editor, object ) );
						commands.push( new RemoveObjectCommand( editor, object.target ) );

					} else {

						commands.push( new RemoveObjectCommand( editor, object ) );

					}

				}

				if ( commands.length === 1 ) {

					editor.execute( commands[ 0 ] );

				} else if ( commands.length > 1 ) {

					editor.execute( new MultiCmdsCommand( editor, commands ) );

				}

				break;

			}

			case config.getKey( 'settings/shortcuts/selectAll' ): {

				if ( event.altKey === true || event.ctrlKey === true || event.metaKey === true ) break;

				// toggle between selecting and deselecting all scene objects

				const objects = editor.scene.children;
				const selection = editor.selector.selection;

				let allSelected = objects.length > 0;

				for ( let i = 0; i < objects.length; i ++ ) {

					if ( selection.indexOf( objects[ i ] ) === - 1 ) {

						allSelected = false;
						break;

					}

				}

				if ( allSelected === true ) {

					editor.deselect();

				} else {

					editor.selector.setSelection( objects );

				}

				break;

			}

			case config.getKey( 'settings/shortcuts/translate' ):

				signals.transformModeChanged.dispatch( 'translate' );

				break;

			case config.getKey( 'settings/shortcuts/rotate' ):

				signals.transformModeChanged.dispatch( 'rotate' );

				break;

			case config.getKey( 'settings/shortcuts/scale' ):

				signals.transformModeChanged.dispatch( 'scale' );

				break;

			case config.getKey( 'settings/shortcuts/undo' ):

				if ( IS_MAC ? event.metaKey : event.ctrlKey ) {

					event.preventDefault(); // Prevent browser specific hotkeys

					if ( event.shiftKey ) {

						editor.redo();

					} else {

						editor.undo();

					}

				}

				break;

			case config.getKey( 'settings/shortcuts/focus' ):

				if ( editor.selected !== null ) {

					editor.focus( editor.selected );

				}

				break;

			case config.getKey( 'settings/shortcuts/perspective' ):

				editor.setCameraType( 'perspective' );

				break;

			case config.getKey( 'settings/shortcuts/orthographic' ):

				editor.setCameraType( 'orthographic' );

				break;

		}

	} );

	return container;

}

export { SidebarSettingsShortcuts };
