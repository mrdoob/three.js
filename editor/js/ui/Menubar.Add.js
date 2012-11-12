Menubar.Add = function ( signals ) {

	var container = new UI.Panel();
	container.setFloat( 'left' );
	container.setWidth( '50px' );
	container.setCursor( 'pointer' );
	container.onMouseOver( function () { options.setDisplay( '' ) } );
	container.onMouseOut( function () { options.setDisplay( 'none' ) } );
	container.onClick( function () { options.setDisplay( 'none' ) } );

	var title = new UI.Panel();
	title.setTextContent( 'Add' ).setColor( '#666' );
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
	option.setTextContent( 'Sphere' ).setColor( '#666' );
	option.onClick( function () { alert( 'Sphere' ) } );
	options.add( option );

	var option = new UI.Panel();
	option.setTextContent( 'Cube' ).setColor( '#666' );
	option.onClick( function () { alert( 'Cube' ) } );
	options.add( option );

	var option = new UI.Panel();
	option.setTextContent( 'Plane' ).setColor( '#666' );
	option.onClick( function () { alert( 'Plane' ) } );
	options.add( option );

	return container;

}
