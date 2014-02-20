Menubar.Help = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setTextContent( 'Help' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	//

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// about

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'About' );
	option.onClick( function () { window.open( 'https://github.com/CyberSEES/gi-studio', '_blank' ) } );
	options.add( option );

	//

	return container;

}
