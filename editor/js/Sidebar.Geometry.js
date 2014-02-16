Sidebar.Geometry = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text().setValue( 'GEOMETRY' ) );
	container.add( new UI.Break(), new UI.Break() );

	// uuid

	var geometryUUIDRow = new UI.Panel();
	var geometryUUID = new UI.Input().setWidth( '115px' ).setColor( '#444' ).setFontSize( '12px' ).setDisabled( true );
	var geometryUUIDRenew = new UI.Button( '⟳' ).setMarginLeft( '7px' ).onClick( function () {

		geometryUUID.setValue( THREE.Math.generateUUID() );

		editor.selected.geometry.uuid = geometryUUID.getValue();

	} );

	geometryUUIDRow.add( new UI.Text( 'UUID' ).setWidth( '90px' ) );
	geometryUUIDRow.add( geometryUUID );
	geometryUUIDRow.add( geometryUUIDRenew );

	container.add( geometryUUIDRow );

	// name

	var geometryNameRow = new UI.Panel();
	var geometryName = new UI.Input().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( function () {

		editor.setGeometryName( editor.selected.geometry, geometryName.getValue() );

	} );

	geometryNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
	geometryNameRow.add( geometryName );

	container.add( geometryNameRow );

	// class

	var geometryTypeRow = new UI.Panel();
	var geometryType = new UI.Text().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' );

	geometryTypeRow.add( new UI.Text( 'Type' ).setWidth( '90px' ) );
	geometryTypeRow.add( geometryType );

	container.add( geometryTypeRow );

	// vertices

	var geometryVerticesRow = new UI.Panel();
	var geometryVertices = new UI.Text().setColor( '#444' ).setFontSize( '12px' );

	geometryVerticesRow.add( new UI.Text( 'Vertices' ).setWidth( '90px' ) );
	geometryVerticesRow.add( geometryVertices );

	container.add( geometryVerticesRow );

	// faces

	var geometryFacesRow = new UI.Panel();
	var geometryFaces = new UI.Text().setColor( '#444' ).setFontSize( '12px' );

	geometryFacesRow.add( new UI.Text( 'Faces' ).setWidth( '90px' ) );
	geometryFacesRow.add( geometryFaces );

	container.add( geometryFacesRow );

	// parameters

	var parameters;


	//

	function build() {

		var object = editor.selected;

		if ( object && object.geometry ) {

			var geometry = object.geometry;

			container.setDisplay( 'block' );

			geometryType.setValue( editor.getGeometryType( object.geometry ) );

			updateFields( geometry );

			//

			if ( parameters !== undefined ) {

				container.remove( parameters );
				parameters = undefined;

			}

			if ( geometry instanceof THREE.BoxGeometry ) {

				parameters = new Sidebar.Geometry.BoxGeometry( signals, object );
				container.add( parameters );

			} else if ( geometry instanceof THREE.CircleGeometry ) {

				parameters = new Sidebar.Geometry.CircleGeometry( signals, object );
				container.add( parameters );

			} else if ( geometry instanceof THREE.CylinderGeometry ) {

				parameters = new Sidebar.Geometry.CylinderGeometry( signals, object );
				container.add( parameters );

			} else if ( geometry instanceof THREE.SphereGeometry ) {

				parameters = new Sidebar.Geometry.SphereGeometry( signals, object );
				container.add( parameters );

			} else if ( geometry instanceof THREE.IcosahedronGeometry ) {

				parameters = new Sidebar.Geometry.IcosahedronGeometry( signals, object );
				container.add( parameters );

			} else if ( geometry instanceof THREE.PlaneGeometry ) {

				parameters = new Sidebar.Geometry.PlaneGeometry( signals, object );
				container.add( parameters );

			} else if ( geometry instanceof THREE.TorusGeometry ) {

				parameters = new Sidebar.Geometry.TorusGeometry( signals, object );
				container.add( parameters );

			} else if ( geometry instanceof THREE.TorusKnotGeometry ) {

				parameters = new Sidebar.Geometry.TorusKnotGeometry( signals, object );
				container.add( parameters );

			}

		} else {

			container.setDisplay( 'none' );

		}

	}

	signals.objectSelected.add( build );
	signals.objectChanged.add( build );

	//

	function updateFields( geometry ) {

		geometryUUID.setValue( geometry.uuid );
		geometryName.setValue( geometry.name );

		if ( geometry instanceof THREE.Geometry ) {

			geometryVertices.setValue( geometry.vertices.length );
			geometryFaces.setValue( geometry.faces.length );

		} else if ( geometry instanceof THREE.Geometry2 ) {

			geometryVertices.setValue( geometry.vertices.length / 3 );
			geometryFaces.setValue( geometry.vertices.length / 9 );

		} else if ( geometry instanceof THREE.BufferGeometry ) {

			geometryVertices.setValue( geometry.attributes.position.array.length / 3 );

			if ( geometry.attributes.index !== undefined ) {

				geometryFaces.setValue( geometry.attributes.index.array.length / 3 );

			} else {

				geometryFaces.setValue( geometry.attributes.position.array.length / 9 );

			}

		}

	}

	return container;

}
