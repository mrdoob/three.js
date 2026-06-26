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

	// height

	const heightRow = new UIRow();
	const height = new UINumber( parameters.height ).onChange( update );

	heightRow.add( new UIText( strings.getKey( 'sidebar/geometry/capsule_geometry/height' ) ).setClass( 'Label' ) );
	heightRow.add( height );

	container.add( heightRow );

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

	// heightSegments

	const heightSegmentsRow = new UIRow();
	const heightSegments = new UIInteger( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/capsule_geometry/heightseg' ) ).setClass( 'Label' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	//

	function refreshUI() {

		const parameters = object.geometry.parameters;

		radius.setValue( parameters.radius );
		height.setValue( parameters.height );
		capSegments.setValue( parameters.capSegments );
		radialSegments.setValue( parameters.radialSegments );
		heightSegments.setValue( parameters.heightSegments );

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
			height.getValue(),
			capSegments.getValue(),
			radialSegments.getValue(),
			heightSegments.getValue()
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
