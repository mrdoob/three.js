Menubar.Help = function ( signals ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setTextContent( 'Help' ).setColor( '#666' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	//

	var options = new UI.Panel();
	options.setClass( 'options' );
	options.setWidth( '140px' );
	container.add( options );

	// about

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'About' );
	option.onClick( function () { alert( 'About' ) } );
	options.add( option );

	//

	return container;

}
