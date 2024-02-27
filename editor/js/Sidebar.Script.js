import { UIPanel, UIBreak, UIText, UIButton, UIRow, UIInput } from './libs/ui.js';

import { AddScriptCommand } from './commands/AddScriptCommand.js';
import { SetScriptValueCommand } from './commands/SetScriptValueCommand.js';
import { RemoveScriptCommand } from './commands/RemoveScriptCommand.js';

function SidebarScript( editor ) {

	const strings = editor.strings;

	const signals = editor.signals;

	const container = new UIPanel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );
	container.setDisplay( 'none' );

	//

	const scriptsContainer = new UIRow();
	container.add( scriptsContainer );

	const newScript = new UIButton( strings.getKey( 'sidebar/script/new' ) );
	newScript.onClick( function () {

		const script = { name: '', source: 'function update( event ) {}' };
		editor.execute( new AddScriptCommand( editor, editor.selected, script ) );

	} );
	container.add( newScript );

	/*
	let loadScript = new UI.Button( 'Load' );
	loadScript.setMarginLeft( '4px' );
	container.add( loadScript );
	*/

	//

	function update() {

		scriptsContainer.clear();
		scriptsContainer.setDisplay( 'none' );

		const object = editor.selected;

		if ( object === null ) {

			return;

		}

		const scripts = editor.scripts[ object.uuid ];

		if ( scripts !== undefined && scripts.length > 0 ) {

			scriptsContainer.setDisplay( 'block' );

			for ( let i = 0; i < scripts.length; i ++ ) {

				( function ( object, script ) {

					const name = new UIInput( script.name ).setWidth( '130px' ).setFontSize( '12px' );
					name.onChange( function () {

						editor.execute( new SetScriptValueCommand( editor, editor.selected, script, 'name', this.getValue() ) );

					} );
					scriptsContainer.add( name );

					const edit = new UIButton( strings.getKey( 'sidebar/script/edit' ) );
					edit.setMarginLeft( '4px' );
					edit.onClick( function () {

						signals.editScript.dispatch( object, script );

					} );
					scriptsContainer.add( edit );

					const remove = new UIButton( strings.getKey( 'sidebar/script/remove' ) );
					remove.setMarginLeft( '4px' );
					remove.onClick( function () {

						if ( confirm( 'Are you sure?' ) ) {

							editor.execute( new RemoveScriptCommand( editor, editor.selected, script ) );

						}

					} );
					scriptsContainer.add( remove );

					scriptsContainer.add( new UIBreak() );

				} )( object, scripts[ i ] );

			}

		}

	}

	// signals

	signals.objectSelected.add( function ( object ) {

		if ( object !== null && editor.camera !== object ) {

			container.setDisplay( 'block' );

			update();

		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.scriptAdded.add( update );
	signals.scriptRemoved.add( update );
	signals.scriptChanged.add( update );

	return container;

}

export { SidebarScript };
