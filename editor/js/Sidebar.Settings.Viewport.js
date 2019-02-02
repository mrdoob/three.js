/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Settings.Viewport = function ( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UI.Div();
	container.add( new UI.Break() );

	container.add( new UI.Text( strings.getKey( 'sidebar/settings/viewport/grid' ) ).setWidth( '90px' ) );

	var div = new UI.Div().setPaddingLeft( '90px' );
	container.add( div );

	div.add( new UI.Text( 'Visible' ).setPaddingRight( '8px' ).setWidth( '90px' ) );
	var show = new UI.THREE.Boolean( true ).onChange( update );
	div.add( show, new UI.Break() );

	div.add( new UI.Text( 'Size' ).setPaddingRight( '8px' ).setWidth( '90px' ) );
	var size = new UI.Integer( 30 ).setWidth( '45px' ).onChange( update );
	div.add( size, new UI.Break() );

	div.add( new UI.Text( 'Divisions' ).setPaddingRight( '8px' ).setWidth( '90px' ) );
	var divisions = new UI.Integer( 30 ).setWidth( '45px' ).onChange( update );
	div.add( divisions, new UI.Break() );

	div.add( new UI.Text( 'Color1' ).setPaddingRight( '8px' ).setWidth( '90px' ) );
	var color1 = new UI.Color().setWidth( '45px' ).onChange( update ).setValue( "#444444" );
	div.add( color1, new UI.Break() );

	div.add( new UI.Text( 'Color2' ).setPaddingRight( '8px' ).setWidth( '90px' ) );
	var color2 = new UI.Color().setWidth( '45px' ).onChange( update ).setValue( "#888888" );
	div.add( color2, new UI.Break() );

	div.add( new UI.Text( 'Dividers' ).setPaddingRight( '8px' ).setWidth( '90px' ) );
	var dividers = new UI.Integer( 6 ).setWidth( '45px' ).onChange( update );
	div.add( dividers, new UI.Break() );

	/*
	var snapSize = new UI.Number( 25 ).setWidth( '40px' ).onChange( update );
	container.add( snapSize );

	var snap = new UI.THREE.Boolean( false, 'snap' ).onChange( update );
	container.add( snap );
	*/

	function update() {

		signals.showGridChanged.dispatch( {
			visible: show.getValue(),
			size: size.getValue(),
			divisions: divisions.getValue(),
			color1: color1.getHexValue(),
			color2: color2.getHexValue(),
			dividers: dividers.getValue()
		} );

		// signals.snapChanged.dispatch( snap.getValue() === true ? snapSize.getValue() : null );

	}

	return container;

};
