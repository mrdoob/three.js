import * as THREE from '../../build/three.module.js';

import { UIButton, UICheckbox, UIInput, UINumber, UIPanel, UIRow, UISelect, UIText } from './libs/ui.js';
import { UITexture } from './libs/ui.three.js';

import { SetMaterialCommand } from './commands/SetMaterialCommand.js';
import { SetMaterialMapCommand } from './commands/SetMaterialMapCommand.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';

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

	// reflectivity

	const materialReflectivity = new SidebarMaterialMapProperty( editor, 'reflectivity', strings.getKey( 'sidebar/material/reflectivity' ) );
	container.add( materialReflectivity );

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

	const materialBumpMap = new SidebarMaterialMapProperty( editor, 'bumpMap', strings.getKey( 'sidebar/material/bumpmap' ) );
	container.add( materialBumpMap );

	// normal map

	const materialNormalMap = new SidebarMaterialMapProperty( editor, 'normalMap', strings.getKey( 'sidebar/material/normalmap' ) );
	container.add( materialNormalMap );

	// clearcoat normal map

	const materialClearcoatNormalMap = new SidebarMaterialMapProperty( editor, 'clearcoatNormalMap', strings.getKey( 'sidebar/material/clearcoatnormalmap' ) );
	container.add( materialClearcoatNormalMap );

	// displacement map

	const materialDisplacementMap = new SidebarMaterialMapProperty( editor, 'displacementMap', strings.getKey( 'sidebar/material/displacementmap' ) );
	container.add( materialDisplacementMap );

	// roughness map

	const materialRoughnessMap = new SidebarMaterialMapProperty( editor, 'roughnessMap', strings.getKey( 'sidebar/material/roughnessmap' ) );
	container.add( materialRoughnessMap );

	// metalness map

	const materialMetalnessMap = new SidebarMaterialMapProperty( editor, 'metalnessMap', strings.getKey( 'sidebar/material/metalnessmap' ) );
	container.add( materialMetalnessMap );

	// specular map

	const materialSpecularMap = new SidebarMaterialMapProperty( editor, 'specularMap', strings.getKey( 'sidebar/material/specularmap' ) );
	container.add( materialSpecularMap );

	// env map

	const materialEnvMap = new SidebarMaterialMapProperty( editor, 'envMap', strings.getKey( 'sidebar/material/envmap' ) );
	container.add( materialEnvMap );

	// light map

	const materialLightMap = new SidebarMaterialMapProperty( editor, 'lightMap', strings.getKey( 'sidebar/material/lightmap' ) );
	container.add( materialLightMap );

	// ambient occlusion map

	const materialAOMap = new SidebarMaterialMapProperty( editor, 'aoMap', strings.getKey( 'sidebar/material/aomap' ) );
	container.add( materialAOMap );

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
