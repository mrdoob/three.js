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

	var scriptsRow = new UI.Panel();
	container.add( scriptsRow );

	// source

	var scriptSourceRow = new UI.Panel();
	var scriptSource = new UI.TextArea().setWidth( '240px' ).setHeight( '180px' ).setColor( '#444' ).setFontSize( '12px' );
	scriptSource.onChange( function () {

		var object = editor.selected;

		object.script = new THREE.Script( scriptSource.getValue() );

		editor.signals.objectChanged.dispatch( object );

	} );

	scriptSourceRow.add( scriptSource );

	container.add( scriptSourceRow );

	//

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			container.setDisplay( 'block' );

			if ( object.script !== undefined ) {

				scriptSource.setValue( object.script.source );

			} else {

				scriptSource.setValue( '' );

			}

		} else {

			container.setDisplay( 'none' );

		}

	} );

	return container;

}
