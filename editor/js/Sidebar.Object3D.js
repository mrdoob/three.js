Sidebar.Object3D = function ( signals ) {

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setPadding( '10px' );
	container.setDisplay( 'none' );

	var objectType = new UI.Text().setColor( '#666' ).setTextTransform( 'uppercase' );
	container.add( objectType );
	container.add( new UI.Break(), new UI.Break() );

	// name

	var objectNameRow = new UI.Panel();
	var objectName = new UI.Input().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	objectNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ).setColor( '#666' ) );
	objectNameRow.add( objectName );

	container.add( objectNameRow );

	// parent

	var objectParentRow = new UI.Panel();
	var objectParent = new UI.Select().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );
	var parentLabel = new UI.Text( 'Parent' ).setWidth( '90px' ).setColor( '#0080f0' );
	parentLabel.onClick( function(){  signals.selectObject.dispatch( editor.objects[ objectParent.getValue() ] ) } );
	objectParentRow.add( parentLabel );
	objectParentRow.add( objectParent );

	container.add( objectParentRow );

	// geometry

	var objectGeometryRow = new UI.Panel();
	var objectGeometry = new UI.Select().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );
	var geometryLabel = new UI.Text( 'Geometry' ).setWidth( '90px' ).setColor( '#0080f0' );
	geometryLabel.onClick( function(){  signals.selectGeometry.dispatch( editor.geometries[ objectGeometry.getValue() ] ) } );
	objectGeometryRow.add( geometryLabel );
	objectGeometryRow.add( objectGeometry );

	container.add( objectGeometryRow );

	// material

	var objectMaterialRow = new UI.Panel();
	var objectMaterial = new UI.Select().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );
	var materialLabel = new UI.Text( 'Material' ).setWidth( '90px' ).setColor( '#0080f0' );
	materialLabel.onClick( function(){  signals.selectMaterial.dispatch( editor.materials[ objectMaterial.getValue() ] ) } );
	objectMaterialRow.add( materialLabel );

	objectMaterialRow.add( objectMaterial );

	container.add( objectMaterialRow );

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
	var objectScaleLock = new UI.Checkbox().setPosition( 'absolute' ).setLeft( '75px' );
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

	var object = null;

	var scene = editor.scene;

	//

	function updateScaleX() {

		if ( objectScaleLock.getValue() === true ) {

			var scale = objectScaleX.getValue() / object.scale.x;

			objectScaleY.setValue( objectScaleY.getValue() * scale );
			objectScaleZ.setValue( objectScaleZ.getValue() * scale );

		}

		update();

	}

	function updateScaleY() {

		if ( objectScaleLock.getValue() === true ) {

			var scale = objectScaleY.getValue() / object.scale.y;

			objectScaleX.setValue( objectScaleX.getValue() * scale );
			objectScaleZ.setValue( objectScaleZ.getValue() * scale );

		}

		update();

	}

	function updateScaleZ() {

		if ( objectScaleLock.getValue() === true ) {

			var scale = objectScaleZ.getValue() / object.scale.z;

			objectScaleX.setValue( objectScaleX.getValue() * scale );
			objectScaleY.setValue( objectScaleY.getValue() * scale );

		}

		update();

	}

	function update() {

		if ( object ) {

			object.name = objectName.getValue();

			if ( object.parent !== undefined ) {

				var newParentUuid = objectParent.getValue();

				if ( object.parent.uuid !== newParentUuid && object.uuid !== newParentUuid ) {

					var parent = editor.objects[newParentUuid];

					if ( parent === undefined ) {

						parent = scene;

					}

					parent.add( object );

					signals.sceneChanged.dispatch( scene );

				}

			}


			if ( object.geometry !== undefined ) {

				var newGeometryUUid = objectGeometry.getValue();

				if ( object.geometry.uuid !== newGeometryUUid && object.uuid !== newGeometryUUid ) {

					object.geometry = editor.geometries[newGeometryUUid];

					// TODO: Update Geometry;

					signals.objectChanged.dispatch( object );

				}

			}

			if ( object.material !== undefined ) {

				var newMaterialUUid = objectMaterial.getValue();

				if ( object.material.uuid !== newMaterialUUid && object.uuid !== newMaterialUUid ) {

					object.material = editor.materials[newMaterialUUid];

					signals.objectChanged.dispatch( object );

				}

			}

			object.position.x = objectPositionX.getValue();
			object.position.y = objectPositionY.getValue();
			object.position.z = objectPositionZ.getValue();

			object.rotation.x = objectRotationX.getValue();
			object.rotation.y = objectRotationY.getValue();
			object.rotation.z = objectRotationZ.getValue();

			object.scale.x = objectScaleX.getValue();
			object.scale.y = objectScaleY.getValue();
			object.scale.z = objectScaleZ.getValue();

			if ( object.fov !== undefined ) {

				object.fov = objectFov.getValue();
				object.updateProjectionMatrix();

			}

			if ( object.near !== undefined ) {

				object.near = objectNear.getValue();

			}

			if ( object.far !== undefined ) {

				object.far = objectFar.getValue();

			}

			if ( object.intensity !== undefined ) {

				object.intensity = objectIntensity.getValue();

			}

			if ( object.color !== undefined ) {

				object.color.setHex( objectColor.getHexValue() );

			}

			if ( object.groundColor !== undefined ) {

				object.groundColor.setHex( objectGroundColor.getHexValue() );

			}

			if ( object.distance !== undefined ) {

				object.distance = objectDistance.getValue();

			}

			if ( object.angle !== undefined ) {

				object.angle = objectAngle.getValue();

			}

			if ( object.exponent !== undefined ) {

				object.exponent = objectExponent.getValue();

			}

			object.visible = objectVisible.getValue();

			try {

				object.userData = JSON.parse( objectUserData.getValue() );

			} catch ( error ) {

				console.log( error );

			}

			signals.objectChanged.dispatch( object );

		}

	}

	function updateRows() {

		var properties = {
			'parent': objectParentRow,
			'geometry': objectGeometryRow,
			'material': objectMaterialRow,
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

			properties[ property ].setDisplay( object[ property ] !== undefined ? '' : 'none' );

		}

	}

	function updateTransformRows() {

		if ( object instanceof THREE.Light || ( object instanceof THREE.Object3D && object.userData.targetInverse ) ) {

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

	signals.sceneChanged.add( function () {



	} );

	signals.selected.add( function ( selected ) {
			
		var selected = editor.listSelected( 'object' );
		object = ( selected.length ) ? selected[0] : null;

		updateUI();

	} );

	signals.objectChanged.add( function ( changedObject ) {

		if ( object === changedObject ) updateUI();

	} );

	function updateUI() {

		if ( !object ) {

			container.setDisplay( 'none' );
			return;

		}

		container.setDisplay( 'block' );

		objectType.setValue( getObjectInstanceName( object ) );

		var allObjects = {};
		var allGeometries = {};
		var allMaterials = {};

		for ( var uuid in editor.objects ) {

			if ( object.uuid != uuid ) allObjects[ uuid ] = editor.objects[ uuid ].name;

		}

		for ( var uuid in editor.geometries ) {

			allGeometries[ uuid ] = editor.geometries[ uuid ].name;

		}

		for ( var uuid in editor.materials ) {

			allMaterials[ uuid ] = editor.materials[ uuid ].name;

		}

		objectParent.setOptions( allObjects );
		objectGeometry.setOptions( allGeometries );
		objectMaterial.setOptions( allMaterials );

		if ( object.parent !== undefined ) {

			objectParent.setValue( object.parent.uuid );

		}

		if ( object.geometry !== undefined ) {

			objectGeometry.setValue( object.geometry.uuid );

		}

		if ( object.material !== undefined ) {

			objectMaterial.setValue( object.material.uuid );

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
