Sidebar.Outliner.Textures = function ( signals ) {

	var container = new UI.Panel();
	container.name = "TEX";
	container.setPadding( '10px' );

	var outliner = new UI.FancySelect().setWidth( '100%' ).setHeight('170px').setColor( '#444' ).setFontSize( '12px' ).onChange( selectFromOutliner );
	container.add( outliner );

	var textures = null;

  function getTextures() {

		var options = {};

		for ( var i in editor.textures ) {

			var texture = editor.textures[ i ];

			if ( texture.name == '') texture.name = 'Texture' + texture.id;

			options[ i ] = texture.name;

		}

		outliner.setOptions( options );
    getSelected();

  }

	function selectFromOutliner() {

    var uuid = outliner.getValue();

		editor.select( editor.textures[uuid] );

	}

  function getSelected() {

    var selectedUuids = [];

    for ( var uuid in editor.selected ) {

      if ( editor.textures[uuid] ) selectedUuids.push(uuid);

    }

    // TODO: implement multiple selection
    outliner.setValue( selectedUuids.length ? selectedUuids[0] : null );

  }

	// events

  var timeout;

	signals.sceneChanged.add( function () {

    clearTimeout( timeout );

    timeout = setTimeout( function () {

      getTextures();

    }, 100 );

	} );

  signals.selected.add( getSelected );

	return container;

}
