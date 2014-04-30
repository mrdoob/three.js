Sidebar.ComponentClasses = function ( editor ) {

	var container = new UI.Panel();
	container.setId('componentPanel');

	drawPanel();

	// events

	editor.signals.componentClassRegistryChanged.add( function (componentClass) {

		container.clear();
		drawPanel();

	} );

	return container;

	//

	function drawPanel() {

		drawNewComponent();
		drawComponentPanels();

	}

	function drawNewComponent () {
		
		var newComponentPanel = new UI.Panel();
		var newComponentButton = new UI.Button( 'New Component' ).onClick( function () {

			var newComponentClass = new ComponentClass();
			editor.registerComponentClass( newComponentClass );
			editor.signals.currentComponentClassChanged.dispatch( newComponentClass );

		} );

		newComponentPanel.add( newComponentButton );
		container.add( newComponentPanel );

	}

	function drawComponentPanels () {

		var componentClasses = editor.componentClasses;

		Object.keys(componentClasses).forEach( function( uuid ) {
		
			var componentClass = componentClasses[ uuid ];
			container.add( createComponentPanel( componentClass ) );

		} );

	}

	function createComponentPanel (componentClass) {
		
		var panel = new UI.CollapsiblePanel();
		panel.addStatic( new UI.Text( componentClass.name ) );
		panel.add( new UI.Break() );


		// name

		var componentNameRow = new UI.Panel();
		var componentName = new UI.Input().setValue( componentClass.name ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( function () {

			componentClass.name = componentName.getValue();
			
			// An error occurs if you do this immediately
			setTimeout( function () {

				editor.signals.componentClassRegistryChanged.dispatch( componentClass );

			} );

		} );

		componentNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
		componentNameRow.add( componentName );

		panel.add( componentNameRow );

		// stats

		var componentStatsRow = new UI.Panel();
		var componentStats = new UI.Text( componentClass.instances.length ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' );

		componentStatsRow.add( new UI.Text( 'Instances' ).setWidth( '90px' ) );
		componentStatsRow.add( componentStats );

		panel.add( componentStatsRow );

		// CRUD

		var componentCrudRow = new UI.Panel();

		var componentDuplicateButton = new UI.Button( 'Duplicate' ).onClick( function () {

			var newName = incrementName( componentClass.name );

			var newComponentClass = new ComponentClass({
				name: newName,
				src: componentClass.getCode(),
			});

			editor.registerComponentClass( newComponentClass );
			editor.signals.currentComponentClassChanged.dispatch( newComponentClass );

		} );

		var componentDeleteButton = new UI.Button( 'Delete' ).onClick( function () {
			
			editor.deleteComponentClass( componentClass );

		} );

		componentCrudRow.add( componentDuplicateButton );
		componentCrudRow.add( componentDeleteButton );


		panel.add( componentCrudRow );

		// events

		panel.onClick( function () {

			editor.signals.currentComponentClassChanged.dispatch( componentClass );

		} );

		return panel;

	}

	function incrementName( name ) {

		var digits = 0;
		var endsInNumber = 0;

		while (true) {
		
			var tryDigits = digits + 1;
			var endOfName = name.slice( -tryDigits );
			var isNumber = !Number.isNaN( Number( endOfName ) );
			if (isNumber && tryDigits < name.length ) { 
				endsInNumber = Number( endOfName );
				digits++;
			} else {
				break;
			}

		}
		
		if ( digits > 0 ) {
			name = name.slice( 0, -digits );
		}

		if ( endsInNumber === 0) {
			endsInNumber = 2;
		} else {
			endsInNumber++;
		}

		name += endsInNumber;

		return name;
		
	}

}