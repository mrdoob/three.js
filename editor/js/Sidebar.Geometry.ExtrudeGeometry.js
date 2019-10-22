/**
 * @author Temdog007 / http://github.com/Temdog007
 */

Sidebar.Geometry.ExtrudeGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;
	var options = parameters.options;
	options.curveSegments = options.curveSegments != undefined ? options.curveSegments : 12;
	options.steps = options.steps != undefined ? options.steps : 1;
	options.depth = options.depth != undefined ? options.depth : 100;
	options.bevelThickness = options.bevelThickness !== undefined ? options.bevelThickness : 6;
	options.bevelSize = options.bevelSize !== undefined ? options.bevelSize : 4;
	options.bevelOffset = options.bevelOffset !== undefined ? options.bevelOffset : 0;
	options.bevelSegments = options.bevelSegments !== undefined ? options.bevelSegments : 3;


	// curveSegments

	var curveSegmentsRow = new UI.Row();
	var curveSegments = new UI.Integer( options.curveSegments ).onChange( update ).setRange( 1, Infinity );

	curveSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/extrude_geometry/curveSegments' ) ).setWidth( '90px' ) );
	curveSegmentsRow.add( curveSegments );

	container.add( curveSegmentsRow );

	// steps

	var stepsRow = new UI.Row();
	var steps = new UI.Integer( options.steps ).onChange( update ).setRange( 1, Infinity );

	stepsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/extrude_geometry/steps' ) ).setWidth( '90px' ) );
	stepsRow.add( steps );

	container.add( stepsRow );

	// depth

	var depthRow = new UI.Row();
	var depth = new UI.Number( options.depth ).onChange( update ).setRange( 1, Infinity );

	depthRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/extrude_geometry/depth' ) ).setWidth( '90px' ) );
	depthRow.add( depth );

	container.add( depthRow );

	// enabled

	var enabledRow = new UI.Row();
	var enabled = new UI.Checkbox( options.bevelEnabled ).onChange( update );

	enabledRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelEnabled' ) ).setWidth( '90px' ) );
	enabledRow.add( enabled );

	container.add( enabledRow );

	if ( options.bevelEnabled === true ) {

		// thickness

		var thicknessRow = new UI.Row();
		var thickness = new UI.Number( options.bevelThickness ).onChange( update );

		thicknessRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelThickness' ) ).setWidth( '90px' ) );
		thicknessRow.add( thickness );

		container.add( thicknessRow );

		// size

		var sizeRow = new UI.Row();
		var size = new UI.Number( options.bevelSize ).onChange( update );

		sizeRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelSize' ) ).setWidth( '90px' ) );
		sizeRow.add( size );

		container.add( sizeRow );

		// offset

		var offsetRow = new UI.Row();
		var offset = new UI.Number( options.bevelOffset ).onChange( update );

		offsetRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelOffset' ) ).setWidth( '90px' ) );
		offsetRow.add( offset );

		container.add( offsetRow );

		// segments

		var segmentsRow = new UI.Row();
		var segments = new UI.Integer( options.bevelSegments ).onChange( update ).setRange( 0, Infinity );

		segmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelSegments' ) ).setWidth( '90px' ) );
		segmentsRow.add( segments );

		container.add( segmentsRow );

	}

	var button = new UI.Button( strings.getKey( 'sidebar/geometry/extrude_geometry/shape' ) ).onClick( toShape ).setWidth( '90px' ).setMarginLeft( '90px' );
	container.add( button );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE[ geometry.type ](
			parameters.shapes,
			{
				curveSegments: curveSegments.getValue(),
				steps: steps.getValue(),
				depth: depth.getValue(),
				bevelEnabled: enabled.getValue(),
				bevelThickness: thickness !== undefined ? thickness.getValue() : options.bevelThickness,
				bevelSize: size !== undefined ? size.getValue() : options.bevelSize,
				bevelOffset: offset !== undefined ? offset.getValue() : options.bevelOffset,
				bevelSegments: segments !== undefined ? segments.getValue() : options.bevelSegments
			}
		) ) );

	}

	function toShape() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.ShapeBufferGeometry(
			parameters.shapes,
			options.curveSegments
		) ) );

	}

	return container;

};

Sidebar.Geometry.ExtrudeBufferGeometry = Sidebar.Geometry.ExtrudeGeometry;
