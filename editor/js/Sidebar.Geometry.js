/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/geometry/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/geometry/collapsed', boolean );

	} );
	container.setDisplay( 'none' );

	var geometryType = new UI.Text().setTextTransform( 'uppercase' );
	container.addStatic( geometryType );
	container.add( new UI.Break() );

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

	// geometry

	container.add( new Sidebar.Geometry.Geometry( signals ) );

	// buffergeometry

	container.add( new Sidebar.Geometry.BufferGeometry( signals ) );

	// parameters

	var parameters;


	//

	function build() {

		var object = editor.selected;

		if ( object && object.geometry ) {

			var geometry = object.geometry;

			container.setDisplay( 'block' );

			geometryType.setValue( geometry.type );

			geometryUUID.setValue( geometry.uuid );
			geometryName.setValue( geometry.name );

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

			} else {

				parameters = new Sidebar.Geometry.Modifiers( signals, object );
				container.add( parameters );

			}

		} else {

			container.setDisplay( 'none' );

		}

	}

	signals.objectSelected.add( build );

	return container;

}
