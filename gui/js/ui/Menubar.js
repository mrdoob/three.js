var Menubar = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#eee' );

	var options = new UI.Panel();
	options.setMargin( '8px' );
	options.add( new UI.Text().setText( 'File' ).setColor( '#666' ).setMarginRight( '20px' ) );
	options.add( new UI.Text().setText( 'Edit' ).setColor( '#666' ).setMarginRight( '20px' ) );
	options.add( new UI.Text().setText( 'About' ).setColor( '#666' ).setMarginRight( '20px' ) );
	container.add( options );

	return container;

}
