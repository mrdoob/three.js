import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInteger, UINumber } from './libs/ui.js';
import { UIPoints2 } from './libs/ui.three.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	const strings = editor.strings;

	const container = new UIDiv();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// segments

	const segmentsRow = new UIRow();
	const segments = new UIInteger( parameters.segments ).onChange( update );

	segmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/lathe_geometry/segments' ) ).setWidth( '90px' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	// phiStart

	const phiStartRow = new UIRow();
	const phiStart = new UINumber( parameters.phiStart * 180 / Math.PI ).onChange( update );

	phiStartRow.add( new UIText( strings.getKey( 'sidebar/geometry/lathe_geometry/phistart' ) ).setWidth( '90px' ) );
	phiStartRow.add( phiStart );

	container.add( phiStartRow );

	// phiLength

	const phiLengthRow = new UIRow();
	const phiLength = new UINumber( parameters.phiLength * 180 / Math.PI ).onChange( update );

	phiLengthRow.add( new UIText( strings.getKey( 'sidebar/geometry/lathe_geometry/philength' ) ).setWidth( '90px' ) );
	phiLengthRow.add( phiLength );

	container.add( phiLengthRow );

	// points

	const pointsRow = new UIRow();
	pointsRow.add( new UIText( strings.getKey( 'sidebar/geometry/lathe_geometry/points' ) ).setWidth( '90px' ) );

	const points = new UIPoints2().setValue( parameters.points ).onChange( update );
	pointsRow.add( points );

	container.add( pointsRow );

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.LatheGeometry(
			points.getValue(),
			segments.getValue(),
			phiStart.getValue() / 180 * Math.PI,
			phiLength.getValue() / 180 * Math.PI
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
