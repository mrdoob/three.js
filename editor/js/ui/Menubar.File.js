Menubar.File = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#eee' );
	container.setWidth( '120px' );
	container.setPadding( '10px' );

	container.add( new UI.Panel().add( new UI.Text().setValue( 'Open' ).setColor( '#666' ) ) );
	container.add( new UI.Panel().add( new UI.Text().setValue( 'Reset' ).setColor( '#666' ) ) );
	container.add( new UI.Panel().add( new UI.Text().setValue( 'Export Geometry' ).setColor( '#666' ) ) );
	container.add( new UI.Panel().add( new UI.Text().setValue( 'Export Scene' ).setColor( '#666' ) ) );
	container.add( new UI.Panel().add( new UI.Text().setValue( 'Export OBJ' ).setColor( '#666' ) ) );

	return container;

}
