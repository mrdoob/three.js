Sidebar.Object3D = function ( signals ) {

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setPadding( '10px' );
	container.setDisplay( 'none' );

	var objectType = new UI.Text().setColor( '#666' ).setTextTransform( 'uppercase' );
	container.add( objectType );
	container.add( new UI.Break(), new UI.Break() );

	// parent

	var objectParentRow = new UI.Panel();
	var objectParent = new UI.Select().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	objectParentRow.add( new UI.Text( 'Parent' ).setWidth( '90px' ).setColor( '#666' ) );
	objectParentRow.add( objectParent );

	container.add( objectParentRow );

	// name

	var objectNameRow = new UI.Panel();
	var objectName = new UI.Input().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	objectNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ).setColor( '#666' ) );
	objectNameRow.add( objectName );

	container.add( objectNameRow );

	// position

	var objectPositionRow = new UI.Panel();
	var objectPositionX = new UI.Number().setWidth( '50px' ).onChange( update );
	var objectPositionY = new UI.Number().setWidth( '50px' ).onChange( update );
	var objectPositionZ = new UI.Number().setWidth( '50px' ).onChange( update );

	objectPositionRow.add( new UI.Text( 'Position' ).setWidth( '90px' ).setColor( '#666' ) );
	objectPositionRow.add( objectPositionX, objectPositionY, objectPositionZ );

	container.add( objectPositionRow );

	// rotation

	var objectRotationRow = new UI.Panel();
	var objectRotationX = new UI.Number().setWidth( '50px' ).onChange( update );
	var objectRotationY = new UI.Number().setWidth( '50px' ).onChange( update );
	var objectRotationZ = new UI.Number().setWidth( '50px' ).onChange( update );

	objectRotationRow.add( new UI.Text( 'Rotation' ).setWidth( '90px' ).setColor( '#666' ) );
	objectRotationRow.add( objectRotationX, objectRotationY, objectRotationZ );

	container.add( objectRotationRow );

	// scale

	var objectScaleRow = new UI.Panel();
	var objectScaleLock = new UI.Checkbox().setPosition( 'absolute' ).setLeft( '75px' ).onChange( updateScaleLock );
	var objectScaleX = new UI.Number( 1 ).setWidth( '50px' ).onChange( updateScaleX );
	var objectScaleY = new UI.Number( 1 ).setWidth( '50px' ).onChange( updateScaleY );
	var objectScaleZ = new UI.Number( 1 ).setWidth( '50px' ).onChange( updateScaleZ );

	objectScaleRow.add( new UI.Text( 'Scale' ).setWidth( '90px' ).setColor( '#666' ) );
	objectScaleRow.add( objectScaleLock );
	objectScaleRow.add( objectScaleX, objectScaleY, objectScaleZ );

	container.add( objectScaleRow );

	// fov

	var objectFovRow = new UI.Panel();
	var objectFov = new UI.Number().onChange( update );

	objectFovRow.add( new UI.Text( 'Fov' ).setWidth( '90px' ).setColor( '#666' ) );
	objectFovRow.add( objectFov );

	container.add( objectFovRow );

	// near

	var objectNearRow = new UI.Panel();
	var objectNear = new UI.Number().onChange( update );

	objectNearRow.add( new UI.Text( 'Near' ).setWidth( '90px' ).setColor( '#666' ) );
	objectNearRow.add( objectNear );

	container.add( objectNearRow );

	// far

	var objectFarRow = new UI.Panel();
	var objectFar = new UI.Number().onChange( update );

	objectFarRow.add( new UI.Text( 'Far' ).setWidth( '90px' ).setColor( '#666' ) );
	objectFarRow.add( objectFar );

	container.add( objectFarRow );

	// intensity

	var objectIntensityRow = new UI.Panel();
	var objectIntensity = new UI.Number().setRange( 0, Infinity ).onChange( update );

	objectIntensityRow.add( new UI.Text( 'Intensity' ).setWidth( '90px' ).setColor( '#666' ) );
	objectIntensityRow.add( objectIntensity );

	container.add( objectIntensityRow );

	// color

	var objectColorRow = new UI.Panel();
	var objectColor = new UI.Color().onChange( update );

	objectColorRow.add( new UI.Text( 'Color' ).setWidth( '90px' ).setColor( '#666' ) );
	objectColorRow.add( objectColor );

	container.add( objectColorRow );

	// ground color

	var objectGroundColorRow = new UI.Panel();
	var objectGroundColor = new UI.Color().onChange( update );

	objectGroundColorRow.add( new UI.Text( 'Ground color' ).setWidth( '90px' ).setColor( '#666' ) );
	objectGroundColorRow.add( objectGroundColor );

	container.add( objectGroundColorRow );

	// distance

	var objectDistanceRow = new UI.Panel();
	var objectDistance = new UI.Number().setRange( 0, Infinity ).onChange( update );

	objectDistanceRow.add( new UI.Text( 'Distance' ).setWidth( '90px' ).setColor( '#666' ) );
	objectDistanceRow.add( objectDistance );

	container.add( objectDistanceRow );

	// angle

	var objectAngleRow = new UI.Panel();
	var objectAngle = new UI.Number().setPrecision( 3 ).setRange( 0, Math.PI / 2 ).onChange( update );

	objectAngleRow.add( new UI.Text( 'Angle' ).setWidth( '90px' ).setColor( '#666' ) );
	objectAngleRow.add( objectAngle );

	container.add( objectAngleRow );

	// exponent

	var objectExponentRow = new UI.Panel();
	var objectExponent = new UI.Number().setRange( 0, Infinity ).onChange( update );

	objectExponentRow.add( new UI.Text( 'Exponent' ).setWidth( '90px' ).setColor( '#666' ) );
	objectExponentRow.add( objectExponent );

	container.add( objectExponentRow );

	// visible

	var objectVisibleRow = new UI.Panel();
	var objectVisible = new UI.Checkbox().onChange( update );

	objectVisibleRow.add( new UI.Text( 'Visible' ).setWidth( '90px' ).setColor( '#666' ) );
	objectVisibleRow.add( objectVisible );

	container.add( objectVisibleRow );

	// user data

	var objectUserDataRow = new UI.Panel();
	var objectUserData = new UI.TextArea().setWidth( '150px' ).setHeight( '40px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );
	objectUserData.onKeyUp( function () {

		try {

			JSON.parse( objectUserData.getValue() );
			objectUserData.setBorderColor( '#ccc' );
			objectUserData.setBackgroundColor( '' );

		} catch ( error ) {

			objectUserData.setBorderColor( '#f00' );
			objectUserData.setBackgroundColor( 'rgba(255,0,0,0.25)' );

		}

	} );

	objectUserDataRow.add( new UI.Text( 'User data' ).setWidth( '90px' ).setColor( '#666' ) );
	objectUserDataRow.add( objectUserData );

	container.add( objectUserDataRow );


	//

	var selected = null;

	var scene = null;

	var uniformScale = 1;

	var scaleRatioX = 1;
	var scaleRatioY = 1;
	var scaleRatioZ = 1;

	var scaleLock = false;

	function updateScaleLock() {

		scaleLock = objectScaleLock.getValue();

		if ( scaleLock ) {

			scaleRatioX = objectScaleX.getValue() / uniformScale;
			scaleRatioY = objectScaleY.getValue() / uniformScale;
			scaleRatioZ = objectScaleZ.getValue() / uniformScale;

		}

	}

	function updateScaleX() {

		uniformScale = objectScaleX.getValue();
		update();

	}

	function updateScaleY() {

		uniformScale = objectScaleY.getValue();
		update();

	}

	function updateScaleZ() {

		uniformScale = objectScaleZ.getValue();
		update();

	}

	function update() {

		if ( selected ) {

			selected.name = objectName.getValue();

			if ( selected.parent !== undefined ) {

				var newParentId = parseInt( objectParent.getValue() );

				if ( selected.parent.id !== newParentId && selected.id !== newParentId ) {

					var parent = scene.getObjectById( newParentId, true );

					if ( parent === undefined ) {

						parent = scene;

					}

					parent.add( selected );

					signals.sceneChanged.dispatch( scene );

				}

			}

			selected.position.x = objectPositionX.getValue();
			selected.position.y = objectPositionY.getValue();
			selected.position.z = objectPositionZ.getValue();

			selected.rotation.x = objectRotationX.getValue();
			selected.rotation.y = objectRotationY.getValue();
			selected.rotation.z = objectRotationZ.getValue();

			if ( scaleLock ) {

				objectScaleX.setValue( uniformScale * scaleRatioX );
				objectScaleY.setValue( uniformScale * scaleRatioY );
				objectScaleZ.setValue( uniformScale * scaleRatioZ );

			}

			selected.scale.x = objectScaleX.getValue();
			selected.scale.y = objectScaleY.getValue();
			selected.scale.z = objectScaleZ.getValue();

			if ( selected.fov !== undefined ) {

				selected.fov = objectFov.getValue();
				selected.updateProjectionMatrix();

			}

			if ( selected.near !== undefined ) {

				selected.near = objectNear.getValue();

			}

			if ( selected.far !== undefined ) {

				selected.far = objectFar.getValue();

			}

			if ( selected.intensity !== undefined ) {

				selected.intensity = objectIntensity.getValue();

			}

			if ( selected.color !== undefined ) {

				selected.color.setHex( objectColor.getHexValue() );

			}

			if ( selected.groundColor !== undefined ) {

				selected.groundColor.setHex( objectGroundColor.getHexValue() );

			}

			if ( selected.distance !== undefined ) {

				selected.distance = objectDistance.getValue();

			}

			if ( selected.angle !== undefined ) {

				selected.angle = objectAngle.getValue();

			}

			if ( selected.exponent !== undefined ) {

				selected.exponent = objectExponent.getValue();

			}

			selected.visible = objectVisible.getValue();

			try {

				selected.userData = JSON.parse( objectUserData.getValue() );

			} catch ( error ) {

				console.log( error );

			}

			signals.objectChanged.dispatch( selected );

		}

	}

	function updateRows() {

		var properties = {
			'parent': objectParentRow,
			'fov': objectFovRow,
			'near': objectNearRow,
			'far': objectFarRow,
			'intensity': objectIntensityRow,
			'color': objectColorRow,
			'groundColor': objectGroundColorRow,
			'distance' : objectDistanceRow,
			'angle' : objectAngleRow,
			'exponent' : objectExponentRow
		};

		for ( var property in properties ) {

			properties[ property ].setDisplay( selected[ property ] !== undefined ? '' : 'none' );

		}

	}

	function updateTransformRows() {

		if ( selected instanceof THREE.Light || ( selected instanceof THREE.Object3D && selected.userData.targetInverse ) ) {

			objectRotationRow.setDisplay( 'none' );
			objectScaleRow.setDisplay( 'none' );

		} else {

			objectRotationRow.setDisplay( '' );
			objectScaleRow.setDisplay( '' );

		}

	}

	function getObjectInstanceName( object ) {

		var objects = {

			'Scene': THREE.Scene,
			'PerspectiveCamera': THREE.PerspectiveCamera,
			'AmbientLight': THREE.AmbientLight,
			'DirectionalLight': THREE.DirectionalLight,
			'HemisphereLight': THREE.HemisphereLight,
			'PointLight': THREE.PointLight,
			'SpotLight': THREE.SpotLight,
			'Mesh': THREE.Mesh,
			'Object3D': THREE.Object3D

		};

		for ( var key in objects ) {

			if ( object instanceof objects[ key ] ) return key;

		}

	}

	// events

	signals.sceneChanged.add( function ( object ) {

		scene = object;

		var options = {};

		options[ scene.id ] = 'Scene';

		( function addObjects( objects ) {

			for ( var i = 0, l = objects.length; i < l; i ++ ) {

				var object = objects[ i ];

				options[ object.id ] = object.name;

				addObjects( object.children );

			}

		} )( object.children );

		objectParent.setOptions( options );

	} );

	signals.objectSelected.add( function ( object ) {

		selected = object;
		updateUI();

	} );
	signals.objectChanged.add( function ( object ) {

		if ( selected === object ) updateUI();

	} );

	function updateUI() {

		container.setDisplay( 'block' );

		var object = selected;

		objectType.setValue( getObjectInstanceName( object ) );

		if ( object.parent !== undefined ) {

			objectParent.setValue( object.parent.id );

		}

		objectName.setValue( object.name );

		objectPositionX.setValue( object.position.x );
		objectPositionY.setValue( object.position.y );
		objectPositionZ.setValue( object.position.z );

		objectRotationX.setValue( object.rotation.x );
		objectRotationY.setValue( object.rotation.y );
		objectRotationZ.setValue( object.rotation.z );

		objectScaleX.setValue( object.scale.x );
		objectScaleY.setValue( object.scale.y );
		objectScaleZ.setValue( object.scale.z );

		if ( object.fov !== undefined ) {

			objectFov.setValue( object.fov );

		}

		if ( object.near !== undefined ) {

			objectNear.setValue( object.near );

		}

		if ( object.far !== undefined ) {

			objectFar.setValue( object.far );

		}

		if ( object.intensity !== undefined ) {

			objectIntensity.setValue( object.intensity );

		}

		if ( object.color !== undefined ) {

			objectColor.setValue( '#' + object.color.getHexString() );

		}

		if ( object.groundColor !== undefined ) {

			objectGroundColor.setValue( '#' + object.groundColor.getHexString() );

		}

		if ( object.distance !== undefined ) {

			objectDistance.setValue( object.distance );

		}

		if ( object.angle !== undefined ) {

			objectAngle.setValue( object.angle );

		}

		if ( object.exponent !== undefined ) {

			objectExponent.setValue( object.exponent );

		}

		objectVisible.setValue( object.visible );

		try {

			objectUserData.setValue( JSON.stringify( object.userData, null, '  ' ) );

		} catch ( error ) {

			console.log( error );

		}

		objectUserData.setBorderColor( '#ccc' );
		objectUserData.setBackgroundColor( '' );

		updateRows();
		updateTransformRows();

	}

	return container;

}
