/**
 * @author Clinton Freeman <freeman@cs.unc.edu>
 */

Sidebar.Location = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	var locationInputRow = new UI.Panel();
	var locationInput = new UI.Input().setWidth( '200px' ).setColor( '#444' ).setFontSize( '12px' );
	var autocomplete = new google.maps.places.Autocomplete( locationInput.dom );

    var veginfoPanel = new UI.Panel();
    var veglist = new UI.FancySelect().setId( 'veglist' ).onChange( function () {

        var vegAddButton = new UI.Button( 'Add' ).onClick( function() {

            var callback = function( obj3d ) {

                var tree = obj3d.scene.children[0];
                tree.name = "tree";
                tree.position.set(50,-100,250);
                tree.castShadow = true;
                tree.receiveShadow = true;


                editor.addObject(tree);// obj3d.scene );
                editor.select(tree);// obj3d.scene );
            }
    
            var mloader = new THREE.ColladaLoader();
            mloader.load("media/river_birch.DAE", callback); // FIXME

            createTreeAtPos(80,-100,250);

        } );

        veginfoPanel.clear();
        veginfoPanel.add( new UI.Text( veglist.options[veglist.getValue()].innerHTML ) );
        veginfoPanel.add( new UI.Break() );
        veginfoPanel.add( vegAddButton );

    } );

	var goButton = new UI.Button( 'Go' ).onClick( function() {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': locationInput.getValue() }, function( results, status ) {
            if (status == google.maps.GeocoderStatus.OK) {
            	console.log(results[0].geometry.location.lat());
                var coords = {
            		lat: results[0].geometry.location.lat(),
            		lng: results[0].geometry.location.lng()
            	};
            	console.log( coords );

            	$.ajax( {
            		url: 'http://geoservice-freemancw.rhcloud.com/speciesforlatlng',   
                	data: $.param( coords ),
                	dataType: 'json',
                	success: function( data ) {
                    	console.log( 'success' );
                        veglist.setOptions( data );
                	},
                	error: function( jqXHR, textStatus, errorThrown ) {
                		console.log( textStatus );
                		console.log( errorThrown );
                	}
	            } );

            } else {
            	console.log( "Geocoding error. Status: " + status );
            }
        } );
	} );

	locationInputRow.add( locationInput );
	locationInputRow.add( goButton );

    container.add( new UI.Text( 'LOCATION' ) );
    container.add( new UI.Break(), new UI.Break() );
	container.add( locationInputRow );

    container.add( new UI.Text( 'VEGETATION' ) );
    container.add( new UI.Break(), new UI.Break() );
    container.add( veglist );
    container.add( new UI.Break(), new UI.Break() );
    container.add( veginfoPanel );

	return container;
}
