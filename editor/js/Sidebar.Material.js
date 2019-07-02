/**
 * @author mrdoob / http://mrdoob.com/
 */

import {
	BasicDepthPacking,
	LineBasicMaterial,
	LineDashedMaterial,
	Math as _Math,
	MeshBasicMaterial,
	MeshDepthMaterial,
	MeshNormalMaterial,
	MeshLambertMaterial,
	MeshToonMaterial,
	MeshPhongMaterial,
	MeshMatcapMaterial,
	ShaderMaterial,
	RawShaderMaterial,
	SpriteMaterial,
	MeshPhysicalMaterial,
	ShadowMaterial,
	MeshStandardMaterial,
	RGBADepthPacking,
	SphericalReflectionMapping,
	sRGBEncoding
} from '../../build/three.module.js';

import { Panel, Row, Input, Button, Color, Checkbox, Select, UIText, UINumber } from './libs/ui.js';
import { UITexture } from './libs/ui.three.js';

import { SetMaterialCommand } from './commands/SetMaterialCommand.js';
import { SetMaterialColorCommand } from './commands/SetMaterialColorCommand.js';
import { SetMaterialMapCommand } from './commands/SetMaterialMapCommand.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';

var materialClasses = {
	'LineBasicMaterial': LineBasicMaterial,
	'LineDashedMaterial': LineDashedMaterial,
	'MeshBasicMaterial': MeshBasicMaterial,
	'MeshDepthMaterial': MeshDepthMaterial,
	'MeshNormalMaterial': MeshNormalMaterial,
	'MeshLambertMaterial': MeshLambertMaterial,
	'MeshMatcapMaterial': MeshMatcapMaterial,
	'MeshPhongMaterial': MeshPhongMaterial,
	'MeshToonMaterial': MeshToonMaterial,
	'MeshStandardMaterial': MeshStandardMaterial,
	'MeshPhysicalMaterial': MeshPhysicalMaterial,
	'RawShaderMaterial': RawShaderMaterial,
	'ShaderMaterial': ShaderMaterial,
	'ShadowMaterial': ShadowMaterial,
	'SpriteMaterial': SpriteMaterial
};

