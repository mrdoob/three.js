/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Scene = function ( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var renderer = signals.rendererChanged.add( function ( newRenderer ) {

		renderer = newRenderer;

	} );

	var container = new UI.Panel();
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

		if ( object instanceof THREE.Mesh ) {

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

	var outliner = new UI.Outliner( editor );
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
	container.add( new UI.Break() );

	// background

	function onBackgroundChanged() {

		signals.sceneBackgroundChanged.dispatch( backgroundColor.getHexValue() );

	}

	var backgroundRow = new UI.Row();

	var backgroundColor = new UI.Color().setValue( '#aaaaaa' ).onChange( onBackgroundChanged );

	backgroundRow.add( new UI.Text( strings.getKey( 'sidebar/scene/background' ) ).setWidth( '90px' ) );
	backgroundRow.add( backgroundColor );

	container.add( backgroundRow );

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

	var fogTypeRow = new UI.Row();
	var fogType = new UI.Select().setOptions( {

		'None': 'None',
		'Fog': 'Linear',
		'FogExp2': 'Exponential'

	} ).setWidth( '150px' );
	fogType.onChange( function () {

		onFogChanged();
		refreshFogUI();

	} );

	fogTypeRow.add( new UI.Text( strings.getKey( 'sidebar/scene/fog' ) ).setWidth( '90px' ) );
	fogTypeRow.add( fogType );

	container.add( fogTypeRow );

	// fog color

	var fogPropertiesRow = new UI.Row();
	fogPropertiesRow.setDisplay( 'none' );
	fogPropertiesRow.setMarginLeft( '90px' );
	container.add( fogPropertiesRow );

	var fogColor = new UI.Color().setValue( '#aaaaaa' );
	fogColor.onChange( onFogChanged );
	fogPropertiesRow.add( fogColor );

	// fog near

	var fogNear = new UI.Number( 0.1 ).setWidth( '40px' ).setRange( 0, Infinity ).onChange( onFogChanged );
	fogPropertiesRow.add( fogNear );

	// fog far

	var fogFar = new UI.Number( 50 ).setWidth( '40px' ).setRange( 0, Infinity ).onChange( onFogChanged );
	fogPropertiesRow.add( fogFar );

	// fog density

	var fogDensity = new UI.Number( 0.05 ).setWidth( '40px' ).setRange( 0, 0.1 ).setStep( 0.001 ).setPrecision( 3 ).onChange( onFogChanged );
	fogPropertiesRow.add( fogDensity );

	// screenshot
	var screenshotRow = new UI.Row();
	container.add( screenshotRow );

	screenshotRow.add( new UI.Button( strings.getKey( 'sidebar/scene/screenshot' ) ).onClick( function () {

		if ( renderer !== null ) {

			editor.scene.updateMatrixWorld();
			renderer.clear();
			renderer.render( editor.scene, editor.camera );

			var width = renderer.domElement.width;
			var height = renderer.domElement.height;
			context.drawImage( renderer.domElement, 0, 0, width, height, 0, 0, canvas.width, canvas.height );

			// TODO: Allow for multiple screenshots?
			editor.scene.userData.images = {};
			editor.scene.userData.textures = {};

			// Create new canvas to hold the entire screenshot
			var newCanvas = document.createElement( 'canvas' );
			newCanvas.width = width;
			newCanvas.height = height;
			var ctx = newCanvas.getContext( '2d', { alpha: false } );
			ctx.drawImage( renderer.domElement, 0, 0 );
			editor.scene.userData.screenshot = new THREE.CanvasTexture( newCanvas ).toJSON( editor.scene.userData ).uuid;

			needScreenshot = true;
			signals.sceneGraphChanged.dispatch();

		}

	} ) );

	var canvas = document.createElement( 'canvas' );
	canvas.width = 90;
	canvas.height = 90;
	canvas.style.marginLeft = '45px';
	var context = canvas.getContext( '2d', { alpha: false } );
	screenshotRow.dom.appendChild( canvas );

	var needScreenshot = true;

	signals.sceneGraphChanged.add( function () {

		context.clearRect( 0, 0, canvas.width, canvas.height );
		if ( needScreenshot && editor.scene.userData.screenshot !== undefined ) {

			var texture = editor.scene.userData.textures[ editor.scene.userData.screenshot ];
			if ( texture !== undefined ) {

				var image = editor.scene.userData.images[ texture.image ];
				if ( image !== undefined ) {

					var loader = new THREE.ImageLoader();
					loader.load( image.url, function ( img ) {

						// Don't draw if screenshot was deleted
						if ( editor.scene.userData.screenshot !== undefined ) {

							context.drawImage( img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height );
							console.log( "screenshot" );

						}

					} );

				}

			}
			needScreenshot = false;

		}

	} );

	signals.editorCleared.add( function () {

		context.clearRect( 0, 0, canvas.width, canvas.height );
		delete editor.scene.userData.screenshot;
		needScreenshot = true;

	} );

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

			backgroundColor.setHexValue( scene.background.getHex() );

		}

		if ( scene.fog ) {

			fogColor.setHexValue( scene.fog.color.getHex() );

			if ( scene.fog instanceof THREE.Fog ) {

				fogType.setValue( "Fog" );
				fogNear.setValue( scene.fog.near );
				fogFar.setValue( scene.fog.far );

			} else if ( scene.fog instanceof THREE.FogExp2 ) {

				fogType.setValue( "FogExp2" );
				fogDensity.setValue( scene.fog.density );

			}

		} else {

			fogType.setValue( "None" );

		}

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
