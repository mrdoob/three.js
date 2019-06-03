/**
 * @author Temdog007 / http://github.com/Temdog007
 */

Sidebar.Geometry.TubeGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// points

	var pointsRow = new UI.Row();
	pointsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/path' ) ).setWidth( '90px' ) );

	var points = new UI.Points3().setValue( parameters.path.points ).onChange( update );
	pointsRow.add( points );

	container.add( pointsRow );

	// radius

	var radiusRow = new UI.Row();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tubularSegments

	var tubularSegmentsRow = new UI.Row();
	var tubularSegments = new UI.Integer( parameters.tubularSegments ).onChange( update );

	tubularSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/tubularsegments' ) ).setWidth( '90px' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// radialSegments

	var radialSegmentsRow = new UI.Row();
	var radialSegments = new UI.Integer( parameters.radialSegments ).onChange( update );

	radialSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/radialsegments' ) ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// closed

	var closedRow = new UI.Row();
	var closed = new UI.Checkbox( parameters.closed ).onChange( update );

	closedRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/closed' ) ).setWidth( '90px' ) );
	closedRow.add( closed );

	container.add( closedRow );

	// curveType

	var curveTypeRow = new UI.Row();
	var curveType = new UI.Select().setOptions( { centripetal: 'centripetal', chordal: 'chordal', catmullrom: 'catmullrom' } ).setValue( parameters.path.curveType ).onChange( update );

	curveTypeRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/curvetype' ) ).setWidth( '90px' ), curveType );

	container.add( curveTypeRow );

	// tension

	var tensionRow = new UI.Row().setDisplay( curveType.getValue() == 'catmullrom' ? '' : 'none' );
	var tension = new UI.Number( parameters.path.tension ).setStep( 0.01 ).onChange( update );

	tensionRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/tension' ) ).setWidth( '90px' ), tension );

	container.add( tensionRow );

	//

	function update() {

		tensionRow.setDisplay( curveType.getValue() == 'catmullrom' ? '' : 'none' );

		editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
			new THREE.CatmullRomCurve3( points.getValue(), closed.getValue(), curveType.getValue(), tension.getValue() ),
			tubularSegments.getValue(),
			radius.getValue(),
			radialSegments.getValue(),
			closed.getValue()
		) ) );

	}

	return container;

};

Sidebar.Geometry.TubeBufferGeometry = Sidebar.Geometry.TubeGeometry;
