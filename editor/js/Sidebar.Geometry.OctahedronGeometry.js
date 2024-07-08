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

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/octahedron_geometry/radius' ) ).setClass( 'Label' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// detail

	const detailRow = new UIRow();
	const detail = new UIInteger( parameters.detail ).setRange( 0, Infinity ).onChange( update );

	detailRow.add( new UIText( strings.getKey( 'sidebar/geometry/octahedron_geometry/detail' ) ).setClass( 'Label' ) );
	detailRow.add( detail );

	container.add( detailRow );

	//

	function refreshUI() {

		const parameters = object.geometry.parameters;

		radius.setValue( parameters.radius );
		detail.setValue( parameters.detail );

	}

	signals.geometryChanged.add( function ( mesh ) {

		if ( mesh === object ) {

			refreshUI();

		}

	} );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.OctahedronGeometry(
			radius.getValue(),
			detail.getValue()
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
