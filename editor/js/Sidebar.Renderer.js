/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Renderer = function ( editor ) {

	var signals = editor.signals;

	var rendererTypes = {

		'WebGLRenderer': THREE.WebGLRenderer,
		'CanvasRenderer': THREE.CanvasRenderer,
		'SVGRenderer': THREE.SVGRenderer,
		'SoftwareRenderer': THREE.SoftwareRenderer,
		'RaytracingRenderer': THREE.RaytracingRenderer

	};

	var container = new UI.Panel().setClass( 'Panel tab' );

	container.add( new UI.Radio( 'tabs' ).setId( 'tab-renderer' ).setCheck() );
	container.add( new UI.Label( 'Renderer' ).setFor( 'tab-renderer' ) );

	var containercontent = new UI.Panel().setClass( 'Panel' ).setClass( 'Content tab-content' ).setId( 'tab-content-renderer' );

	// class

	var options = {};

	for ( var key in rendererTypes ) {

		if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

		options[ key ] = key;

	}

	var rendererTypeRow = new UI.Panel();
	var rendererType = new UI.Select().setOptions( options ).setWidth( '150px' ).setColor( '#444' ).onChange( function () {

		editor.config.setKey( 'renderer', this.getValue() );
		updateRenderer();

	} );

	rendererTypeRow.add( new UI.Text( 'Type' ).setWidth( '90px' ) );
	rendererTypeRow.add( rendererType );

	containercontent.add( rendererTypeRow );

	if ( editor.config.getKey( 'renderer' ) !== undefined ) {

		rendererType.setValue( editor.config.getKey( 'renderer' ) );

	}
	
	// antialiasing

	var rendererAntialiasRow = new UI.Panel();
	var rendererAntialias = new UI.Checkbox( editor.config.getKey( 'renderer/antialias' ) ).setLeft( '100px' ).onChange( function () {

		editor.config.setKey( 'renderer/antialias', this.getValue() );
		// updateRenderer();

	} );

	rendererAntialiasRow.add( new UI.Text( 'Antialias' ).setWidth( '90px' ) );
	rendererAntialiasRow.add( rendererAntialias );

	containercontent.add( rendererAntialiasRow );

	//

	function updateRenderer() {

		signals.rendererChanged.dispatch( rendererType.getValue(), rendererAntialias.getValue() );

	}

	container.add( containercontent );

	return container;

}
