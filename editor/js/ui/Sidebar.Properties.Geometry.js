Sidebar.Properties.Geometry = function ( signals ) {

	var geometries = {

		"ConvexGeometry": THREE.ConvexGeometry,
		"CubeGeometry": THREE.CubeGeometry,
		"CylinderGeometry": THREE.CylinderGeometry,
		"ExtrudeGeometry": THREE.ExtrudeGeometry,
		"IcosahedronGeometry": THREE.IcosahedronGeometry,
		"LatheGeometry": THREE.LatheGeometry,
		"OctahedronGeometry": THREE.OctahedronGeometry,
		"ParametricGeometry": THREE.ParametricGeometry,
		"PlaneGeometry": THREE.PlaneGeometry,
		"PolyhedronGeometry": THREE.PolyhedronGeometry,
		"SphereGeometry": THREE.SphereGeometry,
		"TetrahedronGeometry": THREE.TetrahedronGeometry,
		"TextGeometry": THREE.TextGeometry,
		"TorusGeometry": THREE.TorusGeometry,
		"TorusKnotGeometry": THREE.TorusKnotGeometry,
		"TubeGeometry": THREE.TubeGeometry,
		"Geometry": THREE.Geometry

	};

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setDisplay( 'none' );
	container.setPadding( '10px' );

	container.add( new UI.Text().setValue( 'GEOMETRY' ).setColor( '#666' ) );
	container.add( new UI.Button( 'absolute' ).setRight( '0px' ).setLabel( 'Export' ).onClick( exportGeometry ) );
	container.add( new UI.Break(), new UI.Break() );

	// name

	var geometryNameRow = new UI.Panel();
	var geometryName = new UI.Input( 'absolute' ).setLeft( '100px' ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	geometryNameRow.add( new UI.Text().setValue( 'Name' ).setColor( '#666' ) );
	geometryNameRow.add( geometryName );

	container.add( geometryNameRow );

	// class

	var geometryClassRow = new UI.Panel();
	var geometryClass = new UI.Text( 'absolute' ).setLeft( '100px' ).setColor( '#444' ).setFontSize( '12px' );

	geometryClassRow.add( new UI.Text().setValue( 'Class' ).setColor( '#666' ) );
	geometryClassRow.add( geometryClass );

	container.add( geometryClassRow );

	// vertices

	var geometryVerticesRow = new UI.Panel();
	var geometryVertices = new UI.Text( 'absolute' ).setLeft( '100px' ).setColor( '#444' ).setFontSize( '12px' );

	geometryVerticesRow.add( new UI.Text().setValue( 'Vertices' ).setColor( '#666' ) );
	geometryVerticesRow.add( geometryVertices );

	container.add( geometryVerticesRow );

	// faces

	var geometryFacesRow = new UI.Panel();
	var geometryFaces = new UI.Text( 'absolute' ).setLeft( '100px' ).setColor( '#444' ).setFontSize( '12px' );

	geometryFacesRow.add( new UI.Text().setValue( 'Faces' ).setColor( '#666' ) );
	geometryFacesRow.add( geometryFaces );

	container.add( geometryFacesRow );


	//

	var selected = null;

	function update() {

		if ( selected ) {

			selected.name = geometryName.getValue();

		}

	}

	signals.objectSelected.add( function ( object ) {

		if ( object && object.geometry ) {

			selected = object.geometry;

			container.setDisplay( 'block' );

			geometryName.setValue( object.geometry.name );
			geometryClass.setValue( getGeometryInstanceName( object.geometry ) );
			geometryVertices.setValue( object.geometry.vertices.length );
			geometryFaces.setValue( object.geometry.faces.length );

		} else {

			selected = null;

			container.setDisplay( 'none' );

		}

	} );

	function getGeometryInstanceName( geometry ) {

		for ( var key in geometries ) {

			if ( geometry instanceof geometries[ key ] ) return key;

		}

	}

	function exportGeometry() {

		var output = new THREE.GeometryExporter().parse( selected );

		/*
		var blob = new Blob( [ output ], { type: 'text/json' } );
		var objectURL = URL.createObjectURL( blob );
		*/

	}

	return container;

}
