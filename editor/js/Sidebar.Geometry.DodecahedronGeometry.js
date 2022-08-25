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

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/dodecahedron_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// detail

	const detailRow = new UIRow();
	const detail = new UIInteger( parameters.detail ).setRange( 0, Infinity ).onChange( update );

	detailRow.add( new UIText( strings.getKey( 'sidebar/geometry/dodecahedron_geometry/detail' ) ).setWidth( '90px' ) );
	detailRow.add( detail );

	container.add( detailRow );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.DodecahedronGeometry(
			radius.getValue(),
			detail.getValue()
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };
