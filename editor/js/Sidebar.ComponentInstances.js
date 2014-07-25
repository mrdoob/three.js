Sidebar.ComponentInstances = function ( editor ) {

	var container = new UI.Panel();

	drawPanel();

	// events

	editor.signals.objectSelected.add( function () {

		container.clear();
		drawPanel();

	} );

	editor.signals.componentClassRegistryChanged.add( function () {

		container.clear();
		drawPanel();

	} );

	return container;

	//

	function drawPanel() {

		var selectedObject = editor.selected;

		if ( selectedObject ) {

			drawComponentPanels( selectedObject );
			drawNewComponent( selectedObject );

		}

	}

	function drawComponentPanels ( selectedObject ) {

		var components = editor.componentsForObject( selectedObject );

		components.forEach( function( component ) {
		
			container.add( createComponentPanel( component ) );

		} );

	}

	function drawNewComponent ( selectedObject ) {

		var newComponentPanel = new UI.Panel();

		var options = {
			null: '...'
		};

		Object.keys(editor.componentClasses).forEach( function (uuid) {

			var componentClass = editor.componentClasses[ uuid ];
			options[ componentClass.uuid ] = componentClass.name;

		} );

		options.new = '( New Component )';

		var newComponentLabel = new UI.Text( 'Add' ).setWidth( '50px' ).setColor( '#888' ).setFontSize( '14px' );
		var newComponentSelect = new UI.Select().setWidth( '200px' ).setOptions( options ).onChange( function () {

			var uuid = newComponentSelect.getValue();
			
			if ( uuid === 'new' ) {

				var newComponentClass = new ComponentClass();
				editor.registerComponentClass( newComponentClass );
				uuid = newComponentClass.uuid;
				
				editor.setSidebarMode('components');
				editor.signals.currentComponentClassChanged.dispatch( newComponentClass );

			}

			var componentClass = editor.componentClasses[ uuid ];
			editor.instantiateComponent( componentClass, selectedObject );

		} );

		newComponentPanel.add( newComponentLabel );
		newComponentPanel.add( newComponentSelect );
		container.add( newComponentPanel );

	}

	function createComponentPanel ( component ) {
		
		var panel = new UI.CollapsiblePanel();
		panel.addStatic( new UI.Text( component.class.name ) );
		panel.add( new UI.Break() );

		// CRUD

		var componentCrudRow = new UI.Panel();

		var componentEditButton = new UI.Button( 'Edit' ).onClick( function () {
			
			editor.setSidebarMode('components');
			editor.signals.currentComponentClassChanged.dispatch( component.class );

		} );

		var componentDeleteButton = new UI.Button( 'Delete' ).onClick( function () {
			
			editor.deleteComponentInstance( component );
			editor.signals.componentClassRegistryChanged.dispatch();

		} );

		componentCrudRow.add( componentEditButton );
		componentCrudRow.add( componentDeleteButton );
		panel.add( componentCrudRow );

		return panel;

	}

}