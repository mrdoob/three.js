/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.Geometry = function ( signals ) {

	var container = new UI.Panel();

	// vertices

	var verticesRow = new UI.Panel();
	var vertices = new UI.Text().setFontSize( '12px' );

	verticesRow.add( new UI.Text( 'Vertices' ).setWidth( '90px' ) );
	verticesRow.add( vertices );

	container.add( verticesRow );

	// faces

	var facesRow = new UI.Panel();
	var faces = new UI.Text().setFontSize( '12px' );

	facesRow.add( new UI.Text( 'Faces' ).setWidth( '90px' ) );
	facesRow.add( faces );

	container.add( facesRow );

	//

	var update = function ( object ) {

		if ( object === null ) return;

		var geometry = object.geometry;

		if ( geometry instanceof THREE.Geometry ) { 

			container.setDisplay( 'block' );

			vertices.setValue( ( geometry.vertices.length ).format() );
			faces.setValue( ( geometry.faces.length ).format() );

		} else {

			container.setDisplay( 'none' );

		}

	};

	signals.objectSelected.add( update );
	signals.geometryChanged.add( update );

	return container;

}
