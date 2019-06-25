/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.TorusGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// radius

	var radiusRow = new UI.Row();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/torus_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tube

	var tubeRow = new UI.Row();
	var tube = new UI.Number( parameters.tube ).onChange( update );

	tubeRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/torus_geometry/tube' ) ).setWidth( '90px' ) );
	tubeRow.add( tube );

	container.add( tubeRow );

	// radialSegments

	var radialSegmentsRow = new UI.Row();
	var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/torus_geometry/radialsegments' ) ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// tubularSegments

	var tubularSegmentsRow = new UI.Row();
	var tubularSegments = new UI.Integer( parameters.tubularSegments ).setRange( 1, Infinity ).onChange( update );

	tubularSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/torus_geometry/tubularsegments' ) ).setWidth( '90px' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// arc

	var arcRow = new UI.Row();
	var arc = new UI.Number( parameters.arc * THREE.Math.RAD2DEG ).setStep( 10 ).onChange( update );

	arcRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/torus_geometry/arc' ) ).setWidth( '90px' ) );
	arcRow.add( arc );

	container.add( arcRow );


	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE[ geometry.type ](
			radius.getValue(),
			tube.getValue(),
			radialSegments.getValue(),
			tubularSegments.getValue(),
			arc.getValue() * THREE.Math.DEG2RAD
		) ) );

	}

	return container;

};

Sidebar.Geometry.TorusBufferGeometry = Sidebar.Geometry.TorusGeometry;
