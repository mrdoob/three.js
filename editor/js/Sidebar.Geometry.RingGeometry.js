import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInteger, UINumber } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	const strings = editor.strings;

	const container = new UIDiv();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// innerRadius

	const innerRadiusRow = new UIRow();
	const innerRadius = new UINumber( parameters.innerRadius ).onChange( update );

	innerRadiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/innerRadius' ) ).setClass( 'Label' ) );
	innerRadiusRow.add( innerRadius );

	container.add( innerRadiusRow );

	// outerRadius

	const outerRadiusRow = new UIRow();
	const outerRadius = new UINumber( parameters.outerRadius ).onChange( update );

	outerRadiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/outerRadius' ) ).setClass( 'Label' ) );
	outerRadiusRow.add( outerRadius );

	container.add( outerRadiusRow );

	// thetaSegments

	const thetaSegmentsRow = new UIRow();
	const thetaSegments = new UIInteger( parameters.thetaSegments ).setRange( 3, Infinity ).onChange( update );

	thetaSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/thetaSegments' ) ).setClass( 'Label' ) );
	thetaSegmentsRow.add( thetaSegments );

	container.add( thetaSegmentsRow );

	// phiSegments

	const phiSegmentsRow = new UIRow();
	const phiSegments = new UIInteger( parameters.phiSegments ).setRange( 3, Infinity ).onChange( update );

	phiSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/phiSegments' ) ).setClass( 'Label' ) );
	phiSegmentsRow.add( phiSegments );

	container.add( phiSegmentsRow );

	// thetaStart

	const thetaStartRow = new UIRow();
	const thetaStart = new UINumber( parameters.thetaStart * THREE.MathUtils.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaStartRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/thetastart' ) ).setClass( 'Label' ) );
	thetaStartRow.add( thetaStart );

	container.add( thetaStartRow );

	// thetaLength

	const thetaLengthRow = new UIRow();
	const thetaLength = new UINumber( parameters.thetaLength * THREE.MathUtils.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaLengthRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/thetalength' ) ).setClass( 'Label' ) );
	thetaLengthRow.add( thetaLength );

	container.add( thetaLengthRow );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.RingGeometry(
			innerRadius.getValue(),
			outerRadius.getValue(),
			thetaSegments.getValue(),
			phiSegments.getValue(),
			thetaStart.getValue() * THREE.MathUtils.DEG2RAD,
			thetaLength.getValue() * THREE.MathUtils.DEG2RAD
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
