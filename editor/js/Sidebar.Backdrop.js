/**
 * @author Ayman Habib
 */

Sidebar.Backdrop = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;

	var backdropTypes = {

		'Blank': THREE.WebGLRenderer,
		'Sky': THREE.CanvasRenderer,

	};

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( config.getKey( 'ui/sidebar/backdrop/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		config.setKey( 'ui/sidebar/backdrop/collapsed', boolean );

	} );

	container.addStatic( new UI.Text( 'BACKDROP' ) );
	container.add( new UI.Break() );

	// class

	var options = {};

	for ( var key in backdropTypes ) {

            options[ key ] = key;

	}

	var backdropTypeRow = new UI.Panel();
	var backdropType = new UI.Select().setOptions( options ).setWidth( '150px' ).onChange( function () {

		var value = this.getValue();

		if ( value === 'WebGLRenderer' ) {

			rendererPropertiesRow.setDisplay( '' );

		} else {

			rendererPropertiesRow.setDisplay( 'none' );

		}

		config.setKey( 'project/renderer', value );
		updateRenderer();

	} );

	rendererTypeRow.add( new UI.Text( 'Renderer' ).setWidth( '90px' ) );
	rendererTypeRow.add( rendererType );

	container.add( rendererTypeRow );

	if ( config.getKey( 'project/renderer' ) !== undefined ) {

		rendererType.setValue( config.getKey( 'project/renderer' ) );

	}

	// antialiasing

	var rendererPropertiesRow = new UI.Panel();
	rendererPropertiesRow.add( new UI.Text( '' ).setWidth( '90px' ) );

	var rendererAntialiasSpan = new UI.Span().setMarginRight( '10px' );
	var rendererAntialias = new UI.Checkbox( config.getKey( 'project/renderer/antialias' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/renderer/antialias', this.getValue() );
		updateRenderer();

	} );

	rendererAntialiasSpan.add( rendererAntialias );
	rendererAntialiasSpan.add( new UI.Text( 'antialias' ).setMarginLeft( '3px' ) );

	rendererPropertiesRow.add( rendererAntialiasSpan );

	//

	function updateRenderer() {

		createRenderer( rendererType.getValue(), rendererAntialias.getValue(), rendererShadows.getValue() );

	}

	function createRenderer( type, antialias, shadows ) {

		if ( type === 'WebGLRenderer' && System.support.webgl === false ) {

			type = 'CanvasRenderer';

		}

		var renderer = new rendererTypes[ type ]( { antialias: antialias } );
		if ( shadows && renderer.shadowMap ) renderer.shadowMap.enabled = true;
		signals.rendererChanged.dispatch( renderer );

	}

	createRenderer( config.getKey( 'project/renderer' ), config.getKey( 'project/renderer/antialias' ), config.getKey( 'project/renderer/shadows' ) );

	return container;

}
