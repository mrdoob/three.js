/**
 * @author tschw
 */

import { UIRow, UIText, UIInteger, UICheckbox, UINumber } from './libs/ui.js';

import { TeapotBufferGeometry } from '../../examples/jsm/geometries/TeapotBufferGeometry.js';

var SidebarGeometryTeapotBufferGeometry = function ( signals, object ) {

	var container = new UIRow();

	var parameters = object.geometry.parameters;

	// size

	var sizeRow = new UIRow();
	var size = new UINumber( parameters.size ).onChange( update );

	sizeRow.add( new UIText( 'Size' ).setWidth( '90px' ) );
	sizeRow.add( size );

	container.add( sizeRow );

	// segments

	var segmentsRow = new UIRow();
	var segments = new UIInteger( parameters.segments ).setRange( 1, Infinity ).onChange( update );

	segmentsRow.add( new UIText( 'Segments' ).setWidth( '90px' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	// bottom

	var bottomRow = new UIRow();
	var bottom = new UICheckbox( parameters.bottom ).onChange( update );

	bottomRow.add( new UIText( 'Bottom' ).setWidth( '90px' ) );
	bottomRow.add( bottom );

	container.add( bottomRow );

	// lid

	var lidRow = new UIRow();
	var lid = new UICheckbox( parameters.lid ).onChange( update );

	lidRow.add( new UIText( 'Lid' ).setWidth( '90px' ) );
	lidRow.add( lid );

	container.add( lidRow );

	// body

	var bodyRow = new UIRow();
	var body = new UICheckbox( parameters.body ).onChange( update );

	bodyRow.add( new UIText( 'Body' ).setWidth( '90px' ) );
	bodyRow.add( body );

	container.add( bodyRow );

	// fitted lid

	var fitLidRow = new UIRow();
	var fitLid = new UICheckbox( parameters.fitLid ).onChange( update );

	fitLidRow.add( new UIText( 'Fitted Lid' ).setWidth( '90px' ) );
	fitLidRow.add( fitLid );

	container.add( fitLidRow );

	// blinn-sized

	var blinnRow = new UIRow();
	var blinn = new UICheckbox( parameters.blinn ).onChange( update );

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
