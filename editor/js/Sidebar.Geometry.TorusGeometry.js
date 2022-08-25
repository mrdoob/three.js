import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInteger, UINumber } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	const strings = editor.strings;

	const container = new UIDiv();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// radius

	const radiusRow = new UIRow();
	const radius = new UINumber( parameters.radius ).onChange( update );

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/torus_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tube

	const tubeRow = new UIRow();
	const tube = new UINumber( parameters.tube ).onChange( update );

	tubeRow.add( new UIText( strings.getKey( 'sidebar/geometry/torus_geometry/tube' ) ).setWidth( '90px' ) );
	tubeRow.add( tube );

	container.add( tubeRow );

	// radialSegments

	const radialSegmentsRow = new UIRow();
	const radialSegments = new UIInteger( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/torus_geometry/radialsegments' ) ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// tubularSegments

	const tubularSegmentsRow = new UIRow();
	const tubularSegments = new UIInteger( parameters.tubularSegments ).setRange( 1, Infinity ).onChange( update );

	tubularSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/torus_geometry/tubularsegments' ) ).setWidth( '90px' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// arc

	const arcRow = new UIRow();
	const arc = new UINumber( parameters.arc * THREE.MathUtils.RAD2DEG ).setStep( 10 ).onChange( update );

	arcRow.add( new UIText( strings.getKey( 'sidebar/geometry/torus_geometry/arc' ) ).setWidth( '90px' ) );
	arcRow.add( arc );

	container.add( arcRow );


	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.TorusGeometry(
			radius.getValue(),
			tube.getValue(),
			radialSegments.getValue(),
			tubularSegments.getValue(),
			arc.getValue() * THREE.MathUtils.DEG2RAD
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
