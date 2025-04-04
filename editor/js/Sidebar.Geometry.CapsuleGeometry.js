import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UINumber, UIInteger } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	const strings = editor.strings;
	const signals = editor.signals;

	const container = new UIDiv();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// radius

	const radiusRow = new UIRow();
	const radius = new UINumber( parameters.radius ).onChange( update );

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/capsule_geometry/radius' ) ).setClass( 'Label' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// length

	const lengthRow = new UIRow();
	const length = new UINumber( parameters.length ).onChange( update );

	lengthRow.add( new UIText( strings.getKey( 'sidebar/geometry/capsule_geometry/length' ) ).setClass( 'Label' ) );
	lengthRow.add( length );

	container.add( lengthRow );

	// capSegments

	const capSegmentsRow = new UIRow();
	const capSegments = new UIInteger( parameters.capSegments ).setRange( 1, Infinity ).onChange( update );

	capSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/capsule_geometry/capseg' ) ).setClass( 'Label' ) );
	capSegmentsRow.add( capSegments );

	container.add( capSegmentsRow );

	// radialSegments

	const radialSegmentsRow = new UIRow();
	const radialSegments = new UIInteger( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/capsule_geometry/radialseg' ) ).setClass( 'Label' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	//

	function refreshUI() {

		const parameters = object.geometry.parameters;

		radius.setValue( parameters.radius );
		length.setValue( parameters.length );
		capSegments.setValue( parameters.capSegments );
		radialSegments.setValue( parameters.radialSegments );

	}

	signals.geometryChanged.add( function ( mesh ) {

		if ( mesh === object ) {

			refreshUI();

		}

	} );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.CapsuleGeometry(
			radius.getValue(),
			length.getValue(),
			capSegments.getValue(),
			radialSegments.getValue()
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
