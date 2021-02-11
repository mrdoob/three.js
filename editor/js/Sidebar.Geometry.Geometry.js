import { UIRow, UIText } from './libs/ui.js';

function SidebarGeometryGeometry( editor ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UIRow();

	// vertices

	var verticesRow = new UIRow();
	var vertices = new UIText();

	verticesRow.add( new UIText( strings.getKey( 'sidebar/geometry/geometry/vertices' ) ).setWidth( '90px' ) );
	verticesRow.add( vertices );

	container.add( verticesRow );

	// faces

	var facesRow = new UIRow();
	var faces = new UIText();

	facesRow.add( new UIText( strings.getKey( 'sidebar/geometry/geometry/faces' ) ).setWidth( '90px' ) );
	facesRow.add( faces );

	container.add( facesRow );

	//

	function update( object ) {

		if ( object === null ) return; // objectSelected.dispatch( null )
		if ( object === undefined ) return;

		var geometry = object.geometry;

		if ( geometry && geometry.isGeometry ) {

			container.setDisplay( 'block' );

			vertices.setValue( ( geometry.vertices.length ).format() );
			faces.setValue( ( geometry.faces.length ).format() );

		} else {

			container.setDisplay( 'none' );

		}

	}

	signals.objectSelected.add( update );
	signals.geometryChanged.add( update );

	return container;

}

export { SidebarGeometryGeometry };
