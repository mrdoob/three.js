Sidebar.Outliner = function ( signals ) {

	var selected = null;

	var container = new UI.Panel();
	container.setPadding( '8px' );
	container.setBorderTop( '1px solid #ccc' );

	container.add( new UI.Text().setValue( 'SCENE' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	var scene = new UI.Select().setMultiple( true ).setOptions( [ 'test', 'test' ] ).setWidth( '280px' ).setHeight('140px').setColor( '#444' ).setFontSize( '12px' );
	container.add( scene );

	container.add( new UI.Break(), new UI.Break() );

	return container;

}
