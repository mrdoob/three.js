/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Script = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/script/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/script/collapsed', boolean );

	} );
	container.setDisplay( 'none' );

	container.addStatic( new UI.Text( 'Script' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break() );

	//

	var scriptsContainer = new UI.Panel();
	container.add( scriptsContainer );

	var eventType = new UI.Select();
	eventType.setOptions( {

		'init': 'init',
		'keydown': 'keydown',
		'keyup': 'keyup',
		'mousedown': 'mousedown',
		'mouseup': 'mouseup',
		'mousemove': 'mousemove',
		'update': 'update'

	} );
	container.add( eventType );

	var button = new UI.Button( 'Add' );
	button.setMarginLeft( '5px' );
	button.onClick( function () {

		var script = new UI.ScriptEditor();
		script.setValue( { event: eventType.getValue(), source: '' } );
		script.onChange( function () {

			signals.scriptChanged.dispatch();

		} );
		scriptsContainer.add( script );

	} );
	container.add( button );

	// signals

	signals.objectSelected.add( function ( object ) {

		scriptsContainer.clear();

		if ( object !== null ) {

			container.setDisplay( 'block' );

			var sources = editor.scripts[ object.uuid ];

			if ( sources !== undefined ) {

				for ( var i = 0; i < sources.length; i ++ ) {

					var script = new UI.ScriptEditor();
					script.setValue( sources[ i ] );
					script.onChange( function () {

						signals.scriptChanged.dispatch();

					} );
					scriptsContainer.add( script );

				}

			}

		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.scriptChanged.add( function () {

		var array = [];
		var object = editor.selected;

		for ( var i = 0; i < scriptsContainer.children.length; i ++ ) {

			var script = scriptsContainer.children[ i ];

			array.push( script.getValue() );

		}

		editor.scripts[ object.uuid ] = array;

	} );

	return container;

};
