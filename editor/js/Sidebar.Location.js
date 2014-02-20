Sidebar.Location = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

	container.add( new UI.Text( 'LOCATION' ) );
	container.add( new UI.Break(), new UI.Break() );

	// location input

	var locationInputRow = new UI.Panel();
	var locationInput = new UI.Input().setWidth( '230px' ).setColor( '#444' ).setFontSize( '12px' );
	var autocomplete = new google.maps.places.Autocomplete( locationInput.dom );

	var goButton = new UI.Button( 'Go' ).onClick( function() {

	} );

	locationInputRow.add( locationInput );
	locationInputRow.add( goButton );

	container.add( locationInputRow );

	return container;
}
