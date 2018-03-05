/**
 * @author rheros / https://github.com/rheros
 */

Sidebar.Settings.Controllers = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;

	var container = new UI.Div();
	let items = [];
	container.add( new UI.Break() );

	var TitleRow = new UI.Row();
	TitleRow.dom.title = "Set mouse button to ctrl editor camera";
	TitleRow.add( new UI.Text( 'Mouse Button' ) );
	container.add( TitleRow );

	//camera ctrl type
	var options = {
		0: 'Rotate',
		1: 'Zoom',
		2: 'Pan'
	}

	var ctrls = [ 'LeftBtn', 'MidBtn', 'RightBtn' ]

	for ( var i = 0; i < ctrls.length; i++ ) {

		let typeRow = new UI.Row();
		items[ i ] = new UI.Select().setWidth( '150px' );
		let type = items[ i ]
		type.setOptions( options );

		let configName = 'settings/mouse/' + ctrls[ i ]
		let v = config.getKey( configName );
		type.setValue( v );

		type.onChange( function () {

			let value = this.getValue();
			setItem( configName, value, i );
			//update state list to latest
			signals.mouseConfigChanged.dispatch();

		} );

		typeRow.add( new UI.Text( ctrls[ i ] ).setTextTransform( 'capitalize' ).setWidth( '90px' ) );
		typeRow.add( type );

		container.add( typeRow )

	}

	//wheel speed
	var speedKey='settings/mouse/wheelSpeed'
	var speed = 100;
	var speedRow = new UI.Row();
	var wheelSpeed = new UI.Number( speed ).setRange( 1, 300 );
	wheelSpeed.setValue( config.getKey( speedKey) );

	wheelSpeed.onChange( function () {

		config.setKey( speedKey, this.value );
		signals.changeWheelSpeed.dispatch(this.value);

	} );

	speedRow.add( new UI.Text('wheelSpeed' ).setTextTransform( 'capitalize' ).setWidth( '90px' ) );
	speedRow.add( wheelSpeed );

	container.add( speedRow );

	function setItem( configname, value, index ) {

		for ( var i = 0; i < ctrls.length; i++ ) {
			if ( i != index ) {
				let name = 'settings/mouse/' + ctrls[ i ];
				if ( value == config.getKey( name ) ) {
					var oldValue = config.getKey( configname );
					config.setKey( name, oldValue );
					items[ i ].setValue( oldValue );

				}
			}
		}
		config.setKey( configname, value );
	}

	return container
}