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

	// Quick hack to expose a user control to switch themes - for easy review purposes only

	var themeLink = document.getElementById( 'theme' );
	var themeRow = new UI.Panel();
	var originalColor;

	var theme = new UI.Select().setOptions( [ 'Light', 'Dark' ] ).setWidth( '150px ').setColor( '#444' ).setFontSize( '12px ');
	theme.onChange( function () {

		switch ( this.value ) {

			case '0': themeLink.href = 'css/light.css'; break;
			case '1': themeLink.href = 'css/dark.css'; break;

		}

		signals.themeChanged.dispatch( { selectedIndex: this.value } );

	} );

	themeRow.add( new UI.Text('Theme').setWidth('90px') );
	themeRow.add( theme );

	container.add( themeRow );

	//

	function updateRenderer() {

		var renderer = new rendererTypes[ rendererType.getValue() ]( {
			antialias: true
		} );
		signals.rendererChanged.dispatch( renderer );

	}

	return container;

}
