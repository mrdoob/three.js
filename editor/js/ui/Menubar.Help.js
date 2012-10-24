Menubar.Help = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#ccc' );
	container.setWidth( '120px' );
	container.setPadding( '10px' );

	container.add( new UI.Panel().add( new UI.Text().setValue( 'About' ).setColor( '#666' ) ) );

	return container;

}
