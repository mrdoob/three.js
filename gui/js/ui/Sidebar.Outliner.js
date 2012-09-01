Sidebar.Outliner = function ( signals ) {

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

	signals.sceneChanged.add( function ( object ) {

		scene = object;

		var options = {};

		for ( var i in scene.children ) {

			var object = scene.children[ i ];
			options[ object.id ] = ' - ' + object.name;

		}

		sceneGraph.setOptions( options );

	} );

	signals.objectSelected.add( function ( object ) {

		sceneGraph.setValue( object !== null ? object.id: null );

	} );

	return container;

}
