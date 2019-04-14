/**
 * @author rfm1201
 */

Sidebar.Geometry.LatheGeometry = function( editor, object ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// segments

	var segmentsRow = new UI.Row();
	var segments = new UI.Integer( parameters.segments ).onChange( update );

	segmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/lathe_geometry/segments' ) ).setWidth( '90px' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	// phiStart

	var phiStartRow = new UI.Row();
	var phiStart = new UI.Number( parameters.phiStart * 180 / Math.PI ).onChange( update );

	phiStartRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/lathe_geometry/phistart' ) ).setWidth( '90px' ) );
	phiStartRow.add( phiStart );

	container.add( phiStartRow );

	// phiLength

	var phiLengthRow = new UI.Row();
	var phiLength = new UI.Number( parameters.phiLength * 180 / Math.PI ).onChange( update );

	phiLengthRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/lathe_geometry/philength' ) ).setWidth( '90px' ) );
	phiLengthRow.add( phiLength );

	container.add( phiLengthRow );

	// points

	var pointsRow = new UI.Row();
	pointsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/lathe_geometry/points' ) ).setWidth( '90px' ) );

	var points = new UI.Points2().setValue(parameters.points).onChange(update);
	pointsRow.add(points);

	container.add( pointsRow );

	function update() {

		editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
			points.getValue(),
			segments.getValue(),
			phiStart.getValue() / 180 * Math.PI,
			phiLength.getValue() / 180 * Math.PI
		) ) );

	}

	return container;

};

Sidebar.Geometry.LatheBufferGeometry = Sidebar.Geometry.LatheGeometry;
