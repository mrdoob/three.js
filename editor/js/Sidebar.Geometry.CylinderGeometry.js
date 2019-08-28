/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.CylinderGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// radiusTop

	var radiusTopRow = new UI.Row();
	var radiusTop = new UI.Number( parameters.radiusTop ).onChange( update );

	radiusTopRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/cylinder_geometry/radiustop' ) ).setWidth( '90px' ) );
	radiusTopRow.add( radiusTop );

	container.add( radiusTopRow );

	// radiusBottom

	var radiusBottomRow = new UI.Row();
	var radiusBottom = new UI.Number( parameters.radiusBottom ).onChange( update );

	radiusBottomRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/cylinder_geometry/radiusbottom' ) ).setWidth( '90px' ) );
	radiusBottomRow.add( radiusBottom );

	container.add( radiusBottomRow );

	// height

	var heightRow = new UI.Row();
	var height = new UI.Number( parameters.height ).onChange( update );

	heightRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/cylinder_geometry/height' ) ).setWidth( '90px' ) );
	heightRow.add( height );

	container.add( heightRow );

	// radialSegments

	var radialSegmentsRow = new UI.Row();
	var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/cylinder_geometry/radialsegments' ) ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Row();
	var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/cylinder_geometry/heightsegments' ) ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// openEnded

	var openEndedRow = new UI.Row();
	var openEnded = new UI.Checkbox( parameters.openEnded ).onChange( update );

	openEndedRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/cylinder_geometry/openended' ) ).setWidth( '90px' ) );
	openEndedRow.add( openEnded );

	container.add( openEndedRow );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE[ geometry.type ](
			radiusTop.getValue(),
			radiusBottom.getValue(),
			height.getValue(),
			radialSegments.getValue(),
			heightSegments.getValue(),
			openEnded.getValue()
		) ) );

	}

	return container;

};

Sidebar.Geometry.CylinderBufferGeometry = Sidebar.Geometry.CylinderGeometry;
