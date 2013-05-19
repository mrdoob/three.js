Sidebar.Outliner.Geometries = function ( signals ) {

	var container = new UI.Panel();
	container.name = "GEO";
	container.setPadding( '10px' );

	var outliner = new UI.FancySelect().setWidth( '100%' ).setHeight('170px').setColor( '#444' ).setFontSize( '12px' ).onChange( selectFromOutliner );
	container.add( outliner );

	var geometries = null;

  function getGeometries() {

		var options = {};

		for ( var i in editor.geometries ) {

			var geometry = editor.geometries[ i ];

			if ( geometry.name == '') geometry.name = 'Geometry' + geometry.id;

			options[ i ] = geometry.name;

		}

		outliner.setOptions( options );
    getSelected();

  }

  function getSelected() {

    var selectedIds = [];

    for ( var id in editor.selected ) {

      if ( editor.geometries[ id ] ) selectedIds.push( id );

    }

    // TODO: implement multiple selection
    outliner.setValue( selectedIds.length ? selectedIds[0] : null );

  }

	function selectFromOutliner() {

		var id = outliner.getValue();

		editor.select( editor.geometries[ id ] );

	}

	// events

  var timeout;

	signals.sceneChanged.add( function () {

    clearTimeout( timeout );

    timeout = setTimeout( function () {

      getGeometries();

    }, 100 );

	} );

  signals.selected.add( getSelected );

	return container;

}
