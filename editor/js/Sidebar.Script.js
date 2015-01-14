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

	var newScript = new UI.Button( 'New' );
	newScript.setMarginLeft( '5px' );
	newScript.onClick( function () {

		var script = new UI.ScriptEditor( editor );
		script.setValue( { name: '', source: 'return {\n\tupdate: function ( event ) {}\n};' } );
		script.onChange( function () {

			signals.scriptChanged.dispatch();

		} );
		scriptsContainer.add( script );

	} );
	container.add( newScript );

	var loadScript = new UI.Button( 'Load' );
	loadScript.setMarginLeft( '4px' );
	container.add( loadScript );

	// signals

	signals.objectSelected.add( function ( object ) {

		scriptsContainer.clear();

		if ( object !== null ) {

			container.setDisplay( 'block' );

			var sources = editor.scripts[ object.uuid ];

			if ( sources !== undefined ) {

				for ( var i = 0; i < sources.length; i ++ ) {

					var script = new UI.ScriptEditor( editor );
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
