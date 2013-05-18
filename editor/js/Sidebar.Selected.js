Sidebar.Selected = function ( signals ) {

  var container = new UI.Panel();

  container.add( new Sidebar.Object3D( signals ) );
  container.add( new Sidebar.Geometry( signals ) );
  container.add( new Sidebar.Material( signals ) );

  return container;

}
