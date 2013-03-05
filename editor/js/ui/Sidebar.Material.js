Sidebar.Material = function ( signals ) {

    var materialClasses = {

		'LineBasicMaterial': THREE.LineBasicMaterial,
		'LineDashedMaterial': THREE.LineDashedMaterial,
		'MeshBasicMaterial': THREE.MeshBasicMaterial,
		'MeshDepthMaterial': THREE.MeshDepthMaterial,
		'MeshFaceMaterial': THREE.MeshFaceMaterial,
		'MeshLambertMaterial': THREE.MeshLambertMaterial,
		'MeshNormalMaterial': THREE.MeshNormalMaterial,
		'MeshPhongMaterial': THREE.MeshPhongMaterial,
		'ParticleBasicMaterial': THREE.ParticleBasicMaterial,
		'ParticleCanvasMaterial': THREE.ParticleCanvasMaterial,
		'ShaderMaterial': THREE.ShaderMaterial,
		'Material': THREE.Material

	};

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setDisplay( 'none' );
	container.setPadding( '10px' );

	container.add( new UI.Text().setValue( 'MATERIAL' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	// name

	var materialNameRow = new UI.Panel();
	var materialName = new UI.Input().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	materialNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ).setColor( '#666' ) );
	materialNameRow.add( materialName );

	container.add( materialNameRow );

	// class

	var materialClassRow = new UI.Panel();
	var materialClass = new UI.Select().setOptions( {

		'LineBasicMaterial': 'LineBasicMaterial',
		'LineDashedMaterial': 'LineDashedMaterial',
		'MeshBasicMaterial': 'MeshBasicMaterial',
		'MeshDepthMaterial': 'MeshDepthMaterial',
		'MeshFaceMaterial': 'MeshFaceMaterial',
		'MeshLambertMaterial': 'MeshLambertMaterial',
		'MeshNormalMaterial': 'MeshNormalMaterial',
		'MeshPhongMaterial': 'MeshPhongMaterial'

	} ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	materialClassRow.add( new UI.Text( 'Class' ).setWidth( '90px' ).setColor( '#666' ) );
	materialClassRow.add( materialClass );

	container.add( materialClassRow );

	// color

	var materialColorRow = new UI.Panel();
	var materialColor = new UI.Color().onChange( update );

	materialColorRow.add( new UI.Text( 'Color' ).setWidth( '90px' ).setColor( '#666' ) );
	materialColorRow.add( materialColor );

	container.add( materialColorRow );

	// ambient

	var materialAmbientRow = new UI.Panel();
	var materialAmbient = new UI.Color().onChange( update );

	materialAmbientRow.add( new UI.Text( 'Ambient' ).setWidth( '90px' ).setColor( '#666' ) );
	materialAmbientRow.add( materialAmbient );

	container.add( materialAmbientRow );

	// emissive

	var materialEmissiveRow = new UI.Panel();
	var materialEmissive = new UI.Color().onChange( update );

	materialEmissiveRow.add( new UI.Text( 'Emissive' ).setWidth( '90px' ).setColor( '#666' ) );
	materialEmissiveRow.add( materialEmissive );

	container.add( materialEmissiveRow );

	// specular

	var materialSpecularRow = new UI.Panel();
	var materialSpecular = new UI.Color().onChange( update );

	materialSpecularRow.add( new UI.Text( 'Specular' ).setWidth( '90px' ).setColor( '#666' ) );
	materialSpecularRow.add( materialSpecular );

	container.add( materialSpecularRow );

	// shininess

	var materialShininessRow = new UI.Panel();
	var materialShininess = new UI.Number( 30 ).onChange( update );

	materialShininessRow.add( new UI.Text( 'Shininess' ).setWidth( '90px' ).setColor( '#666' ) );
	materialShininessRow.add( materialShininess );

	container.add( materialShininessRow );

	// map

	var materialMapRow = new UI.Panel();
	var materialMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialMap = new UI.Texture().setColor( '#444' ).setWidth( '100px' ).onChange( update );

	materialMapRow.add( new UI.Text( 'Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialMapRow.add( materialMapEnabled );
	materialMapRow.add( materialMap );

	container.add( materialMapRow );

	// light map

	var materialLightMapRow = new UI.Panel();
	var materialLightMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialLightMap = new UI.Texture().setColor( '#444' ).setWidth( '100px' ).onChange( update );

	materialLightMapRow.add( new UI.Text( 'Light Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialLightMapRow.add( materialLightMapEnabled );
	materialLightMapRow.add( materialLightMap );

	container.add( materialLightMapRow );

	// bump map

	var materialBumpMapRow = new UI.Panel();
	var materialBumpMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialBumpMap = new UI.Texture().setColor( '#444' ).setWidth( '100px' ).onChange( update );
	var materialBumpScale = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

	materialBumpMapRow.add( new UI.Text( 'Bump Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialBumpMapRow.add( materialBumpMapEnabled );
	materialBumpMapRow.add( materialBumpScale );
	materialBumpMapRow.add( materialBumpMap );

	container.add( materialBumpMapRow );

	// normal map

	var materialNormalMapRow = new UI.Panel();
	var materialNormalMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialNormalMap = new UI.Texture().setColor( '#444' ).setWidth( '100px' ).onChange( update );

	materialNormalMapRow.add( new UI.Text( 'Normal Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialNormalMapRow.add( materialNormalMapEnabled );
	materialNormalMapRow.add( materialNormalMap );

	container.add( materialNormalMapRow );

	// specular map

	var materialSpecularMapRow = new UI.Panel();
	var materialSpecularMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialSpecularMap = new UI.Texture().setColor( '#444' ).setWidth( '100px' ).onChange( update );

	materialSpecularMapRow.add( new UI.Text( 'Specular Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialSpecularMapRow.add( materialSpecularMapEnabled );
	materialSpecularMapRow.add( materialSpecularMap );

	container.add( materialSpecularMapRow );

	// env map

	var materialEnvMapRow = new UI.Panel();
	var materialEnvMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialEnvMap = new UI.CubeTexture().setColor( '#444' ).setWidth( '100px' ).onChange( update );
	var materialReflectivity = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );


	materialEnvMapRow.add( new UI.Text( 'Env Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialEnvMapRow.add( materialEnvMapEnabled );
	materialEnvMapRow.add( materialReflectivity );
	materialEnvMapRow.add( materialEnvMap );

	container.add( materialEnvMapRow );

	// opacity

	var materialOpacityRow = new UI.Panel();
	var materialOpacity = new UI.Number().setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialOpacityRow.add( new UI.Text( 'Opacity' ).setWidth( '90px' ).setColor( '#666' ) );
	materialOpacityRow.add( materialOpacity );

	container.add( materialOpacityRow );

	// transparent

	var materialTransparentRow = new UI.Panel();
	var materialTransparent = new UI.Checkbox().setLeft( '100px' ).onChange( update );

	materialTransparentRow.add( new UI.Text( 'Transparent' ).setWidth( '90px' ).setColor( '#666' ) );
	materialTransparentRow.add( materialTransparent );

	container.add( materialTransparentRow );

	// wireframe

	var materialWireframeRow = new UI.Panel();
	var materialWireframe = new UI.Checkbox( false ).onChange( update );
	var materialWireframeLinewidth = new UI.Number( 1 ).setWidth( '60px' ).setRange( 0, 100 ).onChange( update );

	materialWireframeRow.add( new UI.Text( 'Wireframe' ).setWidth( '90px' ).setColor( '#666' ) );
	materialWireframeRow.add( materialWireframe );
	materialWireframeRow.add( materialWireframeLinewidth );

	container.add( materialWireframeRow );


	//

	var selected = null;
	var selectedHasUvs = false;

	function update() {

		var material = selected.material;
		var textureWarning = false;

		if ( material ) {

			material.name = materialName.getValue();

			if ( material instanceof materialClasses[ materialClass.getValue() ] == false ) {

				material = new materialClasses[ materialClass.getValue() ]();
				selected.material = material;

			}

			if ( material.color !== undefined ) {

				material.color.setHex( materialColor.getHexValue() );

			}

			if ( material.ambient !== undefined ) {

				material.ambient.setHex( materialAmbient.getHexValue() );

			}

			if ( material.emissive !== undefined ) {

				material.emissive.setHex( materialEmissive.getHexValue() );

			}

			if ( material.specular !== undefined ) {

				material.specular.setHex( materialSpecular.getHexValue() );

			}

			if ( material.shininess !== undefined ) {

				material.shininess = materialShininess.getValue();

			}

			if ( material.map !== undefined ) {

				var mapEnabled = materialMapEnabled.getValue() === true;

				if ( selectedHasUvs )  {

					material.map = mapEnabled ? materialMap.getValue() : null;
					material.needsUpdate = true;
					selected.geometry.buffersNeedUpdate = true;
					selected.geometry.uvsNeedUpdate = true;

				} else {

					if ( mapEnabled ) textureWarning = true;

				}

			}

			/*
			if ( material.lightMap !== undefined ) {

				var lightMapEnabled = materialLightMapEnabled.getValue() === true;

				if ( selectedHasUvs )  {

					material.lightMap = lightMapEnabled ? materialLightMap.getValue() : null;
					material.needsUpdate = true;
					selected.geometry.buffersNeedUpdate = true;
					selected.geometry.uvsNeedUpdate = true;

				} else {

					if ( lightMapEnabled ) textureWarning = true;

				}

			}
			*/

			if ( material.bumpMap !== undefined ) {

				var bumpMapEnabled = materialBumpMapEnabled.getValue() === true;

				if ( selectedHasUvs )  {

					material.bumpMap = bumpMapEnabled ? materialBumpMap.getValue() : null;
					material.bumpScale = materialBumpScale.getValue();
					material.needsUpdate = true;
					selected.geometry.buffersNeedUpdate = true;
					selected.geometry.uvsNeedUpdate = true;

				} else {

					if ( bumpMapEnabled ) textureWarning = true;

				}

			}

			if ( material.normalMap !== undefined ) {

				var normalMapEnabled = materialNormalMapEnabled.getValue() === true;

				if ( selectedHasUvs )  {

					material.normalMap = normalMapEnabled ? materialNormalMap.getValue() : null;
					material.needsUpdate = true;
					selected.geometry.buffersNeedUpdate = true;
					selected.geometry.uvsNeedUpdate = true;

				} else {

					if ( normalMapEnabled ) textureWarning = true;

				}

			}

			if ( material.specularMap !== undefined ) {

				var specularMapEnabled = materialSpecularMapEnabled.getValue() === true;

				if ( selectedHasUvs )  {

					material.specularMap = specularMapEnabled ? materialSpecularMap.getValue() : null;
					material.needsUpdate = true;
					selected.geometry.buffersNeedUpdate = true;
					selected.geometry.uvsNeedUpdate = true;

				} else {

					if ( specularMapEnabled ) textureWarning = true;

				}

			}

			if ( material.envMap !== undefined ) {

				var envMapEnabled = materialEnvMapEnabled.getValue() === true;

				if ( selectedHasUvs )  {

					material.envMap = envMapEnabled ? materialEnvMap.getValue() : null;
					material.reflectivity = materialReflectivity.getValue();
					material.needsUpdate = true;
					selected.geometry.buffersNeedUpdate = true;
					selected.geometry.uvsNeedUpdate = true;

				} else {

					if ( envMapEnabled ) textureWarning = true;

				}

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

		if ( textureWarning ) {

			console.warn( "Can't set texture, model doesn't have texture coordinates" );

		}

	};

	function updateRows() {

		var properties = {
			'color': materialColorRow,
			'ambient': materialAmbientRow,
			'emissive': materialEmissiveRow,
			'specular': materialSpecularRow,
			'shininess': materialShininessRow,
			'map': materialMapRow,
			'lightMap': materialLightMapRow,
			'bumpMap': materialBumpMapRow,
			'normalMap': materialNormalMapRow,
			'specularMap': materialSpecularMapRow,
			'envMap': materialEnvMapRow,
			'opacity': materialOpacityRow,
			'transparent': materialTransparentRow,
			'wireframe': materialWireframeRow

		};

		for ( var property in properties ) {

			properties[ property ].setDisplay( selected.material[ property ] !== undefined ? '' : 'none' );

		}

	};

	function getMaterialInstanceName( material ) {

		for ( var key in materialClasses ) {

			if ( material instanceof materialClasses[ key ] ) return key;

		}

	}

	// events

	signals.objectSelected.add( function ( object ) {

		if ( object && object.material ) {

			selected = object;
			selectedHasUvs = object.geometry.faceVertexUvs[ 0 ].length > 0;

			container.setDisplay( '' );

			var material = object.material;

			materialName.setValue( material.name );
			materialClass.setValue( getMaterialInstanceName( material ) );

			if ( material.color !== undefined ) {

				materialColor.setValue( '#' + material.color.getHexString() );

			}

			if ( material.ambient !== undefined ) {

				materialAmbient.setValue( '#' + material.ambient.getHexString() );

			}

			if ( material.emissive !== undefined ) {

				materialEmissive.setValue( '#' + material.emissive.getHexString() );

			}

			if ( material.specular !== undefined ) {

				materialSpecular.setValue( '#' + material.specular.getHexString() );

			}

			if ( material.shininess !== undefined ) {

				materialShininess.setValue( material.shininess );

			}

			if ( material.map !== undefined ) {

				if ( selectedHasUvs ) {

					if ( material.map !== null ) {

						materialMapEnabled.setValue( true );
						materialMap.setValue( material.map );

					} else {

						materialMapEnabled.setValue( false );

					}

				} else {

					console.warn( "Can't set texture, model doesn't have texture coordinates" );

				}

			}

			/*
			if ( material.lightMap !== undefined ) {

				if ( material.lightMap !== null ) {

					materialLightMapEnabled.setValue( true );
					materialLightMap.setValue( material.lightMap );

				} else {

					materialLightMapEnabled.setValue( false );

				}

			}
			*/

			if ( material.bumpMap !== undefined ) {

				if ( material.bumpMap !== null ) {

					materialBumpMapEnabled.setValue( true );
					materialBumpMap.setValue( material.bumpMap );
					materialBumpScale.setValue( material.bumpScale );

				} else {

					materialBumpMapEnabled.setValue( false );
					materialBumpScale.setValue( 1 );

				}

			}

			if ( material.normalMap !== undefined ) {

				if ( material.normalMap !== null ) {

					materialNormalMapEnabled.setValue( true );
					materialNormalMap.setValue( material.normalMap );

				} else {

					materialNormalMapEnabled.setValue( false );

				}

			}

			if ( material.specularMap !== undefined ) {

				if ( material.specularMap !== null ) {

					materialSpecularMapEnabled.setValue( true );
					materialSpecularMap.setValue( material.specularMap );

				} else {

					materialSpecularMapEnabled.setValue( false );

				}

			}

			if ( material.envMap !== undefined ) {

				if ( material.envMap !== null ) {

					materialEnvMapEnabled.setValue( true );
					materialEnvMap.setValue( material.envMap );
					materialReflectivity.setValue( material.reflectivity );

				} else {

					materialEnvMapEnabled.setValue( false );

				}

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
			selectedHasUvs = false;

			container.setDisplay( 'none' );

		}

	} );

	return container;

}
