/**
 * @author dforrer / https://github.com/dforrer
 */

Sidebar.History = function ( editor ) {

	var signals = editor.signals;

	var history = editor.history;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/history/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/history/collapsed', boolean );

	} );

	container.addStatic( new UI.Text( 'HISTORY' ) );

	// Actions

	var objectActions = new UI.Select().setPosition( 'absolute' ).setRight( '8px' ).setFontSize( '11px' );
	objectActions.setOptions( {

		'Actions': 'Actions',
		'Serialization': 'Serialize History?'

	} );
	objectActions.onClick( function ( event ) {

		event.stopPropagation(); // Avoid panel collapsing

	} );
	objectActions.onChange( function ( event ) {

		var currentValue = history.serializationEnabled ? 'yes' : 'no';

		var response;
		if ( ( response = prompt( 'Should the history be preserved across a browser refresh? (yes or no)', currentValue ) ) === null ) {

			this.setValue( 'Actions' );
			return;

		}

		if ( response.toLowerCase() === 'yes' ) {

			alert( 'The history will be preserved across a browser refresh.' );

			var lastUndoCmd = history.undos[ history.undos.length - 1 ];
			var lastUndoId = ( lastUndoCmd !== undefined ) ? lastUndoCmd.id : 0;
			editor.history.enableSerialization( lastUndoId );

		} else {

			alert( 'The history will NOT be preserved across a browser refresh.' );
			editor.history.disableSerialization();

		}

		this.setValue( 'Actions' );

	} );
	container.addStatic( objectActions );


	container.add( new UI.Break() );

	var ignoreObjectSelectedSignal = false;

	var outliner = new UI.Outliner( editor );
	outliner.onChange( function () {

		ignoreObjectSelectedSignal = true;

		editor.history.goToState( parseInt( outliner.getValue() ) );

		ignoreObjectSelectedSignal = false;

	} );
	outliner.onDblClick( function () {

		//editor.focusById( parseInt( outliner.getValue() ) );

	} );
	container.add( outliner );

	//

	var refreshUI = function () {

		var options = [];
		var enumerator = 1;

		( function addObjects( objects, pad ) {

			for ( var i = 0, l = objects.length; i < l; i ++ ) {

				var object = objects[ i ];

				var html = pad + "<span style='color: #0000cc '>" + enumerator ++ + ". Undo: " + object.name + "</span>";

				options.push( { value: object.id, html: html } );

			}

		} )( history.undos, '&nbsp;' );


		( function addObjects( objects, pad ) {

			for ( var i = objects.length - 1; i >= 0; i -- ) {

				var object = objects[ i ];

				var html = pad + "<span style='color: #71544e'>" + enumerator ++ + ". Redo: " +  object.name + "</span>";

				options.push( { value: object.id, html: html } );

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
