Sidebar.Geometry.TorusKnotGeometry = function ( signals, geometry ) {

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setPaddingTop( '10px' );

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( geometry.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ).setColor( '#666' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tube

	var tubeRow = new UI.Panel();
	var tube = new UI.Number( geometry.tube ).onChange( update );

	tubeRow.add( new UI.Text( 'Tube' ).setWidth( '90px' ).setColor( '#666' ) );
	tubeRow.add( tube );

	container.add( tubeRow );

	// radialSegments

	var radialSegmentsRow = new UI.Panel();
	var radialSegments = new UI.Integer( geometry.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UI.Text( 'Radial segments' ).setWidth( '90px' ).setColor( '#666' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// tubularSegments

	var tubularSegmentsRow = new UI.Panel();
	var tubularSegments = new UI.Integer( geometry.tubularSegments ).setRange( 1, Infinity ).onChange( update );

	tubularSegmentsRow.add( new UI.Text( 'Tubular segments' ).setWidth( '90px' ).setColor( '#666' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// p

	var pRow = new UI.Panel();
	var p = new UI.Number( geometry.p ).onChange( update );

	pRow.add( new UI.Text( 'P' ).setWidth( '90px' ).setColor( '#666' ) );
	pRow.add( p );

	container.add( pRow );

	// q

	var qRow = new UI.Panel();
	var q = new UI.Number( geometry.q ).onChange( update );

	pRow.add( new UI.Text( 'Q' ).setWidth( '90px' ).setColor( '#666' ) );
	pRow.add( q );

	container.add( qRow );

	// heightScale

	var heightScaleRow = new UI.Panel();
	var heightScale = new UI.Number( geometry.heightScale ).onChange( update );

	pRow.add( new UI.Text( 'Height scale' ).setWidth( '90px' ).setColor( '#666' ) );
	pRow.add( heightScale );

	container.add( heightScaleRow );


	//

	function update() {

		editor.remakeGeometry( geometry,
			{
				radius: radius.getValue(),
				tube: tube.getValue(),
				radialSegments: radialSegments.getValue(),
				tubularSegments: tubularSegments.getValue(),
				p: p.getValue(),
				q: q.getValue(),
				heightScale: heightScale.getValue()
			}
		);

	}

	return container;

}
