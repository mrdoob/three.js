Sidebar.Outliner = function ( signals ) {

	var objects = {

		'PerspectiveCamera': THREE.PerspectiveCamera,
		'PointLight': THREE.PointLight,
		'DirectionalLight': THREE.DirectionalLight,
		'Mesh': THREE.Mesh,
		'Object3D': THREE.Object3D

	};

	var selected = null;

	var container = new UI.Panel();
	container.setPadding( '8px' );
	container.setBorderTop( '1px solid #ccc' );

	container.add( new UI.Text().setValue( 'SCENE' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	var sceneGraph = new UI.Select().setMultiple( true ).setWidth( '100%' ).setHeight('140px').setColor( '#444' ).setFontSize( '12px' ).onChange( update );
	container.add( sceneGraph );

	container.add( new UI.Break(), new UI.Break() );

	var scene = null;

	function update() {

		var id = parseInt( sceneGraph.getValue() );

		for ( var i in scene.children ) {

			var object = scene.children[ i ];

			if ( object.id === id ) {

				signals.objectSelected.dispatch( object );
				return;

			}

		}

	}

	function getObjectInstanceName( object ) {

		for ( var key in objects ) {

			if ( object instanceof objects[ key ] ) return key;

		}

	}

	// events

	signals.sceneChanged.add( function ( object ) {

		scene = object;

		var options = {};

		for ( var i in scene.children ) {

			var object = scene.children[ i ];
			options[ object.id ] = ' - ' + object.name + '[' + getObjectInstanceName( object ) + ']';

		}

		sceneGraph.setOptions( options );

	} );

	signals.objectSelected.add( function ( object ) {

		sceneGraph.setValue( object !== null ? object.id: null );

	} );

	return container;

}
