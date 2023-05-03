import { UIDiv, UIButton, UIRow } from './libs/ui.js';

function SidebarGeometryModifiers( editor, object ) {

	const strings = editor.strings;

	const signals = editor.signals;

	const container = new UIDiv().setPaddingLeft( '90px' );

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
