/**
 * @author mrdoob / http://mrdoob.com/
 */

var Toolbar = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'toolbar' );

	var buttons = new UI.Panel();
	container.add( buttons );

	// translate / rotate / scale

	var translate = new UI.Button( 'translate' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	buttons.add( translate );

	var rotate = new UI.Button( 'rotate' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'rotate' );

	} );
	buttons.add( rotate );

	var scale = new UI.Button( 'scale' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'scale' );

	} );
	buttons.add( scale );

	// grid

	var grid = new UI.Number( 25 ).setWidth( '40px' ).onChange( update );
	buttons.add( new UI.Text( 'Grid: ' ) );
	buttons.add( grid );

	var snap = new UI.Checkbox( false ).onChange( update ).setMarginLeft( '10px' );
	buttons.add( snap );
	buttons.add( new UI.Text( 'snap' ).setMarginLeft( '3px' ) );

	var local = new UI.Checkbox( false ).onChange( update ).setMarginLeft( '10px' );
	buttons.add( local );
	buttons.add( new UI.Text( 'local' ).setMarginLeft( '3px' ) );

	var showGrid = new UI.Checkbox().onChange( update ).setValue( true ).setMarginLeft( '10px' );
	buttons.add( showGrid );
	buttons.add( new UI.Text( 'show' ).setMarginLeft( '3px' ) );

	function update() {

		signals.snapChanged.dispatch( snap.getValue() === true ? grid.getValue() : null );
		signals.spaceChanged.dispatch( local.getValue() === true ? "local" : "world" );
		signals.showGridChanged.dispatch( showGrid.getValue() );

	}

	return container;

}
