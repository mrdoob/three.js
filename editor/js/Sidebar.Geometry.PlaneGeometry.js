import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInteger, UINumber } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	const strings = editor.strings;
	const signals = editor.signals;

	const container = new UIDiv();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// width

	const widthRow = new UIRow();
	const width = new UINumber( parameters.width ).onChange( update );

	widthRow.add( new UIText( strings.getKey( 'sidebar/geometry/plane_geometry/width' ) ).setClass( 'Label' ) );
	widthRow.add( width );

	container.add( widthRow );

	// height

	const heightRow = new UIRow();
	const height = new UINumber( parameters.height ).onChange( update );

	heightRow.add( new UIText( strings.getKey( 'sidebar/geometry/plane_geometry/height' ) ).setClass( 'Label' ) );
	heightRow.add( height );

	container.add( heightRow );

	// widthSegments

	const widthSegmentsRow = new UIRow();
	const widthSegments = new UIInteger( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

	widthSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/plane_geometry/widthsegments' ) ).setClass( 'Label' ) );
	widthSegmentsRow.add( widthSegments );

	container.add( widthSegmentsRow );

	// heightSegments

	const heightSegmentsRow = new UIRow();
	const heightSegments = new UIInteger( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/plane_geometry/heightsegments' ) ).setClass( 'Label' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	//

	function refreshUI() {

		const parameters = object.geometry.parameters;

		width.setValue( parameters.width );
		height.setValue( parameters.height );
		widthSegments.setValue( parameters.widthSegments );
		heightSegments.setValue( parameters.heightSegments );

	}

	signals.geometryChanged.add( function ( mesh ) {

		if ( mesh === object ) {

			refreshUI();

		}

	} );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.PlaneGeometry(
			width.getValue(),
			height.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue()
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
