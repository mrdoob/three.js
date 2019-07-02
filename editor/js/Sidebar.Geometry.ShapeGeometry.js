/**
 * @author Temdog007 / http://github.com/Temdog007
 */

import {
	ExtrudeBufferGeometry,
	ShapeBufferGeometry
} from '../../build/three.module.js';

import { Row, UIText, Integer, Button } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

var SidebarGeometryShapeGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var container = new Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// curveSegments

	var curveSegmentsRow = new Row();
	var curveSegments = new Integer( parameters.curveSegments || 12 ).onChange( changeShape ).setRange( 1, Infinity );

	curveSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/shape_geometry/curveSegments' ) ).setWidth( '90px' ) );
	curveSegmentsRow.add( curveSegments );

	container.add( curveSegmentsRow );

	// to extrude
	var button = new Button( strings.getKey( 'sidebar/geometry/shape_geometry/extrude' ) ).onClick( toExtrude ).setWidth( '90px' ).setMarginLeft( '90px' );
	container.add( button );

	//

	function changeShape() {

		editor.execute( new SetGeometryCommand( editor, object, new ShapeBufferGeometry(
			parameters.shapes,
			curveSegments.getValue()
		) ) );

	}

	function toExtrude() {

		editor.execute( new SetGeometryCommand( editor, object, new ExtrudeBufferGeometry(
			parameters.shapes, {
				curveSegments: curveSegments.getValue()
			}
		) ) );

	}

	return container;

};

export { SidebarGeometryShapeGeometry };
