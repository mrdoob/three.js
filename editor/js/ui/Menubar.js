var Menubar = function ( signals ) {

	var container = new UI.Panel();
	container.setPosition( 'absolute' );
	container.setClass( 'menubar' );

	container.add( new Menubar.File( signals ) );
	container.add( new Menubar.Edit( signals ) );
	container.add( new Menubar.Add( signals ) );
	container.add( new Menubar.Help( signals ) );

	return container;

}
