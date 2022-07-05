import { UIDiv, UIButton, UIRow } from './libs/ui.js';

function SidebarGeometryModifiers( editor, object ) {

	const strings = editor.strings;

	const signals = editor.signals;

	const container = new UIDiv().setPaddingLeft( '90px' );

	const geometry = object.geometry;

	// Compute Vertex Normals

	const button = new UIButton( strings.getKey( 'sidebar/geometry/compute_vertex_normals' ) );
	button.onClick( function () {

		geometry.computeVertexNormals();

		geometry.attributes.normal.needsUpdate = true;

		signals.geometryChanged.dispatch( object );

	} );

	const row = new UIRow();
	row.add( button );

	container.add( row );

	//

	return container;

}

export { SidebarGeometryModifiers };
