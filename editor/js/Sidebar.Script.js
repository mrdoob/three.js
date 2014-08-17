Sidebar.Script = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( true );
	container.setDisplay( 'none' );

	container.addStatic( new UI.Text( 'Script' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break() );

	var scriptsRow = new UI.Panel();
	container.add( scriptsRow );

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			container.setDisplay( 'block' );

		} else {

			container.setDisplay( 'none' );

		}

	} );

	return container;

}
