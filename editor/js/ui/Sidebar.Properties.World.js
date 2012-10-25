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

	var fogTypeRow = new UI.Panel();
	var fogType = new UI.Select( 'absolute' ).setOptions( {

		'None': 'None',
		'Fog': 'Linear',
		'FogExp2': 'Exponential'

	} ).setLeft( '100px' ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( updateFogType );

	fogTypeRow.add( new UI.Text().setValue( 'Fog type' ).setColor( '#666' ) );
	fogTypeRow.add( fogType );

	container.add( fogTypeRow );

	// fog color

	var fogColorRow = new UI.Panel();
	fogColorRow.setDisplay( 'none' );

	var fogColor = new UI.Color( 'absolute' ).setLeft( '100px' ).setValue( '#aaaaaa' ).onChange( updateFogColor );

	fogColorRow.add( new UI.Text().setValue( 'Fog color' ).setColor( '#666' ) );
	fogColorRow.add( fogColor );

	container.add( fogColorRow );

	// clear color lock

	var colorLockEnabled = true;

	var colorLockRow = new UI.Panel();
	colorLockRow.setDisplay( 'inline-block' ).setLeft( '100px' ).setMargin( '0px' );

	var colorLock = new UI.Checkbox( 'relative' ).setLeft( '10px' ).setValue( colorLockEnabled ).onChange( updateColorLock );
	colorLockRow.add( colorLock );

	fogColorRow.add( colorLockRow );

	// fog near

	var fogNearRow = new UI.Panel();
	fogNearRow.setDisplay( 'none' );

	var fogNear = new UI.Number( 'absolute' ).setLeft( '100px' ).setWidth( '60px' ).setRange( 0, Infinity ).setValue( 1 ).onChange( updateFogParameters );

	fogNearRow.add( new UI.Text().setValue( 'Fog near' ).setColor( '#666' ) );
	fogNearRow.add( fogNear );

	container.add( fogNearRow );

	var fogFarRow = new UI.Panel();
	fogFarRow.setDisplay( 'none' );

	// fog far

	var fogFar = new UI.Number( 'absolute' ).setLeft( '100px' ).setWidth( '60px' ).setRange( 0, Infinity ).setValue( 5000 ).onChange( updateFogParameters );

	fogFarRow.add( new UI.Text().setValue( 'Fog far' ).setColor( '#666' ) );
	fogFarRow.add( fogFar );

	container.add( fogFarRow );

	// fog density

	var fogDensityRow = new UI.Panel();
	fogDensityRow.setDisplay( 'none' );

	var fogDensity = new UI.Number( 'absolute' ).setLeft( '100px' ).setWidth( '60px' ).setRange( 0, 0.1 ).setPrecision( 5 ).setValue( 0.00025 ).onChange( updateFogParameters );

	fogDensityRow.add( new UI.Text().setValue( 'Fog density' ).setColor( '#666' ) );
	fogDensityRow.add( fogDensity );

	container.add( fogDensityRow );

	//

	function updateClearColor() {

		signals.clearColorChanged.dispatch( clearColor.getHexValue() );

	}

	function updateFogType() {

		var type = fogType.getValue();

		if ( type === "None" ) {

			fogColorRow.setDisplay( 'none' );

		} else {

			fogColorRow.setDisplay( '' );

		}

		if ( type === "Fog" ) {

			fogNearRow.setDisplay( '' );
			fogFarRow.setDisplay( '' );

		} else {

			fogNearRow.setDisplay( 'none' );
			fogFarRow.setDisplay( 'none' );

		}

		if ( type === "FogExp2" ) {

			fogDensityRow.setDisplay( '' );

		} else {

			fogDensityRow.setDisplay( 'none' );

		}

		signals.fogTypeChanged.dispatch( type );

	}

	function updateFogColor() {

		signals.fogColorChanged.dispatch( fogColor.getHexValue() );

		if ( colorLockEnabled )  {

			clearColor.setValue( fogColor.getValue() );
			updateClearColor();

		}

	}

	function updateFogParameters() {

		signals.fogParametersChanged.dispatch( fogNear.getValue(), fogFar.getValue(), fogDensity.getValue() );

	}

	function updateColorLock() {

		colorLockEnabled = colorLock.getValue();
		updateFogColor();

	}

	// events

	return container;

}
