function ComponentClass ( opts ) {

	opts = opts || {};

	var defaultSrc = [
		'// hello world',
		'this.update = function () {',
		'  ',
		'}',
	].join('\n');

	this.uuid = THREE.Math.generateUUID();
	this.name = opts.name || 'Unnamed Component';
	this.src = opts.src || defaultSrc;
	this.instances = [];

}

Sidebar.ComponentClasses = function ( editor ) {

	//
	// Temp Component Def
	//

	if (!Object.keys(editor.componentClasses).length) {

		var bobber = new ComponentClass({
			name: 'Bobber',
			src: [
				'// bobber',
				'var t = 0;',
				'this.update = function () {',
				'  t++;',
				'  var y = 100 * sin( t / 50 );',
				'  this.target.position.setY( y );',
				'}',
			].join('\n'),
		});

		editor.registerComponentClass( bobber );

		var spinner = new ComponentClass({
			uuid: 1,
			name: 'Spinner',
			src: [
				'// spinner',
				'this.update = function () {',
				'  var y = 1 / 50;',
				'  this.target.rotateY( y );',
				'}',
			].join('\n'),
		});

		editor.registerComponentClass( spinner );

	}
	
	//
	// Temp Component Def
	//

	var container = new UI.Panel();
	container.setId('componentPanel');

	drawNewComponentsPanel();

	// events

	editor.signals.componentClassRegistryChanged.add( function (componentClass) {

		container.clear();
		drawNewComponentsPanel();

	} );

	return container;

	function drawNewComponentsPanel() {

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

		var newName = incrementComponentName( componentClass.name );

		var newComponentClass = new ComponentClass({
			name: newName,
			src: componentClass.src,
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

	//

	function incrementComponentName( name ) {

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