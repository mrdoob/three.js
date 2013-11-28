var Sidebar = function ( editor ) {

	var container = new UI.Panel();

	container.add( new Sidebar.Renderer( editor ) );
	container.add( new Sidebar.Scene( editor ) );
	container.add( new Sidebar.Object3D( editor ) );
	container.add( new Sidebar.Geometry( editor ) );
	container.add( new Sidebar.Material( editor ) );
	container.add( new Sidebar.Animation( editor ) );

	return container;

}
