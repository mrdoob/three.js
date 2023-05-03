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
	options.depth = options.depth != undefined ? options.depth : 100;
	options.bevelThickness = options.bevelThickness !== undefined ? options.bevelThickness : 6;
	options.bevelSize = options.bevelSize !== undefined ? options.bevelSize : 4;
	options.bevelOffset = options.bevelOffset !== undefined ? options.bevelOffset : 0;
	options.bevelSegments = options.bevelSegments !== undefined ? options.bevelSegments : 3;


	// curveSegments

	const curveSegmentsRow = new UIRow();
	const curveSegments = new UIInteger( options.curveSegments ).onChange( update ).setRange( 1, Infinity );

	curveSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/curveSegments' ) ).setWidth( '90px' ) );
	curveSegmentsRow.add( curveSegments );

	container.add( curveSegmentsRow );

	// steps

	const stepsRow = new UIRow();
	const steps = new UIInteger( options.steps ).onChange( update ).setRange( 1, Infinity );

	stepsRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/steps' ) ).setWidth( '90px' ) );
	stepsRow.add( steps );

	container.add( stepsRow );

	// depth

	const depthRow = new UIRow();
	const depth = new UINumber( options.depth ).onChange( update ).setRange( 1, Infinity );

	depthRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/depth' ) ).setWidth( '90px' ) );
	depthRow.add( depth );

	container.add( depthRow );

	// enabled

	const enabledRow = new UIRow();
	const enabled = new UICheckbox( options.bevelEnabled ).onChange( update );

	enabledRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelEnabled' ) ).setWidth( '90px' ) );
	enabledRow.add( enabled );

	container.add( enabledRow );

	let thickness, size, offset, segments;

	if ( options.bevelEnabled === true ) {

		// thickness

		const thicknessRow = new UIRow();
		thickness = new UINumber( options.bevelThickness ).onChange( update );

		thicknessRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelThickness' ) ).setWidth( '90px' ) );
		thicknessRow.add( thickness );

		container.add( thicknessRow );

		// size

		const sizeRow = new UIRow();
		size = new UINumber( options.bevelSize ).onChange( update );

		sizeRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelSize' ) ).setWidth( '90px' ) );
		sizeRow.add( size );

		container.add( sizeRow );

		// offset

		const offsetRow = new UIRow();
		offset = new UINumber( options.bevelOffset ).onChange( update );

		offsetRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelOffset' ) ).setWidth( '90px' ) );
		offsetRow.add( offset );

		container.add( offsetRow );

		// segments

		const segmentsRow = new UIRow();
		segments = new UIInteger( options.bevelSegments ).onChange( update ).setRange( 0, Infinity );

		segmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelSegments' ) ).setWidth( '90px' ) );
		segmentsRow.add( segments );

		container.add( segmentsRow );

	}

	const button = new UIButton( strings.getKey( 'sidebar/geometry/extrude_geometry/shape' ) ).onClick( toShape ).setWidth( '90px' ).setMarginLeft( '90px' );
	container.add( button );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.ExtrudeGeometry(
			parameters.shapes,
			{
				curveSegments: curveSegments.getValue(),
				steps: steps.getValue(),
				depth: depth.getValue(),
				bevelEnabled: enabled.getValue(),
				bevelThickness: options.bevelThickness,
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
