Menubar.Edit = function ( signals ) {

	var container = new UI.Panel();
	container.setFloat( 'left' );
	container.setWidth( '50px' );
	container.setCursor( 'pointer' );
	container.onMouseOver( function () { options.setDisplay( '' ) } );
	container.onMouseOut( function () { options.setDisplay( 'none' ) } );
	container.onClick( function () { options.setDisplay( 'none' ) } );

	var title = new UI.Panel();
	title.setTextContent( 'Edit' ).setColor( '#666' );
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
	option.setTextContent( 'Delete' ).setColor( '#666' );
	option.onClick( function () { signals.removeSelectedObject.dispatch(); } );
	options.add( option );

	return container;

}
