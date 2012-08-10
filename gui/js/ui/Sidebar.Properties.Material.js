Sidebar.Properties.Material = function ( signals ) {

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text().setText( 'MATERIAL' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	container.add( new UI.Text().setText( 'Name' ).setColor( '#666' ) );
	var materialName = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( materialName );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Class' ).setColor( '#666' ) );
	var materialClass = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( materialClass );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Color' ).setColor( '#666' ) );
	
	var materialColor = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );
	container.add( materialColor );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Ambient' ).setColor( '#666' ) );
	
	var materialAmbient = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );
	container.add( materialAmbient );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Specular' ).setColor( '#666' ) );
	
	var materialSpecular = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );
	container.add( materialSpecular );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Map' ).setColor( '#666' ) );
	var materialMap = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( materialMap );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Opacity' ).setColor( '#666' ) );
	var materialOpacity = new UI.Number( 'absolute' ).setLeft( '90px' ).setWidth( '60px' ).setMin( 0 ).setMax( 1 ).onChange( update );
	container.add( materialOpacity );
	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'Transparent' ).setColor( '#666' ) );
	var materialTransparent = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( materialTransparent );

	//

	var selected = null;

	function update() {

		if ( selected ) {

			selected.color.setHex( parseInt( materialColor.getValue().substr( 1 ), 16 ) );

			if ( selected.ambient ) {

				selected.ambient.setHex( parseInt( materialAmbient.getValue().substr( 1 ), 16 ) );

			}

			if ( selected.specular ) {

				selected.specular.setHex( parseInt( materialSpecular.getValue().substr( 1 ), 16 ) );

			}

			selected.opacity = materialOpacity.getValue();

			signals.materialChanged.dispatch( selected );

		}

	}

	signals.objectSelected.add( function ( object ) {

		if ( object && object.material ) {

			selected = object.material;

			container.setDisplay( 'block' );

			materialName.setText( object.material.name );
			materialClass.setText( getMaterialInstanceName( object.material ) );
			materialColor.setValue( '#' + object.material.color.getHex().toString( 16 ) );
			if ( object.material.ambient ) materialAmbient.setValue( '#' + object.material.ambient.getHex().toString( 16 ) );
			if ( object.material.specular ) materialSpecular.setValue( '#' + object.material.specular.getHex().toString( 16 ) );
			materialMap.setText( object.material.map );
			materialOpacity.setValue( object.material.opacity );
			materialTransparent.setText( object.material.transparent );

		} else {

			selected = null;

			container.setDisplay( 'none' );

		}

	} );

	function getMaterialInstanceName( material ) {

		// TODO: Is there a way of doing this automatically?

		if ( material instanceof THREE.LineBasicMaterial ) return "LineBasicMaterial";
		if ( material instanceof THREE.MeshBasicMaterial ) return "MeshBasicMaterial";
		if ( material instanceof THREE.MeshDepthMaterial ) return "MeshDepthMaterial";
		if ( material instanceof THREE.MeshFaceMaterial ) return "MeshFaceMaterial";
		if ( material instanceof THREE.MeshLambertMaterial ) return "MeshLambertMaterial";
		if ( material instanceof THREE.MeshNormalMaterial ) return "MeshNormalMaterial";
		if ( material instanceof THREE.MeshPhongMaterial ) return "MeshPhongMaterial";
		if ( material instanceof THREE.ParticleBasicMaterial ) return "ParticleBasicMaterial";
		if ( material instanceof THREE.ParticleCanvasMaterial ) return "ParticleCanvasMaterial";
		if ( material instanceof THREE.ParticleDOMMaterial ) return "ParticleDOMMaterial";
		if ( material instanceof THREE.ShaderMaterial ) return "ShaderMaterial";
		if ( material instanceof THREE.Material ) return "Material";

	}

	return container;

}
