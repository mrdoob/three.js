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
			options[ i ] = '- ' + texture.name;

		}

		outliner.setOptions( options );
    getSelected();

  }

	function selectFromOutliner() {

    var id = outliner.getValue();
    
		editor.select( editor.textures[ id ] );

	}

  function getSelected() {

    var selectedIds = [];

    for ( var id in editor.selected ) {

      if ( editor.textures[ id ] ) selectedIds.push( id );

    }

    // TODO: implement multiple selection
    outliner.setValue( selectedIds.length ? selectedIds[0] : null );

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
