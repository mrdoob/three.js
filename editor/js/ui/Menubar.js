var Menubar = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#eee' );

	var options = new UI.Panel();
	options.setMargin( '8px' );
	options.add( new UI.Text().setValue( 'File' ).setColor( '#666' ).setMarginRight( '20px' ) );
	options.add( new UI.Text().setValue( 'Edit' ).setColor( '#666' ).setMarginRight( '20px' ) );
	options.add( new UI.Text().setValue( 'Add' ).setColor( '#666' ).setMarginRight( '20px' ) );
	options.add( new UI.Text().setValue( 'Help' ).setColor( '#666' ).setMarginRight( '20px' ) );
	container.add( options );

	return container;

}
