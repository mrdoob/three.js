import { UIDiv, UIButton, UIRow } from './libs/ui.js';

import { computeMikkTSpaceTangents } from 'three/addons/utils/BufferGeometryUtils.js';
import * as MikkTSpace from 'three/addons/libs/mikktspace.module.js';

function SidebarGeometryModifiers( editor, object ) {

	const strings = editor.strings;

	const signals = editor.signals;

	const container = new UIDiv().setMarginLeft( '120px' );

	const geometry = object.geometry;

	// Compute Vertex Normals

	const computeVertexNormalsButton = new UIButton( strings.getKey( 'sidebar/geometry/compute_vertex_normals' ) );
	computeVertexNormalsButton.onClick( function () {

		geometry.computeVertexNormals();

		signals.geometryChanged.dispatch( object );

	} );

	const computeVertexNormalsRow = new UIRow();
	computeVertexNormalsRow.add( computeVertexNormalsButton );
	container.add( computeVertexNormalsRow );

	// Compute Vertex Tangents

	if ( geometry.hasAttribute( 'position' ) && geometry.hasAttribute( 'normal' ) && geometry.hasAttribute( 'uv' ) ) {

		const computeVertexTangentsButton = new UIButton( strings.getKey( 'sidebar/geometry/compute_vertex_tangents' ) );
		computeVertexTangentsButton.onClick( async function () {

			await MikkTSpace.ready;

			computeMikkTSpaceTangents( geometry, MikkTSpace );

			signals.geometryChanged.dispatch( object );

		} );

		const computeVertexTangentsRow = new UIRow();
		computeVertexTangentsRow.add( computeVertexTangentsButton );
		container.add( computeVertexTangentsRow );

	}

	// Center Geometry

	const centerButton = new UIButton( strings.getKey( 'sidebar/geometry/center' ) );
	centerButton.onClick( function () {

		geometry.center();

		signals.geometryChanged.dispatch( object );

	} );

	const centerRow = new UIRow();
	centerRow.add( centerButton );
	container.add( centerRow );

	//

	return container;

}

export { SidebarGeometryModifiers };
