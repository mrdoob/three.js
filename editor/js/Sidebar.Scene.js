/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIPanel, UIBreak, UIRow, UIColor, UISelect, UIText, UINumber } from './libs/ui.js';
import { UIOutliner, UITexture, UICubeTexture } from './libs/ui.three.js';

var SidebarScene = function ( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UIPanel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );

	// outliner

	function buildOption( object, draggable ) {

		var option = document.createElement( 'div' );
		option.draggable = draggable;
		option.innerHTML = buildHTML( object );
		option.value = object.id;

		return option;

	}

	function getMaterialName( material ) {

		if ( Array.isArray( material ) ) {

			var array = [];

			for ( var i = 0; i < material.length; i ++ ) {

				array.push( material[ i ].name );

			}

			return array.join( ',' );

		}

		return material.name;

	}

	function escapeHTML( html ) {

		return html
			.replace( /&/g, '&amp;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#39;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' );

	}

	function buildHTML( object ) {

		var html = '<span class="type ' + object.type + '"></span> ' + escapeHTML( object.name );

		if ( object.isMesh ) {

			var geometry = object.geometry;
			var material = object.material;

			html += ' <span class="type ' + geometry.type + '"></span> ' + escapeHTML( geometry.name );
			html += ' <span class="type ' + material.type + '"></span> ' + escapeHTML( getMaterialName( material ) );

		}

		html += getScript( object.uuid );

		return html;

	}

	function getScript( uuid ) {

		if ( editor.scripts[ uuid ] !== undefined ) {

			return ' <span class="type Script"></span>';

		}

		return '';

	}

	var ignoreObjectSelectedSignal = false;

	var outliner = new UIOutliner( editor );
	outliner.setId( 'outliner' );
	outliner.onChange( function () {

		ignoreObjectSelectedSignal = true;

		editor.selectById( parseInt( outliner.getValue() ) );

		ignoreObjectSelectedSignal = false;

	} );
	outliner.onDblClick( function () {

		editor.focusById( parseInt( outliner.getValue() ) );

	} );
	container.add( outliner );
	container.add( new UIBreak() );

	// background

	function onBackgroundChanged() {

		signals.sceneBackgroundChanged.dispatch(
			backgroundType.getValue(),
			backgroundColor.getHexValue(),
			backgroundTexture.getValue(),
			backgroundCubeTexture.getValue(),
			backgroundEquirectTexture.getValue()
		);

	}

	function onTextureChanged( texture ) {

		texture.encoding = texture.isHDRTexture ? THREE.RGBEEncoding : THREE.sRGBEncoding;

		if ( texture.isCubeTexture && texture.isHDRTexture ) {

			texture.format = THREE.RGBAFormat;
			texture.minFilter = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
			texture.generateMipmaps = false;

		}

		onBackgroundChanged();

	}

	var backgroundRow = new UIRow();

	var backgroundType = new UISelect().setOptions( {

		'None': 'None',
		'Color': 'Color',
		'Texture': 'Texture',
		'CubeTexture': 'CubeTexture',
		'Equirect': 'Equirect (HDR)'

	} ).setWidth( '150px' );
	backgroundType.onChange( function () {

		onBackgroundChanged();
		refreshBackgroundUI();

	} );
	backgroundType.setValue( 'Color' );

	backgroundRow.add( new UIText( strings.getKey( 'sidebar/scene/background' ) ).setWidth( '90px' ) );
	backgroundRow.add( backgroundType );

	container.add( backgroundRow );

	//

	var colorRow = new UIRow();
	colorRow.setMarginLeft( '90px' );

	var backgroundColor = new UIColor().setValue( '#aaaaaa' ).onChange( onBackgroundChanged );
	colorRow.add( backgroundColor );

	container.add( colorRow );

	//

	var textureRow = new UIRow();
	textureRow.setDisplay( 'none' );
	textureRow.setMarginLeft( '90px' );

	var backgroundTexture = new UITexture().onChange( onTextureChanged );
	textureRow.add( backgroundTexture );

	container.add( textureRow );

	//

	var cubeTextureRow = new UIRow();
	cubeTextureRow.setDisplay( 'none' );
	cubeTextureRow.setMarginLeft( '90px' );

	var backgroundCubeTexture = new UICubeTexture().onChange( onTextureChanged );
	cubeTextureRow.add( backgroundCubeTexture );

	container.add( cubeTextureRow );

	//

	var equirectRow = new UIRow();
	equirectRow.setDisplay( 'none' );
	equirectRow.setMarginLeft( '90px' );

	var backgroundEquirectTexture = new UITexture().onChange( onTextureChanged );
	equirectRow.add( backgroundEquirectTexture );

	container.add( equirectRow );

	//

	function refreshBackgroundUI() {

		var type = backgroundType.getValue();

		colorRow.setDisplay( type === 'Color' ? '' : 'none' );
		textureRow.setDisplay( type === 'Texture' ? '' : 'none' );
		cubeTextureRow.setDisplay( type === 'CubeTexture' ? '' : 'none' );
		equirectRow.setDisplay( type === 'Equirect' ? '' : 'none' );

	}

	// fog

	function onFogChanged() {

		signals.sceneFogChanged.dispatch(
			fogType.getValue(),
			fogColor.getHexValue(),
			fogNear.getValue(),
			fogFar.getValue(),
			fogDensity.getValue()
		);

	}

	var fogTypeRow = new UIRow();
	var fogType = new UISelect().setOptions( {

		'None': 'None',
		'Fog': 'Linear',
		'FogExp2': 'Exponential'

	} ).setWidth( '150px' );
	fogType.onChange( function () {

		onFogChanged();
		refreshFogUI();

	} );

	fogTypeRow.add( new UIText( strings.getKey( 'sidebar/scene/fog' ) ).setWidth( '90px' ) );
	fogTypeRow.add( fogType );

	container.add( fogTypeRow );

	// fog color

	var fogPropertiesRow = new UIRow();
	fogPropertiesRow.setDisplay( 'none' );
	fogPropertiesRow.setMarginLeft( '90px' );
	container.add( fogPropertiesRow );

	var fogColor = new UIColor().setValue( '#aaaaaa' );
	fogColor.onChange( onFogChanged );
	fogPropertiesRow.add( fogColor );

	// fog near

	var fogNear = new UINumber( 0.1 ).setWidth( '40px' ).setRange( 0, Infinity ).onChange( onFogChanged );
	fogPropertiesRow.add( fogNear );

	// fog far

	var fogFar = new UINumber( 50 ).setWidth( '40px' ).setRange( 0, Infinity ).onChange( onFogChanged );
	fogPropertiesRow.add( fogFar );

	// fog density

	var fogDensity = new UINumber( 0.05 ).setWidth( '40px' ).setRange( 0, 0.1 ).setStep( 0.001 ).setPrecision( 3 ).onChange( onFogChanged );
	fogPropertiesRow.add( fogDensity );

	//

	function refreshUI() {

		var camera = editor.camera;
		var scene = editor.scene;

		var options = [];

		options.push( buildOption( camera, false ) );
		options.push( buildOption( scene, false ) );

		( function addObjects( objects, pad ) {

			for ( var i = 0, l = objects.length; i < l; i ++ ) {

				var object = objects[ i ];

				var option = buildOption( object, true );
				option.style.paddingLeft = ( pad * 10 ) + 'px';
				options.push( option );

				addObjects( object.children, pad + 1 );

			}

		} )( scene.children, 1 );

		outliner.setOptions( options );

		if ( editor.selected !== null ) {

			outliner.setValue( editor.selected.id );

		}

		if ( scene.background ) {

			if ( scene.background.isColor ) {

				backgroundType.setValue( "Color" );
				backgroundColor.setHexValue( scene.background.getHex() );
				backgroundTexture.setValue( null );
				backgroundCubeTexture.setValue( null );
				backgroundEquirectTexture.setValue( null );

			} else if ( scene.background.isTexture && ! scene.background.isPmremTexture ) {

				backgroundType.setValue( "Texture" );
				backgroundTexture.setValue( scene.background );
				backgroundCubeTexture.setValue( null );
				backgroundEquirectTexture.setValue( null );

			} else if ( scene.background.isCubeTexture ) {

				backgroundType.setValue( "CubeTexture" );
				backgroundCubeTexture.setValue( scene.background );
				backgroundTexture.setValue( null );
				backgroundEquirectTexture.setValue( null );

			}

		} else {

			backgroundType.setValue( "None" );
			backgroundTexture.setValue( null );

		}

		if ( scene.fog ) {

			fogColor.setHexValue( scene.fog.color.getHex() );

			if ( scene.fog.isFog ) {

				fogType.setValue( "Fog" );
				fogNear.setValue( scene.fog.near );
				fogFar.setValue( scene.fog.far );

			} else if ( scene.fog.isFogExp2 ) {

				fogType.setValue( "FogExp2" );
				fogDensity.setValue( scene.fog.density );

			}

		} else {

			fogType.setValue( "None" );

		}

		refreshBackgroundUI();
		refreshFogUI();

	}

	function refreshFogUI() {

		var type = fogType.getValue();

		fogPropertiesRow.setDisplay( type === 'None' ? 'none' : '' );
		fogNear.setDisplay( type === 'Fog' ? '' : 'none' );
		fogFar.setDisplay( type === 'Fog' ? '' : 'none' );
		fogDensity.setDisplay( type === 'FogExp2' ? '' : 'none' );

	}

	refreshUI();

	// events

	signals.editorCleared.add( refreshUI );

	signals.sceneGraphChanged.add( refreshUI );

	signals.objectChanged.add( function ( object ) {

		var options = outliner.options;

		for ( var i = 0; i < options.length; i ++ ) {

			var option = options[ i ];

			if ( option.value === object.id ) {

				option.innerHTML = buildHTML( object );
				return;

			}

		}

	} );

	signals.objectSelected.add( function ( object ) {

		if ( ignoreObjectSelectedSignal === true ) return;

		outliner.setValue( object !== null ? object.id : null );

	} );

	return container;

};

export { SidebarScene };