var SidebarMaterial = function ( editor ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var currentObject;

	var currentMaterialSlot = 0;

	var container = new Panel();
	container.setBorderTop( '0' );
	container.setDisplay( 'none' );
	container.setPaddingTop( '20px' );

	// New / Copy / Paste

	var copiedMaterial;

	var managerRow = new Row();

	// Current material slot

	var materialSlotRow = new Row();

	materialSlotRow.add( new UIText( 'Slot' ).setWidth( '90px' ) );

	var materialSlotSelect = new Select().setWidth( '170px' ).setFontSize( '12px' ).onChange( update );
	materialSlotSelect.setOptions( { 0: '' } ).setValue( 0 );
	materialSlotRow.add( materialSlotSelect );

	container.add( materialSlotRow );

	managerRow.add( new UIText( '' ).setWidth( '90px' ) );

	managerRow.add( new Button( strings.getKey( 'sidebar/material/new' ) ).onClick( function () {

		var material = new materialClasses[ materialClass.getValue() ]();
		editor.execute( new SetMaterialCommand( editor, currentObject, material, currentMaterialSlot ), 'New Material: ' + materialClass.getValue() );
		update();

	} ) );

	managerRow.add( new Button( strings.getKey( 'sidebar/material/copy' ) ).setMarginLeft( '4px' ).onClick( function () {

		copiedMaterial = currentObject.material;

		if ( Array.isArray( copiedMaterial ) ) {

			if ( copiedMaterial.length === 0 ) return;

			copiedMaterial = copiedMaterial[ currentMaterialSlot ];

		}

	} ) );

	managerRow.add( new Button( strings.getKey( 'sidebar/material/paste' ) ).setMarginLeft( '4px' ).onClick( function () {

		if ( copiedMaterial === undefined ) return;

		editor.execute( new SetMaterialCommand( editor, currentObject, copiedMaterial, currentMaterialSlot ), 'Pasted Material: ' + materialClass.getValue() );
		refreshUI();
		update();

	} ) );

	container.add( managerRow );


	// type

	var materialClassRow = new Row();
	var materialClass = new Select().setOptions( {

		'LineBasicMaterial': 'LineBasicMaterial',
		'LineDashedMaterial': 'LineDashedMaterial',
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
		'ShadowMaterial': 'ShadowMaterial',
		'SpriteMaterial': 'SpriteMaterial'

	} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

	materialClassRow.add( new UIText( strings.getKey( 'sidebar/material/type' ) ).setWidth( '90px' ) );
	materialClassRow.add( materialClass );

	container.add( materialClassRow );

	// uuid

	var materialUUIDRow = new Row();
	var materialUUID = new Input().setWidth( '102px' ).setFontSize( '12px' ).setDisabled( true );
	var materialUUIDRenew = new Button( strings.getKey( 'sidebar/material/new' ) ).setMarginLeft( '7px' ).onClick( function () {

		materialUUID.setValue( _Math.generateUUID() );
		update();

	} );

	materialUUIDRow.add( new UIText( strings.getKey( 'sidebar/material/uuid' ) ).setWidth( '90px' ) );
	materialUUIDRow.add( materialUUID );
	materialUUIDRow.add( materialUUIDRenew );

	container.add( materialUUIDRow );

	// name

	var materialNameRow = new Row();
	var materialName = new Input().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

		editor.execute( new SetMaterialValueCommand( editor, editor.selected, 'name', materialName.getValue(), currentMaterialSlot ) );

	} );

	materialNameRow.add( new UIText( strings.getKey( 'sidebar/material/name' ) ).setWidth( '90px' ) );
	materialNameRow.add( materialName );

	container.add( materialNameRow );

	// program

	var materialProgramRow = new Row();
	materialProgramRow.add( new UIText( strings.getKey( 'sidebar/material/program' ) ).setWidth( '90px' ) );

	var materialProgramInfo = new Button( strings.getKey( 'sidebar/material/info' ) );
	materialProgramInfo.setMarginLeft( '4px' );
	materialProgramInfo.onClick( function () {

		signals.editScript.dispatch( currentObject, 'programInfo' );

	} );
	materialProgramRow.add( materialProgramInfo );

	var materialProgramVertex = new Button( strings.getKey( 'sidebar/material/vertex' ) );
	materialProgramVertex.setMarginLeft( '4px' );
	materialProgramVertex.onClick( function () {

		signals.editScript.dispatch( currentObject, 'vertexShader' );

	} );
	materialProgramRow.add( materialProgramVertex );

	var materialProgramFragment = new Button( strings.getKey( 'sidebar/material/fragment' ) );
	materialProgramFragment.setMarginLeft( '4px' );
	materialProgramFragment.onClick( function () {

		signals.editScript.dispatch( currentObject, 'fragmentShader' );

	} );
	materialProgramRow.add( materialProgramFragment );

	container.add( materialProgramRow );

	// color

	var materialColorRow = new Row();
	var materialColor = new Color().onChange( update );

	materialColorRow.add( new UIText( strings.getKey( 'sidebar/material/color' ) ).setWidth( '90px' ) );
	materialColorRow.add( materialColor );

	container.add( materialColorRow );

	// roughness

	var materialRoughnessRow = new Row();
	var materialRoughness = new UINumber( 0.5 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialRoughnessRow.add( new UIText( strings.getKey( 'sidebar/material/roughness' ) ).setWidth( '90px' ) );
	materialRoughnessRow.add( materialRoughness );

	container.add( materialRoughnessRow );

	// metalness

	var materialMetalnessRow = new Row();
	var materialMetalness = new UINumber( 0.5 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialMetalnessRow.add( new UIText( strings.getKey( 'sidebar/material/metalness' ) ).setWidth( '90px' ) );
	materialMetalnessRow.add( materialMetalness );

	container.add( materialMetalnessRow );

	// emissive

	var materialEmissiveRow = new Row();
	var materialEmissive = new Color().setHexValue( 0x000000 ).onChange( update );

	materialEmissiveRow.add( new UIText( strings.getKey( 'sidebar/material/emissive' ) ).setWidth( '90px' ) );
	materialEmissiveRow.add( materialEmissive );

	container.add( materialEmissiveRow );

	// specular

	var materialSpecularRow = new Row();
	var materialSpecular = new Color().setHexValue( 0x111111 ).onChange( update );

	materialSpecularRow.add( new UIText( strings.getKey( 'sidebar/material/specular' ) ).setWidth( '90px' ) );
	materialSpecularRow.add( materialSpecular );

	container.add( materialSpecularRow );

	// shininess

	var materialShininessRow = new Row();
	var materialShininess = new UINumber( 30 ).onChange( update );

	materialShininessRow.add( new UIText( strings.getKey( 'sidebar/material/shininess' ) ).setWidth( '90px' ) );
	materialShininessRow.add( materialShininess );

	container.add( materialShininessRow );

	// clearCoat

	var materialClearCoatRow = new Row();
	var materialClearCoat = new UINumber( 1 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialClearCoatRow.add( new UIText( strings.getKey( 'sidebar/material/clearcoat' ) ).setWidth( '90px' ) );
	materialClearCoatRow.add( materialClearCoat );

	container.add( materialClearCoatRow );

	// clearCoatRoughness

	var materialClearCoatRoughnessRow = new Row();
	var materialClearCoatRoughness = new UINumber( 1 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialClearCoatRoughnessRow.add( new UIText( strings.getKey( 'sidebar/material/clearcoatroughness' ) ).setWidth( '90px' ) );
	materialClearCoatRoughnessRow.add( materialClearCoatRoughness );

	container.add( materialClearCoatRoughnessRow );

	// vertex colors

	var materialVertexColorsRow = new Row();
	var materialVertexColors = new Select().setOptions( {

		0: strings.getKey( 'sidebar/material/vertexcolors/no' ),
		1: strings.getKey( 'sidebar/material/vertexcolors/face' ),
		2: strings.getKey( 'sidebar/material/vertexcolors/vertex' )

	} ).onChange( update );

	materialVertexColorsRow.add( new UIText( strings.getKey( 'sidebar/material/vertexcolors' ) ).setWidth( '90px' ) );
	materialVertexColorsRow.add( materialVertexColors );

	container.add( materialVertexColorsRow );

	// depth packing

	var materialDepthPackingRow = new Row();
	var materialDepthPacking = new Select().setOptions( {
		[ BasicDepthPacking ]: 'BasicDepthPacking',
		[ RGBADepthPacking ]: 'RGBADepthPacking'
	} );
	materialDepthPacking.onChange( update );

	materialDepthPackingRow.add( new UIText( strings.getKey( 'sidebar/material/depthPacking' ) ).setWidth( '90px' ) );
	materialDepthPackingRow.add( materialDepthPacking );

	container.add( materialDepthPackingRow );

	// skinning

	var materialSkinningRow = new Row();
	var materialSkinning = new Checkbox( false ).onChange( update );

	materialSkinningRow.add( new UIText( strings.getKey( 'sidebar/material/skinning' ) ).setWidth( '90px' ) );
	materialSkinningRow.add( materialSkinning );

	container.add( materialSkinningRow );

	// map

	var materialMapRow = new Row();
	var materialMapEnabled = new Checkbox( false ).onChange( update );
	var materialMap = new UITexture().onChange( updateMaterial );

	materialMapRow.add( new UIText( strings.getKey( 'sidebar/material/map' ) ).setWidth( '90px' ) );
	materialMapRow.add( materialMapEnabled );
	materialMapRow.add( materialMap );

	container.add( materialMapRow );

	// matcap map

	var materialMatcapMapRow = new Row();
	var materialMatcapMapEnabled = new Checkbox( false ).onChange( update );
	var materialMatcapMap = new UITexture().onChange( update );

	materialMatcapMapRow.add( new UIText( strings.getKey( 'sidebar/material/matcap' ) ).setWidth( '90px' ) );
	materialMatcapMapRow.add( materialMatcapMapEnabled );
	materialMatcapMapRow.add( materialMatcapMap );

	container.add( materialMatcapMapRow );

	// alpha map

	var materialAlphaMapRow = new Row();
	var materialAlphaMapEnabled = new Checkbox( false ).onChange( update );
	var materialAlphaMap = new UITexture().onChange( update );

	materialAlphaMapRow.add( new UIText( strings.getKey( 'sidebar/material/alphamap' ) ).setWidth( '90px' ) );
	materialAlphaMapRow.add( materialAlphaMapEnabled );
	materialAlphaMapRow.add( materialAlphaMap );

	container.add( materialAlphaMapRow );

	// bump map

	var materialBumpMapRow = new Row();
	var materialBumpMapEnabled = new Checkbox( false ).onChange( update );
	var materialBumpMap = new UITexture().onChange( update );
	var materialBumpScale = new UINumber( 1 ).setWidth( '30px' ).onChange( update );

	materialBumpMapRow.add( new UIText( strings.getKey( 'sidebar/material/bumpmap' ) ).setWidth( '90px' ) );
	materialBumpMapRow.add( materialBumpMapEnabled );
	materialBumpMapRow.add( materialBumpMap );
	materialBumpMapRow.add( materialBumpScale );

	container.add( materialBumpMapRow );

	// normal map

	var materialNormalMapRow = new Row();
	var materialNormalMapEnabled = new Checkbox( false ).onChange( update );
	var materialNormalMap = new UITexture().onChange( update );

	materialNormalMapRow.add( new UIText( strings.getKey( 'sidebar/material/normalmap' ) ).setWidth( '90px' ) );
	materialNormalMapRow.add( materialNormalMapEnabled );
	materialNormalMapRow.add( materialNormalMap );

	container.add( materialNormalMapRow );

	// displacement map

	var materialDisplacementMapRow = new Row();
	var materialDisplacementMapEnabled = new Checkbox( false ).onChange( update );
	var materialDisplacementMap = new UITexture().onChange( update );
	var materialDisplacementScale = new UINumber( 1 ).setWidth( '30px' ).onChange( update );

	materialDisplacementMapRow.add( new UIText( strings.getKey( 'sidebar/material/displacemap' ) ).setWidth( '90px' ) );
	materialDisplacementMapRow.add( materialDisplacementMapEnabled );
	materialDisplacementMapRow.add( materialDisplacementMap );
	materialDisplacementMapRow.add( materialDisplacementScale );

	container.add( materialDisplacementMapRow );

	// roughness map

	var materialRoughnessMapRow = new Row();
	var materialRoughnessMapEnabled = new Checkbox( false ).onChange( update );
	var materialRoughnessMap = new UITexture().onChange( update );

	materialRoughnessMapRow.add( new UIText( strings.getKey( 'sidebar/material/roughmap' ) ).setWidth( '90px' ) );
	materialRoughnessMapRow.add( materialRoughnessMapEnabled );
	materialRoughnessMapRow.add( materialRoughnessMap );

	container.add( materialRoughnessMapRow );

	// metalness map

	var materialMetalnessMapRow = new Row();
	var materialMetalnessMapEnabled = new Checkbox( false ).onChange( update );
	var materialMetalnessMap = new UITexture().onChange( update );

	materialMetalnessMapRow.add( new UIText( strings.getKey( 'sidebar/material/metalmap' ) ).setWidth( '90px' ) );
	materialMetalnessMapRow.add( materialMetalnessMapEnabled );
	materialMetalnessMapRow.add( materialMetalnessMap );

	container.add( materialMetalnessMapRow );

	// specular map

	var materialSpecularMapRow = new Row();
	var materialSpecularMapEnabled = new Checkbox( false ).onChange( update );
	var materialSpecularMap = new UITexture().onChange( update );

	materialSpecularMapRow.add( new UIText( strings.getKey( 'sidebar/material/specularmap' ) ).setWidth( '90px' ) );
	materialSpecularMapRow.add( materialSpecularMapEnabled );
	materialSpecularMapRow.add( materialSpecularMap );

	container.add( materialSpecularMapRow );

	// env map

	var materialEnvMapRow = new Row();
	var materialEnvMapEnabled = new Checkbox( false ).onChange( update );
	var materialEnvMap = new UITexture( SphericalReflectionMapping ).onChange( updateMaterial );
	var materialReflectivity = new UINumber( 1 ).setWidth( '30px' ).onChange( update );

	materialEnvMapRow.add( new UIText( strings.getKey( 'sidebar/material/envmap' ) ).setWidth( '90px' ) );
	materialEnvMapRow.add( materialEnvMapEnabled );
	materialEnvMapRow.add( materialEnvMap );
	materialEnvMapRow.add( materialReflectivity );

	container.add( materialEnvMapRow );

	// light map

	var materialLightMapRow = new Row();
	var materialLightMapEnabled = new Checkbox( false ).onChange( update );
	var materialLightMap = new UITexture().onChange( update );

	materialLightMapRow.add( new UIText( strings.getKey( 'sidebar/material/lightmap' ) ).setWidth( '90px' ) );
	materialLightMapRow.add( materialLightMapEnabled );
	materialLightMapRow.add( materialLightMap );

	container.add( materialLightMapRow );

	// ambient occlusion map

	var materialAOMapRow = new Row();
	var materialAOMapEnabled = new Checkbox( false ).onChange( update );
	var materialAOMap = new UITexture().onChange( update );
	var materialAOScale = new UINumber( 1 ).setRange( 0, 1 ).setWidth( '30px' ).onChange( update );

	materialAOMapRow.add( new UIText( strings.getKey( 'sidebar/material/aomap' ) ).setWidth( '90px' ) );
	materialAOMapRow.add( materialAOMapEnabled );
	materialAOMapRow.add( materialAOMap );
	materialAOMapRow.add( materialAOScale );

	container.add( materialAOMapRow );

	// emissive map

	var materialEmissiveMapRow = new Row();
	var materialEmissiveMapEnabled = new Checkbox( false ).onChange( update );
	var materialEmissiveMap = new UITexture().onChange( updateMaterial );

	materialEmissiveMapRow.add( new UIText( strings.getKey( 'sidebar/material/emissivemap' ) ).setWidth( '90px' ) );
	materialEmissiveMapRow.add( materialEmissiveMapEnabled );
	materialEmissiveMapRow.add( materialEmissiveMap );

	container.add( materialEmissiveMapRow );

	// gradient map

	var materialGradientMapRow = new Row();
	var materialGradientMapEnabled = new Checkbox( false ).onChange( update );
	var materialGradientMap = new UITexture().onChange( update );

	materialGradientMapRow.add( new UIText( strings.getKey( 'sidebar/material/gradientmap' ) ).setWidth( '90px' ) );
	materialGradientMapRow.add( materialGradientMapEnabled );
	materialGradientMapRow.add( materialGradientMap );

	container.add( materialGradientMapRow );

	// side

	var materialSideRow = new Row();
	var materialSide = new Select().setOptions( {

		0: strings.getKey( 'sidebar/material/side/front' ),
		1: strings.getKey( 'sidebar/material/side/back' ),
		2: strings.getKey( 'sidebar/material/side/double' )

	} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

	materialSideRow.add( new UIText( strings.getKey( 'sidebar/material/side' ) ).setWidth( '90px' ) );
	materialSideRow.add( materialSide );

	container.add( materialSideRow );

	// shading

	var materialShadingRow = new Row();
	var materialShading = new Checkbox( false ).setLeft( '100px' ).onChange( update );

	materialShadingRow.add( new UIText( strings.getKey( 'sidebar/material/flatshaded' ) ).setWidth( '90px' ) );
	materialShadingRow.add( materialShading );

	container.add( materialShadingRow );

	// blending

	var materialBlendingRow = new Row();
	var materialBlending = new Select().setOptions( {

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

	var materialOpacityRow = new Row();
	var materialOpacity = new UINumber( 1 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialOpacityRow.add( new UIText( strings.getKey( 'sidebar/material/opacity' ) ).setWidth( '90px' ) );
	materialOpacityRow.add( materialOpacity );

	container.add( materialOpacityRow );

	// transparent

	var materialTransparentRow = new Row();
	var materialTransparent = new Checkbox().setLeft( '100px' ).onChange( update );

	materialTransparentRow.add( new UIText( strings.getKey( 'sidebar/material/transparent' ) ).setWidth( '90px' ) );
	materialTransparentRow.add( materialTransparent );

	container.add( materialTransparentRow );

	// alpha test

	var materialAlphaTestRow = new Row();
	var materialAlphaTest = new UINumber().setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

	materialAlphaTestRow.add( new UIText( strings.getKey( 'sidebar/material/alphatest' ) ).setWidth( '90px' ) );
	materialAlphaTestRow.add( materialAlphaTest );

	container.add( materialAlphaTestRow );

	// wireframe

	var materialWireframeRow = new Row();
	var materialWireframe = new Checkbox( false ).onChange( update );
	var materialWireframeLinewidth = new UINumber( 1 ).setWidth( '60px' ).setRange( 0, 100 ).onChange( update );

	materialWireframeRow.add( new UIText( strings.getKey( 'sidebar/material/wireframe' ) ).setWidth( '90px' ) );
	materialWireframeRow.add( materialWireframe );
	materialWireframeRow.add( materialWireframeLinewidth );

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

				if ( material.type == "RawShaderMaterial" ) {

					material.vertexShader = vertexShaderVariables + material.vertexShader;

				}

				editor.execute( new SetMaterialCommand( editor, currentObject, material, currentMaterialSlot ), 'New Material: ' + materialClass.getValue() );
				// TODO Copy other references in the scene graph
				// keeping name and UUID then.
				// Also there should be means to create a unique
				// copy for the current object explicitly and to
				// attach the current material to other objects.

			}

			if ( material.color !== undefined && material.color.getHex() !== materialColor.getHexValue() ) {

				editor.execute( new SetMaterialColorCommand( editor, currentObject, 'color', materialColor.getHexValue(), currentMaterialSlot ) );

			}

			if ( material.roughness !== undefined && Math.abs( material.roughness - materialRoughness.getValue() ) >= 0.01 ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'roughness', materialRoughness.getValue(), currentMaterialSlot ) );

			}

			if ( material.metalness !== undefined && Math.abs( material.metalness - materialMetalness.getValue() ) >= 0.01 ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'metalness', materialMetalness.getValue(), currentMaterialSlot ) );

			}

			if ( material.emissive !== undefined && material.emissive.getHex() !== materialEmissive.getHexValue() ) {

				editor.execute( new SetMaterialColorCommand( editor, currentObject, 'emissive', materialEmissive.getHexValue(), currentMaterialSlot ) );

			}

			if ( material.specular !== undefined && material.specular.getHex() !== materialSpecular.getHexValue() ) {

				editor.execute( new SetMaterialColorCommand( editor, currentObject, 'specular', materialSpecular.getHexValue(), currentMaterialSlot ) );

			}

			if ( material.shininess !== undefined && Math.abs( material.shininess - materialShininess.getValue() ) >= 0.01 ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'shininess', materialShininess.getValue(), currentMaterialSlot ) );

			}

			if ( material.clearCoat !== undefined && Math.abs( material.clearCoat - materialClearCoat.getValue() ) >= 0.01 ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'clearCoat', materialClearCoat.getValue(), currentMaterialSlot ) );

			}

			if ( material.clearCoatRoughness !== undefined && Math.abs( material.clearCoatRoughness - materialClearCoatRoughness.getValue() ) >= 0.01 ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'clearCoatRoughness', materialClearCoatRoughness.getValue(), currentMaterialSlot ) );

			}

			if ( material.vertexColors !== undefined ) {

				var vertexColors = parseInt( materialVertexColors.getValue() );

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

				} else {

					if ( normalMapEnabled ) textureWarning = true;

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

			if ( material.opacity !== undefined && Math.abs( material.opacity - materialOpacity.getValue() ) >= 0.01 ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'opacity', materialOpacity.getValue(), currentMaterialSlot ) );

			}

			if ( material.transparent !== undefined && material.transparent !== materialTransparent.getValue() ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'transparent', materialTransparent.getValue(), currentMaterialSlot ) );

			}

			if ( material.alphaTest !== undefined && Math.abs( material.alphaTest - materialAlphaTest.getValue() ) >= 0.01 ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'alphaTest', materialAlphaTest.getValue(), currentMaterialSlot ) );

			}

			if ( material.wireframe !== undefined && material.wireframe !== materialWireframe.getValue() ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'wireframe', materialWireframe.getValue(), currentMaterialSlot ) );

			}

			if ( material.wireframeLinewidth !== undefined && Math.abs( material.wireframeLinewidth - materialWireframeLinewidth.getValue() ) >= 0.01 ) {

				editor.execute( new SetMaterialValueCommand( editor, currentObject, 'wireframeLinewidth', materialWireframeLinewidth.getValue(), currentMaterialSlot ) );

			}

			refreshUI();

		}

		if ( textureWarning ) {

			console.warn( "Can't set texture, model doesn't have texture coordinates" );

		}

	}

	function updateMaterial( texture ) {

		if ( texture !== null ) {

			if ( texture.encoding !== sRGBEncoding ) {

				texture.encoding = sRGBEncoding;
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
			'specular': materialSpecularRow,
			'shininess': materialShininessRow,
			'clearCoat': materialClearCoatRow,
			'clearCoatRoughness': materialClearCoatRoughnessRow,
			'vertexShader': materialProgramRow,
			'vertexColors': materialVertexColorsRow,
			'depthPacking': materialDepthPackingRow,
			'skinning': materialSkinningRow,
			'map': materialMapRow,
			'matcap': materialMatcapMapRow,
			'alphaMap': materialAlphaMapRow,
			'bumpMap': materialBumpMapRow,
			'normalMap': materialNormalMapRow,
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
			'flatShading': materialShadingRow,
			'blending': materialBlendingRow,
			'opacity': materialOpacityRow,
			'transparent': materialTransparentRow,
			'alphaTest': materialAlphaTestRow,
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

		if ( material.emissive !== undefined ) {

			materialEmissive.setHexValue( material.emissive.getHexString() );

		}

		if ( material.specular !== undefined ) {

			materialSpecular.setHexValue( material.specular.getHexString() );

		}

		if ( material.shininess !== undefined ) {

			materialShininess.setValue( material.shininess );

		}

		if ( material.clearCoat !== undefined ) {

			materialClearCoat.setValue( material.clearCoat );

		}

		if ( material.clearCoatRoughness !== undefined ) {

			materialClearCoatRoughness.setValue( material.clearCoatRoughness );

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

		if ( material.wireframe !== undefined ) {

			materialWireframe.setValue( material.wireframe );

		}

		if ( material.wireframeLinewidth !== undefined ) {

			materialWireframeLinewidth.setValue( material.wireframeLinewidth );

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

	return container;

};

export { SidebarMaterial };
