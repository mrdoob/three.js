Sidebar.Outliner = function ( signals ) {

  var container = new UI.TabbedPanel();

  container.add( new Sidebar.Outliner.Scene( signals ) );
  container.add( new Sidebar.Outliner.Geometries( signals ) );
  container.add( new Sidebar.Outliner.Materials( signals ) );
  container.add( new Sidebar.Outliner.Textures( signals ) );

  return container;

}
