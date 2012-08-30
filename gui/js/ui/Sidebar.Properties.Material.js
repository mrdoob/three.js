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

	container.add( new UI.Text().setValue( 'Name' ).setColor( '#666' ) );
	var materialName = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( materialName );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setValue( 'Class' ).setColor( '#666' ) );
	var materialClass = new UI.Select( 'absolute' ).setOptions( [ 'LineBasicMaterial', 'MeshBasicMaterial', 'MeshDepthMaterial', 'MeshFaceMaterial', 'MeshLambertMaterial', 'MeshNormalMaterial', 'MeshPhongMaterial', 'ParticleBasicMaterial', 'ParticleCanvasMaterial', 'ParticleDOMMaterial', 'ShaderMaterial' ] ).setLeft( '90px' ).setWidth( '180px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );
	container.add( materialClass );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setValue( 'Color' ).setColor( '#666' ) );

	var materialColor = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );
	container.add( materialColor );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setValue( 'Ambient' ).setColor( '#666' ) );

	var materialAmbient = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );
	container.add( materialAmbient );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setValue( 'Specular' ).setColor( '#666' ) );

	var materialSpecular = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );
	container.add( materialSpecular );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setValue( 'Map' ).setColor( '#666' ) );
	var materialMap = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( materialMap );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setValue( 'Opacity' ).setColor( '#666' ) );
	var materialOpacity = new UI.Number( 'absolute' ).setLeft( '90px' ).setWidth( '60px' ).setMin( 0 ).setMax( 1 ).onChange( update );
	container.add( materialOpacity );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setValue( 'Transparent' ).setColor( '#666' ) );
	var materialTransparent = new UI.Boolean( 'absolute' ).setValue( false ).setLeft( '90px' ).onChange( update );
	container.add( materialTransparent );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setValue( 'Wireframe' ).setColor( '#666' ) );
	var materialWireframe = new UI.Boolean( 'absolute' ).setValue( false ).setLeft( '90px' ).onChange( update );
	container.add( materialWireframe );

	//

	var selected = null;

	function update() {

		var material = selected.material;

		if ( material ) {

			if ( material instanceof materials[ materialClass.getValue() ] == false ) {

				material = new materials[ materialClass.getValue() ];
				selected.material = material;

			}

			if ( material.color ) {

				material.color.setHex( parseInt( materialColor.getValue().substr( 1 ), 16 ) );

			}

			if ( material.ambient ) {

				material.ambient.setHex( parseInt( materialAmbient.getValue().substr( 1 ), 16 ) );

			}

			if ( material.specular ) {

				material.specular.setHex( parseInt( materialSpecular.getValue().substr( 1 ), 16 ) );

			}

			material.opacity = materialOpacity.getValue();
			material.transparent = materialTransparent.getValue();
			material.wireframe = materialWireframe.getValue();

			signals.materialChanged.dispatch( material );

		}

	}

	signals.objectSelected.add( function ( object ) {

		if ( object && object.material ) {

			selected = object;

			container.setDisplay( 'block' );

			var material = object.material;

			materialName.setValue( material.name );
			materialClass.setValue( getMaterialInstanceName( material ) );

			if ( material.color ) materialColor.setValue( '#' + material.color.getHex().toString( 16 ) );
			if ( material.ambient ) materialAmbient.setValue( '#' + material.ambient.getHex().toString( 16 ) );
			if ( material.specular ) materialSpecular.setValue( '#' + material.specular.getHex().toString( 16 ) );
			if ( material.map ) materialMap.setValue( material.map );

			materialOpacity.setValue( material.opacity );
			materialTransparent.setValue( material.transparent );

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
