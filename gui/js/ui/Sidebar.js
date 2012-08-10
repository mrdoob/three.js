var Sidebar = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setWidth( '300px' ).setHeight( '100%' );
	container.setBackgroundColor( '#eee' );
	container.setOverflow( 'auto' );

	var outliner = new Sidebar.Outliner( signals );
	container.add( outliner );

	var properties = new Sidebar.Properties( signals );
	container.add( properties );

	return container;

}
