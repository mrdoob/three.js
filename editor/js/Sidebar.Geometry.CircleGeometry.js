/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.CircleGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// radius

	var radiusRow = new UI.Row();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/circle_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// segments

	var segmentsRow = new UI.Row();
	var segments = new UI.Integer( parameters.segments ).setRange( 3, Infinity ).onChange( update );

	segmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/circle_geometry/segments' ) ).setWidth( '90px' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	// thetaStart

	var thetaStartRow = new UI.Row();
	var thetaStart = new UI.Number( parameters.thetaStart * THREE.Math.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaStartRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/circle_geometry/thetastart' ) ).setWidth( '90px' ) );
	thetaStartRow.add( thetaStart );

	container.add( thetaStartRow );

	// thetaLength

	var thetaLengthRow = new UI.Row();
	var thetaLength = new UI.Number( parameters.thetaLength * THREE.Math.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaLengthRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/circle_geometry/thetalength' ) ).setWidth( '90px' ) );
	thetaLengthRow.add( thetaLength );

	container.add( thetaLengthRow );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE[ geometry.type ](
			radius.getValue(),
			segments.getValue(),
			thetaStart.getValue() * THREE.Math.DEG2RAD,
			thetaLength.getValue() * THREE.Math.DEG2RAD
		) ) );

	}

	return container;

};

Sidebar.Geometry.CircleBufferGeometry = Sidebar.Geometry.CircleGeometry;
