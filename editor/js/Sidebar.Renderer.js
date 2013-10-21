Sidebar.Renderer = function ( editor ) {

	var signals = editor.signals;

	var rendererTypes = {

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

	for ( var key in rendererTypes ) {

		if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

		options[ key ] = key;

	}

	var rendererTypeRow = new UI.Panel();
	var rendererType = new UI.Select().setOptions( options ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( updateRenderer );

	rendererTypeRow.add( new UI.Text( 'Type' ).setWidth( '90px' ) );
	rendererTypeRow.add( rendererType );

	container.add( rendererTypeRow );

	if ( editor.config.getKey( 'renderer' ) !== undefined ) {

		rendererType.setValue( editor.config.getKey( 'renderer' ) );

	}

	//

	function updateRenderer() {

		signals.rendererChanged.dispatch( rendererType.getValue() );
		editor.config.setKey( 'renderer', rendererType.getValue() );

	}

	return container;

}
