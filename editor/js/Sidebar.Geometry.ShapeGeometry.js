/**
 * @author Temdog007 / http://github.com/Temdog007
 */

Sidebar.Geometry.ShapeGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// curveSegments

	var curveSegmentsRow = new UI.Row();
	var curveSegments = new UI.Integer( parameters.curveSegments || 12 ).onChange( changeShape ).setRange( 1, Infinity );

	curveSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/shape_geometry/curveSegments' ) ).setWidth( '90px' ) );
	curveSegmentsRow.add( curveSegments );

	container.add( curveSegmentsRow );

	// to extrude
	var button = new UI.Button( strings.getKey( 'sidebar/geometry/shape_geometry/extrude' ) ).onClick( toExtrude ).setWidth( '90px' ).setMarginLeft( '90px' );
	container.add( button );

	//

	function changeShape() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE[ geometry.type ](
			parameters.shapes,
			curveSegments.getValue()
		) ) );

	}

	function toExtrude() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.ExtrudeBufferGeometry(
			parameters.shapes, {
				curveSegments: curveSegments.getValue()
			}
		) ) );

	}

	return container;

};

Sidebar.Geometry.ShapeBufferGeometry = Sidebar.Geometry.ShapeGeometry;
