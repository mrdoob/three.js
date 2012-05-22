var SideBar = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setWidth( '300px' ).setHeight( '100%' );
	container.setBackgroundColor( '#eee' );

	var properties = new Properties( signals );
	container.add( properties );

	return container;

}
