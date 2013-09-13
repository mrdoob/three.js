Sidebar.Material = function ( editor ) {

	var signals = editor.signals;

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
	container.setPadding( '10px' );
	container.setDisplay( 'none' );

	container.add( new UI.Text().setValue( 'MATERIAL' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	// uuid

	var materialUUIDRow = new UI.Panel();
	var materialUUID = new UI.Input().setWidth( '115px' ).setColor( '#444' ).setFontSize( '12px' ).setDisabled( true );
	var materialUUIDRenew = new UI.Button( '⟳' ).setMarginLeft( '7px' ).onClick( function () {

		materialUUID.setValue( THREE.Math.generateUUID() );
		update();

	} );

	materialUUIDRow.add( new UI.Text( 'UUID' ).setWidth( '90px' ).setColor( '#666' ) );
	materialUUIDRow.add( materialUUID );
	materialUUIDRow.add( materialUUIDRenew );

	container.add( materialUUIDRow );

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

	// vertex colors

	var materialVertexColorsRow = new UI.Panel();
	var materialVertexColors = new UI.Select().setOptions( {

		0: 'No',
		1: 'Face',
		2: 'Vertex'

	} ).onChange( update );

	materialVertexColorsRow.add( new UI.Text( 'Vertex Colors' ).setWidth( '90px' ).setColor( '#666' ) );
	materialVertexColorsRow.add( materialVertexColors );

	container.add( materialVertexColorsRow );


	// map

	var materialMapRow = new UI.Panel();
	var materialMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialMap = new UI.Texture().setColor( '#444' ).onChange( update );

	materialMapRow.add( new UI.Text( 'Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialMapRow.add( materialMapEnabled );
	materialMapRow.add( materialMap );

	container.add( materialMapRow );


	// light map

	var materialLightMapRow = new UI.Panel();
	var materialLightMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialLightMap = new UI.Texture().setColor( '#444' ).onChange( update );

	materialLightMapRow.add( new UI.Text( 'Light Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialLightMapRow.add( materialLightMapEnabled );
	materialLightMapRow.add( materialLightMap );

	container.add( materialLightMapRow );


	// bump map

	var materialBumpMapRow = new UI.Panel();
	var materialBumpMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialBumpMap = new UI.Texture().setColor( '#444' ).onChange( update );
	var materialBumpScale = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

	materialBumpMapRow.add( new UI.Text( 'Bump Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialBumpMapRow.add( materialBumpMapEnabled );
	materialBumpMapRow.add( materialBumpMap );
	materialBumpMapRow.add( materialBumpScale );

	container.add( materialBumpMapRow );


	// normal map

	var materialNormalMapRow = new UI.Panel();
	var materialNormalMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialNormalMap = new UI.Texture().setColor( '#444' ).onChange( update );

	materialNormalMapRow.add( new UI.Text( 'Normal Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialNormalMapRow.add( materialNormalMapEnabled );
	materialNormalMapRow.add( materialNormalMap );

	container.add( materialNormalMapRow );


	// specular map

	var materialSpecularMapRow = new UI.Panel();
	var materialSpecularMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialSpecularMap = new UI.Texture().setColor( '#444' ).onChange( update );

	materialSpecularMapRow.add( new UI.Text( 'Specular Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialSpecularMapRow.add( materialSpecularMapEnabled );
	materialSpecularMapRow.add( materialSpecularMap );

	container.add( materialSpecularMapRow );


	// env map

	var materialEnvMapRow = new UI.Panel();
	var materialEnvMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialEnvMap = new UI.CubeTexture().setColor( '#444' ).onChange( update );
	var materialReflectivity = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

	materialEnvMapRow.add( new UI.Text( 'Env Map' ).setWidth( '90px' ).setColor( '#666' ) );
	materialEnvMapRow.add( materialEnvMapEnabled );
	materialEnvMapRow.add( materialEnvMap );
	materialEnvMapRow.add( materialReflectivity );

	container.add( materialEnvMapRow );


	// blending

	var materialBlendingRow = new UI.Panel();
	var materialBlending = new UI.Select().setOptions( {

		0: 'No',
		1: 'Normal',
		2: 'Additive',
		3: 'Subtractive',
		4: 'Multiply',
		5: 'Custom'

	} ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	materialBlendingRow.add( new UI.Text( 'Blending' ).setWidth( '90px' ).setColor( '#666' ) );
	materialBlendingRow.add( materialBlending );

	container.add( materialBlendingRow );


	// side

	var materialSideRow = new UI.Panel();
	var materialSide = new UI.Select().setOptions( {

		0: 'Front',
		1: 'Back',
		2: 'Double'

	} ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	materialSideRow.add( new UI.Text( 'Side' ).setWidth( '90px' ).setColor( '#666' ) );
	materialSideRow.add( materialSide );

	container.add( materialSideRow );


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

	function update() {

		var object = editor.selected;
		var geometry = object.geometry;
		var material = object.material;
		var textureWarning = false;
		var objectHasUvs = false;

		if ( geometry instanceof THREE.Geometry && geometry.faceVertexUvs[ 0 ].length > 0 ) objectHasUvs = true;
		if ( geometry instanceof THREE.BufferGeometry && geometry.attributes.uv !== undefined ) objectHasUvs = true;

		if ( material ) {

			if ( material.uuid !== undefined ) {

				material.uuid = materialUUID.getValue();

			}

			if ( material.name !== undefined ) {

				material.name = materialName.getValue();

			}

			if ( material instanceof materialClasses[ materialClass.getValue() ] === false ) {

				material = new materialClasses[ materialClass.getValue() ]();
				object.material = material;

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

			if ( material.vertexColors !== undefined ) {

				geometry.buffersNeedUpdate = true;
				geometry.colorsNeedUpdate = true;

				material.vertexColors = parseInt( materialVertexColors.getValue() );
				material.needsUpdate = true;

			}

			if ( material.map !== undefined ) {

				var mapEnabled = materialMapEnabled.getValue() === true;

				if ( objectHasUvs )  {

					geometry.buffersNeedUpdate = true;
					geometry.uvsNeedUpdate = true;

					material.map = mapEnabled ? materialMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( mapEnabled ) textureWarning = true;

				}

			}

			/*
			if ( material.lightMap !== undefined ) {

				var lightMapEnabled = materialLightMapEnabled.getValue() === true;

				if ( objectHasUvs )  {

					geometry.buffersNeedUpdate = true;
					geometry.uvsNeedUpdate = true;

					material.lightMap = lightMapEnabled ? materialLightMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( lightMapEnabled ) textureWarning = true;

				}

			}
			*/

			if ( material.bumpMap !== undefined ) {

				var bumpMapEnabled = materialBumpMapEnabled.getValue() === true;

				if ( objectHasUvs )  {

					geometry.buffersNeedUpdate = true;
					geometry.uvsNeedUpdate = true;

					material.bumpMap = bumpMapEnabled ? materialBumpMap.getValue() : null;
					material.bumpScale = materialBumpScale.getValue();
					material.needsUpdate = true;

				} else {

					if ( bumpMapEnabled ) textureWarning = true;

				}

			}

			if ( material.normalMap !== undefined ) {

				var normalMapEnabled = materialNormalMapEnabled.getValue() === true;

				if ( objectHasUvs )  {

					geometry.buffersNeedUpdate = true;
					geometry.uvsNeedUpdate = true;

					material.normalMap = normalMapEnabled ? materialNormalMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( normalMapEnabled ) textureWarning = true;

				}

			}

			if ( material.specularMap !== undefined ) {

				var specularMapEnabled = materialSpecularMapEnabled.getValue() === true;

				if ( objectHasUvs )  {

					geometry.buffersNeedUpdate = true;
					geometry.uvsNeedUpdate = true;

					material.specularMap = specularMapEnabled ? materialSpecularMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( specularMapEnabled ) textureWarning = true;

				}

			}

			if ( material.envMap !== undefined ) {

				var envMapEnabled = materialEnvMapEnabled.getValue() === true;

				if ( objectHasUvs )  {

					geometry.buffersNeedUpdate = true;
					geometry.uvsNeedUpdate = true;

					material.envMap = envMapEnabled ? materialEnvMap.getValue() : null;
					material.reflectivity = materialReflectivity.getValue();
					material.needsUpdate = true;

				} else {

					if ( envMapEnabled ) textureWarning = true;

				}

			}

			if ( material.blending !== undefined ) {

				material.blending = parseInt( materialBlending.getValue() );

			}

			if ( material.side !== undefined ) {

				material.side = parseInt( materialSide.getValue() );

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
			'name': materialNameRow,
			'color': materialColorRow,
			'ambient': materialAmbientRow,
			'emissive': materialEmissiveRow,
			'specular': materialSpecularRow,
			'shininess': materialShininessRow,
			'vertexColors': materialVertexColorsRow,
			'map': materialMapRow,
			'lightMap': materialLightMapRow,
			'bumpMap': materialBumpMapRow,
			'normalMap': materialNormalMapRow,
			'specularMap': materialSpecularMapRow,
			'envMap': materialEnvMapRow,
			'blending': materialBlendingRow,
			'side': materialSideRow,
			'opacity': materialOpacityRow,
			'transparent': materialTransparentRow,
			'wireframe': materialWireframeRow

		};

		var object = editor.selected;

		for ( var property in properties ) {

			properties[ property ].setDisplay( object.material[ property ] !== undefined ? '' : 'none' );

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

			container.setDisplay( '' );

			var material = object.material;

			if ( material.uuid !== undefined ) {

				materialUUID.setValue( material.uuid );

			}

			if ( material.name !== undefined ) {

				materialName.setValue( material.name );

			}

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

			if ( material.vertexColors !== undefined ) {

				materialVertexColors.setValue( material.vertexColors );

			}

			if ( material.map !== undefined ) {

				materialMapEnabled.setValue( material.map !== null );
				materialMap.setValue( material.map );

			}

			/*
			if ( material.lightMap !== undefined ) {

				materialLightMapEnabled.setValue( material.lightMap !== null );
				materialLightMap.setValue( material.lightMap );

			}
			*/

			if ( material.bumpMap !== undefined ) {

				materialBumpMapEnabled.setValue( material.bumpMap !== null );
				materialBumpMap.setValue( material.bumpMap );
				materialBumpScale.setValue( material.bumpScale );

			}

			if ( material.normalMap !== undefined ) {

				materialNormalMapEnabled.setValue( material.normalMap !== null );
				materialNormalMap.setValue( material.normalMap );

			}

			if ( material.specularMap !== undefined ) {

				materialSpecularMapEnabled.setValue( material.specularMap !== null );
				materialSpecularMap.setValue( material.specularMap );

			}

			if ( material.envMap !== undefined ) {

				materialEnvMapEnabled.setValue( material.envMap !== null );
				materialEnvMap.setValue( material.envMap );
				materialReflectivity.setValue( material.reflectivity );

			}

			if ( material.blending !== undefined ) {

				materialBlending.setValue( material.blending );

			}

			if ( material.side !== undefined ) {

				materialSide.setValue( material.side );

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

			container.setDisplay( 'none' );

		}

	} );

	return container;

}
