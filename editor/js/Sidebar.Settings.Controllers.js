/**
 * @author rheros / https://github.com/rheros
 */

Sidebar.Settings.Controllers = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;

	var container = new UI.Div();

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
		signals.changeCameraCtrlType.dispatch( v );

	} else {

		type.setValue( "Default" );

	}

	type.onChange( function () {

		var value = this.getValue();
		signals.changeCameraCtrlType.dispatch( value );
		config.setKey( 'cameraCtrlType', value );

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
		signals.changeWheelSpeed.dispatch( speed );

	} else {

		speed = 100;
		wheelSpeed.setValue( 100 );

	}

	wheelSpeed.onChange( function () {

		speed = this.value;
		signals.changeWheelSpeed.dispatch( speed );
		config.setKey( 'wheelSpeed', speed );

	} );

	speedRow.add( new UI.Text( 'wheelSpeed' ).setWidth( '90px' ) );
	speedRow.add( wheelSpeed );

	container.add( speedRow );

	//focus Size
	var size = 0.8;
	var sizeRow = new UI.Row();
	var focusSize = new UI.Number( size ).setRange( 0.2, 1 )
	if ( config.getKey( 'focusSize' ) !== undefined ) {

		size = config.getKey( 'focusSize' );
		focusSize.setValue( size );
		signals.changeFocusSize.dispatch( size );

	} else {

		size = 0.8;
		focuseSize.setValue( 0.8 );

	}

	focusSize.onChange( function () {

		size = this.value;
		signals.changeFocusSize.dispatch( size );
		config.setKey( 'focusSize', size );

	} );

	sizeRow.add( new UI.Text( "focusSize" ).setWidth( '90px' ) );
	sizeRow.add( focusSize );
	container.add( sizeRow );

	return container
}