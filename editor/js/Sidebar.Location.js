Sidebar.Location = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	var locationInputRow = new UI.Panel();
	var locationInput = new UI.Input().setWidth( '200px' ).setColor( '#444' ).setFontSize( '12px' );
	var autocomplete = new google.maps.places.Autocomplete( locationInput.dom );

    var veginfoPanel = new UI.Panel();
    var veglist = new UI.FancySelect().setId( 'veglist' ).onChange( function () {
        var input = document.createElement( 'input' );
        input.type = 'file';
        
        input.addEventListener( 'change', function ( event ) {
            //console.log( input.files[0] );
            //editor.loader.loadFile( input.files[ 0 ] );
        } );
        
        //signals.vegChanged.dispatch( veglist.getValue() );
        
        var vegAddButton = new UI.Button( 'Add' ).onClick( function() {
            //input.click();

            var callback = function( geometry, materials ) {

                var default_mat = new THREE.MeshBasicMaterial( { color: 0xdddddd } );        
                var vegmesh = new THREE.Mesh( geometry, default_mat );
                vegmesh.name = veglist.options[veglist.getValue()].innerHTML + " 1";
                editor.addObject( vegmesh );
               
            }
    
            var mloader = new THREE.ColladaLoader();
            mloader.load("media/river_birch.DAE", callback); // FIXME

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
                    	//$("output").append(JSON.stringify(data));
                    	//console.log(data.addition);
                        /*
                        data.forEach( function( tree ) {
                            container.add( new UI.Text( tree ) );
                            container.add( new UI.Break() );
                        } );
                        */
                        veglist.setOptions( data );
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
