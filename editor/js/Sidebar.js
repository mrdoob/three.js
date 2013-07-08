var Sidebar = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setPosition( 'absolute' );
	container.setClass( 'sidebar' );

	container.add( new Sidebar.Renderer( signals ) );
	container.add( new Sidebar.Scene( signals ) );
	container.add( new Sidebar.Object3D( signals ) );
	container.add( new Sidebar.Geometry( signals ) );
	container.add( new Sidebar.Material( signals ) );
	container.add( new Sidebar.Animation( signals ) );

	return container;

}
