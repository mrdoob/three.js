Sidebar.Scene = function ( signals ) {

	var selected = null;

	var container = new UI.Panel();
	container.setPadding( '10px' );
	container.setBorderTop( '1px solid #ccc' );

	container.add( new UI.Text( 'SCENE' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	var outliner = new UI.FancySelect().setWidth( '100%' ).setHeight('140px').setColor( '#444' ).setFontSize( '12px' ).onChange( updateOutliner );
	container.add( outliner );
	container.add( new UI.Break() );

	// fog

	var fogTypeRow = new UI.Panel();
	var fogType = new UI.Select().setOptions( {

		'None': 'None',
		'Fog': 'Linear',
		'FogExp2': 'Exponential'

	} ).setWidth( '150px' ).setColor( '#444' ).setFontSize( '12px' ).onChange( updateFogType );

	fogTypeRow.add( new UI.Text( 'Fog' ).setWidth( '90px' ).setColor( '#666' ) );
	fogTypeRow.add( fogType );

	container.add( fogTypeRow );

	// fog color

	var fogColorRow = new UI.Panel();
	fogColorRow.setDisplay( 'none' );

	var fogColor = new UI.Color().setValue( '#aaaaaa' ).onChange( updateFogColor );

	fogColorRow.add( new UI.Text( 'Fog color' ).setWidth( '90px' ).setColor( '#666' ) );
	fogColorRow.add( fogColor );

	container.add( fogColorRow );

	// fog near

	var fogNearRow = new UI.Panel();
	fogNearRow.setDisplay( 'none' );

	var fogNear = new UI.Number( 1 ).setWidth( '60px' ).setRange( 0, Infinity ).onChange( updateFogParameters );

	fogNearRow.add( new UI.Text( 'Fog near' ).setWidth( '90px' ).setColor( '#666' ) );
	fogNearRow.add( fogNear );

	container.add( fogNearRow );

	var fogFarRow = new UI.Panel();
	fogFarRow.setDisplay( 'none' );

	// fog far

	var fogFar = new UI.Number( 5000 ).setWidth( '60px' ).setRange( 0, Infinity ).onChange( updateFogParameters );

	fogFarRow.add( new UI.Text( 'Fog far' ).setWidth( '90px' ).setColor( '#666' ) );
	fogFarRow.add( fogFar );

	container.add( fogFarRow );

	// fog density

	var fogDensityRow = new UI.Panel();
	fogDensityRow.setDisplay( 'none' );

	var fogDensity = new UI.Number( 0.00025 ).setWidth( '60px' ).setRange( 0, 0.1 ).setPrecision( 5 ).onChange( updateFogParameters );

	fogDensityRow.add( new UI.Text( 'Fog density' ).setWidth( '90px' ).setColor( '#666' ) );
	fogDensityRow.add( fogDensity );

	container.add( fogDensityRow );

	//

	var scene = null;

	function getObjectType( object ) {

		var objects = {

			'Scene': THREE.Scene,
			'PerspectiveCamera': THREE.PerspectiveCamera,
			'AmbientLight': THREE.AmbientLight,
			'DirectionalLight': THREE.DirectionalLight,
			'HemisphereLight': THREE.HemisphereLight,
			'PointLight': THREE.PointLight,
			'SpotLight': THREE.SpotLight,
			'Mesh': THREE.Mesh,
			'Object3D': THREE.Object3D

		};

		for ( var type in objects ) {

			if ( object instanceof objects[ type ] ) return type;

		}

	}

	function updateOutliner() {

		var id = parseInt( outliner.getValue() );

		scene.traverse( function ( node ) {

			if ( node.id === id ) {

				signals.objectSelected.dispatch( node );
				return;

			}

		} );

	}

	function updateFogType() {

		var type = fogType.getValue();
		signals.fogTypeChanged.dispatch( type );

		refreshFogUI();

	}

	function refreshFogUI() {

		var type = fogType.getValue();

		fogColorRow.setDisplay( type === 'None' ? 'none' : '' );
		fogNearRow.setDisplay( type === 'Fog' ? '' : 'none' );
		fogFarRow.setDisplay( type === 'Fog' ? '' : 'none' );
		fogDensityRow.setDisplay( type === 'FogExp2' ? '' : 'none' );

	}

	function updateFogColor() {

		signals.fogColorChanged.dispatch( fogColor.getHexValue() );

	}

	function updateFogParameters() {

		signals.fogParametersChanged.dispatch( fogNear.getValue(), fogFar.getValue(), fogDensity.getValue() );

	}

	// events

	signals.sceneChanged.add( function ( object ) {

		scene = object;

		var options = {};

		options[ scene.id ] = scene.name + ' <span style="color: #aaa">- ' + getObjectType( scene ) + '</span>';

		( function addObjects( objects, pad ) {

			for ( var i = 0, l = objects.length; i < l; i ++ ) {

				var object = objects[ i ];

				options[ object.id ] = pad + object.name + ' <span style="color: #aaa">- ' + getObjectType( object ) + '</span>';

				addObjects( object.children, pad + '&nbsp;&nbsp;&nbsp;' );

			}

		} )( scene.children, '&nbsp;&nbsp;&nbsp;' );

		outliner.setOptions( options );

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

	} );

	signals.objectSelected.add( function ( object ) {

		outliner.setValue( object !== null ? object.id : null );

	} );

	return container;

}
