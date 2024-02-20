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

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/circle_geometry/radius' ) ).setClass( 'Label' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// segments

	const segmentsRow = new UIRow();
	const segments = new UIInteger( parameters.segments ).setRange( 3, Infinity ).onChange( update );

	segmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/circle_geometry/segments' ) ).setClass( 'Label' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	// thetaStart

	const thetaStartRow = new UIRow();
	const thetaStart = new UINumber( parameters.thetaStart * THREE.MathUtils.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaStartRow.add( new UIText( strings.getKey( 'sidebar/geometry/circle_geometry/thetastart' ) ).setClass( 'Label' ) );
	thetaStartRow.add( thetaStart );

	container.add( thetaStartRow );

	// thetaLength

	const thetaLengthRow = new UIRow();
	const thetaLength = new UINumber( parameters.thetaLength * THREE.MathUtils.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaLengthRow.add( new UIText( strings.getKey( 'sidebar/geometry/circle_geometry/thetalength' ) ).setClass( 'Label' ) );
	thetaLengthRow.add( thetaLength );

	container.add( thetaLengthRow );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.CircleGeometry(
			radius.getValue(),
			segments.getValue(),
			thetaStart.getValue() * THREE.MathUtils.DEG2RAD,
			thetaLength.getValue() * THREE.MathUtils.DEG2RAD
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
