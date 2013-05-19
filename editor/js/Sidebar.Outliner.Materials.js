Sidebar.Outliner.Materials = function ( signals ) {

	var container = new UI.Panel();
	container.name = "MAT";
	container.setPadding( '10px' );

	var outliner = new UI.FancySelect().setWidth( '100%' ).setHeight('170px').setColor( '#444' ).setFontSize( '12px' ).onChange( selectFromOutliner );
	container.add( outliner );

	var materials = null;

  function getMaterials() {

		var options = {};

		for ( var i in editor.materials ) {

			var material = editor.materials[ i ];
			options[ i ] = '- ' + material.name;

		}

		outliner.setOptions( options );
    getSelected();

  }

  function getSelected() {

    var selectedIds = [];

    for ( var id in editor.selected ) {

      if ( editor.materials[ id ] ) selectedIds.push( id );

    }

    // TODO: implement multiple selection
    outliner.setValue( selectedIds.length ? selectedIds[0] : null );

  }

	function selectFromOutliner() {

		var id = outliner.getValue();

		editor.select( editor.materials[ id ] );

	}

	// events

  var timeout;

	signals.sceneChanged.add( function () {

    clearTimeout( timeout );

    timeout = setTimeout( function () {

      getMaterials();

    }, 100 );

	} );

  signals.selected.add( getSelected );

	return container;

}
