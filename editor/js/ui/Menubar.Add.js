Menubar.Add = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#ccc' );
	container.setWidth( '120px' );
	container.setPadding( '10px' );

	container.add( new UI.Panel().add( new UI.Text().setValue( 'Sphere' ).setColor( '#666' ) ) );
	container.add( new UI.Panel().add( new UI.Text().setValue( 'Cube' ).setColor( '#666' ) ) );
	container.add( new UI.Panel().add( new UI.Text().setValue( 'Plane' ).setColor( '#666' ) ) );

	return container;

}
