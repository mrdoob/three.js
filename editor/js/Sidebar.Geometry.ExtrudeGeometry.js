import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInteger, UICheckbox, UIButton, UINumber } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	const strings = editor.strings;

	const container = new UIDiv();

	const geometry = object.geometry;
	const parameters = geometry.parameters;
	const options = parameters.options;
	options.curveSegments = options.curveSegments != undefined ? options.curveSegments : 12;
	options.steps = options.steps != undefined ? options.steps : 1;
	options.depth = options.depth != undefined ? options.depth : 1;
	const bevelThickness = options.bevelThickness !== undefined ? options.bevelThickness : 0.2;
	options.bevelThickness = bevelThickness;
	options.bevelSize = options.bevelSize !== undefined ? options.bevelSize : bevelThickness - 0.1;
	options.bevelOffset = options.bevelOffset !== undefined ? options.bevelOffset : 0;
	options.bevelSegments = options.bevelSegments !== undefined ? options.bevelSegments : 3;


	// curveSegments

	const curveSegmentsRow = new UIRow();
	const curveSegments = new UIInteger( options.curveSegments ).onChange( update ).setRange( 1, Infinity );

	curveSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/curveSegments' ) ).setClass( 'Label' ) );
	curveSegmentsRow.add( curveSegments );

	container.add( curveSegmentsRow );

	// steps

	const stepsRow = new UIRow();
	const steps = new UIInteger( options.steps ).onChange( update ).setRange( 1, Infinity );

	stepsRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/steps' ) ).setClass( 'Label' ) );
	stepsRow.add( steps );

	container.add( stepsRow );

	// depth

	const depthRow = new UIRow();
	const depth = new UINumber( options.depth ).onChange( update ).setRange( 1, Infinity );

	depthRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/depth' ) ).setClass( 'Label' ) );
	depthRow.add( depth );

	container.add( depthRow );

	// enabled

	const enabledRow = new UIRow();
	const enabled = new UICheckbox( options.bevelEnabled ).onChange( update );

	enabledRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelEnabled' ) ).setClass( 'Label' ) );
	enabledRow.add( enabled );

	container.add( enabledRow );

	// thickness

	const thicknessRow = new UIRow();
	const thickness = new UINumber( options.bevelThickness ).onChange( update );

	thicknessRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelThickness' ) ).setClass( 'Label' ) );
	thicknessRow.add( thickness );

	container.add( thicknessRow );

	// size

	const sizeRow = new UIRow();
	const size = new UINumber( options.bevelSize ).onChange( update );

	sizeRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelSize' ) ).setClass( 'Label' ) );
	sizeRow.add( size );

	container.add( sizeRow );

	// offset

	const offsetRow = new UIRow();
	const offset = new UINumber( options.bevelOffset ).onChange( update );

	offsetRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelOffset' ) ).setClass( 'Label' ) );
	offsetRow.add( offset );

	container.add( offsetRow );

	// segments

	const segmentsRow = new UIRow();
	const segments = new UIInteger( options.bevelSegments ).onChange( update ).setRange( 0, Infinity );

	segmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelSegments' ) ).setClass( 'Label' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	updateBevelRow( options.bevelEnabled );

	const button = new UIButton( strings.getKey( 'sidebar/geometry/extrude_geometry/shape' ) ).onClick( toShape ).setClass( 'Label' ).setMarginLeft( '120px' );
	container.add( button );

	//

	function updateBevelRow( enabled ) {

		if ( enabled === true ) {

			thicknessRow.setDisplay( '' );
			sizeRow.setDisplay( '' );
			offsetRow.setDisplay( '' );
			segmentsRow.setDisplay( '' );

		} else {

			thicknessRow.setDisplay( 'none' );
			sizeRow.setDisplay( 'none' );
			offsetRow.setDisplay( 'none' );
			segmentsRow.setDisplay( 'none' );

		}

	}

	function update() {

		updateBevelRow( enabled.getValue() );

		editor.execute( new SetGeometryCommand( editor, object, new THREE.ExtrudeGeometry(
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

		editor.execute( new SetGeometryCommand( editor, object, new THREE.ShapeGeometry(
			parameters.shapes,
			options.curveSegments
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
