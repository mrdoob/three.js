Sidebar.Geometry = function ( signals ) {

	var geometryClasses = {

		"CircleGeometry": THREE.CircleGeometry,
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
		"ShapeGeometry": THREE.ShapeGeometry,
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

	var objectType = new UI.Text().setColor( '#666' ).setTextTransform( 'uppercase' );
	container.add( objectType );
	container.add( new UI.Break(), new UI.Break() );

	// name

	var geometryNameRow = new UI.Panel();
	var geometryName = new UI.Input().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	geometryNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ).setColor( '#666' ) );
	geometryNameRow.add( geometryName );

	container.add( geometryNameRow );

	// vertices

	var geometryVerticesRow = new UI.Panel();
	var geometryVertices = new UI.Text().setColor( '#444' ).setFontSize( '12px' );

	geometryVerticesRow.add( new UI.Text( 'Vertices' ).setWidth( '90px' ).setColor( '#666' ) );
	geometryVerticesRow.add( geometryVertices );

	container.add( geometryVerticesRow );

	// faces

	var geometryFacesRow = new UI.Panel();
	var geometryFaces = new UI.Text().setColor( '#444' ).setFontSize( '12px' );

	geometryFacesRow.add( new UI.Text( 'Faces' ).setWidth( '90px' ).setColor( '#666' ) );
	geometryFacesRow.add( geometryFaces );

	container.add( geometryFacesRow );

	// parameters

	var parameters;

	//

	var geometry = null;

	function update() {

		if ( geometry ) {

			geometry.name = geometryName.getValue();

		}

	}

	signals.selected.add( function ( selected ) {

		var selected = editor.listSelected( 'geometry' );
		geometry = ( selected.length ) ? selected[0] : null;

		if ( geometry ) {

			container.setDisplay( 'block' );

			objectType.setValue( getGeometryInstanceName( geometry ) );

			updateFields( geometry );

			//

			if ( parameters !== undefined ) {

				container.remove( parameters );
				parameters = undefined;

			}

			if ( geometry instanceof THREE.PlaneGeometry ) {

				parameters = new Sidebar.Geometry.PlaneGeometry( signals, geometry );
				container.add( parameters );

			} else if ( geometry instanceof THREE.CubeGeometry ) {

				parameters = new Sidebar.Geometry.CubeGeometry( signals, geometry );
				container.add( parameters );

			} else if ( geometry instanceof THREE.CylinderGeometry ) {

				parameters = new Sidebar.Geometry.CylinderGeometry( signals, geometry );
				container.add( parameters );

			} else if ( geometry instanceof THREE.SphereGeometry ) {

				parameters = new Sidebar.Geometry.SphereGeometry( signals, geometry );
				container.add( parameters );

			} else if ( geometry instanceof THREE.IcosahedronGeometry ) {

				parameters = new Sidebar.Geometry.IcosahedronGeometry( signals, geometry );
				container.add( parameters );

			} else if ( geometry instanceof THREE.TorusGeometry ) {

				parameters = new Sidebar.Geometry.TorusGeometry( signals, geometry );
				container.add( parameters );

			} else if ( geometry instanceof THREE.TorusKnotGeometry ) {

				parameters = new Sidebar.Geometry.TorusKnotGeometry( signals, geometry );
				container.add( parameters );

			}

			update();

		} else {

			geometry = null;

			container.setDisplay( 'none' );

		}

	} );

	signals.objectChanged.add( function ( object ) {

		if ( object && object.geometry ) {

			updateFields( object.geometry );

		}

	} );

	//

	function updateFields( geometry ) {

		geometryName.setValue( geometry.name );
		geometryVertices.setValue( geometry.vertices.length );
		geometryFaces.setValue( geometry.faces.length );

	}

	function getGeometryInstanceName( geometry ) {

		for ( var key in geometryClasses ) {

			if ( geometry instanceof geometryClasses[ key ] ) return key;

		}

	}

	return container;

}
