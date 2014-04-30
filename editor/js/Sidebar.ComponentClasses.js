Sidebar.ComponentClasses = function ( editor ) {

	//
	// Temp Component Def
	//

	if (!Object.keys(editor.componentClasses).length) {

		editor.componentClasses = [{
			uuid: 0,
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
		},{
			uuid: 1,
			name: 'Spinner',
			src: [
				'// spinner',
				'this.update = function () {',
				'  var y = 1 / 50;',
				'  this.target.rotateY( y );',
				'}',
			].join('\n'),
		}];

	}
	
	//
	// Temp Component Def
	//

	var container = new UI.Panel();
	container.setId('componentPanel');

	drawComponentPanels();

	// events

	editor.signals.componentClassNameChanged.add( function (componentClass) {

		container.clear();
		drawComponentPanels();

	} );

	return container;

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

			editor.signals.componentClassNameChanged.dispatch( componentClass );

		} );

	} );

	componentNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
	componentNameRow.add( componentName );

	panel.add( componentNameRow );

	// stats

	var componentStatsRow = new UI.Panel();
	var componentStats = new UI.Text( 0 ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' );

	componentStatsRow.add( new UI.Text( 'Instances' ).setWidth( '90px' ) );
	componentStatsRow.add( componentStats );

	panel.add( componentStatsRow );

	// events

	panel.onClick( function () {

		editor.signals.currentComponentClassChanged.dispatch( componentClass );

	} );

	return panel;

}