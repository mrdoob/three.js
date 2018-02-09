/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Settings = function ( editor ) {

	var wheelSpeed = 100;
	var config = editor.config;
	var signals = editor.signals;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );
	container.setPaddingBottom( '20px' );

	// class

	var options = {
		'css/light.css': 'light',
		'css/dark.css': 'dark'
	};

	var themeRow = new UI.Row();
	var theme = new UI.Select().setWidth( '150px' );
	theme.setOptions( options );

	if ( config.getKey( 'theme' ) !== undefined ) {

		theme.setValue( config.getKey( 'theme' ) );

	}

	theme.onChange( function () {

		var value = this.getValue();

		editor.setTheme( value );
		editor.config.setKey( 'theme', value );

	} );

	themeRow.add( new UI.Text( 'Theme' ).setWidth( '90px' ) );
	themeRow.add( theme );

	container.add( themeRow );

	//camera ctrl type

	var options = {
		'Default': 'Default',
		'Maya': "Maya"
	}

	var typeRow = new UI.Row();
	var type = new UI.Select().setWidth( '150px' );
	type.setOptions( options );

	if ( config.getKey( 'cameraCtrlType' ) !== undefined ) {

		var v = config.getKey( 'cameraCtrlType' );
		type.setValue( v );
		editor.setCamerCtrlType( v );

	} else {

		type.setValue( "Default" );

	}

	type.onChange( function () {

		var value = this.getValue();

		editor.setCamerCtrlType( value );
		editor.config.setKey( 'cameraCtrlType', value );

	} );

	typeRow.add( new UI.Text( 'CamCtrlType' ).setWidth( '90px' ) );
	typeRow.add( type );

	container.add( typeRow )

	//wheel speed
	var speed = 100;
	var speedRow = new UI.Row();
	var wheelSpeed = new UI.Number( speed ).setRange( 1, 300 );

	if ( config.getKey( 'wheelSpeed' ) !== undefined ) {

		speed = config.getKey( 'wheelSpeed' );
		wheelSpeed.setValue( speed );
		editor.setWheelSpeed( speed );

	} else {
		speed = 100;
		wheelSpeed.setValue( 100 );
	}

	wheelSpeed.onChange( function () {
		speed = this.value;
		editor.setWheelSpeed( speed );
		editor.config.setKey( 'wheelSpeed', speed );

	} );

	speedRow.add( new UI.Text( 'wheelSpeed' ).setWidth( '90px' ) );
	speedRow.add( wheelSpeed );

	container.add( speedRow );

	container.add( new Sidebar.Settings.Shortcuts( editor ) );
	container.add( new Sidebar.Settings.Viewport( editor ) );

	return container;

};