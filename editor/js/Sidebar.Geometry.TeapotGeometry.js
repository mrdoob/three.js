import { UIDiv, UIRow, UIText, UIInteger, UICheckbox, UINumber } from './libs/ui.js';

import { TeapotGeometry } from '../../examples/jsm/geometries/TeapotGeometry.js';

function GeometryParametersPanel( signals, object ) {

	const container = new UIDiv();

	const parameters = object.geometry.parameters;

	// size

	const sizeRow = new UIRow();
	const size = new UINumber( parameters.size ).onChange( update );

	sizeRow.add( new UIText( 'Size' ).setWidth( '90px' ) );
	sizeRow.add( size );

	container.add( sizeRow );

	// segments

	const segmentsRow = new UIRow();
	const segments = new UIInteger( parameters.segments ).setRange( 1, Infinity ).onChange( update );

	segmentsRow.add( new UIText( 'Segments' ).setWidth( '90px' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	// bottom

	const bottomRow = new UIRow();
	const bottom = new UICheckbox( parameters.bottom ).onChange( update );

	bottomRow.add( new UIText( 'Bottom' ).setWidth( '90px' ) );
	bottomRow.add( bottom );

	container.add( bottomRow );

	// lid

	const lidRow = new UIRow();
	const lid = new UICheckbox( parameters.lid ).onChange( update );

	lidRow.add( new UIText( 'Lid' ).setWidth( '90px' ) );
	lidRow.add( lid );

	container.add( lidRow );

	// body

	const bodyRow = new UIRow();
	const body = new UICheckbox( parameters.body ).onChange( update );

	bodyRow.add( new UIText( 'Body' ).setWidth( '90px' ) );
	bodyRow.add( body );

	container.add( bodyRow );

	// fitted lid

	const fitLidRow = new UIRow();
	const fitLid = new UICheckbox( parameters.fitLid ).onChange( update );

	fitLidRow.add( new UIText( 'Fitted Lid' ).setWidth( '90px' ) );
	fitLidRow.add( fitLid );

	container.add( fitLidRow );

	// blinn-sized

	const blinnRow = new UIRow();
	const blinn = new UICheckbox( parameters.blinn ).onChange( update );

	blinnRow.add( new UIText( 'Blinn-scaled' ).setWidth( '90px' ) );
	blinnRow.add( blinn );

	container.add( blinnRow );

	function update() {

		object.geometry.dispose();

		object.geometry = new TeapotGeometry(
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

}

export { GeometryParametersPanel };
