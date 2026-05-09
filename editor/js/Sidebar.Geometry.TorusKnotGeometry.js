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

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/radius' ) ).setClass( 'Label' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tube

	const tubeRow = new UIRow();
	const tube = new UINumber( parameters.tube ).onChange( update );

	tubeRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/tube' ) ).setClass( 'Label' ) );
	tubeRow.add( tube );

	container.add( tubeRow );

	// tubularSegments

	const tubularSegmentsRow = new UIRow();
	const tubularSegments = new UIInteger( parameters.tubularSegments ).setRange( 1, Infinity ).onChange( update );

	tubularSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/tubularsegments' ) ).setClass( 'Label' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// radialSegments

	const radialSegmentsRow = new UIRow();
	const radialSegments = new UIInteger( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/radialsegments' ) ).setClass( 'Label' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// p

	const pRow = new UIRow();
	const p = new UIInteger( parameters.p ).onChange( update );

	pRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/p' ) ).setClass( 'Label' ) );
	pRow.add( p );

	container.add( pRow );

	// q

	const qRow = new UIRow();
	const q = new UIInteger( parameters.q ).onChange( update );

	qRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/q' ) ).setClass( 'Label' ) );
	qRow.add( q );

	container.add( qRow );

	//

	function refreshUI() {

		const parameters = object.geometry.parameters;

		radius.setValue( parameters.radius );
		tube.setValue( parameters.tube );
		tubularSegments.setValue( parameters.tubularSegments );
		radialSegments.setValue( parameters.radialSegments );
		p.setValue( parameters.p );
		q.setValue( parameters.q );

	}

	signals.geometryChanged.add( function ( mesh ) {

		if ( mesh === object ) {

			refreshUI();

		}

	} );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.TorusKnotGeometry(
			radius.getValue(),
			tube.getValue(),
			tubularSegments.getValue(),
			radialSegments.getValue(),
			p.getValue(),
			q.getValue()
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
