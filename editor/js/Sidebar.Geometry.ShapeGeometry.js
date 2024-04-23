import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInteger, UIButton } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	const strings = editor.strings;

	const container = new UIDiv();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// curveSegments

	const curveSegmentsRow = new UIRow();
	const curveSegments = new UIInteger( parameters.curveSegments || 12 ).onChange( changeShape ).setRange( 1, Infinity );

	curveSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/shape_geometry/curveSegments' ) ).setClass( 'Label' ) );
	curveSegmentsRow.add( curveSegments );

	container.add( curveSegmentsRow );

	// to extrude
	const button = new UIButton( strings.getKey( 'sidebar/geometry/shape_geometry/extrude' ) ).onClick( toExtrude ).setClass( 'Label' ).setMarginLeft( '120px' );
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
