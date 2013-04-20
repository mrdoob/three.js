Sidebar.Renderer = function ( signals ) {

	var rendererClasses = {

		'WebGLRenderer': THREE.WebGLRenderer,
		'WebGLRenderer3': THREE.WebGLRenderer3,
		'CanvasRenderer': THREE.CanvasRenderer,
		'SoftwareRenderer': THREE.SoftwareRenderer,
		'SVGRenderer': THREE.SVGRenderer

	};

	var container = new UI.Panel();
	container.setPadding( '10px' );
	container.setBorderTop( '1px solid #ccc' );

	container.add( new UI.Text( 'RENDERER' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	// class

	var options = {};

	for ( var key in rendererClasses ) {

		if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

		options[ key ] = key;

	}

	var rendererClassRow = new UI.Panel();
	var rendererClass = new UI.Select().setOptions( options ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( updateRenderer );

	rendererClassRow.add( new UI.Text( 'Class' ).setWidth( '90px' ).setColor( '#666' ) );
	rendererClassRow.add( rendererClass );

	container.add( rendererClassRow );

	// clear color

	var clearColorRow = new UI.Panel();
	var clearColor = new UI.Color().setValue( '#aaaaaa' ).onChange( updateClearColor );

	clearColorRow.add( new UI.Text( 'Clear color' ).setWidth( '90px' ).setColor( '#666' ) );
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
