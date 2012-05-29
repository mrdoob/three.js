var MenuBar = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#eee' );

	var options = new UI.Panel();
	options.setMargin( '8px' );
	options.add( new UI.Text().setText( 'File' ).setColor( '#666' ).setMarginRight( '10px' ) );
	options.add( new UI.Text().setText( 'About' ).setColor( '#666' ).setMarginRight( '10px' ) );
	container.add( options );

	return container;

}
