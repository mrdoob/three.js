var Menubar = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#eee' );
	container.setPadding( '0px' ).setMargin( '0px' );

	container.add( new Menubar.File( signals ) );
	container.add( new Menubar.Edit( signals ) );
	container.add( new Menubar.Add( signals ) );
	container.add( new Menubar.Help( signals ) );

	return container;

}
