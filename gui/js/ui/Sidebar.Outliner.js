Sidebar.Outliner = function ( signals ) {

	var selected = null;

	var container = new UI.Panel();
	container.setPadding( '8px' );
	container.setBorderTop( '1px solid #ccc' );

	container.add( new UI.Text().setValue( 'SCENE' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	var scene = new UI.Select().setMultiple( true ).setOptions( [ 'test', 'test' ] ).setWidth( '100%' ).setHeight('140px').setColor( '#444' ).setFontSize( '12px' ).onChange( update );
	container.add( scene );

	container.add( new UI.Break(), new UI.Break() );

	function update() {

		console.log( scene.getValue() );

	}

	return container;

}
