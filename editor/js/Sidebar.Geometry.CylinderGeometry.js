Sidebar.Geometry.CylinderGeometry = function ( signals, geometry ) {

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setPaddingTop( '10px' );

	// radiusTop

	var radiusTopRow = new UI.Panel();
	var radiusTop = new UI.Number( geometry.radiusTop ).onChange( update );

	radiusTopRow.add( new UI.Text( 'Radius top' ).setWidth( '90px' ).setColor( '#666' ) );
	radiusTopRow.add( radiusTop );

	container.add( radiusTopRow );

	// radiusBottom

	var radiusBottomRow = new UI.Panel();
	var radiusBottom = new UI.Number( geometry.radiusBottom ).onChange( update );

	radiusBottomRow.add( new UI.Text( 'Radius bottom' ).setWidth( '90px' ).setColor( '#666' ) );
	radiusBottomRow.add( radiusBottom );

	container.add( radiusBottomRow );

	// height

	var heightRow = new UI.Panel();
	var height = new UI.Number( geometry.height ).onChange( update );

	heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ).setColor( '#666' ) );
	heightRow.add( height );

	container.add( heightRow );

	// radialSegments

	var radialSegmentsRow = new UI.Panel();
	var radialSegments = new UI.Integer( geometry.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UI.Text( 'Radius segments' ).setWidth( '90px' ).setColor( '#666' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Panel();
	var heightSegments = new UI.Integer( geometry.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ).setColor( '#666' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// openEnded

	var openEndedRow = new UI.Panel();
	var openEnded = new UI.Checkbox( geometry.openEnded ).onChange( update );

	openEndedRow.add( new UI.Text( 'Open ended' ).setWidth( '90px' ).setColor( '#666' ) );
	openEndedRow.add( openEnded );

	container.add( openEndedRow );

	//

	function update() {

		editor.remakeGeometry( geometry,
			{
				radiusTop: radiusTop.getValue(),
				radiusBottom: radiusBottom.getValue(),
				height: height.getValue(),
				radialSegments: radialSegments.getValue(),
				heightSegments: heightSegments.getValue(),
				openEnded: openEnded.getValue()
			}
		);

	}

	return container;

}
