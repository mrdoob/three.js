/**
 * @author tschw
 */


import { Row, UIText, Integer, Checkbox, UINumber } from './libs/ui.js';

import { TeapotBufferGeometry } from '../../examples/jsm/geometries/TeapotBufferGeometry.js';

var SidebarGeometryTeapotBufferGeometry = function ( signals, object ) {

	var container = new Row();

	var parameters = object.geometry.parameters;

	// size

	var sizeRow = new Row();
	var size = new UINumber( parameters.size ).onChange( update );

	sizeRow.add( new UIText( 'Size' ).setWidth( '90px' ) );
	sizeRow.add( size );

	container.add( sizeRow );

	// segments

	var segmentsRow = new Row();
	var segments = new Integer( parameters.segments ).setRange( 1, Infinity ).onChange( update );

	segmentsRow.add( new UIText( 'Segments' ).setWidth( '90px' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	// bottom

	var bottomRow = new Row();
	var bottom = new Checkbox( parameters.bottom ).onChange( update );

	bottomRow.add( new UIText( 'Bottom' ).setWidth( '90px' ) );
	bottomRow.add( bottom );

	container.add( bottomRow );

	// lid

	var lidRow = new Row();
	var lid = new Checkbox( parameters.lid ).onChange( update );

	lidRow.add( new UIText( 'Lid' ).setWidth( '90px' ) );
	lidRow.add( lid );

	container.add( lidRow );

	// body

	var bodyRow = new Row();
	var body = new Checkbox( parameters.body ).onChange( update );

	bodyRow.add( new UIText( 'Body' ).setWidth( '90px' ) );
	bodyRow.add( body );

	container.add( bodyRow );

	// fitted lid

	var fitLidRow = new Row();
	var fitLid = new Checkbox( parameters.fitLid ).onChange( update );

	fitLidRow.add( new UIText( 'Fitted Lid' ).setWidth( '90px' ) );
	fitLidRow.add( fitLid );

	container.add( fitLidRow );

	// blinn-sized

	var blinnRow = new Row();
	var blinn = new Checkbox( parameters.blinn ).onChange( update );

	blinnRow.add( new UIText( 'Blinn-scaled' ).setWidth( '90px' ) );
	blinnRow.add( blinn );

	container.add( blinnRow );

	function update() {

		object.geometry.dispose();

		object.geometry = new TeapotBufferGeometry(
			size.getValue(),
			segments.getValue(),
			bottom.getValue(),
			lid.getValue(),
			body.getValue(),
			fitLid.getValue(),
			blinn.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

};

export { SidebarGeometryTeapotBufferGeometry };
