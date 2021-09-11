import * as THREE from '../../build/three.module.js';

import { UIRow, UIText, UIInteger, UINumber } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	var strings = editor.strings;

	var container = new UIRow();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// radius

	var radiusRow = new UIRow();
	var radius = new UINumber( parameters.radius ).onChange( update );

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tube

	var tubeRow = new UIRow();
	var tube = new UINumber( parameters.tube ).onChange( update );

	tubeRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/tube' ) ).setWidth( '90px' ) );
	tubeRow.add( tube );

	container.add( tubeRow );

	// tubularSegments

	var tubularSegmentsRow = new UIRow();
	var tubularSegments = new UIInteger( parameters.tubularSegments ).setRange( 1, Infinity ).onChange( update );

	tubularSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/tubularsegments' ) ).setWidth( '90px' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// radialSegments

	var radialSegmentsRow = new UIRow();
	var radialSegments = new UIInteger( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/radialsegments' ) ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// p

	var pRow = new UIRow();
	var p = new UINumber( parameters.p ).onChange( update );

	pRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/p' ) ).setWidth( '90px' ) );
	pRow.add( p );

	container.add( pRow );

	// q

	var qRow = new UIRow();
	var q = new UINumber( parameters.q ).onChange( update );

	qRow.add( new UIText( strings.getKey( 'sidebar/geometry/torusKnot_geometry/q' ) ).setWidth( '90px' ) );
	qRow.add( q );

	container.add( qRow );


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
