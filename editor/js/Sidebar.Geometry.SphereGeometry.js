import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInteger, UINumber } from './libs/ui.js';

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

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/radius' ) ).setClass( 'Label' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// widthSegments

	const widthSegmentsRow = new UIRow();
	const widthSegments = new UIInteger( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

	widthSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/widthsegments' ) ).setClass( 'Label' ) );
	widthSegmentsRow.add( widthSegments );

	container.add( widthSegmentsRow );

	// heightSegments

	const heightSegmentsRow = new UIRow();
	const heightSegments = new UIInteger( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/heightsegments' ) ).setClass( 'Label' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// phiStart

	const phiStartRow = new UIRow();
	const phiStart = new UINumber( parameters.phiStart * THREE.MathUtils.RAD2DEG ).setUnit( '°' ).setStep( 10 ).onChange( update );

	phiStartRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/phistart' ) ).setClass( 'Label' ) );
	phiStartRow.add( phiStart );

	container.add( phiStartRow );

	// phiLength

	const phiLengthRow = new UIRow();
	const phiLength = new UINumber( parameters.phiLength * THREE.MathUtils.RAD2DEG ).setUnit( '°' ).setStep( 10 ).onChange( update );

	phiLengthRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/philength' ) ).setClass( 'Label' ) );
	phiLengthRow.add( phiLength );

	container.add( phiLengthRow );

	// thetaStart

	const thetaStartRow = new UIRow();
	const thetaStart = new UINumber( parameters.thetaStart * THREE.MathUtils.RAD2DEG ).setUnit( '°' ).setStep( 10 ).onChange( update );

	thetaStartRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/thetastart' ) ).setClass( 'Label' ) );
	thetaStartRow.add( thetaStart );

	container.add( thetaStartRow );

	// thetaLength

	const thetaLengthRow = new UIRow();
	const thetaLength = new UINumber( parameters.thetaLength * THREE.MathUtils.RAD2DEG ).setUnit( '°' ).setStep( 10 ).onChange( update );

	thetaLengthRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/thetalength' ) ).setClass( 'Label' ) );
	thetaLengthRow.add( thetaLength );

	container.add( thetaLengthRow );

	//

	function refreshUI() {

		const parameters = object.geometry.parameters;

		radius.setValue( parameters.radius );
		widthSegments.setValue( parameters.widthSegments );
		heightSegments.setValue( parameters.heightSegments );
		phiStart.setValue( parameters.phiStart * THREE.MathUtils.RAD2DEG );
		phiLength.setValue( parameters.phiLength * THREE.MathUtils.RAD2DEG );
		thetaStart.setValue( parameters.thetaStart * THREE.MathUtils.RAD2DEG );
		thetaLength.setValue( parameters.thetaLength * THREE.MathUtils.RAD2DEG );

	}

	signals.geometryChanged.add( function ( mesh ) {

		if ( mesh === object ) {

			refreshUI();

		}

	} );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.SphereGeometry(
			radius.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue(),
			phiStart.getValue() * THREE.MathUtils.DEG2RAD,
			phiLength.getValue() * THREE.MathUtils.DEG2RAD,
			thetaStart.getValue() * THREE.MathUtils.DEG2RAD,
			thetaLength.getValue() * THREE.MathUtils.DEG2RAD
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
