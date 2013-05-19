var Sidebar = function ( editor, signals ) {

	var container = new UI.Panel().setWidth('300px');
	container.setPosition( 'absolute' );
	container.setClass( 'sidebar' );

	container.add( new Sidebar.Renderer( signals ) );
  container.add( new Sidebar.Outliner( signals ) );
  container.add( new Sidebar.Attributes( signals ) );
  container.add( new Sidebar.Animation( signals ) );

	return container;

}
