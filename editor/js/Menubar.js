var Menubar = function ( editor ) {

	var container = new UI.Panel();

	container.add( new Menubar.File( editor ) );
	container.add( new Menubar.Edit( editor ) );
	container.add( new Menubar.Add( editor ) );
	container.add( new Menubar.View( editor ) );
	container.add( new Menubar.Help( editor ) );

	return container;

}
