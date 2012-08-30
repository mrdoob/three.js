Sidebar.Properties.Material = function ( signals ) {

	var materials = {

		'LineBasicMaterial': THREE.LineBasicMaterial,
		'MeshBasicMaterial': THREE.MeshBasicMaterial,
		'MeshDepthMaterial': THREE.MeshDepthMaterial,
		'MeshFaceMaterial': THREE.MeshFaceMaterial,
		'MeshLambertMaterial': THREE.MeshLambertMaterial,
		'MeshNormalMaterial': THREE.MeshNormalMaterial,
		'MeshPhongMaterial': THREE.MeshPhongMaterial,
		'ParticleBasicMaterial': THREE.ParticleBasicMaterial,
		'ParticleCanvasMaterial': THREE.ParticleCanvasMaterial,
		'ParticleDOMMaterial': THREE.ParticleDOMMaterial,
		'ShaderMaterial': THREE.ShaderMaterial,
		'Material': THREE.Material

	};

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text().setValue( 'MATERIAL' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	// name

	var materialNameRow = new UI.Panel();
	var materialName = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	materialNameRow.add(
		new UI.Text().setValue( 'Name' ).setColor( '#666' ),
		materialName
	);

	container.add( materialNameRow );

	// class

	var materialClassRow = new UI.Panel();
	var materialClass = new UI.Select( 'absolute' ).setOptions( [ 'LineBasicMaterial', 'MeshBasicMaterial', 'MeshDepthMaterial', 'MeshFaceMaterial', 'MeshLambertMaterial', 'MeshNormalMaterial', 'MeshPhongMaterial', 'ParticleBasicMaterial', 'ParticleCanvasMaterial', 'ParticleDOMMaterial', 'ShaderMaterial' ] ).setLeft( '90px' ).setWidth( '180px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	materialClassRow.add(
		new UI.HorizontalRule(),
		new UI.Text().setValue( 'Class' ).setColor( '#666' ),
		materialClass
	);

	container.add( materialClassRow );

	// color

	var materialColorRow = new UI.Panel();
	var materialColor = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );

	materialColorRow.add(
		new UI.HorizontalRule(),
		new UI.Text().setValue( 'Color' ).setColor( '#666' ),
		materialColor
	);

	container.add( materialColorRow );

	// ambient

	var materialAmbientRow = new UI.Panel();
	var materialAmbient = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );

	materialAmbientRow.add(
		new UI.HorizontalRule(),
		new UI.Text().setValue( 'Ambient' ).setColor( '#666' ),
		materialAmbient
	);

	container.add( materialAmbientRow );

	// specular

	var materialSpecularRow = new UI.Panel();
	var materialSpecular = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );

	materialSpecularRow.add(
		new UI.HorizontalRule(),
		new UI.Text().setValue( 'Specular' ).setColor( '#666' ),
		materialSpecular
	);

	container.add( materialSpecularRow );

	// map

	var materialMapRow = new UI.Panel();
	var materialMap = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	materialMapRow.add(
		new UI.HorizontalRule(),
		new UI.Text().setValue( 'Map' ).setColor( '#666' ),
		materialMap
	);

	container.add( materialSpecularRow );

	// opacity

	var materialOpacityRow = new UI.Panel();
	var materialOpacity = new UI.Number( 'absolute' ).setLeft( '90px' ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialOpacityRow.add(
		new UI.HorizontalRule(),
		new UI.Text().setValue( 'Opacity' ).setColor( '#666' ),
		materialOpacity
	);

	container.add( materialOpacityRow );

	// transparent

	var materialTransparentRow = new UI.Panel();
	var materialTransparent = new UI.Boolean( 'absolute' ).setValue( false ).setLeft( '90px' ).onChange( update );

	materialTransparentRow.add(
		new UI.HorizontalRule(),
		new UI.Text().setValue( 'Transparent' ).setColor( '#666' ),
		materialTransparent
	);

	container.add( materialTransparentRow );

	// wireframe

	var materialWireframeRow = new UI.Panel();
	var materialWireframe = new UI.Boolean( 'absolute' ).setValue( false ).setLeft( '90px' ).onChange( update );

	materialWireframeRow.add(
		new UI.HorizontalRule(),
		new UI.Text().setValue( 'Wireframe' ).setColor( '#666' ),
		materialWireframe
	);

	container.add( materialWireframeRow );

	// wireframeLinewidth

	var materialWireframeLinewidthRow = new UI.Panel();
	var materialWireframeLinewidth = new UI.Number( 'absolute' ).setValue( 1 ).setLeft( '90px' ).setRange( 0, 100 ).onChange( update );

	materialWireframeLinewidthRow.add(
		new UI.HorizontalRule(),
		new UI.Text().setValue( 'Linewidth' ).setColor( '#666' ),
		materialWireframeLinewidth
	);

	container.add( materialWireframeLinewidthRow );



	//

	var selected = null;

	function update() {

		var material = selected.material;

		if ( material ) {

			if ( material instanceof materials[ materialClass.getValue() ] == false ) {

				material = new materials[ materialClass.getValue() ];
				selected.material = material;

			}

			if ( material.color !== undefined ) {

				material.color.setHex( parseInt( materialColor.getValue().substr( 1 ), 16 ) );

			}

			if ( material.ambient !== undefined ) {

				material.ambient.setHex( parseInt( materialAmbient.getValue().substr( 1 ), 16 ) );

			}

			if ( material.specular !== undefined ) {

				material.specular.setHex( parseInt( materialSpecular.getValue().substr( 1 ), 16 ) );

			}

			if ( material.opacity !== undefined ) {

				material.opacity = materialOpacity.getValue();

			}

			if ( material.transparent !== undefined ) {

				material.transparent = materialTransparent.getValue();

			}

			if ( material.wireframe !== undefined ) {

				material.wireframe = materialWireframe.getValue();

			}

			if ( material.wireframe === true ) {

				material.wireframeLinewidth = materialWireframeLinewidth.getValue();

			}

			updateRows();

			signals.materialChanged.dispatch( material );

		}

	};

	function updateRows() {

		var material = selected.material;

		materialColorRow.setDisplay( material.color !== undefined ? '' : 'none' );
		materialAmbientRow.setDisplay( material.ambient !== undefined ? '' : 'none' );
		materialSpecularRow.setDisplay( material.specular !== undefined ? '' : 'none' );
		materialMapRow.setDisplay( material.map !== undefined ? '' : 'none' );
		materialOpacityRow.setDisplay( material.opacity !== undefined ? '' : 'none' );
		materialTransparentRow.setDisplay( material.transparent !== undefined ? '' : 'none' );
		materialWireframeRow.setDisplay( material.wireframe !== undefined ? '' : 'none' );
		materialWireframeLinewidthRow.setDisplay( material.wireframe === true ? '' : 'none' );

	};

	signals.objectSelected.add( function ( object ) {

		if ( object && object.material ) {

			selected = object;

			container.setDisplay( '' );

			var material = object.material;

			materialName.setValue( material.name );
			materialClass.setValue( getMaterialInstanceName( material ) );

			if ( material.color !== undefined ) {

				materialColor.setValue( '#' + material.color.getHex().toString( 16 ) );

			}

			if ( material.ambient !== undefined ) {

				materialAmbient.setValue( '#' + material.ambient.getHex().toString( 16 ) );

			}

			if ( material.specular !== undefined ) {

				materialSpecular.setValue( '#' + material.specular.getHex().toString( 16 ) );

			}

			if ( material.map !== undefined ) {

				materialMap.setValue( material.map );

			}

			if ( material.opacity !== undefined ) {

				materialOpacity.setValue( material.opacity );

			}

			if ( material.transparent !== undefined ) {

				materialTransparent.setValue( material.transparent );

			}

			if ( material.wireframe !== undefined ) {

				materialWireframe.setValue( material.wireframe );

			}

			if ( material.wireframeLinewidth !== undefined ) {

				materialWireframeLinewidth.setValue( material.wireframeLinewidth );

			}

			updateRows();

		} else {

			selected = null;

			container.setDisplay( 'none' );

		}

	} );

	function getMaterialInstanceName( material ) {

		for ( var key in materials ) {

			if ( material instanceof materials[ key ] ) return key;

		}

	}

	return container;

}
