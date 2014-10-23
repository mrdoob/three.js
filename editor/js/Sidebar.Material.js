/**
 * @author mrdoob / http://mrdoob.com/
 */

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
		'PointCloudMaterial': THREE.PointCloudMaterial,
		'ShaderMaterial': THREE.ShaderMaterial,
		'SpriteMaterial': THREE.SpriteMaterial,
		'SpriteCanvasMaterial': THREE.SpriteCanvasMaterial,
		'Material': THREE.Material

	};

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/material/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/material/collapsed', boolean );

	} );
	container.setDisplay( 'none' );
	container.dom.classList.add( 'Material' );

	container.addStatic( new UI.Text().setValue( 'MATERIAL' ) );
	container.add( new UI.Break() );

	// uuid

	var materialUUIDRow = new UI.Panel();
	var materialUUID = new UI.Input().setWidth( '115px' ).setColor( '#444' ).setFontSize( '12px' ).setDisabled( true );
	var materialUUIDRenew = new UI.Button( '⟳' ).setMarginLeft( '7px' ).onClick( function () {

		materialUUID.setValue( THREE.Math.generateUUID() );
		update();

	} );

	materialUUIDRow.add( new UI.Text( 'UUID' ).setWidth( '90px' ) );
	materialUUIDRow.add( materialUUID );
	materialUUIDRow.add( materialUUIDRenew );

	container.add( materialUUIDRow );

	// name

	var materialNameRow = new UI.Panel();
	var materialName = new UI.Input().setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( function () {

		editor.setMaterialName( editor.selected.material, materialName.getValue() );

	} );

	materialNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
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
		'MeshPhongMaterial': 'MeshPhongMaterial',
		'ShaderMaterial': 'ShaderMaterial',
		'SpriteMaterial': 'SpriteMaterial'

	} ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	materialClassRow.add( new UI.Text( 'Type' ).setWidth( '90px' ) );
	materialClassRow.add( materialClass );

	container.add( materialClassRow );

	// color

	var materialColorRow = new UI.Panel();
	var materialColor = new UI.Color().onChange( update );

	materialColorRow.add( new UI.Text( 'Color' ).setWidth( '90px' ) );
	materialColorRow.add( materialColor );

	container.add( materialColorRow );

	// ambient

	var materialAmbientRow = new UI.Panel();
	var materialAmbient = new UI.Color().onChange( update );

	materialAmbientRow.add( new UI.Text( 'Ambient' ).setWidth( '90px' ) );
	materialAmbientRow.add( materialAmbient );

	container.add( materialAmbientRow );

	// emissive

	var materialEmissiveRow = new UI.Panel();
	var materialEmissive = new UI.Color().setHexValue( 0x000000 ).onChange( update );

	materialEmissiveRow.add( new UI.Text( 'Emissive' ).setWidth( '90px' ) );
	materialEmissiveRow.add( materialEmissive );

	container.add( materialEmissiveRow );

	// specular

	var materialSpecularRow = new UI.Panel();
	var materialSpecular = new UI.Color().setHexValue( 0x111111 ).onChange( update );

	materialSpecularRow.add( new UI.Text( 'Specular' ).setWidth( '90px' ) );
	materialSpecularRow.add( materialSpecular );

	container.add( materialSpecularRow );

	// shininess

	var materialShininessRow = new UI.Panel();
	var materialShininess = new UI.Number( 30 ).onChange( update );

	materialShininessRow.add( new UI.Text( 'Shininess' ).setWidth( '90px' ) );
	materialShininessRow.add( materialShininess );

	container.add( materialShininessRow );

	// uniforms

	var materialUniformsRow = new UI.Panel();
	var materialUniforms = new UI.TextArea().setWidth( '150px' ).setHeight( '80px' );
	materialUniforms.setValue( '{\n  "uColor": {\n    "type": "3f",\n    "value": [1, 0, 0]\n  }\n}' ).onChange( update );

	materialUniformsRow.add( new UI.Text( 'Uniforms' ).setWidth( '90px' ) );
	materialUniformsRow.add( materialUniforms );

	container.add( materialUniformsRow );

	// vertex shader

	var materialVertexShaderRow = new UI.Panel();
	var materialVertexShader = new UI.TextArea().setWidth( '150px' ).setHeight( '80px' );
	materialVertexShader.setValue( 'void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}' ).onChange( update );

	materialVertexShaderRow.add( new UI.Text( 'Vertex Shader' ).setWidth( '90px' ) );
	materialVertexShaderRow.add( materialVertexShader );

	container.add( materialVertexShaderRow );

	// fragment shader

	var materialFragmentShaderRow = new UI.Panel();
	var materialFragmentShader = new UI.TextArea().setWidth( '150px' ).setHeight( '80px' );
	materialFragmentShader.setValue( 'uniform vec3 uColor;\n\nvoid main() {\n\tgl_FragColor = vec4( uColor, 1.0 );\n}' ).onChange( update );

	materialFragmentShaderRow.add( new UI.Text( 'Fragment Shader' ).setWidth( '90px' ) );
	materialFragmentShaderRow.add( materialFragmentShader );

	container.add( materialFragmentShaderRow );

	// vertex colors

	var materialVertexColorsRow = new UI.Panel();
	var materialVertexColors = new UI.Select().setOptions( {

		0: 'No',
		1: 'Face',
		2: 'Vertex'

	} ).onChange( update );

	materialVertexColorsRow.add( new UI.Text( 'Vertex Colors' ).setWidth( '90px' ) );
	materialVertexColorsRow.add( materialVertexColors );

	container.add( materialVertexColorsRow );

	// skinning

	var materialSkinningRow = new UI.Panel();
	var materialSkinning = new UI.Checkbox( false ).onChange( update );

	materialSkinningRow.add( new UI.Text( 'Skinning' ).setWidth( '90px' ) );
	materialSkinningRow.add( materialSkinning );

	container.add( materialSkinningRow );

	// map

	var materialMapRow = new UI.Panel();
	var materialMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialMap = new UI.Texture().setColor( '#444' ).onChange( update );

	materialMapRow.add( new UI.Text( 'Map' ).setWidth( '90px' ) );
	materialMapRow.add( materialMapEnabled );
	materialMapRow.add( materialMap );

	container.add( materialMapRow );

	// alpha map

	var materialAlphaMapRow = new UI.Panel();
	var materialAlphaMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialAlphaMap = new UI.Texture().setColor( '#444' ).onChange( update );

	materialAlphaMapRow.add( new UI.Text( 'Alpha Map' ).setWidth( '90px' ) );
	materialAlphaMapRow.add( materialAlphaMapEnabled );
	materialAlphaMapRow.add( materialAlphaMap );

	container.add( materialAlphaMapRow );

	// light map

	var materialLightMapRow = new UI.Panel();
	var materialLightMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialLightMap = new UI.Texture().setColor( '#444' ).onChange( update );

	materialLightMapRow.add( new UI.Text( 'Light Map' ).setWidth( '90px' ) );
	materialLightMapRow.add( materialLightMapEnabled );
	materialLightMapRow.add( materialLightMap );

	container.add( materialLightMapRow );

	// bump map

	var materialBumpMapRow = new UI.Panel();
	var materialBumpMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialBumpMap = new UI.Texture().setColor( '#444' ).onChange( update );
	var materialBumpScale = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

	materialBumpMapRow.add( new UI.Text( 'Bump Map' ).setWidth( '90px' ) );
	materialBumpMapRow.add( materialBumpMapEnabled );
	materialBumpMapRow.add( materialBumpMap );
	materialBumpMapRow.add( materialBumpScale );

	container.add( materialBumpMapRow );

	// normal map

	var materialNormalMapRow = new UI.Panel();
	var materialNormalMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialNormalMap = new UI.Texture().setColor( '#444' ).onChange( update );

	materialNormalMapRow.add( new UI.Text( 'Normal Map' ).setWidth( '90px' ) );
	materialNormalMapRow.add( materialNormalMapEnabled );
	materialNormalMapRow.add( materialNormalMap );

	container.add( materialNormalMapRow );

	// specular map

	var materialSpecularMapRow = new UI.Panel();
	var materialSpecularMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialSpecularMap = new UI.Texture().setColor( '#444' ).onChange( update );

	materialSpecularMapRow.add( new UI.Text( 'Specular Map' ).setWidth( '90px' ) );
	materialSpecularMapRow.add( materialSpecularMapEnabled );
	materialSpecularMapRow.add( materialSpecularMap );

	container.add( materialSpecularMapRow );

	// env map

	var materialEnvMapRow = new UI.Panel();
	var materialEnvMapEnabled = new UI.Checkbox( false ).onChange( update );
	var materialEnvMap = new UI.CubeTexture().setColor( '#444' ).onChange( update );
	var materialReflectivity = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

	materialEnvMapRow.add( new UI.Text( 'Env Map' ).setWidth( '90px' ) );
	materialEnvMapRow.add( materialEnvMapEnabled );
	materialEnvMapRow.add( materialEnvMap );
	materialEnvMapRow.add( materialReflectivity );

	container.add( materialEnvMapRow );

	// side

	var materialSideRow = new UI.Panel();
	var materialSide = new UI.Select().setOptions( {

		0: 'Front',
		1: 'Back',
		2: 'Double'

	} ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	materialSideRow.add( new UI.Text( 'Side' ).setWidth( '90px' ) );
	materialSideRow.add( materialSide );

	container.add( materialSideRow );

	// shading

	var materialShadingRow = new UI.Panel();
	var materialShading = new UI.Select().setOptions( {

		0: 'No',
		1: 'Flat',
		2: 'Smooth'

	} ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( update );

	materialShadingRow.add( new UI.Text( 'Shading' ).setWidth( '90px' ) );
	materialShadingRow.add( materialShading );

	container.add( materialShadingRow );

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

	materialBlendingRow.add( new UI.Text( 'Blending' ).setWidth( '90px' ) );
	materialBlendingRow.add( materialBlending );

	container.add( materialBlendingRow );

	// opacity

	var materialOpacityRow = new UI.Panel();
	var materialOpacity = new UI.Number().setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialOpacityRow.add( new UI.Text( 'Opacity' ).setWidth( '90px' ) );
	materialOpacityRow.add( materialOpacity );

	container.add( materialOpacityRow );

	// transparent

	var materialTransparentRow = new UI.Panel();
	var materialTransparent = new UI.Checkbox().setLeft( '100px' ).onChange( update );

	materialTransparentRow.add( new UI.Text( 'Transparent' ).setWidth( '90px' ) );
	materialTransparentRow.add( materialTransparent );

	container.add( materialTransparentRow );

	// wireframe

	var materialWireframeRow = new UI.Panel();
	var materialWireframe = new UI.Checkbox( false ).onChange( update );
	var materialWireframeLinewidth = new UI.Number( 1 ).setWidth( '60px' ).setRange( 0, 100 ).onChange( update );

	materialWireframeRow.add( new UI.Text( 'Wireframe' ).setWidth( '90px' ) );
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

		if ( object instanceof THREE.Sprite ) objectHasUvs = true;
		if ( geometry instanceof THREE.Geometry && geometry.faceVertexUvs[ 0 ].length > 0 ) objectHasUvs = true;
		if ( geometry instanceof THREE.BufferGeometry && geometry.attributes.uv !== undefined ) objectHasUvs = true;

		if ( material ) {

			if ( material.uuid !== undefined ) {

				material.uuid = materialUUID.getValue();

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

			if ( material.uniforms !== undefined ) {

				material.uniforms = JSON.parse( materialUniforms.getValue() );

			}

			if ( material.vertexShader !== undefined ) {

				material.vertexShader = materialVertexShader.getValue();

			}

			if ( material.fragmentShader !== undefined ) {

				material.fragmentShader = materialFragmentShader.getValue();

			}

			if ( material.vertexColors !== undefined ) {

				material.vertexColors = parseInt( materialVertexColors.getValue() );
				material.needsUpdate = true;

			}

			if ( material.skinning !== undefined ) {

				material.skinning = materialSkinning.getValue();

			}

			if ( material.map !== undefined ) {

				var mapEnabled = materialMapEnabled.getValue() === true;

				if ( objectHasUvs )  {

					material.map = mapEnabled ? materialMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( mapEnabled ) textureWarning = true;

				}

			}

			if ( material.alphaMap !== undefined ) {

				var mapEnabled = materialAlphaMapEnabled.getValue() === true;

				if ( objectHasUvs )  {

					material.alphaMap = mapEnabled ? materialAlphaMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( mapEnabled ) textureWarning = true;

				}

			}

			/*
			if ( material.lightMap !== undefined ) {

				var lightMapEnabled = materialLightMapEnabled.getValue() === true;

				if ( objectHasUvs )  {

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

					material.normalMap = normalMapEnabled ? materialNormalMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( normalMapEnabled ) textureWarning = true;

				}

			}

			if ( material.specularMap !== undefined ) {

				var specularMapEnabled = materialSpecularMapEnabled.getValue() === true;

				if ( objectHasUvs )  {

					material.specularMap = specularMapEnabled ? materialSpecularMap.getValue() : null;
					material.needsUpdate = true;

				} else {

					if ( specularMapEnabled ) textureWarning = true;

				}

			}

			if ( material.envMap !== undefined ) {

				var envMapEnabled = materialEnvMapEnabled.getValue() === true;

				material.envMap = envMapEnabled ? materialEnvMap.getValue() : null;
				material.reflectivity = materialReflectivity.getValue();
				material.needsUpdate = true;

			}

			if ( material.side !== undefined ) {

				material.side = parseInt( materialSide.getValue() );

			}

			if ( material.shading !== undefined ) {

				material.shading = parseInt( materialShading.getValue() );

			}

			if ( material.blending !== undefined ) {

				material.blending = parseInt( materialBlending.getValue() );

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
			'uniforms': materialUniformsRow,
			'vertexShader': materialVertexShaderRow,
			'fragmentShader': materialFragmentShaderRow,
			'vertexColors': materialVertexColorsRow,
			'skinning': materialSkinningRow,
			'map': materialMapRow,
			'alphaMap': materialAlphaMapRow,
			'lightMap': materialLightMapRow,
			'bumpMap': materialBumpMapRow,
			'normalMap': materialNormalMapRow,
			'specularMap': materialSpecularMapRow,
			'envMap': materialEnvMapRow,
			'side': materialSideRow,
			'shading': materialShadingRow,
			'blending': materialBlendingRow,
			'opacity': materialOpacityRow,
			'transparent': materialTransparentRow,
			'wireframe': materialWireframeRow
		};

		var material = editor.selected.material;

		for ( var property in properties ) {

			properties[ property ].setDisplay( material[ property ] !== undefined ? '' : 'none' );

		}

	};

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

			materialClass.setValue( material.type );

			if ( material.color !== undefined ) {

				materialColor.setHexValue( material.color.getHexString() );

			}

			if ( material.ambient !== undefined ) {

				materialAmbient.setHexValue( material.ambient.getHexString() );

			}

			if ( material.emissive !== undefined ) {

				materialEmissive.setHexValue( material.emissive.getHexString() );

			}

			if ( material.specular !== undefined ) {

				materialSpecular.setHexValue( material.specular.getHexString() );

			}

			if ( material.shininess !== undefined ) {

				materialShininess.setValue( material.shininess );

			}

			if ( material.uniforms !== undefined ) {

				materialUniforms.setValue( JSON.stringify( material.uniforms, null, '  ' ) );

			}

			if ( material.vertexShader !== undefined ) {

				materialVertexShader.setValue( material.vertexShader );

			}

			if ( material.fragmentShader !== undefined ) {

				materialFragmentShader.setValue( material.fragmentShader );

			}

			if ( material.vertexColors !== undefined ) {

				materialVertexColors.setValue( material.vertexColors );

			}

			if ( material.skinning !== undefined ) {

				materialSkinning.setValue( material.skinning );

			}

			if ( material.map !== undefined ) {

				materialMapEnabled.setValue( material.map !== null );
				materialMap.setValue( material.map );

			}

			if ( material.alphaMap !== undefined ) {

				materialAlphaMapEnabled.setValue( material.alphaMap !== null );
				materialAlphaMap.setValue( material.alphaMap );

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

			if ( material.side !== undefined ) {

				materialSide.setValue( material.side );

			}

			if ( material.shading !== undefined ) {

				materialShading.setValue( material.shading );

			}

			if ( material.blending !== undefined ) {

				materialBlending.setValue( material.blending );

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
