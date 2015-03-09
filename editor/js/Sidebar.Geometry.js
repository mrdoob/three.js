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

	// Actions

	var objectActions = new UI.Select().setPosition('absolute').setRight( '8px' ).setFontSize( '11px' );
	objectActions.setOptions( {

		'Actions': 'Actions',
		'Center': 'Center',
		'Flatten': 'Flatten'

	} );
	objectActions.onClick( function ( event ) {

		event.stopPropagation(); // Avoid panel collapsing

	} );
	objectActions.onChange( function ( event ) {

		var action = this.getValue();

		var object = editor.selected;
		var geometry = object.geometry;

		if ( confirm( action + ' ' + object.name + '?' ) === false ) return;

		switch ( action ) {

			case 'Center':

				var offset = geometry.center();

				object.position.sub( offset );

				editor.signals.geometryChanged.dispatch( geometry );
				editor.signals.objectChanged.dispatch( object );

				break;

			case 'Flatten':

				geometry.applyMatrix( object.matrix );

				object.position.set( 0, 0, 0 );
				object.rotation.set( 0, 0, 0 );
				object.scale.set( 1, 1, 1 );

				editor.signals.geometryChanged.dispatch( geometry );
				editor.signals.objectChanged.dispatch( object );

				break;

		}

		this.setValue( 'Actions' );

		signals.objectChanged.dispatch( object );

	} );
	container.addStatic( objectActions );

	container.add( new UI.Break() );

	// uuid

	var geometryUUIDRow = new UI.Panel();
	var geometryUUID = new UI.Input().setWidth( '115px' ).setFontSize( '12px' ).setDisabled( true );
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
	var geometryName = new UI.Input().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

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

	var parameters = new UI.Panel();
	container.add( parameters );


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

			parameters.clear();

			if ( geometry instanceof THREE.BoxGeometry ) {

				parameters.add( new Sidebar.Geometry.BoxGeometry( signals, object ) );

			} else if ( geometry instanceof THREE.CircleGeometry ) {

				parameters.add( new Sidebar.Geometry.CircleGeometry( signals, object ) );

			} else if ( geometry instanceof THREE.CylinderGeometry ) {

				parameters.add( new Sidebar.Geometry.CylinderGeometry( signals, object ) );

			} else if ( geometry instanceof THREE.SphereGeometry ) {

				parameters.add( new Sidebar.Geometry.SphereGeometry( signals, object ) );

			} else if ( geometry instanceof THREE.IcosahedronGeometry ) {

				parameters.add( new Sidebar.Geometry.IcosahedronGeometry( signals, object ) );

			} else if ( geometry instanceof THREE.PlaneGeometry ) {

				parameters.add( new Sidebar.Geometry.PlaneGeometry( signals, object ) );

			} else if ( geometry instanceof THREE.TorusGeometry ) {

				parameters.add( new Sidebar.Geometry.TorusGeometry( signals, object ) );

			} else if ( geometry instanceof THREE.TorusKnotGeometry ) {

				parameters.add( new Sidebar.Geometry.TorusKnotGeometry( signals, object ) );

			}

			parameters.add( new Sidebar.Geometry.Modifiers( signals, object ) );

		} else {

			container.setDisplay( 'none' );

		}

	}

	signals.objectSelected.add( build );
	signals.geometryChanged.add( build );

	return container;

}
