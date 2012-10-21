Sidebar.Outliner = function ( signals ) {

	var objectTypes = {

		'PerspectiveCamera': THREE.PerspectiveCamera,
		'PointLight': THREE.PointLight,
		'DirectionalLight': THREE.DirectionalLight,
		'Mesh': THREE.Mesh,
		'Object3D': THREE.Object3D

	};

	var selected = null;

	var container = new UI.Panel();
	container.setPadding( '10px' );
	container.setBorderTop( '1px solid #ccc' );

	container.add( new UI.Text().setValue( 'SCENE' ).setColor( '#666' ) );
	container.add( new UI.Button( 'absolute' ).setRight( '8px' ).setTop( '5px' ).setLabel( 'Export' ).onClick( exportScene ) );
	container.add( new UI.Break(), new UI.Break() );

	var sceneGraph = new UI.FancySelect().setWidth( '100%' ).setHeight('140px').setColor( '#444' ).setFontSize( '12px' ).onChange( update );
	container.add( sceneGraph );

	var scene = null;

	function update() {

		var id = parseInt( sceneGraph.getValue() );

		scene.traverse( function ( node ) {

			if ( node.id === id ) {

				signals.objectSelected.dispatch( node );
				return;

			}

		} );

	}

	function getObjectType( object ) {

		for ( var type in objectTypes ) {

			if ( object instanceof objectTypes[ type ] ) return type;

		}

	}

	// events

	signals.sceneCreated.add( function ( object ) {

		scene = object;

	} );

	signals.sceneChanged.add( function ( object ) {

		scene = object;

		var options = {};

		( function createList( object, pad ) {

			for ( var key in object.children ) {

				var child = object.children[ key ];

				options[ child.id ] = pad + child.name + ' <span style="color: #aaa">- ' + getObjectType( child ) + '</span>';

				createList( child, pad + '&nbsp;&nbsp;&nbsp;' );

			}

		} )( scene, '' );

		sceneGraph.setOptions( options );

	} );

	signals.objectSelected.add( function ( object ) {

		sceneGraph.setValue( object !== null ? object.id : null );

	} );

	function exportScene() {

		var output = new THREE.SceneExporter().parse( scene );

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		window.open( objectURL, '_blank' );
		window.focus();

	}

	return container;

}
