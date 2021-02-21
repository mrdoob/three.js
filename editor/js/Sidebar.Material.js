import * as THREE from '../../build/three.module.js';

import { UIPanel, UIRow, UIInput, UIButton, UIColor, UICheckbox, UISelect, UIText, UINumber } from './libs/ui.js';
import { UITexture } from './libs/ui.three.js';

import { SetMaterialCommand } from './commands/SetMaterialCommand.js';
import { SetMaterialColorCommand } from './commands/SetMaterialColorCommand.js';
import { SetMaterialMapCommand } from './commands/SetMaterialMapCommand.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';
import { SetMaterialVectorCommand } from './commands/SetMaterialVectorCommand.js';

var materialClasses = {
	'LineBasicMaterial': THREE.LineBasicMaterial,
	'LineDashedMaterial': THREE.LineDashedMaterial,
	'MeshBasicMaterial': THREE.MeshBasicMaterial,
	'MeshDepthMaterial': THREE.MeshDepthMaterial,
	'MeshNormalMaterial': THREE.MeshNormalMaterial,
	'MeshLambertMaterial': THREE.MeshLambertMaterial,
	'MeshMatcapMaterial': THREE.MeshMatcapMaterial,
	'MeshPhongMaterial': THREE.MeshPhongMaterial,
	'MeshToonMaterial': THREE.MeshToonMaterial,
	'MeshStandardMaterial': THREE.MeshStandardMaterial,
	'MeshPhysicalMaterial': THREE.MeshPhysicalMaterial,
	'RawShaderMaterial': THREE.RawShaderMaterial,
	'ShaderMaterial': THREE.ShaderMaterial,
	'ShadowMaterial': THREE.ShadowMaterial,
	'SpriteMaterial': THREE.SpriteMaterial,
	'PointsMaterial': THREE.PointsMaterial
};

