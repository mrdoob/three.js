import { UIRow, UIButton } from './libs/ui.js';

function SidebarGeometryModifiers( editor, object ) {

	var signals = editor.signals;

	var container = new UIRow().setPaddingLeft( '90px' );

	var geometry = object.geometry;

	// Compute Vertex Normals

	var button = new UIButton( 'Compute Vertex Normals' );
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
