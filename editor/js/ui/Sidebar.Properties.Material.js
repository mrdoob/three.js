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

	materialNameRow.add( new UI.Text().setValue( 'Name' ).setColor( '#666' ) );
	materialNameRow.add( materialName );

	container.add( materialNameRow );

	// class

	var materialClassRow = new UI.Panel();
	var materialClass = new UI.Select( 'absolute' ).setOptions( {

		'LineBasicMaterial': 'LineBasicMaterial',
		'MeshBasicMaterial': 'MeshBasicMaterial',
		'MeshDepthMaterial': 'MeshDepthMaterial',
		'MeshFaceMaterial': 'MeshFaceMaterial',
		'MeshLambertMaterial': 'MeshLambertMaterial',
		'MeshNormalMaterial': 'MeshNormalMaterial',
		'MeshPhongMaterial': 'MeshPhongMaterial'

	} ).setLeft( '90px' ).setWidth( '180px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	materialClassRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Class' ).setColor( '#666' ) );
	materialClassRow.add( materialClass );

	container.add( materialClassRow );

	// color

	var materialColorRow = new UI.Panel();
	var materialColor = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );

	materialColorRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Color' ).setColor( '#666' ) );
	materialColorRow.add( materialColor );

	container.add( materialColorRow );

	// ambient

	var materialAmbientRow = new UI.Panel();
	var materialAmbient = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );

	materialAmbientRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Ambient' ).setColor( '#666' ) );
	materialAmbientRow.add( materialAmbient );

	container.add( materialAmbientRow );

	// emissive

	var materialEmissiveRow = new UI.Panel();
	var materialEmissive = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );

	materialEmissiveRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Emissive' ).setColor( '#666' ) );
	materialEmissiveRow.add( materialEmissive );

	container.add( materialEmissiveRow );

	// specular

	var materialSpecularRow = new UI.Panel();
	var materialSpecular = new UI.Color( 'absolute' ).setLeft( '90px' ).onChange( update );

	materialSpecularRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Specular' ).setColor( '#666' ) );
	materialSpecularRow.add( materialSpecular );

	container.add( materialSpecularRow );

	// shininess

	var materialShininessRow = new UI.Panel();
	var materialShininess = new UI.Number( 'absolute' ).setValue( 30 ).setLeft( '90px' ).onChange( update );

	materialShininessRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Shininess' ).setColor( '#666' ) );
	materialShininessRow.add( materialShininess );

	container.add( materialShininessRow );

	// map

	var materialMapRow = new UI.Panel();
	var materialMap = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	materialMapRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Map' ).setColor( '#666' ) );
	materialMapRow.add( materialMap );

	container.add( materialMapRow );

	// light map

	var materialLightMapRow = new UI.Panel();
	var materialLightMap = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	materialLightMapRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Light Map' ).setColor( '#666' ) );
	materialLightMapRow.add( materialLightMap );

	container.add( materialLightMapRow );

	// bump map

	var materialBumpMapRow = new UI.Panel();
	var materialBumpMap = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	materialBumpMapRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Bump Map' ).setColor( '#666' ) );
	materialBumpMapRow.add( materialBumpMap );

	container.add( materialBumpMapRow );

	// normal map

	var materialNormalMapRow = new UI.Panel();
	var materialNormalMap = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	materialNormalMapRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Normal Map' ).setColor( '#666' ) );
	materialNormalMapRow.add( materialNormalMap );

	container.add( materialNormalMapRow );

	// specular map

	var materialSpecularMapRow = new UI.Panel();
	var materialSpecularMap = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	materialSpecularMapRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Specular Map' ).setColor( '#666' ) );
	materialSpecularMapRow.add( materialSpecularMap );

	container.add( materialSpecularMapRow );

	// env map

	var materialEnvMapRow = new UI.Panel();
	var materialEnvMap = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );

	materialEnvMapRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Env Map' ).setColor( '#666' ) );
	materialEnvMapRow.add( materialEnvMap );

	container.add( materialEnvMapRow );

	// opacity

	var materialOpacityRow = new UI.Panel();
	var materialOpacity = new UI.Number( 'absolute' ).setLeft( '90px' ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialOpacityRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Opacity' ).setColor( '#666' ) );
	materialOpacityRow.add( materialOpacity );

	container.add( materialOpacityRow );

	// transparent

	var materialTransparentRow = new UI.Panel();
	var materialTransparent = new UI.Checkbox( 'absolute' ).setValue( false ).setLeft( '90px' ).onChange( update );

	materialTransparentRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Transparent' ).setColor( '#666' ) );
	materialTransparentRow.add( materialTransparent );

	container.add( materialTransparentRow );

	// wireframe

	var materialWireframeRow = new UI.Panel();
	var materialWireframe = new UI.Checkbox( 'absolute' ).setValue( false ).setLeft( '90px' ).onChange( update );
	var materialWireframeLinewidth = new UI.Number( 'absolute' ).setValue( 1 ).setLeft( '120px' ).setRange( 0, 100 ).onChange( update );

	materialWireframeRow.add( new UI.HorizontalRule(), new UI.Text().setValue( 'Wireframe' ).setColor( '#666' ) );
	materialWireframeRow.add( materialWireframe );
	materialWireframeRow.add( materialWireframeLinewidth );

	container.add( materialWireframeRow );



	//

	var selected = null;

	function update() {

		var material = selected.material;

		if ( material ) {

			if ( material instanceof materials[ materialClass.getValue() ] == false ) {

				material = new materials[ materialClass.getValue() ]();
				selected.material = material;

			}

			if ( material.color !== undefined ) {

				material.color.setHex( parseInt( materialColor.getValue().substr( 1 ), 16 ) );

			}

			if ( material.ambient !== undefined ) {

				material.ambient.setHex( parseInt( materialAmbient.getValue().substr( 1 ), 16 ) );

			}

			if ( material.emissive !== undefined ) {

				material.emissive.setHex( parseInt( materialEmissive.getValue().substr( 1 ), 16 ) );

			}

			if ( material.specular !== undefined ) {

				material.specular.setHex( parseInt( materialSpecular.getValue().substr( 1 ), 16 ) );

			}

			if ( material.shininess !== undefined ) {

				material.shininess = materialShininess.getValue();

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

			if ( material.wireframeLinewidth !== undefined ) {

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
		materialEmissiveRow.setDisplay( material.emissive !== undefined ? '' : 'none' );
		materialSpecularRow.setDisplay( material.specular !== undefined ? '' : 'none' );
		materialShininessRow.setDisplay( material.shininess !== undefined ? '' : 'none' );
		materialMapRow.setDisplay( material.map !== undefined ? '' : 'none' );
		materialLightMapRow.setDisplay( material.lightMap !== undefined ? '' : 'none' );
		materialBumpMapRow.setDisplay( material.bumpMap !== undefined ? '' : 'none' );
		materialNormalMapRow.setDisplay( material.normalMap !== undefined ? '' : 'none' );
		materialSpecularMapRow.setDisplay( material.specularMap !== undefined ? '' : 'none' );
		materialEnvMapRow.setDisplay( material.envMap !== undefined ? '' : 'none' );
		materialOpacityRow.setDisplay( material.opacity !== undefined ? '' : 'none' );
		materialTransparentRow.setDisplay( material.transparent !== undefined ? '' : 'none' );
		materialWireframeRow.setDisplay( material.wireframe !== undefined ? '' : 'none' );

	};

	function getMaterialInstanceName( material ) {

		for ( var key in materials ) {

			if ( material instanceof materials[ key ] ) return key;

		}

	}

	// events

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

			if ( material.emissive !== undefined ) {

				materialEmissive.setValue( '#' + material.emissive.getHex().toString( 16 ) );

			}

			if ( material.specular !== undefined ) {

				materialSpecular.setValue( '#' + material.specular.getHex().toString( 16 ) );

			}

			if ( material.shininess !== undefined ) {

				materialShininess.setValue( material.shininess );

			}

			/*
			if ( material.map !== undefined ) {

				materialMap.setValue( material.map );

			}
			*/

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

	return container;

}
