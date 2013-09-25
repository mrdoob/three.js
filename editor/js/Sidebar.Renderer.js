Sidebar.Renderer = function ( editor ) {

	var signals = editor.signals;

	var rendererClasses = {

		'WebGLRenderer': THREE.WebGLRenderer,
		'WebGLRenderer3': THREE.WebGLRenderer3,
		'CanvasRenderer': THREE.CanvasRenderer,
		'SoftwareRenderer': THREE.SoftwareRenderer,
		'SVGRenderer': THREE.SVGRenderer

	};

	var container = new UI.Panel();

	container.add( new UI.Text( 'RENDERER' ) );
	container.add( new UI.Break(), new UI.Break() );

	// class

	var options = {};

	for ( var key in rendererClasses ) {

		if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

		options[ key ] = key;

	}

	var rendererClassRow = new UI.Panel();
	var rendererClass = new UI.Select().setOptions( options ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( updateRenderer );

	rendererClassRow.add( new UI.Text( 'Class' ).setWidth( '90px' ) );
	rendererClassRow.add( rendererClass );

	container.add( rendererClassRow );

	// Quick hack to expose a user control to switch themes - for easy review purposes only

	var themeLink = document.getElementById('theme');
	var themeRow = new UI.Panel();
	var originalColor;

	var themeClass = new UI.Select().setOptions( ['Light', 'Dark', 'Dark+'] ).setWidth( '150px ').setColor( '#444' ).setFontSize( '12px ').onChange( function () {

		var colorVal = clearColor.getValue();
		switch ( this.value ) {

			case '1':
				themeLink.href = 'css/dark.css';

				if ( originalColor && originalColor != colorVal ) {

					clearColor.setValue( originalColor );

				}

				break;

			case '2':
				themeLink.href =  'css/dark.css'

				if ( colorVal != '#333333' ) {

					originalColor = colorVal;
					clearColor.setValue( '#333333' );

				}

				break;

			default:
				themeLink.href = 'css/light.css';

				if ( originalColor && originalColor != colorVal ) {

					clearColor.setValue( originalColor );

				}

				break;
		}

		updateClearColor();

	});

	themeRow.add( new UI.Text('Theme').setWidth('90px') );
	themeRow.add( themeClass );

	container.add( themeRow );

	// clear color

	var clearColorRow = new UI.Panel();
	var clearColor = new UI.Color().setValue( '#aaaaaa' ).onChange( updateClearColor );

	clearColorRow.add( new UI.Text( 'Clear color' ).setWidth( '90px' ) );
	clearColorRow.add( clearColor );

	container.add( clearColorRow );

	//

	function updateRenderer() {

		var renderer = new rendererClasses[ rendererClass.getValue() ]( {
			antialias: true,
			alpha: false,
			clearColor: clearColor.getHexValue(),
			clearAlpha: 1
		} );
		signals.rendererChanged.dispatch( renderer );

	}

	function updateClearColor() {

		signals.clearColorChanged.dispatch( clearColor.getHexValue() );

	}

	// events

	signals.clearColorChanged.add( function ( color ) {

		clearColor.setHexValue( color );

	} );

	return container;

}
