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

	var scripts = new UI.Panel();
	container.add( scripts );

	//

	var scriptEvent = new UI.Select();
	scriptEvent.setOptions( {

		'init': 'init',
		'keydown': 'keydown',
		'keyup': 'keyup',
		'update': 'update'

	} );
	container.add( scriptEvent );

	var addButton = new UI.Button( 'Add' );
	addButton.onClick( function () {

		var script = new UI.ScriptEditor();
		script.onChange( function () {

			signals.scriptChanged.dispatch();

		} );
		scripts.add( script );

	} );
	container.add( addButton );

	// signals

	signals.objectSelected.add( function ( object ) {

		scripts.clear();

		if ( object !== null ) {

			container.setDisplay( 'block' );

			var sources = editor.scripts[ object.uuid ];

			if ( sources !== undefined ) {

				for ( var i = 0; i < sources.length; i ++ ) {

					var source = sources[ i ];

					var script = new UI.ScriptEditor();
					script.setValue( source );
					script.onChange( function () {

						signals.scriptChanged.dispatch();

					} );
					scripts.add( script );

				}

			}

		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.scriptChanged.add( function () {

		var array = [];
		var object = editor.selected;

		for ( var i = 0; i < scripts.children.length; i ++ ) {

			var script = scripts.children[ i ];
			array.push( script.getValue() );

		}

		editor.scripts[ object.uuid ] = array;

	} );

	return container;

};
