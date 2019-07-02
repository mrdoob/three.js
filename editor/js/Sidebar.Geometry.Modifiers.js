/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Row, Button } from './libs/ui.js';

var SidebarGeometryModifiers = function ( editor, object ) {

	var signals = editor.signals;

	var container = new Row().setPaddingLeft( '90px' );

	var geometry = object.geometry;

	// Compute Vertex Normals

	var button = new Button( 'Compute Vertex Normals' );
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
