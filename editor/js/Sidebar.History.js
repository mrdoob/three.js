/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

import { Panel, Break, UIText } from './libs/ui.js';
import { Boolean, Outliner } from './libs/ui.three.js';

var SidebarHistory = function ( editor ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var config = editor.config;

	var history = editor.history;

	var container = new Panel();

	container.add( new UIText( strings.getKey( 'sidebar/history/history' ) ) );

	//

	var persistent = new Boolean( config.getKey( 'settings/history' ), strings.getKey( 'sidebar/history/persistent' ) );
	persistent.setPosition( 'absolute' ).setRight( '8px' );
	persistent.onChange( function () {

		var value = this.getValue();

		config.setKey( 'settings/history', value );

		if ( value ) {

			alert( 'The history will be preserved across sessions.\nThis can have an impact on performance when working with textures.' );

			var lastUndoCmd = history.undos[ history.undos.length - 1 ];
			var lastUndoId = ( lastUndoCmd !== undefined ) ? lastUndoCmd.id : 0;
			editor.history.enableSerialization( lastUndoId );

		} else {

			signals.historyChanged.dispatch();

		}

	} );
	container.add( persistent );

	container.add( new Break(), new Break() );

	var outliner = new Outliner( editor );
	container.add( outliner );

	//

	var refreshUI = function () {

		var options = [];

		function buildOption( object ) {

			var option = document.createElement( 'div' );
			option.value = object.id;

			return option;

		}

		( function addObjects( objects ) {

			for ( var i = 0, l = objects.length; i < l; i ++ ) {

				var object = objects[ i ];

				var option = buildOption( object );
				option.innerHTML = '&nbsp;' + object.name;

				options.push( option );

			}

		} )( history.undos );


		( function addObjects( objects ) {

			for ( var i = objects.length - 1; i >= 0; i -- ) {

				var object = objects[ i ];

				var option = buildOption( object );
				option.innerHTML = '&nbsp;' + object.name;
				option.style.opacity = 0.3;

				options.push( option );

			}

		} )( history.redos, '&nbsp;' );

		outliner.setOptions( options );

	};

	refreshUI();

	// events

	signals.editorCleared.add( refreshUI );

	signals.historyChanged.add( refreshUI );
	signals.historyChanged.add( function ( cmd ) {

		outliner.setValue( cmd !== undefined ? cmd.id : null );

	} );


	return container;

};

export { SidebarHistory };
