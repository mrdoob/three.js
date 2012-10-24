Sidebar.Properties.World = function ( signals ) {

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setPadding( '10px' );

	var objectType = new UI.Text().setColor( '#666' ).setValue( 'WORLD' );
	container.add( objectType );
	container.add( new UI.Break(), new UI.Break() );

	// clear color

	var clearColorRow = new UI.Panel();
	var clearColor = new UI.Color( 'absolute' ).setLeft( '100px' ).setValue( '#aaaaaa' ).onChange( updateClearColor );

	clearColorRow.add( new UI.Text().setValue( 'Clear color' ).setColor( '#666' ) );
	clearColorRow.add( clearColor );

	container.add( clearColorRow );

	// fog

	var fogRow = new UI.Panel();
	var fog = new UI.Select( 'absolute' ).setOptions( {

		'None': 'None',
		'Fog': 'Fog',
		'FogExp2': 'FogExp2'

	} ).setLeft( '100px' ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( updateFog );

	fogRow.add( new UI.Text().setValue( 'Fog' ).setColor( '#666' ) );
	fogRow.add( fog );

	container.add( fogRow );

	//

	function updateClearColor() {

		signals.clearColorChanged.dispatch( clearColor.getHexValue() );

	}

	function updateFog() {

		console.log( "fog", fog.getValue() );

	}

	// events

	return container;

}
