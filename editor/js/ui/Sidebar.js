var Sidebar = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setWidth( '300px' ).setHeight( '100%' );
	container.setBackgroundColor( '#eee' );
	container.setOverflow( 'auto' );

	container.add( new Sidebar.Scene( signals ) );
	container.add( new Sidebar.Object3D( signals ) );
	container.add( new Sidebar.Geometry( signals ) );
	container.add( new Sidebar.Material( signals ) );

	return container;

}
