/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.TorusKnotGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// radius

	var radiusRow = new UI.Row();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/torusKnot_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tube

	var tubeRow = new UI.Row();
	var tube = new UI.Number( parameters.tube ).onChange( update );

	tubeRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/torusKnot_geometry/tube' ) ).setWidth( '90px' ) );
	tubeRow.add( tube );

	container.add( tubeRow );

	// tubularSegments

	var tubularSegmentsRow = new UI.Row();
	var tubularSegments = new UI.Integer( parameters.tubularSegments ).setRange( 1, Infinity ).onChange( update );

	tubularSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/torusKnot_geometry/tubularsegments' ) ).setWidth( '90px' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// radialSegments

	var radialSegmentsRow = new UI.Row();
	var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/torusKnot_geometry/radialsegments' ) ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// p

	var pRow = new UI.Row();
	var p = new UI.Number( parameters.p ).onChange( update );

	pRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/torusKnot_geometry/p' ) ).setWidth( '90px' ) );
	pRow.add( p );

	container.add( pRow );

	// q

	var qRow = new UI.Row();
	var q = new UI.Number( parameters.q ).onChange( update );

	qRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/torusKnot_geometry/q' ) ).setWidth( '90px' ) );
	qRow.add( q );

	container.add( qRow );


	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE[ geometry.type ](
			radius.getValue(),
			tube.getValue(),
			tubularSegments.getValue(),
			radialSegments.getValue(),
			p.getValue(),
			q.getValue()
		) ) );

	}

	return container;

};

Sidebar.Geometry.TorusKnotBufferGeometry = Sidebar.Geometry.TorusKnotGeometry;
