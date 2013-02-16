Sidebar.Renderer = function ( signals ) {

	var container = new UI.Panel();
	container.setPadding( '10px' );
	container.setBorderTop( '1px solid #ccc' );

	container.add( new UI.Text().setValue( 'RENDERER' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	// clear color

	var clearColorRow = new UI.Panel();
	var clearColor = new UI.Color( 'absolute' ).setLeft( '100px' ).setValue( '#aaaaaa' ).onChange( updateClearColor );

	clearColorRow.add( new UI.Text().setValue( 'Clear color' ).setColor( '#666' ) );
	clearColorRow.add( clearColor );

	container.add( clearColorRow );

	function updateClearColor() {

		signals.clearColorChanged.dispatch( clearColor.getHexValue() );

	}

	// events

	signals.clearColorChanged.add( function ( color ) {

		clearColor.setHexValue( color );

	} );

	return container;

}
