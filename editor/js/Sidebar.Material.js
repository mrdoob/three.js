import * as THREE from '../../build/three.module.js';

import { UIButton, UICheckbox, UIInput, UINumber, UIPanel, UIRow, UISelect, UIText } from './libs/ui.js';
import { UITexture } from './libs/ui.three.js';

import { SetMaterialCommand } from './commands/SetMaterialCommand.js';
import { SetMaterialMapCommand } from './commands/SetMaterialMapCommand.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';
import { SetMaterialVectorCommand } from './commands/SetMaterialVectorCommand.js';

import { SidebarMaterialBooleanProperty } from './Sidebar.Material.BooleanProperty.js';
import { SidebarMaterialColorProperty } from './Sidebar.Material.ColorProperty.js';
import { SidebarMaterialMapProperty } from './Sidebar.Material.MapProperty.js';
import { SidebarMaterialNumberProperty } from './Sidebar.Material.NumberProperty.js';

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
	materialProgramInfo.setMarginRight( '4px' );
	materialProgramInfo.onClick( function () {

		signals.editScript.dispatch( currentObject, 'programInfo' );

	} );
	materialProgramRow.add( materialProgramInfo );

	var materialProgramVertex = new UIButton( strings.getKey( 'sidebar/material/vertex' ) );
	materialProgramVertex.setMarginRight( '4px' );
	materialProgramVertex.onClick( function () {

		signals.editScript.dispatch( currentObject, 'vertexShader' );

	} );
	materialProgramRow.add( materialProgramVertex );

	var materialProgramFragment = new UIButton( strings.getKey( 'sidebar/material/fragment' ) );
	materialProgramFragment.setMarginRight( '4px' );
	materialProgramFragment.onClick( function () {

		signals.editScript.dispatch( currentObject, 'fragmentShader' );

	} );
	materialProgramRow.add( materialProgramFragment );

	container.add( materialProgramRow );

	// color

	const materialColor = new SidebarMaterialColorProperty( editor, 'color', strings.getKey( 'sidebar/material/color' ) );
	container.add( materialColor );

	// roughness

	const materialRoughness = new SidebarMaterialNumberProperty( editor, 'roughness', strings.getKey( 'sidebar/material/roughness' ), [ 0, 1 ] );
	container.add( materialRoughness );

	// metalness

	const materialMetalness = new SidebarMaterialNumberProperty( editor, 'metalness', strings.getKey( 'sidebar/material/metalness' ), [ 0, 1 ] );
	container.add( materialMetalness );

	// transmission

	const materialTransmission = new SidebarMaterialNumberProperty( editor, 'transmission', strings.getKey( 'sidebar/material/transmission' ), [ 0, 1 ] );
	container.add( materialTransmission );

	// emissive

	const materialEmissive = new SidebarMaterialColorProperty( editor, 'emissive', strings.getKey( 'sidebar/material/emissive' ) );
	container.add( materialEmissive );

	// specular

	const materialSpecular = new SidebarMaterialColorProperty( editor, 'specular', strings.getKey( 'sidebar/material/specular' ) );
	container.add( materialSpecular );

	// shininess

	const materialShininess = new SidebarMaterialNumberProperty( editor, 'shininess', strings.getKey( 'sidebar/material/shininess' ) );
	container.add( materialShininess );

	// clearcoat

	const materialClearcoat = new SidebarMaterialNumberProperty( editor, 'clearcoat', strings.getKey( 'sidebar/material/clearcoat' ), [ 0, 1 ] );
	container.add( materialClearcoat );

	// clearcoatRoughness

	const materialClearcoatRoughness = new SidebarMaterialNumberProperty( editor, 'clearcoatRoughness', strings.getKey( 'sidebar/material/clearcoatroughness' ), [ 0, 1 ] );
	container.add( materialClearcoatRoughness );

	// vertex colors

	const materialVertexColors = new SidebarMaterialBooleanProperty( editor, 'vertexColors', strings.getKey( 'sidebar/material/vertexcolors' ) );
	container.add( materialVertexColors );

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

	// map

	const materialMap = new SidebarMaterialMapProperty( editor, 'map', strings.getKey( 'sidebar/material/map' ) );
	container.add( materialMap );

	// matcap map

	const materialMatcapMap = new SidebarMaterialMapProperty( editor, 'matcap', strings.getKey( 'sidebar/material/matcap' ) );
	container.add( materialMatcapMap );

	// alpha map

	const materialAlphaMap = new SidebarMaterialMapProperty( editor, 'alphaMap', strings.getKey( 'sidebar/material/alphamap' ) );
	container.add( materialAlphaMap );

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

	const materialRoughnessMap = new SidebarMaterialMapProperty( editor, 'roughnessMap', strings.getKey( 'sidebar/material/roughmap' ) );
	container.add( materialRoughnessMap );

	// metalness map

	const materialMetalnessMap = new SidebarMaterialMapProperty( editor, 'metalnessMap', strings.getKey( 'sidebar/material/metalmap' ) );
	container.add( materialMetalnessMap );

	// specular map

	const materialSpecularMap = new SidebarMaterialMapProperty( editor, 'specularMap', strings.getKey( 'sidebar/material/specularmap' ) );
	container.add( materialSpecularMap );

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

	const materialLightMap = new SidebarMaterialMapProperty( editor, 'lightMap', strings.getKey( 'sidebar/material/lightmap' ) );
	container.add( materialLightMap );

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

	const materialEmissiveMap = new SidebarMaterialMapProperty( editor, 'emissiveMap', strings.getKey( 'sidebar/material/emissivemap' ) );
	container.add( materialEmissiveMap );

	// gradient map

	const materialGradientMap = new SidebarMaterialMapProperty( editor, 'gradientMap', strings.getKey( 'sidebar/material/gradientmap' ) );
	container.add( materialGradientMap );

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

	const materialSizeAttenuation = new SidebarMaterialBooleanProperty( editor, 'sizeAttenuation', strings.getKey( 'sidebar/material/sizeAttenuation' ) );
	container.add( materialSizeAttenuation );

	// flatShading

	const materialFlatShading = new SidebarMaterialBooleanProperty( editor, 'flatShading', strings.getKey( 'sidebar/material/flatShading' ) );
	container.add( materialFlatShading );

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

	const materialOpacity = new SidebarMaterialNumberProperty( editor, 'opacity', strings.getKey( 'sidebar/material/opacity' ), [ 0, 1 ] );
	container.add( materialOpacity );

	// transparent

	const materialTransparent = new SidebarMaterialBooleanProperty( editor, 'transparent', strings.getKey( 'sidebar/material/transparent' ) );
	container.add( materialTransparent );

	// alpha test

	const materialAlphaTest = new SidebarMaterialNumberProperty( editor, 'alphaTest', strings.getKey( 'sidebar/material/alphatest' ), [ 0, 1 ] );
	container.add( materialAlphaTest );

	// depth test

	const materialDepthTest = new SidebarMaterialBooleanProperty( editor, 'depthTest', strings.getKey( 'sidebar/material/depthtest' ) );
	container.add( materialDepthTest );

	// depth write

	const materialDepthWrite = new SidebarMaterialBooleanProperty( editor, 'depthWrite', strings.getKey( 'sidebar/material/depthwrite' ) );
	container.add( materialDepthWrite );

	// wireframe

	const materialWireframe = new SidebarMaterialBooleanProperty( editor, 'wireframe', strings.getKey( 'sidebar/material/wireframe' ) );
	container.add( materialWireframe );

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

				if ( material.type === 'RawShaderMaterial' ) {

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

			if ( material.depthPacking !== undefined ) {

				var depthPacking = parseInt( materialDepthPacking.getValue() );

				if ( material.depthPacking !== depthPacking ) {

					editor.execute( new SetMaterialValueCommand( editor, currentObject, 'depthPacking', depthPacking, currentMaterialSlot ) );

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

			if ( material.blending !== undefined ) {

				var blending = parseInt( materialBlending.getValue() );
				if ( material.blending !== blending ) {

					editor.execute( new SetMaterialValueCommand( editor, currentObject, 'blending', blending, currentMaterialSlot ) );

				}

			}

			refreshUI();

		}

		if ( textureWarning ) {

			console.warn( 'Can\'t set texture, model doesn\'t have texture coordinates' );

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
			'vertexShader': materialProgramRow,
			'depthPacking': materialDepthPackingRow,
			'bumpMap': materialBumpMapRow,
			'normalMap': materialNormalMapRow,
			'clearcoatNormalMap': materialClearcoatNormalMapRow,
			'displacementMap': materialDisplacementMapRow,
			'envMap': materialEnvMapRow,
			'aoMap': materialAOMapRow,
			'side': materialSideRow,
			'size': materialSizeRow,
			'blending': materialBlendingRow
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

		if ( material.depthPacking !== undefined ) {

			materialDepthPacking.setValue( material.depthPacking );

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

		if ( material.envMap !== undefined ) {

			materialEnvMapEnabled.setValue( material.envMap !== null );

			if ( material.envMap !== null || resetTextureSelectors ) {

				materialEnvMap.setValue( material.envMap );

			}

		}

		if ( material.reflectivity !== undefined ) {

			materialReflectivity.setValue( material.reflectivity );

		}

		if ( material.aoMap !== undefined ) {

			materialAOMapEnabled.setValue( material.aoMap !== null );

			if ( material.aoMap !== null || resetTextureSelectors ) {

				materialAOMap.setValue( material.aoMap );

			}

			materialAOScale.setValue( material.aoMapIntensity );

		}

		if ( material.side !== undefined ) {

			materialSide.setValue( material.side );

		}

		if ( material.size !== undefined ) {

			materialSize.setValue( material.size );

		}

		if ( material.blending !== undefined ) {

			materialBlending.setValue( material.blending );

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
