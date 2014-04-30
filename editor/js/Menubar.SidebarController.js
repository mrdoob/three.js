Menubar.SidebarController = function ( editor ) {

	var container = new UI.Panel();

	var inspectorButton = new UI.Button('Inspector').onClick( function () {

		editor.setSidebarMode('inspector');

	} );

	var componentsButton = new UI.Button('Components').onClick( function () {

		editor.setSidebarMode('components');

	} );

	container.add(inspectorButton);
	container.add(componentsButton);

	editor.setSidebarMode('inspector');

	return container;
}
