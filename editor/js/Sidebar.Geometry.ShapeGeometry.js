import * as THREE from '../../build/three.module.js';

import { UIRow, UIText, UIInteger, UIButton } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	var strings = editor.strings;

	var container = new UIRow();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// curveSegments

	var curveSegmentsRow = new UIRow();
	var curveSegments = new UIInteger( parameters.curveSegments || 12 ).onChange( changeShape ).setRange( 1, Infinity );

	curveSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/shape_geometry/curveSegments' ) ).setWidth( '90px' ) );
	curveSegmentsRow.add( curveSegments );

	container.add( curveSegmentsRow );

	// to extrude
	var button = new UIButton( strings.getKey( 'sidebar/geometry/shape_geometry/extrude' ) ).onClick( toExtrude ).setWidth( '90px' ).setMarginLeft( '90px' );
	container.add( button );

	//

	function changeShape() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.ShapeGeometry(
			parameters.shapes,
			curveSegments.getValue()
		) ) );

	}

	function toExtrude() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.ExtrudeGeometry(
			parameters.shapes, {
				curveSegments: curveSegments.getValue()
			}
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
