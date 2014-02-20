Sidebar.Location = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

	container.add( new UI.Text( 'LOCATION' ) );
	container.add( new UI.Break(), new UI.Break() );

	// location input

	var locationInputRow = new UI.Panel();
	var locationInput = new UI.Input().setWidth( '200px' ).setColor( '#444' ).setFontSize( '12px' );
	var autocomplete = new google.maps.places.Autocomplete( locationInput.dom );

	var goButton = new UI.Button( 'Go' ).onClick( function() {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': locationInput.getValue() }, function( results, status ) {
            if (status == google.maps.GeocoderStatus.OK) {
            	var coords = {
            		lat: results[0].geometry.location.lat(),
            		lng: results[0].geometry.location.lng()
            	};
            	console.log( coords );

            	$.ajax( {
            		url: 'http://geoservice-freemancw.rhcloud.com/speciesforlatlng',   
                	data: $.param(coords),
                	dataType: 'json',
                	success: function(data) {
                    	console.log('success');
                    	//$("output").append(JSON.stringify(data));
                    	console.log(data);
                	},
                	error: function( jqXHR, textStatus, errorThrown ) {
                		console.log( textStatus );
                		console.log( errorThrown );
                	}
	            } );

                //map.setCenter(results[0].geometry.location);
                //showMessage( 'Address found.' );
                //addMarker( results[0].geometry.location ); // move to position (thanks @jocabola!)
            } else {
            	console.log("failure!");
                //showError("Geocode was not successful for the following reason: " + status);
                //showProgress( false );
            }
        } );
	} );

	locationInputRow.add( locationInput );
	locationInputRow.add( goButton );

	container.add( locationInputRow );

	return container;
}
