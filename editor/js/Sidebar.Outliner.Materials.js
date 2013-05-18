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

			if ( material.name == '') material.name = 'Material' + material.id;

			options[ i ] = material.name;

		}

		outliner.setOptions( options );
    getSelected();

  }

  function getSelected() {

    var selectedUuids = [];

    for ( var uuid in editor.selected ) {

      if ( editor.materials[uuid] ) selectedUuids.push(uuid);

    }

    // TODO: implement multiple selection
    outliner.setValue( selectedUuids.length ? selectedUuids[0] : null );

  }

	function selectFromOutliner() {

		var uuid = outliner.getValue();

		editor.select( editor.materials[uuid] );

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
