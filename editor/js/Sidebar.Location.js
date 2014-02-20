Sidebar.Location = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

	container.add( new UI.Text( 'LOCATION' ) );
	container.add( new UI.Break(), new UI.Break() );

	// location input

	var locationInputRow = new UI.Panel();
	var locationInput = new UI.Input().setColor( '#444' ).setFontSize( '12px' ).onChange( function () {

			//editor.setObjectName( editor.selected, objectName.getValue() );

	} );
	var goButton = new UI.Button( 'Go' ).onClick( function() {

	} );

	locationInputRow.add( locationInput );
	locationInputRow.add( goButton );

	container.add( locationInputRow );

	return container;
}
