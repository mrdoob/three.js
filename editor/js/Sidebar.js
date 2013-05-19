var Sidebar = function ( editor, signals ) {

	var container = new UI.Panel();
	container.setPosition( 'absolute' );
	container.setClass( 'sidebar' );

	container.add( new Sidebar.Renderer( signals ) );
  container.add( new Sidebar.Outliner( signals ) );
  container.add( new Sidebar.Selected( signals ) );
  container.add( new Sidebar.Animation( signals ) );

	return container;

}
