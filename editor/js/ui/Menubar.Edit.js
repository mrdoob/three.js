Menubar.Edit = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#eee' );
	container.setWidth( '120px' );
	container.setPadding( '10px' );

	container.add( new UI.Panel().add( new UI.Text().setValue( 'Delete' ).setColor( '#666' ) ) );

	return container;

}
