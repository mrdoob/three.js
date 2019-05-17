/**
 * @author Temdog007 / http://github.com/Temdog007
 */

Sidebar.Geometry.BoxGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;
	var options = parameters.options || {
		curveSegments : 12,
		steps : 1,
		depth : 100,
		bevelEnabled : true,
		bevelThickness : 6,
		bevelSize : 4,
		bevelOffset : 0,
		bevelSegments : 3
	};

	// curveSegments

	var curveSegmentsRow = new UI.Row();
	var curveSegments = new UI.Number( options.curveSegments ).onChange( update ).setRange(1, Infinity);

	curveSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/extrude_geometry/curveSegments' ) ).setWidth( '90px' ) );
	curveSegmentsRow.add( curveSegments );

	container.add( curveSegmentsRow );

	// steps

	var stepsRow = new UI.Row();
	var steps = new UI.Number( options.steps ).onChange( update ).setRange(1, Infinity);

	stepsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/extrude_geometry/steps' ) ).setWidth( '90px' ) );
	stepsRow.add( steps );

	container.add( stepsRow );

	//

	function update() {

		editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
			parameters.shapes,
			{
				curveSegments : curveSegments.getValue(),
				steps : steps.getValue()
			}
		) ) );

	}

	return container;

};

Sidebar.Geometry.BoxBufferGeometry = Sidebar.Geometry.BoxGeometry;
