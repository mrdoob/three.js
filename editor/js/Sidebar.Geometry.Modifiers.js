import { UIRow, UIButton } from './libs/ui.js';

function SidebarGeometryModifiers( editor, object ) {

	const signals = editor.signals;

	const container = new UIDiv().setPaddingLeft( '90px' );

	const geometry = object.geometry;

	// Compute Vertex Normals

	const button = new UIButton( 'Compute Vertex Normals' );
	button.onClick( function () {

		geometry.computeVertexNormals();

		geometry.attributes.normal.needsUpdate = true;

		signals.geometryChanged.dispatch( object );

	} );

	container.add( button );

	//

	return container;

}

export { SidebarGeometryModifiers };
