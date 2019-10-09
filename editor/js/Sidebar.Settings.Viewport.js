/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Settings.Viewport = function ( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UI.Div();
	container.add( new UI.Break() );

	container.add( new UI.Text( strings.getKey( 'sidebar/settings/viewport/grid' ) ).setWidth( '90px' ) );

	var show = new UI.THREE.Boolean( true ).onChange( update );
	container.add( show );

	/*
	var snapSize = new UI.Number( 25 ).setWidth( '40px' ).onChange( update );
	container.add( snapSize );

	var snap = new UI.THREE.Boolean( false, 'snap' ).onChange( update );
	container.add( snap );
	*/

	function update() {

		signals.showGridChanged.dispatch( show.getValue() );

		// signals.snapChanged.dispatch( snap.getValue() === true ? snapSize.getValue() : null );

	}

	return container;

};
