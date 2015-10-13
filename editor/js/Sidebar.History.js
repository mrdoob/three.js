/**
 * @author dforrer / https://github.com/dforrer
 */

Sidebar.History = function ( editor ) {

	var signals = editor.signals;

	var config = editor.config;

	var history = editor.history;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/history/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/history/collapsed', boolean );

	} );

	container.addStatic( new UI.Text( 'HISTORY' ) );

	// Checkbox 'Save History'

	var saveHistorySpan = new UI.Span().setPosition( 'absolute' ).setLeft( '180px' ).setFontSize( '13px' );
	var saveHistoryCheckbox = new UI.Checkbox( config.getKey( 'project/history/stored' ) ).setLeft( '50px' ).onChange( function () {

		config.setKey( 'project/history/stored', this.getValue() );
		var saveHistory = this.getValue();

		if ( saveHistory ) {

			alert( 'The history will be preserved across a browser refresh.\nThis can have an impact on performance (mainly when working with textures)!' );

			var lastUndoCmd = history.undos[ history.undos.length - 1 ];
			var lastUndoId = ( lastUndoCmd !== undefined ) ? lastUndoCmd.id : 0;
			editor.history.enableSerialization( lastUndoId );

		} else {

			signals.historyChanged.dispatch();

		}

	} );

	saveHistorySpan.add( saveHistoryCheckbox );
	saveHistorySpan.add( new UI.Text( 'Save History' ).setPosition( 'relative' ).setLeft( '5px' ) );

	saveHistorySpan.onClick( function ( event ) {

		event.stopPropagation(); // Avoid panel collapsing

	} );

	container.addStatic( saveHistorySpan );

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
