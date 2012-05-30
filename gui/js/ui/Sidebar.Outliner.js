Sidebar.Outliner = function ( signals ) {

	var selected = null;

	var container = new UI.Panel();
	container.setPadding( '8px' );
	container.setBorderTop( '1px solid #ccc' );

	container.add( new UI.Text().setText( 'SCENE' ).setColor( '#666' ) );

	container.add( new UI.Break(), new UI.Break() );

	return container;

}
