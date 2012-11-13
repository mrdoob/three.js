Menubar.File = function ( signals ) {

	var container = new UI.Panel();
	container.setFloat( 'left' );
	container.setWidth( '50px' );
	container.setCursor( 'pointer' );
	container.onMouseOver( function () { options.setDisplay( '' ) } );
	container.onMouseOut( function () { options.setDisplay( 'none' ) } );
	container.onClick( function () { options.setDisplay( 'none' ) } );

	var title = new UI.Panel();
	title.setTextContent( 'File' ).setColor( '#666' );
	title.setMargin( '0px' );
	title.setPadding( '8px' )
	container.add( title );

	//

	var options = new UI.Panel();
	options.setWidth( '140px' );
	options.setBackgroundColor( '#ddd' );
	options.setPadding( '10px' );
	options.setDisplay( 'none' );
	container.add( options );

	var option = new UI.Panel();
	option.setTextContent( 'Open' ).setColor( '#666' );
	option.onClick( function () { alert( 'Open' ) } );
	options.add( option );

	var option = new UI.Panel();
	option.setTextContent( 'Reset' ).setColor( '#666' );
	option.onClick( function () { signals.resetScene.dispatch(); } );
	options.add( option );

	var option = new UI.Panel();
	option.setTextContent( 'Export Geometry' ).setColor( '#666' );
	option.onClick( function () { signals.exportGeometry.dispatch(); } );
	options.add( option );

	var option = new UI.Panel();
	option.setTextContent( 'Export Scene' ).setColor( '#666' );
	option.onClick( function () { signals.exportScene.dispatch(); } );
	options.add( option );

	var option = new UI.Panel();
	option.setTextContent( 'Export OBJ' ).setColor( '#666' );
	option.onClick( function () { alert( 'Export OBJ' ) } );
	options.add( option );

	return container;

}
