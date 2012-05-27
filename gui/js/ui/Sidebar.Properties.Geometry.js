Sidebar.Properties.Geometry = function ( signals ) {

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text().setText( 'GEOMETRY' ).setColor( '#666' ) );

	var button = new UI.Button( 'absolute' ).setRight( '0px' ).setText( 'Export' ).onClick( exportGeometry );
	button.download = 'test.js';
	container.add( button );

	container.add( new UI.Break(), new UI.Break() );

	container.add( new UI.Text().setText( 'Name' ).setColor( '#666' ) );

	var geometryName = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	container.add( geometryName );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Class' ).setColor( '#666' ) );

	var geometryClass = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( geometryClass );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Vertices' ).setColor( '#666' ) );
	
	var verticesCount = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( verticesCount );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Faces' ).setColor( '#666' ) );

	var facesCount = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( facesCount );

	container.add( new UI.Break(), new UI.Break(), new UI.Break() );

	//

	var selected = null;

	signals.objectSelected.add( function ( object ) {

		if ( object && object.geometry ) {

			selected = object.geometry;

			container.setDisplay( 'block' );

			geometryName.setText( object.geometry.name );
			geometryClass.setText( getGeometryInstanceName( object.geometry ) );
			verticesCount.setText( object.geometry.vertices.length );
			facesCount.setText( object.geometry.faces.length );

		} else {

			selected = null;

			container.setDisplay( 'none' );

		}

	} );

	function getGeometryInstanceName( geometry ) {

		// TODO: Is there a way of doing this automatically?

		if ( geometry instanceof THREE.ConvexGeometry ) return "ConvexGeometry";
		if ( geometry instanceof THREE.CubeGeometry ) return "CubeGeometry";
		if ( geometry instanceof THREE.CylinderGeometry ) return "CylinderGeometry";
		if ( geometry instanceof THREE.ExtrudeGeometry ) return "ExtrudeGeometry";
		if ( geometry instanceof THREE.IcosahedronGeometry ) return "IcosahedronGeometry";
		if ( geometry instanceof THREE.LatheGeometry ) return "LatheGeometry";
		if ( geometry instanceof THREE.OctahedronGeometry ) return "OctahedronGeometry";
		if ( geometry instanceof THREE.ParametricGeometry ) return "ParametricGeometry";
		if ( geometry instanceof THREE.PlaneGeometry ) return "PlaneGeometry";
		if ( geometry instanceof THREE.PolyhedronGeometry ) return "PolyhedronGeometry";
		if ( geometry instanceof THREE.SphereGeometry ) return "SphereGeometry";
		if ( geometry instanceof THREE.TetrahedronGeometry ) return "TetrahedronGeometry";
		if ( geometry instanceof THREE.TextGeometry ) return "TextGeometry";
		if ( geometry instanceof THREE.TorusGeometry ) return "TorusGeometry";
		if ( geometry instanceof THREE.TorusKnotGeometry ) return "TorusKnotGeometry";
		if ( geometry instanceof THREE.TubeGeometry ) return "TubeGeometry";
		if ( geometry instanceof THREE.Geometry ) return "Geometry";

	}

	function exportGeometry() {

		var geometry = selected;

		var json = { "metadata": { "formatVersion" : 3 } };

		json.vertices = [];

		for ( var i = 0; i < geometry.vertices.length; i ++ ) {

			var vertex = geometry.vertices[ i ];
			json.vertices.push( vertex.x, vertex.y, vertex.z );

		}

		var file = new BlobBuilder();
		file.append( JSON.stringify( json ) );

		var objectURL = URL.createObjectURL( file.getBlob( 'text/json' ) );

		var clickEvent = document.createEvent( 'MouseEvent' );
		clickEvent.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );

		var download = document.createElement( 'a' );
		download.href = objectURL;
		download.download = 'geometry.js';
		download.dispatchEvent( clickEvent );

		URL.revokeObjectURL( objectURL );

	}

	return container;

}
