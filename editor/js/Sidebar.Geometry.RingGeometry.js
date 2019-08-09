/**
 * @author Temdog007 / http://github.com/Temdog007
 */

Sidebar.Geometry.RingGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// innerRadius

	var innerRadiusRow = new UI.Row();
	var innerRadius = new UI.Number( parameters.innerRadius ).onChange( update );

	innerRadiusRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/ring_geometry/innerRadius' ) ).setWidth( '90px' ) );
	innerRadiusRow.add( innerRadius );

	container.add( innerRadiusRow );

	// outerRadius

	var outerRadiusRow = new UI.Row();
	var outerRadius = new UI.Number( parameters.outerRadius ).onChange( update );

	outerRadiusRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/ring_geometry/outerRadius' ) ).setWidth( '90px' ) );
	outerRadiusRow.add( outerRadius );

	container.add( outerRadiusRow );

	// thetaSegments

	var thetaSegmentsRow = new UI.Row();
	var thetaSegments = new UI.Integer( parameters.thetaSegments ).setRange( 3, Infinity ).onChange( update );

	thetaSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/ring_geometry/thetaSegments' ) ).setWidth( '90px' ) );
	thetaSegmentsRow.add( thetaSegments );

	container.add( thetaSegmentsRow );

	// phiSegments

	var phiSegmentsRow = new UI.Row();
	var phiSegments = new UI.Integer( parameters.phiSegments ).setRange( 3, Infinity ).onChange( update );

	phiSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/ring_geometry/phiSegments' ) ).setWidth( '90px' ) );
	phiSegmentsRow.add( phiSegments );

	container.add( phiSegmentsRow );

	// thetaStart

	var thetaStartRow = new UI.Row();
	var thetaStart = new UI.Number( parameters.thetaStart * THREE.Math.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaStartRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/ring_geometry/thetastart' ) ).setWidth( '90px' ) );
	thetaStartRow.add( thetaStart );

	container.add( thetaStartRow );

	// thetaLength

	var thetaLengthRow = new UI.Row();
	var thetaLength = new UI.Number( parameters.thetaLength * THREE.Math.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaLengthRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/ring_geometry/thetalength' ) ).setWidth( '90px' ) );
	thetaLengthRow.add( thetaLength );

	container.add( thetaLengthRow );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE[ geometry.type ](
			innerRadius.getValue(),
			outerRadius.getValue(),
			thetaSegments.getValue(),
			phiSegments.getValue(),
			thetaStart.getValue() * THREE.Math.DEG2RAD,
			thetaLength.getValue() * THREE.Math.DEG2RAD
		) ) );

	}

	return container;

};

Sidebar.Geometry.RingBufferGeometry = Sidebar.Geometry.RingGeometry;
