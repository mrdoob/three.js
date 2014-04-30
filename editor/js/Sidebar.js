var Sidebar = function ( editor ) {

	var container = new UI.Panel();

	var showInspector = function() {

		container.add( new Sidebar.Renderer( editor ) );
		container.add( new Sidebar.Scene( editor ) );
		container.add( new Sidebar.Object3D( editor ) );
		container.add( new Sidebar.Geometry( editor ) );
		container.add( new Sidebar.Material( editor ) );
		container.add( new Sidebar.Animation( editor ) );

	};

	var showComponents = function() {

		container.add( new Sidebar.ComponentClasses( editor ) );

	};

	// events

	editor.signals.sidebarModeChanged.add( function ( mode ) {

		container.clear();

		switch (mode) {
			
			case 'inspector':
				showInspector();
				break;

			case 'components':
				showComponents();
				break;

		}

	} );

	return container;

}
