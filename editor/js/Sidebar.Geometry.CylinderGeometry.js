import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInteger, UICheckbox, UINumber } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	const strings = editor.strings;

	const container = new UIDiv();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// radiusTop

	const radiusTopRow = new UIRow();
	const radiusTop = new UINumber( parameters.radiusTop ).onChange( update );

	radiusTopRow.add( new UIText( strings.getKey( 'sidebar/geometry/cylinder_geometry/radiustop' ) ).setWidth( '90px' ) );
	radiusTopRow.add( radiusTop );

	container.add( radiusTopRow );

	// radiusBottom

	const radiusBottomRow = new UIRow();
	const radiusBottom = new UINumber( parameters.radiusBottom ).onChange( update );

	radiusBottomRow.add( new UIText( strings.getKey( 'sidebar/geometry/cylinder_geometry/radiusbottom' ) ).setWidth( '90px' ) );
	radiusBottomRow.add( radiusBottom );

	container.add( radiusBottomRow );

	// height

	const heightRow = new UIRow();
	const height = new UINumber( parameters.height ).onChange( update );

	heightRow.add( new UIText( strings.getKey( 'sidebar/geometry/cylinder_geometry/height' ) ).setWidth( '90px' ) );
	heightRow.add( height );

	container.add( heightRow );

	// radialSegments

	const radialSegmentsRow = new UIRow();
	const radialSegments = new UIInteger( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/cylinder_geometry/radialsegments' ) ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// heightSegments

	const heightSegmentsRow = new UIRow();
	const heightSegments = new UIInteger( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/cylinder_geometry/heightsegments' ) ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// openEnded

	const openEndedRow = new UIRow();
	const openEnded = new UICheckbox( parameters.openEnded ).onChange( update );

	openEndedRow.add( new UIText( strings.getKey( 'sidebar/geometry/cylinder_geometry/openended' ) ).setWidth( '90px' ) );
	openEndedRow.add( openEnded );

	container.add( openEndedRow );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.CylinderGeometry(
			radiusTop.getValue(),
			radiusBottom.getValue(),
			height.getValue(),
			radialSegments.getValue(),
			heightSegments.getValue(),
			openEnded.getValue()
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
