Sidebar.Renderer = function ( signals ) {

	var rendererClasses = {

		'CanvasRenderer': THREE.CanvasRenderer,
		'SoftwareRenderer': THREE.SoftwareRenderer,
		'SVGRenderer': THREE.SVGRenderer,
		'WebGLRenderer': THREE.WebGLRenderer

	};

	var container = new UI.Panel();
	container.setPadding( '10px' );
	container.setBorderTop( '1px solid #ccc' );

	container.add( new UI.Text().setValue( 'RENDERER' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	// class

	var rendererClassRow = new UI.Panel();
	var rendererClass = new UI.Select().setPosition( 'absolute' ).setOptions( {

		'WebGLRenderer': 'WebGLRenderer',
		'CanvasRenderer': 'CanvasRenderer',
		'SoftwareRenderer': 'SoftwareRenderer',
		'SVGRenderer': 'SVGRenderer',

	} ).setLeft( '100px' ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( updateRenderer );

	rendererClassRow.add( new UI.Text().setValue( 'Class' ).setColor( '#666' ) );
	rendererClassRow.add( rendererClass );

	container.add( rendererClassRow );

	// clear color

	var clearColorRow = new UI.Panel();
	var clearColor = new UI.Color().setPosition( 'absolute' ).setLeft( '100px' ).setValue( '#aaaaaa' ).onChange( updateClearColor );

	clearColorRow.add( new UI.Text().setValue( 'Clear color' ).setColor( '#666' ) );
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
