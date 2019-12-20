/**
 * @author Temdog007 / http://github.com/Temdog007
 */

import * as THREE from '../../build/three.module.js';

import { UIRow, UIText, UIInteger, UICheckbox, UIButton, UINumber } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

var SidebarGeometryExtrudeGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var container = new UIRow();

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

	var curveSegmentsRow = new UIRow();
	var curveSegments = new UIInteger( options.curveSegments ).onChange( update ).setRange( 1, Infinity );

	curveSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/curveSegments' ) ).setWidth( '90px' ) );
	curveSegmentsRow.add( curveSegments );

	container.add( curveSegmentsRow );

	// steps

	var stepsRow = new UIRow();
	var steps = new UIInteger( options.steps ).onChange( update ).setRange( 1, Infinity );

	stepsRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/steps' ) ).setWidth( '90px' ) );
	stepsRow.add( steps );

	container.add( stepsRow );

	// depth

	var depthRow = new UIRow();
	var depth = new UINumber( options.depth ).onChange( update ).setRange( 1, Infinity );

	depthRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/depth' ) ).setWidth( '90px' ) );
	depthRow.add( depth );

	container.add( depthRow );

	// enabled

	var enabledRow = new UIRow();
	var enabled = new UICheckbox( options.bevelEnabled ).onChange( update );

	enabledRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelEnabled' ) ).setWidth( '90px' ) );
	enabledRow.add( enabled );

	container.add( enabledRow );

	if ( options.bevelEnabled === true ) {

		// thickness

		var thicknessRow = new UIRow();
		var thickness = new UINumber( options.bevelThickness ).onChange( update );

		thicknessRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelThickness' ) ).setWidth( '90px' ) );
		thicknessRow.add( thickness );

		container.add( thicknessRow );

		// size

		var sizeRow = new UIRow();
		var size = new UINumber( options.bevelSize ).onChange( update );

		sizeRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelSize' ) ).setWidth( '90px' ) );
		sizeRow.add( size );

		container.add( sizeRow );

		// offset

		var offsetRow = new UIRow();
		var offset = new UINumber( options.bevelOffset ).onChange( update );

		offsetRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelOffset' ) ).setWidth( '90px' ) );
		offsetRow.add( offset );

		container.add( offsetRow );

		// segments

		var segmentsRow = new UIRow();
		var segments = new UIInteger( options.bevelSegments ).onChange( update ).setRange( 0, Infinity );

		segmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/extrude_geometry/bevelSegments' ) ).setWidth( '90px' ) );
		segmentsRow.add( segments );

		container.add( segmentsRow );

	}

	var button = new UIButton( strings.getKey( 'sidebar/geometry/extrude_geometry/shape' ) ).onClick( toShape ).setWidth( '90px' ).setMarginLeft( '90px' );
	container.add( button );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.ExtrudeBufferGeometry(
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

export { SidebarGeometryExtrudeGeometry };
