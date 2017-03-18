/**
 * @author tschw
 */

Sidebar.Geometry.TeapotBufferGeometry = function ( signals, object ) {

	var container = new UI.Row();

	var parameters = object.geometry.parameters;

	// size

	var sizeRow = new UI.Row();
	var size = new UI.Number( parameters.size ).onChange( update );

	sizeRow.add( new UI.Text( 'Size' ).setWidth( '90px' ) );
	sizeRow.add( size );

	container.add( sizeRow );

	// segments

	var segmentsRow = new UI.Row();
	var segments = new UI.Integer( parameters.segments ).setRange( 1, Infinity ).onChange( update );

	segmentsRow.add( new UI.Text( 'Segments' ).setWidth( '90px' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	// bottom

	var bottomRow = new UI.Row();
	var bottom = new UI.Checkbox( parameters.bottom ).onChange( update );

	bottomRow.add( new UI.Text( 'Bottom' ).setWidth( '90px' ) );
	bottomRow.add( bottom );

	container.add( bottomRow );

	// lid

	var lidRow = new UI.Row();
	var lid = new UI.Checkbox( parameters.lid ).onChange( update );

	lidRow.add( new UI.Text( 'Lid' ).setWidth( '90px' ) );
	lidRow.add( lid );

	container.add( lidRow );

	// body

	var bodyRow = new UI.Row();
	var body = new UI.Checkbox( parameters.body ).onChange( update );

	bodyRow.add( new UI.Text( 'Body' ).setWidth( '90px' ) );
	bodyRow.add( body );

	container.add( bodyRow );

	// fitted lid

	var fitLidRow = new UI.Row();
	var fitLid = new UI.Checkbox( parameters.fitLid ).onChange( update );

	fitLidRow.add( new UI.Text( 'Fitted Lid' ).setWidth( '90px' ) );
	fitLidRow.add( fitLid );

	container.add( fitLidRow );

	// blinn-sized

	var blinnRow = new UI.Row();
	var blinn = new UI.Checkbox( parameters.blinn ).onChange( update );

	blinnRow.add( new UI.Text( 'Blinn-scaled' ).setWidth( '90px' ) );
	blinnRow.add( blinn );

	container.add( blinnRow );

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.TeapotBufferGeometry(
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
