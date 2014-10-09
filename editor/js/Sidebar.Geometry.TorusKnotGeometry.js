/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.TorusKnotGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tube

	var tubeRow = new UI.Panel();
	var tube = new UI.Number( parameters.tube ).onChange( update );

	tubeRow.add( new UI.Text( 'Tube' ).setWidth( '90px' ) );
	tubeRow.add( tube );

	container.add( tubeRow );

	// radialSegments

	var radialSegmentsRow = new UI.Panel();
	var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UI.Text( 'Radial segments' ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// tubularSegments

	var tubularSegmentsRow = new UI.Panel();
	var tubularSegments = new UI.Integer( parameters.tubularSegments ).setRange( 1, Infinity ).onChange( update );

	tubularSegmentsRow.add( new UI.Text( 'Tubular segments' ).setWidth( '90px' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// p

	var pRow = new UI.Panel();
	var p = new UI.Number( parameters.p ).onChange( update );

	pRow.add( new UI.Text( 'P' ).setWidth( '90px' ) );
	pRow.add( p );

	container.add( pRow );

	// q

	var qRow = new UI.Panel();
	var q = new UI.Number( parameters.q ).onChange( update );

	pRow.add( new UI.Text( 'Q' ).setWidth( '90px' ) );
	pRow.add( q );

	container.add( qRow );

	// heightScale

	var heightScaleRow = new UI.Panel();
	var heightScale = new UI.Number( parameters.heightScale ).onChange( update );

	pRow.add( new UI.Text( 'Height scale' ).setWidth( '90px' ) );
	pRow.add( heightScale );

	container.add( heightScaleRow );


	//

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.TorusKnotGeometry(
			radius.getValue(),
			tube.getValue(),
			radialSegments.getValue(),
			tubularSegments.getValue(),
			p.getValue(),
			q.getValue(),
			heightScale.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}
