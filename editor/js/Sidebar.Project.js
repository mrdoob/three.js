/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Project = function ( editor ) {

	var signals = editor.signals;

	var rendererTypes = {

		'WebGLRenderer': THREE.WebGLRenderer,
		'CanvasRenderer': THREE.CanvasRenderer,
		'SVGRenderer': THREE.SVGRenderer,
		'SoftwareRenderer': THREE.SoftwareRenderer,
		'RaytracingRenderer': THREE.RaytracingRenderer

	};

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/project/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/project/collapsed', boolean );

	} );

	container.addStatic( new UI.Text( 'PROJECT' ) );
	container.add( new UI.Break() );

	// class

	var options = {};

	for ( var key in rendererTypes ) {

		if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

		options[ key ] = key;

	}

	var rendererTypeRow = new UI.Panel();
	var rendererType = new UI.Select().setOptions( options ).setWidth( '150px' ).onChange( function () {

		editor.config.setKey( 'project/renderer', this.getValue() );
		updateRenderer();

	} );

	rendererTypeRow.add( new UI.Text( 'Renderer' ).setWidth( '90px' ) );
	rendererTypeRow.add( rendererType );

	container.add( rendererTypeRow );

	if ( editor.config.getKey( 'project/renderer' ) !== undefined ) {

		rendererType.setValue( editor.config.getKey( 'project/renderer' ) );

	}

	// antialiasing

	var rendererAntialiasRow = new UI.Panel();
	var rendererAntialias = new UI.Checkbox( editor.config.getKey( 'project/renderer/antialias' ) ).setLeft( '100px' ).onChange( function () {

		editor.config.setKey( 'project/renderer/antialias', this.getValue() );
		// updateRenderer();

	} );

	rendererAntialiasRow.add( new UI.Text( 'Antialias' ).setWidth( '90px' ) );
	rendererAntialiasRow.add( rendererAntialias );

	container.add( rendererAntialiasRow );

	// VR

	var vrRow = new UI.Panel();
	var vr = new UI.Checkbox( editor.config.getKey( 'project/vr' ) ).setLeft( '100px' ).onChange( function () {

		editor.config.setKey( 'project/vr', this.getValue() );
		// updateRenderer();

	} );

	vrRow.add( new UI.Text( 'VR' ).setWidth( '90px' ) );
	vrRow.add( vr );

	container.add( vrRow );

	//

	function updateRenderer() {

		signals.rendererChanged.dispatch( rendererType.getValue(), rendererAntialias.getValue() );

	}

	return container;

}
