import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInteger, UINumber } from './libs/ui.js';
import { UIPoints2 } from './libs/ui.three.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	const strings = editor.strings;
	const signals = editor.signals;

	const container = new UIDiv();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// segments

	const segmentsRow = new UIRow();
	const segments = new UIInteger( parameters.segments ).onChange( update );

	segmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/lathe_geometry/segments' ) ).setClass( 'Label' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	// phiStart

	const phiStartRow = new UIRow();
	const phiStart = new UINumber( parameters.phiStart * THREE.MathUtils.RAD2DEG ).onChange( update );

	phiStartRow.add( new UIText( strings.getKey( 'sidebar/geometry/lathe_geometry/phistart' ) ).setClass( 'Label' ) );
	phiStartRow.add( phiStart );

	container.add( phiStartRow );

	// phiLength

	const phiLengthRow = new UIRow();
	const phiLength = new UINumber( parameters.phiLength * THREE.MathUtils.RAD2DEG ).onChange( update );

	phiLengthRow.add( new UIText( strings.getKey( 'sidebar/geometry/lathe_geometry/philength' ) ).setClass( 'Label' ) );
	phiLengthRow.add( phiLength );

	container.add( phiLengthRow );

	// points

	const pointsRow = new UIRow();
	pointsRow.add( new UIText( strings.getKey( 'sidebar/geometry/lathe_geometry/points' ) ).setClass( 'Label' ) );

	const points = new UIPoints2().setValue( parameters.points ).onChange( update );
	pointsRow.add( points );

	container.add( pointsRow );

	//

	function refreshUI() {

		const parameters = object.geometry.parameters;

		points.setValue( parameters.points, false );
		segments.setValue( parameters.segments );
		phiStart.setValue( parameters.phiStart * THREE.MathUtils.RAD2DEG );
		phiLength.setValue( parameters.phiLength * THREE.MathUtils.RAD2DEG );

	}

	signals.geometryChanged.add( function ( mesh ) {

		if ( mesh === object ) {

			refreshUI();

		}

	} );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.LatheGeometry(
			points.getValue(),
			segments.getValue(),
			phiStart.getValue() * THREE.MathUtils.DEG2RAD,
			phiLength.getValue() * THREE.MathUtils.DEG2RAD
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
