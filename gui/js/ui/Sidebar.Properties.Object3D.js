Sidebar.Properties.Object3D = function ( signals ) {

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text().setText( 'OBJECT' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	container.add( new UI.Text().setText( 'Name' ).setColor( '#666' ) );
	var objectName = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' );
	container.add( objectName );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Position' ).setColor( '#666' ) );
	var positionX = new UI.FloatNumber( 'absolute' ).setLeft( '90px' ).onChange( update );
	var positionY = new UI.FloatNumber( 'absolute' ).setLeft( '160px' ).onChange( update );
	var positionZ = new UI.FloatNumber( 'absolute' ).setLeft( '230px' ).onChange( update );
	container.add( positionX, positionY, positionZ );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Rotation' ).setColor( '#666' ) );
	var rotationX = new UI.FloatNumber( 'absolute' ).setLeft( '90px' ).onChange( update );
	var rotationY = new UI.FloatNumber( 'absolute' ).setLeft( '160px' ).onChange( update );
	var rotationZ = new UI.FloatNumber( 'absolute' ).setLeft( '230px' ).onChange( update );
	container.add( rotationX, rotationY, rotationZ );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Scale' ).setColor( '#666' ) );
	var scaleX = new UI.FloatNumber( 'absolute' ).setValue( 1 ).setLeft( '90px' ).onChange( update );
	var scaleY = new UI.FloatNumber( 'absolute' ).setValue( 1 ).setLeft( '160px' ).onChange( update );
	var scaleZ = new UI.FloatNumber( 'absolute' ).setValue( 1 ).setLeft( '230px' ).onChange( update );
	container.add( scaleX, scaleY, scaleZ );
	container.add( new UI.Break(), new UI.Break(), new UI.Break() );

	//

	var selected = null;

	function update() {

		if ( selected ) {

			selected.position.x = positionX.getValue();
			selected.position.y = positionY.getValue();
			selected.position.z = positionZ.getValue();

			selected.rotation.x = rotationX.getValue();
			selected.rotation.y = rotationY.getValue();
			selected.rotation.z = rotationZ.getValue();

			selected.scale.x = scaleX.getValue();
			selected.scale.y = scaleY.getValue();
			selected.scale.z = scaleZ.getValue();

			signals.objectChanged.dispatch( selected );

		}

	}

	signals.objectSelected.add( function ( object ) {

		selected = object;

		if ( object ) {

			container.setDisplay( 'block' );

			objectName.setText( object.name );

			positionX.setValue( object.position.x );
			positionY.setValue( object.position.y );
			positionZ.setValue( object.position.z );

			rotationX.setValue( object.rotation.x );
			rotationY.setValue( object.rotation.y );
			rotationZ.setValue( object.rotation.z );

			scaleX.setValue( object.scale.x );
			scaleY.setValue( object.scale.y );
			scaleZ.setValue( object.scale.z );

		} else {

			container.setDisplay( 'none' );

		}

	} );

	return container;

}
