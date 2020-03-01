/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIRow, UIButton } from './libs/ui.js';

var SidebarGeometryModifiers = function ( editor, object ) {

	var signals = editor.signals;

	var container = new UIRow().setPaddingLeft( '90px' );

	var geometry = object.geometry;

	// Compute Vertex Normals

	var button = new UIButton( 'Compute Vertex Normals' );
	button.onClick( function () {

		geometry.computeVertexNormals();

		if ( geometry.isBufferGeometry ) {

			geometry.attributes.normal.needsUpdate = true;

		} else {

			geometry.normalsNeedUpdate = true;

		}

		signals.geometryChanged.dispatch( object );

	} );

	container.add( button );

	//

	return container;

};

export { SidebarGeometryModifiers };