function SidebarMaterial( editor ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var currentObject;

	var currentMaterialSlot = 0;

	var epsilon = 0.01 - Number.EPSILON;

	var container = new UIPanel();
	container.setBorderTop( '0' );
	container.setDisplay( 'none' );
	container.setPaddingTop( '20px' );

	// Current material slot

	var materialSlotRow = new UIRow();

	materialSlotRow.add( new UIText( strings.getKey( 'sidebar/material/slot' ) ).setWidth( '90px' ) );

	var materialSlotSelect = new UISelect().setWidth( '170px' ).setFontSize( '12px' ).onChange( update );
	materialSlotSelect.setOptions( { 0: '' } ).setValue( 0 );
	materialSlotRow.add( materialSlotSelect );

	container.add( materialSlotRow );

	// type

	var materialClassRow = new UIRow();
	var materialClass = new UISelect().setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

	materialClassRow.add( new UIText( strings.getKey( 'sidebar/material/type' ) ).setWidth( '90px' ) );
	materialClassRow.add( materialClass );

	container.add( materialClassRow );

	// uuid

	var materialUUIDRow = new UIRow();
	var materialUUID = new UIInput().setWidth( '102px' ).setFontSize( '12px' ).setDisabled( true );
	var materialUUIDRenew = new UIButton( strings.getKey( 'sidebar/material/new' ) ).setMarginLeft( '7px' ).onClick( function () {

		materialUUID.setValue( THREE.MathUtils.generateUUID() );
		update();

	} );

	materialUUIDRow.add( new UIText( strings.getKey( 'sidebar/material/uuid' ) ).setWidth( '90px' ) );
	materialUUIDRow.add( materialUUID );
	materialUUIDRow.add( materialUUIDRenew );

	container.add( materialUUIDRow );

	// name

	var materialNameRow = new UIRow();
	var materialName = new UIInput().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

		editor.execute( new SetMaterialValueCommand( editor, editor.selected, 'name', materialName.getValue(), currentMaterialSlot ) );

	} );

	materialNameRow.add( new UIText( strings.getKey( 'sidebar/material/name' ) ).setWidth( '90px' ) );
	materialNameRow.add( materialName );

	container.add( materialNameRow );

	// program

	var materialProgramRow = new UIRow();
	materialProgramRow.add( new UIText( strings.getKey( 'sidebar/material/program' ) ).setWidth( '90px' ) );

	var materialProgramInfo = new UIButton( strings.getKey( 'sidebar/material/info' ) );
	materialProgramInfo.setMarginLeft( '4px' );
	materialProgramInfo.onClick( function () {

		signals.editScript.dispatch( currentObject, 'programInfo' );

	} );
	materialProgramRow.add( materialProgramInfo );

	var materialProgramVertex = new UIButton( strings.getKey( 'sidebar/material/vertex' ) );
	materialProgramVertex.setMarginLeft( '4px' );
	materialProgramVertex.onClick( function () {

		signals.editScript.dispatch( currentObject, 'vertexShader' );

	} );
	materialProgramRow.add( materialProgramVertex );

	var materialProgramFragment = new UIButton( strings.getKey( 'sidebar/material/fragment' ) );
	materialProgramFragment.setMarginLeft( '4px' );
	materialProgramFragment.onClick( function () {

		signals.editScript.dispatch( currentObject, 'fragmentShader' );

	} );
	materialProgramRow.add( materialProgramFragment );

	container.add( materialProgramRow );

	// color

	var materialColorRow = new UIRow();
	var materialColor = new UIColor().onInput( update );

	materialColorRow.add( new UIText( strings.getKey( 'sidebar/material/color' ) ).setWidth( '90px' ) );
	materialColorRow.add( materialColor );

	container.add( materialColorRow );

	// roughness

	var materialRoughnessRow = new UIRow();
	var materialRoughness = new UINumber( 0.5 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialRoughnessRow.add( new UIText( strings.getKey( 'sidebar/material/roughness' ) ).setWidth( '90px' ) );
	materialRoughnessRow.add( materialRoughness );

	container.add( materialRoughnessRow );

	// metalness

	var materialMetalnessRow = new UIRow();
	var materialMetalness = new UINumber( 0.5 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialMetalnessRow.add( new UIText( strings.getKey( 'sidebar/material/metalness' ) ).setWidth( '90px' ) );
	materialMetalnessRow.add( materialMetalness );

	container.add( materialMetalnessRow );

	/*
	// sheen

	var materialSheenRow = new UIRow();
	var materialSheenEnabled = new UICheckbox( false ).onChange( update );
	var materialSheen = new UIColor().setHexValue( 0x000000 ).onInput( update );

	materialSheenRow.add( new UIText( strings.getKey( 'sidebar/material/sheen' ) ).setWidth( '90px' ) )
	materialSheenRow.add( materialSheenEnabled );
	materialSheenRow.add( materialSheen );

	container.add( materialSheenRow );
	*/

	// emissive

	var materialEmissiveRow = new UIRow();
	var materialEmissive = new UIColor().setHexValue( 0x000000 ).onInput( update );
	var materialEmissiveIntensity = new UINumber( 1 ).setWidth( '30px' ).onChange( update );

	materialEmissiveRow.add( new UIText( strings.getKey( 'sidebar/material/emissive' ) ).setWidth( '90px' ) );
	materialEmissiveRow.add( materialEmissive );
	materialEmissiveRow.add( materialEmissiveIntensity );

	container.add( materialEmissiveRow );

	// specular

	var materialSpecularRow = new UIRow();
	var materialSpecular = new UIColor().setHexValue( 0x111111 ).onInput( update );

	materialSpecularRow.add( new UIText( strings.getKey( 'sidebar/material/specular' ) ).setWidth( '90px' ) );
	materialSpecularRow.add( materialSpecular );

	container.add( materialSpecularRow );

	// shininess

	var materialShininessRow = new UIRow();
	var materialShininess = new UINumber( 30 ).onChange( update );

	materialShininessRow.add( new UIText( strings.getKey( 'sidebar/material/shininess' ) ).setWidth( '90px' ) );
	materialShininessRow.add( materialShininess );

	container.add( materialShininessRow );

	// clearcoat

	var materialClearcoatRow = new UIRow();
	var materialClearcoat = new UINumber( 1 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialClearcoatRow.add( new UIText( strings.getKey( 'sidebar/material/clearcoat' ) ).setWidth( '90px' ) );
	materialClearcoatRow.add( materialClearcoat );

	container.add( materialClearcoatRow );

	// clearcoatRoughness

	var materialClearcoatRoughnessRow = new UIRow();
	var materialClearcoatRoughness = new UINumber( 1 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialClearcoatRoughnessRow.add( new UIText( strings.getKey( 'sidebar/material/clearcoatroughness' ) ).setWidth( '90px' ) );
	materialClearcoatRoughnessRow.add( materialClearcoatRoughness );

	container.add( materialClearcoatRoughnessRow );

	// vertex colors

	var materialVertexColorsRow = new UIRow();
	var materialVertexColors = new UICheckbox( false ).onChange( update );

	materialVertexColorsRow.add( new UIText( strings.getKey( 'sidebar/material/vertexcolors' ) ).setWidth( '90px' ) );
	materialVertexColorsRow.add( materialVertexColors );

	container.add( materialVertexColorsRow );

	// vertex tangents

	var materialVertexTangentsRow = new UIRow();
	var materialVertexTangents = new UICheckbox( false ).onChange( update );

	materialVertexTangentsRow.add( new UIText( strings.getKey( 'sidebar/material/vertextangents' ) ).setWidth( '90px' ) );
	materialVertexTangentsRow.add( materialVertexTangents );

	container.add( materialVertexTangentsRow );

	// depth packing

	var materialDepthPackingRow = new UIRow();
	var materialDepthPacking = new UISelect().setOptions( {
		[ THREE.BasicDepthPacking ]: 'BasicDepthPacking',
		[ THREE.RGBADepthPacking ]: 'RGBADepthPacking'
	} );
	materialDepthPacking.onChange( update );

	materialDepthPackingRow.add( new UIText( strings.getKey( 'sidebar/material/depthPacking' ) ).setWidth( '90px' ) );
	materialDepthPackingRow.add( materialDepthPacking );

	container.add( materialDepthPackingRow );

	// skinning

	var materialSkinningRow = new UIRow();
	var materialSkinning = new UICheckbox( false ).onChange( update );

	materialSkinningRow.add( new UIText( strings.getKey( 'sidebar/material/skinning' ) ).setWidth( '90px' ) );
	materialSkinningRow.add( materialSkinning );

	container.add( materialSkinningRow );

	// map

	var materialMapRow = new UIRow();
	var materialMapEnabled = new UICheckbox( false ).onChange( update );
	var materialMap = new UITexture().onChange( updateMaterial );

	materialMapRow.add( new UIText( strings.getKey( 'sidebar/material/map' ) ).setWidth( '90px' ) );
	materialMapRow.add( materialMapEnabled );
	materialMapRow.add( materialMap );

	container.add( materialMapRow );

	// matcap map

	var materialMatcapMapRow = new UIRow();
	var materialMatcapMapEnabled = new UICheckbox( false ).onChange( update );
	var materialMatcapMap = new UITexture().onChange( update );

	materialMatcapMapRow.add( new UIText( strings.getKey( 'sidebar/material/matcap' ) ).setWidth( '90px' ) );
	materialMatcapMapRow.add( materialMatcapMapEnabled );
	materialMatcapMapRow.add( materialMatcapMap );

	container.add( materialMatcapMapRow );

	// alpha map

	var materialAlphaMapRow = new UIRow();
	var materialAlphaMapEnabled = new UICheckbox( false ).onChange( update );
	var materialAlphaMap = new UITexture().onChange( update );

	materialAlphaMapRow.add( new UIText( strings.getKey( 'sidebar/material/alphamap' ) ).setWidth( '90px' ) );
	materialAlphaMapRow.add( materialAlphaMapEnabled );
	materialAlphaMapRow.add( materialAlphaMap );

	container.add( materialAlphaMapRow );

	// bump map

	var materialBumpMapRow = new UIRow();
	var materialBumpMapEnabled = new UICheckbox( false ).onChange( update );
	var materialBumpMap = new UITexture().onChange( update );
	var materialBumpScale = new UINumber( 1 ).setWidth( '30px' ).onChange( update );

	materialBumpMapRow.add( new UIText( strings.getKey( 'sidebar/material/bumpmap' ) ).setWidth( '90px' ) );
	materialBumpMapRow.add( materialBumpMapEnabled );
	materialBumpMapRow.add( materialBumpMap );
	materialBumpMapRow.add( materialBumpScale );

	container.add( materialBumpMapRow );

	// normal map

	var materialNormalMapRow = new UIRow();
	var materialNormalMapEnabled = new UICheckbox( false ).onChange( update );
	var materialNormalMap = new UITexture().onChange( update );
	var materialNormalScaleX = new UINumber( 1 ).setWidth( '30px' ).onChange( update );
	var materialNormalScaleY = new UINumber( 1 ).setWidth( '30px' ).onChange( update );

	materialNormalMapRow.add( new UIText( strings.getKey( 'sidebar/material/normalmap' ) ).setWidth( '90px' ) );
	materialNormalMapRow.add( materialNormalMapEnabled );
	materialNormalMapRow.add( materialNormalMap );
	materialNormalMapRow.add( materialNormalScaleX );
	materialNormalMapRow.add( materialNormalScaleY );

	container.add( materialNormalMapRow );

	// clearcoat normal map

	var materialClearcoatNormalMapRow = new UIRow();
	var materialClearcoatNormalMapEnabled = new UICheckbox( false ).onChange( update );
	var materialClearcoatNormalMap = new UITexture().onChange( update );
	var materialClearcoatNormalScaleX = new UINumber( 1 ).setWidth( '30px' ).onChange( update );
	var materialClearcoatNormalScaleY = new UINumber( 1 ).setWidth( '30px' ).onChange( update );

	materialClearcoatNormalMapRow.add( new UIText( strings.getKey( 'sidebar/material/clearcoatnormalmap' ) ).setWidth( '90px' ) );
	materialClearcoatNormalMapRow.add( materialClearcoatNormalMapEnabled );
	materialClearcoatNormalMapRow.add( materialClearcoatNormalMap );
	materialClearcoatNormalMapRow.add( materialClearcoatNormalScaleX );
	materialClearcoatNormalMapRow.add( materialClearcoatNormalScaleY );

	container.add( materialClearcoatNormalMapRow );

	// displacement map

	var materialDisplacementMapRow = new UIRow();
	var materialDisplacementMapEnabled = new UICheckbox( false ).onChange( update );
	var materialDisplacementMap = new UITexture().onChange( update );
	var materialDisplacementScale = new UINumber( 1 ).setWidth( '30px' ).onChange( update );

	materialDisplacementMapRow.add( new UIText( strings.getKey( 'sidebar/material/displacemap' ) ).setWidth( '90px' ) );
	materialDisplacementMapRow.add( materialDisplacementMapEnabled );
	materialDisplacementMapRow.add( materialDisplacementMap );
	materialDisplacementMapRow.add( materialDisplacementScale );

	container.add( materialDisplacementMapRow );

	// roughness map

	var materialRoughnessMapRow = new UIRow();
	var materialRoughnessMapEnabled = new UICheckbox( false ).onChange( update );
	var materialRoughnessMap = new UITexture().onChange( update );

	materialRoughnessMapRow.add( new UIText( strings.getKey( 'sidebar/material/roughmap' ) ).setWidth( '90px' ) );
	materialRoughnessMapRow.add( materialRoughnessMapEnabled );
	materialRoughnessMapRow.add( materialRoughnessMap );

	container.add( materialRoughnessMapRow );

	// metalness map

	var materialMetalnessMapRow = new UIRow();
	var materialMetalnessMapEnabled = new UICheckbox( false ).onChange( update );
	var materialMetalnessMap = new UITexture().onChange( update );

	materialMetalnessMapRow.add( new UIText( strings.getKey( 'sidebar/material/metalmap' ) ).setWidth( '90px' ) );
	materialMetalnessMapRow.add( materialMetalnessMapEnabled );
	materialMetalnessMapRow.add( materialMetalnessMap );

	container.add( materialMetalnessMapRow );

	// specular map

	var materialSpecularMapRow = new UIRow();
	var materialSpecularMapEnabled = new UICheckbox( false ).onChange( update );
	var materialSpecularMap = new UITexture().onChange( update );

	materialSpecularMapRow.add( new UIText( strings.getKey( 'sidebar/material/specularmap' ) ).setWidth( '90px' ) );
	materialSpecularMapRow.add( materialSpecularMapEnabled );
	materialSpecularMapRow.add( materialSpecularMap );

	container.add( materialSpecularMapRow );

	// env map

	var materialEnvMapRow = new UIRow();
	var materialEnvMapEnabled = new UICheckbox( false ).onChange( update );
	var materialEnvMap = new UITexture( THREE.EquirectangularReflectionMapping ).onChange( updateMaterial );
	var materialReflectivity = new UINumber( 1 ).setWidth( '30px' ).onChange( update );

	materialEnvMapRow.add( new UIText( strings.getKey( 'sidebar/material/envmap' ) ).setWidth( '90px' ) );
	materialEnvMapRow.add( materialEnvMapEnabled );
	materialEnvMapRow.add( materialEnvMap );
	materialEnvMapRow.add( materialReflectivity );

	container.add( materialEnvMapRow );

	// light map

	var materialLightMapRow = new UIRow();
	var materialLightMapEnabled = new UICheckbox( false ).onChange( update );
	var materialLightMap = new UITexture().onChange( update );

	materialLightMapRow.add( new UIText( strings.getKey( 'sidebar/material/lightmap' ) ).setWidth( '90px' ) );
	materialLightMapRow.add( materialLightMapEnabled );
	materialLightMapRow.add( materialLightMap );

	container.add( materialLightMapRow );

	// ambient occlusion map

	var materialAOMapRow = new UIRow();
	var materialAOMapEnabled = new UICheckbox( false ).onChange( update );
	var materialAOMap = new UITexture().onChange( update );
	var materialAOScale = new UINumber( 1 ).setRange( 0, 1 ).setWidth( '30px' ).onChange( update );

	materialAOMapRow.add( new UIText( strings.getKey( 'sidebar/material/aomap' ) ).setWidth( '90px' ) );
	materialAOMapRow.add( materialAOMapEnabled );
	materialAOMapRow.add( materialAOMap );
	materialAOMapRow.add( materialAOScale );

	container.add( materialAOMapRow );

	// emissive map

	var materialEmissiveMapRow = new UIRow();
	var materialEmissiveMapEnabled = new UICheckbox( false ).onChange( update );
	var materialEmissiveMap = new UITexture().onChange( updateMaterial );

	materialEmissiveMapRow.add( new UIText( strings.getKey( 'sidebar/material/emissivemap' ) ).setWidth( '90px' ) );
	materialEmissiveMapRow.add( materialEmissiveMapEnabled );
	materialEmissiveMapRow.add( materialEmissiveMap );

	container.add( materialEmissiveMapRow );

	// gradient map

	var materialGradientMapRow = new UIRow();
	var materialGradientMapEnabled = new UICheckbox( false ).onChange( update );
	var materialGradientMap = new UITexture().onChange( update );

	materialGradientMapRow.add( new UIText( strings.getKey( 'sidebar/material/gradientmap' ) ).setWidth( '90px' ) );
	materialGradientMapRow.add( materialGradientMapEnabled );
	materialGradientMapRow.add( materialGradientMap );

	container.add( materialGradientMapRow );

	// side

	var materialSideRow = new UIRow();
	var materialSide = new UISelect().setOptions( {

		0: strings.getKey( 'sidebar/material/side/front' ),
		1: strings.getKey( 'sidebar/material/side/back' ),
		2: strings.getKey( 'sidebar/material/side/double' )

	} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

	materialSideRow.add( new UIText( strings.getKey( 'sidebar/material/side' ) ).setWidth( '90px' ) );
	materialSideRow.add( materialSide );

	container.add( materialSideRow );

	// size

	var materialSizeRow = new UIRow();
	var materialSize = new UINumber( 1 ).setWidth( '60px' ).setRange( 0, Infinity ).onChange( update );

	materialSizeRow.add( new UIText( strings.getKey( 'sidebar/material/size' ) ).setWidth( '90px' ) );
	materialSizeRow.add( materialSize );

	container.add( materialSizeRow );

	// sizeAttenuation

	var materialSizeAttenuationRow = new UIRow();
	var materialSizeAttenuation = new UICheckbox( true ).onChange( update );

	materialSizeAttenuationRow.add( new UIText( strings.getKey( 'sidebar/material/sizeAttenuation' ) ).setWidth( '90px' ) );
	materialSizeAttenuationRow.add( materialSizeAttenuation );

	container.add( materialSizeAttenuationRow );

	// shading

	var materialShadingRow = new UIRow();
	var materialShading = new UICheckbox( false ).setLeft( '100px' ).onChange( update );

	materialShadingRow.add( new UIText( strings.getKey( 'sidebar/material/flatshaded' ) ).setWidth( '90px' ) );
	materialShadingRow.add( materialShading );

	container.add( materialShadingRow );

	// blending

	var materialBlendingRow = new UIRow();
	var materialBlending = new UISelect().setOptions( {

		0: strings.getKey( 'sidebar/material/blending/no' ),
		1: strings.getKey( 'sidebar/material/blending/normal' ),
		2: strings.getKey( 'sidebar/material/blending/additive' ),
		3: strings.getKey( 'sidebar/material/blending/subtractive' ),
		4: strings.getKey( 'sidebar/material/blending/multiply' ),
		5: strings.getKey( 'sidebar/material/blending/custom' )

	} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

	materialBlendingRow.add( new UIText( strings.getKey( 'sidebar/material/blending' ) ).setWidth( '90px' ) );
	materialBlendingRow.add( materialBlending );

	container.add( materialBlendingRow );

	// opacity

	var materialOpacityRow = new UIRow();
	var materialOpacity = new UINumber( 1 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialOpacityRow.add( new UIText( strings.getKey( 'sidebar/material/opacity' ) ).setWidth( '90px' ) );
	materialOpacityRow.add( materialOpacity );

	container.add( materialOpacityRow );

	// transparent

	var materialTransparentRow = new UIRow();
	var materialTransparent = new UICheckbox().setLeft( '100px' ).onChange( update );

	materialTransparentRow.add( new UIText( strings.getKey( 'sidebar/material/transparent' ) ).setWidth( '90px' ) );
	materialTransparentRow.add( materialTransparent );

	container.add( materialTransparentRow );

	// alpha test

	var materialAlphaTestRow = new UIRow();
	var materialAlphaTest = new UINumber().setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialAlphaTestRow.add( new UIText( strings.getKey( 'sidebar/material/alphatest' ) ).setWidth( '90px' ) );
	materialAlphaTestRow.add( materialAlphaTest );

	container.add( materialAlphaTestRow );

	// depth test

	var materialDepthTestRow = new UIRow();
	var materialDepthTest = new UICheckbox().onChange( update );

	materialDepthTestRow.add( new UIText( strings.getKey( 'sidebar/material/depthtest' ) ).setWidth( '90px' ) );
	materialDepthTestRow.add( materialDepthTest );

	container.add( materialDepthTestRow );

	// depth write

	var materialDepthWriteRow = new UIRow();
	var materialDepthWrite = new UICheckbox().onChange( update );

	materialDepthWriteRow.add( new UIText( strings.getKey( 'sidebar/material/depthwrite' ) ).setWidth( '90px' ) );
	materialDepthWriteRow.add( materialDepthWrite );

	container.add( materialDepthWriteRow );

	// wireframe

	var materialWireframeRow = new UIRow();
	var materialWireframe = new UICheckbox( false ).onChange( update );

	materialWireframeRow.add( new UIText( strings.getKey( 'sidebar/material/wireframe' ) ).setWidth( '90px' ) );
	materialWireframeRow.add( materialWireframe );

	container.add( materialWireframeRow );

	//

	function update() {

		var object = currentObject;

		var geometry = object.geometry;

		var previousSelectedSlot = currentMaterialSlot;

		currentMaterialSlot = parseInt( materialSlotSelect.getValue() );

		if ( currentMaterialSlot !== previousSelectedSlot ) refreshUI( true );

		var material = editor.getObjectMaterial( currentObject, currentMaterialSlot );

		var textureWarning = false;
		var objectHasUvs = false;

		if ( object.isSprite ) objectHasUvs = true;
		if ( geometry.isGeometry && geometry.faceVertexUvs[ 0 ].length > 0 ) objectHasUvs = true;
		if ( geometry.isBufferGeometry && geometry.attributes.uv !== undefined ) objectHasUvs = true;

		if ( material ) {

			if ( material.uuid !== undefined && material.uuid !== materialUUID.getValue() ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'uuid', materialUUID.getValue(), currentMaterialSlot ) );

			}

			if ( material.type !== materialClass.getValue() ) {

				material = new materialClasses[ materialClass.getValue() ]();

				if ( material.type === "RawShaderMaterial" ) {

					material.vertexShader = vertexShaderVariables + material.vertexShader;

				}

				if ( Array.isArray( currentObject.material ) ) {

					// don't remove the entire multi-material. just the material of the selected slot

					editor.removeMaterial( currentObject.material[ currentMaterialSlot ] );

				} else {

					editor.removeMaterial( currentObject.material );

				}

				editor.execute( new SetMaterialCommand( editor, currentObject, material, currentMaterialSlot ), 'New Material: ' + materialClass.getValue() );
				editor.addMaterial( material );
				// TODO Copy other references in the scene graph
				// keeping name and UUID then.
				// Also there should be means to create a unique
				// copy for the current object explicitly and to
				// attach the current material to other objects.

			}

			if ( material.color !== undefined && material.color.getHex() !== materialColor.getHexValue() ) {

				editor.execute( new SetMaterialColorCommand( editor, currentObject, 'color', materialColor.getHexValue(), currentMaterialSlot ) );

			}

			if ( material.roughness !== undefined && Math.abs( material.roughness - materialRoughness.getValue() ) >= epsilon ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'roughness', materialRoughness.getValue(), currentMaterialSlot ) );

			}

			if ( material.metalness !== undefined && Math.abs( material.metalness - materialMetalness.getValue() ) >= epsilon ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'metalness', materialMetalness.getValue(), currentMaterialSlot ) );

			}

			/*
			if ( material.sheen !== undefined ) {

				var sheenEnabled = materialSheenEnabled.getValue() === true;

				var sheen = sheenEnabled ? new Color(materialSheen.getHexValue()) : null;

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'sheen', sheen, currentMaterialSlot ) );

			}

			if ( material.sheen !== undefined && material.sheen !== null && material.sheen.getHex() !== materialSheen.getHexValue() ) {

				editor.execute( new SetMaterialColorCommand( editor, currentObject, 'sheen', materialSheen.getHexValue(), currentMaterialSlot ) );

			}
			*/

			if ( material.emissive !== undefined && material.emissive.getHex() !== materialEmissive.getHexValue() ) {

				editor.execute( new SetMaterialColorCommand( editor, currentObject, 'emissive', materialEmissive.getHexValue(), currentMaterialSlot ) );

			}

			if ( material.emissiveIntensity !== undefined && material.emissiveIntensity !== materialEmissiveIntensity.getValue() ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'emissiveIntensity', materialEmissiveIntensity.getValue(), currentMaterialSlot ) );

			}

			if ( material.specular !== undefined && material.specular.getHex() !== materialSpecular.getHexValue() ) {

				editor.execute( new SetMaterialColorCommand( editor, currentObject, 'specular', materialSpecular.getHexValue(), currentMaterialSlot ) );

			}

			if ( material.shininess !== undefined && Math.abs( material.shininess - materialShininess.getValue() ) >= epsilon ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'shininess', materialShininess.getValue(), currentMaterialSlot ) );

			}

			if ( material.clearcoat !== undefined && Math.abs( material.clearcoat - materialClearcoat.getValue() ) >= epsilon ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'clearcoat', materialClearcoat.getValue(), currentMaterialSlot ) );

			}

			if ( material.clearcoatRoughness !== undefined && Math.abs( material.clearcoatRoughness - materialClearcoatRoughness.getValue() ) >= epsilon ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'clearcoatRoughness', materialClearcoatRoughness.getValue(), currentMaterialSlot ) );

			}

			if ( material.vertexColors !== undefined ) {

				var vertexColors = materialVertexColors.getValue();

				if ( material.vertexColors !== vertexColors ) {

					editor.execute( new SetMaterialValueCommand( editor, currentObject, 'vertexColors', vertexColors, currentMaterialSlot ) );

				}

			}

			if ( material.depthPacking !== undefined ) {

				var depthPacking = parseInt( materialDepthPacking.getValue() );
				if ( material.depthPacking !== depthPacking ) {

					editor.execute( new SetMaterialValueCommand( editor, currentObject, 'depthPacking', depthPacking, currentMaterialSlot ) );

				}

			}

			if ( material.skinning !== undefined && material.skinning !== materialSkinning.getValue() ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'skinning', materialSkinning.getValue(), currentMaterialSlot ) );

			}

			if ( material.map !== undefined ) {

				var mapEnabled = materialMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var map = mapEnabled ? materialMap.getValue() : null;
					if ( material.map !== map ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'map', map, currentMaterialSlot ) );

					}

				} else {

					if ( mapEnabled ) textureWarning = true;

				}

			}

			if ( material.matcap !== undefined ) {

				var mapEnabled = materialMatcapMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var matcap = mapEnabled ? materialMatcapMap.getValue() : null;
					if ( material.matcap !== matcap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'matcap', matcap, currentMaterialSlot ) );

					}

				} else {

					if ( mapEnabled ) textureWarning = true;

				}

			}

			if ( material.alphaMap !== undefined ) {

				var mapEnabled = materialAlphaMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var alphaMap = mapEnabled ? materialAlphaMap.getValue() : null;
					if ( material.alphaMap !== alphaMap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'alphaMap', alphaMap, currentMaterialSlot ) );

					}

				} else {

					if ( mapEnabled ) textureWarning = true;

				}

			}

			if ( material.bumpMap !== undefined ) {

				var bumpMapEnabled = materialBumpMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var bumpMap = bumpMapEnabled ? materialBumpMap.getValue() : null;
					if ( material.bumpMap !== bumpMap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'bumpMap', bumpMap, currentMaterialSlot ) );

					}

					if ( material.bumpScale !== materialBumpScale.getValue() ) {

						editor.execute( new SetMaterialValueCommand( editor, currentObject, 'bumpScale', materialBumpScale.getValue(), currentMaterialSlot ) );

					}

				} else {

					if ( bumpMapEnabled ) textureWarning = true;

				}

			}

			if ( material.normalMap !== undefined ) {

				var normalMapEnabled = materialNormalMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var normalMap = normalMapEnabled ? materialNormalMap.getValue() : null;
					if ( material.normalMap !== normalMap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'normalMap', normalMap, currentMaterialSlot ) );

					}

					if ( material.normalScale.x !== materialNormalScaleX.getValue() ||
						material.normalScale.y !== materialNormalScaleY.getValue() ) {

						var value = [
							materialNormalScaleX.getValue(),
							materialNormalScaleY.getValue()
						];
						editor.execute( new SetMaterialVectorCommand( editor, currentObject, 'normalScale', value, currentMaterialSlot ) );

					}

				} else {

					if ( normalMapEnabled ) textureWarning = true;

				}

			}

			if ( material.clearcoatNormalMap !== undefined ) {

				var clearcoatNormalMapEnabled = materialClearcoatNormalMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var clearcoatNormalMap = clearcoatNormalMapEnabled ? materialClearcoatNormalMap.getValue() : null;

					if ( material.clearcoatNormalMap !== clearcoatNormalMap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'clearcoatNormalMap', clearcoatNormalMap, currentMaterialSlot ) );

					}

					if ( material.clearcoatNormalScale.x !== materialClearcoatNormalScaleX.getValue() ||
						material.clearcoatNormalScale.y !== materialClearcoatNormalScaleY.getValue() ) {

						var value = [
							materialClearcoatNormalScaleX.getValue(),
							materialClearcoatNormalScaleY.getValue()
						];
						editor.execute( new SetMaterialVectorCommand( editor, currentObject, 'clearcoatNormalScale', value, currentMaterialSlot ) );

					}

				} else {

					if ( clearcoatNormalMapEnabled ) textureWarning = true;

				}

			}

			if ( material.displacementMap !== undefined ) {

				var displacementMapEnabled = materialDisplacementMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var displacementMap = displacementMapEnabled ? materialDisplacementMap.getValue() : null;
					if ( material.displacementMap !== displacementMap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'displacementMap', displacementMap, currentMaterialSlot ) );

					}

					if ( material.displacementScale !== materialDisplacementScale.getValue() ) {

						editor.execute( new SetMaterialValueCommand( editor, currentObject, 'displacementScale', materialDisplacementScale.getValue(), currentMaterialSlot ) );

					}

				} else {

					if ( displacementMapEnabled ) textureWarning = true;

				}

			}

			if ( material.roughnessMap !== undefined ) {

				var roughnessMapEnabled = materialRoughnessMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var roughnessMap = roughnessMapEnabled ? materialRoughnessMap.getValue() : null;
					if ( material.roughnessMap !== roughnessMap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'roughnessMap', roughnessMap, currentMaterialSlot ) );

					}

				} else {

					if ( roughnessMapEnabled ) textureWarning = true;

				}

			}

			if ( material.metalnessMap !== undefined ) {

				var metalnessMapEnabled = materialMetalnessMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var metalnessMap = metalnessMapEnabled ? materialMetalnessMap.getValue() : null;
					if ( material.metalnessMap !== metalnessMap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'metalnessMap', metalnessMap, currentMaterialSlot ) );

					}

				} else {

					if ( metalnessMapEnabled ) textureWarning = true;

				}

			}

			if ( material.specularMap !== undefined ) {

				var specularMapEnabled = materialSpecularMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var specularMap = specularMapEnabled ? materialSpecularMap.getValue() : null;
					if ( material.specularMap !== specularMap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'specularMap', specularMap, currentMaterialSlot ) );

					}

				} else {

					if ( specularMapEnabled ) textureWarning = true;

				}

			}

			if ( material.envMap !== undefined ) {

				var envMapEnabled = materialEnvMapEnabled.getValue() === true;

				var envMap = envMapEnabled ? materialEnvMap.getValue() : null;

				if ( material.envMap !== envMap ) {

					editor.execute( new SetMaterialMapCommand( editor, currentObject, 'envMap', envMap, currentMaterialSlot ) );

				}

			}

			if ( material.reflectivity !== undefined ) {

				var reflectivity = materialReflectivity.getValue();

				if ( material.reflectivity !== reflectivity ) {

					editor.execute( new SetMaterialValueCommand( editor, currentObject, 'reflectivity', reflectivity, currentMaterialSlot ) );

				}

			}

			if ( material.lightMap !== undefined ) {

				var lightMapEnabled = materialLightMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var lightMap = lightMapEnabled ? materialLightMap.getValue() : null;
					if ( material.lightMap !== lightMap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'lightMap', lightMap, currentMaterialSlot ) );

					}

				} else {

					if ( lightMapEnabled ) textureWarning = true;

				}

			}

			if ( material.aoMap !== undefined ) {

				var aoMapEnabled = materialAOMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var aoMap = aoMapEnabled ? materialAOMap.getValue() : null;
					if ( material.aoMap !== aoMap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'aoMap', aoMap, currentMaterialSlot ) );

					}

					if ( material.aoMapIntensity !== materialAOScale.getValue() ) {

						editor.execute( new SetMaterialValueCommand( editor, currentObject, 'aoMapIntensity', materialAOScale.getValue(), currentMaterialSlot ) );

					}

				} else {

					if ( aoMapEnabled ) textureWarning = true;

				}

			}

			if ( material.emissiveMap !== undefined ) {

				var emissiveMapEnabled = materialEmissiveMapEnabled.getValue() === true;

				if ( objectHasUvs ) {

					var emissiveMap = emissiveMapEnabled ? materialEmissiveMap.getValue() : null;
					if ( material.emissiveMap !== emissiveMap ) {

						editor.execute( new SetMaterialMapCommand( editor, currentObject, 'emissiveMap', emissiveMap, currentMaterialSlot ) );

					}

				} else {

					if ( emissiveMapEnabled ) textureWarning = true;

				}

			}

			if ( material.gradientMap !== undefined ) {

				var gradientMapEnabled = materialGradientMapEnabled.getValue() === true;

				var gradientMap = gradientMapEnabled ? materialGradientMap.getValue() : null;

				if ( material.gradientMap !== gradientMap ) {

					editor.execute( new SetMaterialMapCommand( editor, currentObject, 'gradientMap', gradientMap, currentMaterialSlot ) );

				}

			}

			if ( material.side !== undefined ) {

				var side = parseInt( materialSide.getValue() );
				if ( material.side !== side ) {

					editor.execute( new SetMaterialValueCommand( editor, currentObject, 'side', side, currentMaterialSlot ) );

				}


			}

			if ( material.size !== undefined ) {

				var size = materialSize.getValue();
				if ( material.size !== size ) {

					editor.execute( new SetMaterialValueCommand( editor, currentObject, 'size', size, currentMaterialSlot ) );

				}

			}

			if ( material.sizeAttenuation !== undefined ) {

				var sizeAttenuation = materialSizeAttenuation.getValue();
				if ( material.sizeAttenuation !== sizeAttenuation ) {

					editor.execute( new SetMaterialValueCommand( editor, currentObject, 'sizeAttenuation', sizeAttenuation, currentMaterialSlot ) );

				}

			}

			if ( material.flatShading !== undefined ) {

				var flatShading = materialShading.getValue();
				if ( material.flatShading != flatShading ) {

					editor.execute( new SetMaterialValueCommand( editor, currentObject, 'flatShading', flatShading, currentMaterialSlot ) );

				}

			}

			if ( material.blending !== undefined ) {

				var blending = parseInt( materialBlending.getValue() );
				if ( material.blending !== blending ) {

					editor.execute( new SetMaterialValueCommand( editor, currentObject, 'blending', blending, currentMaterialSlot ) );

				}

			}

			if ( material.opacity !== undefined && Math.abs( material.opacity - materialOpacity.getValue() ) >= epsilon ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'opacity', materialOpacity.getValue(), currentMaterialSlot ) );

			}

			if ( material.transparent !== undefined && material.transparent !== materialTransparent.getValue() ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'transparent', materialTransparent.getValue(), currentMaterialSlot ) );

			}

			if ( material.alphaTest !== undefined && Math.abs( material.alphaTest - materialAlphaTest.getValue() ) >= epsilon ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'alphaTest', materialAlphaTest.getValue(), currentMaterialSlot ) );

			}

			if ( material.depthTest !== undefined && material.depthTest !== materialDepthTest.getValue() ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'depthTest', materialDepthTest.getValue(), currentMaterialSlot ) );

			}

			if ( material.depthWrite !== undefined && material.depthWrite !== materialDepthWrite.getValue() ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'depthWrite', materialDepthWrite.getValue(), currentMaterialSlot ) );

			}

			if ( material.wireframe !== undefined && material.wireframe !== materialWireframe.getValue() ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'wireframe', materialWireframe.getValue(), currentMaterialSlot ) );

			}

			refreshUI();

		}

		if ( textureWarning ) {

			console.warn( "Can't set texture, model doesn't have texture coordinates" );

		}

	}

	function updateMaterial( texture ) {

		if ( texture !== null ) {

			if ( texture.isDataTexture !== true && texture.encoding !== THREE.sRGBEncoding ) {

				texture.encoding = THREE.sRGBEncoding;
				var object = currentObject;
				if ( object !== null ) {

					object.material.needsUpdate = true;

				}

			}

		}

		update();

	}

	//

	function setRowVisibility() {

		var properties = {
			'name': materialNameRow,
			'color': materialColorRow,
			'roughness': materialRoughnessRow,
			'metalness': materialMetalnessRow,
			'emissive': materialEmissiveRow,
			// 'sheen': materialSheenRow,
			'specular': materialSpecularRow,
			'shininess': materialShininessRow,
			'clearcoat': materialClearcoatRow,
			'clearcoatRoughness': materialClearcoatRoughnessRow,
			'vertexShader': materialProgramRow,
			'vertexColors': materialVertexColorsRow,
			'vertexTangents': materialVertexTangentsRow,
			'depthPacking': materialDepthPackingRow,
			'skinning': materialSkinningRow,
			'map': materialMapRow,
			'matcap': materialMatcapMapRow,
			'alphaMap': materialAlphaMapRow,
			'bumpMap': materialBumpMapRow,
			'normalMap': materialNormalMapRow,
			'clearcoatNormalMap': materialClearcoatNormalMapRow,
			'displacementMap': materialDisplacementMapRow,
			'roughnessMap': materialRoughnessMapRow,
			'metalnessMap': materialMetalnessMapRow,
			'specularMap': materialSpecularMapRow,
			'envMap': materialEnvMapRow,
			'lightMap': materialLightMapRow,
			'aoMap': materialAOMapRow,
			'emissiveMap': materialEmissiveMapRow,
			'gradientMap': materialGradientMapRow,
			'side': materialSideRow,
			'size': materialSize,
			'sizeAttenuation': materialSizeAttenuation,
			'flatShading': materialShadingRow,
			'blending': materialBlendingRow,
			'opacity': materialOpacityRow,
			'transparent': materialTransparentRow,
			'alphaTest': materialAlphaTestRow,
			'depthTest': materialDepthTestRow,
			'depthWrite': materialDepthWriteRow,
			'wireframe': materialWireframeRow
		};

		var material = currentObject.material;

		if ( Array.isArray( material ) ) {

			materialSlotRow.setDisplay( '' );

			if ( material.length === 0 ) return;

			material = material[ currentMaterialSlot ];

		} else {

			materialSlotRow.setDisplay( 'none' );

		}

		for ( var property in properties ) {

			properties[ property ].setDisplay( material[ property ] !== undefined ? '' : 'none' );

		}

	}


	function refreshUI( resetTextureSelectors ) {

		if ( ! currentObject ) return;

		var material = currentObject.material;

		if ( Array.isArray( material ) ) {

			var slotOptions = {};

			currentMaterialSlot = Math.max( 0, Math.min( material.length, currentMaterialSlot ) );

			for ( var i = 0; i < material.length; i ++ ) {

				slotOptions[ i ] = String( i + 1 ) + ': ' + material[ i ].name;

			}

			materialSlotSelect.setOptions( slotOptions ).setValue( currentMaterialSlot );

		}

		material = editor.getObjectMaterial( currentObject, currentMaterialSlot );

		if ( material.uuid !== undefined ) {

			materialUUID.setValue( material.uuid );

		}

		if ( material.name !== undefined ) {

			materialName.setValue( material.name );

		}

		if ( currentObject.isMesh ) {

			materialClass.setOptions( meshMaterialOptions );

		} else if ( currentObject.isSprite ) {

			materialClass.setOptions( spriteMaterialOptions );

		} else if ( currentObject.isPoints ) {

			materialClass.setOptions( pointsMaterialOptions );

		} else if ( currentObject.isLine ) {

			materialClass.setOptions( lineMaterialOptions );

		}

		materialClass.setValue( material.type );


		if ( material.color !== undefined ) {

			materialColor.setHexValue( material.color.getHexString() );

		}

		if ( material.roughness !== undefined ) {

			materialRoughness.setValue( material.roughness );

		}

		if ( material.metalness !== undefined ) {

			materialMetalness.setValue( material.metalness );

		}

		/*
		if ( material.sheen !== undefined && material.sheen !== null ) {

			materialSheenEnabled.setValue( true );
			materialSheen.setHexValue( material.sheen.getHexString() );

		}
		*/

		if ( material.emissive !== undefined ) {

			materialEmissive.setHexValue( material.emissive.getHexString() );

			materialEmissiveIntensity.setValue( material.emissiveIntensity );

		}

		if ( material.specular !== undefined ) {

			materialSpecular.setHexValue( material.specular.getHexString() );

		}

		if ( material.shininess !== undefined ) {

			materialShininess.setValue( material.shininess );

		}

		if ( material.clearcoat !== undefined ) {

			materialClearcoat.setValue( material.clearcoat );

		}

		if ( material.clearcoatRoughness !== undefined ) {

			materialClearcoatRoughness.setValue( material.clearcoatRoughness );

		}

		if ( material.vertexColors !== undefined ) {

			materialVertexColors.setValue( material.vertexColors );

		}

		if ( material.depthPacking !== undefined ) {

			materialDepthPacking.setValue( material.depthPacking );

		}

		if ( material.skinning !== undefined ) {

			materialSkinning.setValue( material.skinning );

		}

		if ( material.map !== undefined ) {

			materialMapEnabled.setValue( material.map !== null );

			if ( material.map !== null || resetTextureSelectors ) {

				materialMap.setValue( material.map );

			}

		}

		if ( material.matcap !== undefined ) {

			materialMatcapMapEnabled.setValue( material.matcap !== null );

			if ( material.matcap !== null || resetTextureSelectors ) {

				materialMatcapMap.setValue( material.matcap );

			}

		}

		if ( material.alphaMap !== undefined ) {

			materialAlphaMapEnabled.setValue( material.alphaMap !== null );

			if ( material.alphaMap !== null || resetTextureSelectors ) {

				materialAlphaMap.setValue( material.alphaMap );

			}

		}

		if ( material.bumpMap !== undefined ) {

			materialBumpMapEnabled.setValue( material.bumpMap !== null );

			if ( material.bumpMap !== null || resetTextureSelectors ) {

				materialBumpMap.setValue( material.bumpMap );

			}

			materialBumpScale.setValue( material.bumpScale );

		}

		if ( material.normalMap !== undefined ) {

			materialNormalMapEnabled.setValue( material.normalMap !== null );

			if ( material.normalMap !== null || resetTextureSelectors ) {

				materialNormalMap.setValue( material.normalMap );

			}

			materialNormalScaleX.setValue( material.normalScale.x );
			materialNormalScaleY.setValue( material.normalScale.y );

		}

		if ( material.clearcoatNormalMap !== undefined ) {

			materialClearcoatNormalMapEnabled.setValue( material.clearcoatNormalMap !== null );

			if ( material.clearcoatNormalMap !== null || resetTextureSelectors ) {

				materialClearcoatNormalMap.setValue( material.clearcoatNormalMap );

			}

			materialClearcoatNormalScaleX.setValue( material.clearcoatNormalScale.x );
			materialClearcoatNormalScaleY.setValue( material.clearcoatNormalScale.y );

		}

		if ( material.displacementMap !== undefined ) {

			materialDisplacementMapEnabled.setValue( material.displacementMap !== null );

			if ( material.displacementMap !== null || resetTextureSelectors ) {

				materialDisplacementMap.setValue( material.displacementMap );

			}

			materialDisplacementScale.setValue( material.displacementScale );

		}

		if ( material.roughnessMap !== undefined ) {

			materialRoughnessMapEnabled.setValue( material.roughnessMap !== null );

			if ( material.roughnessMap !== null || resetTextureSelectors ) {

				materialRoughnessMap.setValue( material.roughnessMap );

			}

		}

		if ( material.metalnessMap !== undefined ) {

			materialMetalnessMapEnabled.setValue( material.metalnessMap !== null );

			if ( material.metalnessMap !== null || resetTextureSelectors ) {

				materialMetalnessMap.setValue( material.metalnessMap );

			}

		}

		if ( material.specularMap !== undefined ) {

			materialSpecularMapEnabled.setValue( material.specularMap !== null );

			if ( material.specularMap !== null || resetTextureSelectors ) {

				materialSpecularMap.setValue( material.specularMap );

			}

		}

		if ( material.envMap !== undefined ) {

			materialEnvMapEnabled.setValue( material.envMap !== null );

			if ( material.envMap !== null || resetTextureSelectors ) {

				materialEnvMap.setValue( material.envMap );

			}

		}

		if ( material.gradientMap !== undefined ) {

			materialGradientMapEnabled.setValue( material.gradientMap !== null );

			if ( material.gradientMap !== null || resetTextureSelectors ) {

				materialGradientMap.setValue( material.gradientMap );

			}

		}

		if ( material.reflectivity !== undefined ) {

			materialReflectivity.setValue( material.reflectivity );

		}

		if ( material.lightMap !== undefined ) {

			materialLightMapEnabled.setValue( material.lightMap !== null );

			if ( material.lightMap !== null || resetTextureSelectors ) {

				materialLightMap.setValue( material.lightMap );

			}

		}

		if ( material.aoMap !== undefined ) {

			materialAOMapEnabled.setValue( material.aoMap !== null );

			if ( material.aoMap !== null || resetTextureSelectors ) {

				materialAOMap.setValue( material.aoMap );

			}

			materialAOScale.setValue( material.aoMapIntensity );

		}

		if ( material.emissiveMap !== undefined ) {

			materialEmissiveMapEnabled.setValue( material.emissiveMap !== null );

			if ( material.emissiveMap !== null || resetTextureSelectors ) {

				materialEmissiveMap.setValue( material.emissiveMap );

			}

		}

		if ( material.side !== undefined ) {

			materialSide.setValue( material.side );

		}

		if ( material.size !== undefined ) {

			materialSize.setValue( material.size );

		}

		if ( material.sizeAttenuation !== undefined ) {

			materialSizeAttenuation.setValue( material.sizeAttenuation );

		}

		if ( material.flatShading !== undefined ) {

			materialShading.setValue( material.flatShading );

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

		if ( material.alphaTest !== undefined ) {

			materialAlphaTest.setValue( material.alphaTest );

		}

		if ( material.depthTest !== undefined ) {

			materialDepthTest.setValue( material.depthTest );

		}

		if ( material.depthWrite !== undefined ) {

			materialDepthWrite.setValue( material.depthWrite );

		}

		if ( material.wireframe !== undefined ) {

			materialWireframe.setValue( material.wireframe );

		}

		setRowVisibility();

	}

	// events

	signals.objectSelected.add( function ( object ) {

		var hasMaterial = false;

		if ( object && object.material ) {

			hasMaterial = true;

			if ( Array.isArray( object.material ) && object.material.length === 0 ) {

				hasMaterial = false;

			}

		}

		if ( hasMaterial ) {

			var objectChanged = object !== currentObject;

			currentObject = object;
			refreshUI( objectChanged );
			container.setDisplay( '' );

		} else {

			currentObject = null;
			container.setDisplay( 'none' );

		}

	} );

	signals.materialChanged.add( function () {

		refreshUI();

	} );

	var vertexShaderVariables = [
		'uniform mat4 projectionMatrix;',
		'uniform mat4 modelViewMatrix;\n',
		'attribute vec3 position;\n\n',
	].join( '\n' );

	var meshMaterialOptions = {
		'MeshBasicMaterial': 'MeshBasicMaterial',
		'MeshDepthMaterial': 'MeshDepthMaterial',
		'MeshNormalMaterial': 'MeshNormalMaterial',
		'MeshLambertMaterial': 'MeshLambertMaterial',
		'MeshMatcapMaterial': 'MeshMatcapMaterial',
		'MeshPhongMaterial': 'MeshPhongMaterial',
		'MeshToonMaterial': 'MeshToonMaterial',
		'MeshStandardMaterial': 'MeshStandardMaterial',
		'MeshPhysicalMaterial': 'MeshPhysicalMaterial',
		'RawShaderMaterial': 'RawShaderMaterial',
		'ShaderMaterial': 'ShaderMaterial',
		'ShadowMaterial': 'ShadowMaterial'
	};

	var lineMaterialOptions = {
		'LineBasicMaterial': 'LineBasicMaterial',
		'LineDashedMaterial': 'LineDashedMaterial',
		'RawShaderMaterial': 'RawShaderMaterial',
		'ShaderMaterial': 'ShaderMaterial'
	};

	var spriteMaterialOptions = {
		'SpriteMaterial': 'SpriteMaterial',
		'RawShaderMaterial': 'RawShaderMaterial',
		'ShaderMaterial': 'ShaderMaterial'
	};

	var pointsMaterialOptions = {
		'PointsMaterial': 'PointsMaterial',
		'RawShaderMaterial': 'RawShaderMaterial',
		'ShaderMaterial': 'ShaderMaterial'
	};

	return container;

}

export { SidebarMaterial };
