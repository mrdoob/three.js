import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UINumber, UIInteger } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	const strings = editor.strings;

	const container = new UIDiv();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// radius

	const radiusRow = new UIRow();
	const radius = new UINumber( parameters.radius ).onChange( update );

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/capsule_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// length

	const lengthRow = new UIRow();
	const length = new UINumber( parameters.height ).onChange( update );

	lengthRow.add( new UIText( strings.getKey( 'sidebar/geometry/capsule_geometry/length' ) ).setWidth( '90px' ) );
	lengthRow.add( length );

	container.add( lengthRow );

	// capSegments

	const capSegmentsRow = new UIRow();
	const capSegments = new UINumber( parameters.capSegments ).onChange( update );

	capSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/capsule_geometry/capseg' ) ).setWidth( '90px' ) );
	capSegmentsRow.add( capSegments );

	container.add( capSegmentsRow );

	// radialSegments

	const radialSegmentsRow = new UIRow();
	const radialSegments = new UIInteger( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/capsule_geometry/radialseg' ) ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

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
