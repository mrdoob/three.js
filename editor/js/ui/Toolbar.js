var Toolbar = function ( signals ) {

	var container = new UI.Panel();
	container.setPosition( 'absolute' );
	container.setClass( 'toolbar' );

	var buttons = new UI.Panel();
	buttons.setPadding( '7px' );
	container.add( buttons );

	// axis

	var x = new UI.Checkbox( true ).onChange( update );
	buttons.add( x );
	buttons.add( new UI.Text( 'x' ) );

	var y = new UI.Checkbox( true ).setMarginLeft( '10px' ).onChange( update );
	buttons.add( y );
	buttons.add( new UI.Text( 'y ' ) );

	var z = new UI.Checkbox( true ).setMarginLeft( '10px' ).onChange( update );
	buttons.add( z );
	buttons.add( new UI.Text( 'z ' ) );

	buttons.add( new UI.Text().setWidth( '25px' ) );

	// grid

	var grid = new UI.Number( 25 ).onChange( update );
	grid.dom.style.width = '42px';
	buttons.add( new UI.Text( 'Grid: ' ) );
	buttons.add( grid );

	var snap = new UI.Checkbox( false ).onChange( update );
	buttons.add( snap );
	buttons.add( new UI.Text( 'snap' ) );

	function update() {

		var axis = new THREE.Vector3();
		axis.x = x.getValue() === true ? 1 : 0;
		axis.y = y.getValue() === true ? 1 : 0;
		axis.z = z.getValue() === true ? 1 : 0;

		signals.modifierAxisChanged.dispatch( axis );

		signals.snapChanged.dispatch( snap.getValue() === true ? grid.getValue() : null );

	}

	update();

	return container;

}
