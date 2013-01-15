Menubar.File = function ( signals ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setTextContent( 'File' ).setColor( '#666' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	//

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	/*
	// open

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Open' );
	option.onClick( function () { alert( 'Open' ) } );
	options.add( option );
	*/

	// reset scene

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Reset' );
	option.onClick( function () { signals.resetScene.dispatch(); } );
	options.add( option );

	// export geometry

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export Geometry' );
	option.onClick( function () { signals.exportGeometry.dispatch( { exporter: THREE.GeometryExporter } ); } );
	options.add( option );

	// export scene

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export Scene' );
	option.onClick( function () { signals.exportScene.dispatch(); } );
	options.add( option );

	// export OBJ

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export OBJ' );
	option.onClick( function () { signals.exportGeometry.dispatch( { exporter: THREE.OBJExporter } ); } );
	options.add( option );

	//

	return container;

}
