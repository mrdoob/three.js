var Toolbar = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

	var location = new UI.Panel().setId( 'location' ).setClass( 'locdiv' );
	var locationInput = new UI.Input().setWidth( '248px' ).setColor( '#444' );
	var autocomplete = new google.maps.places.Autocomplete( locationInput.dom );
	var goButton = new UI.Button( 'Go' ).onClick( function() {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': locationInput.getValue() }, function( results, status ) {
            if (status == google.maps.GeocoderStatus.OK) {
                var coords = {
            		lat: results[0].geometry.location.lat(),
            		lng: results[0].geometry.location.lng()
            	};

            	editor.setLocation( coords );

            } else {
            	console.log( "Geocoding error. Status: " + status );
            }
        } );
	} );

	location.add( locationInput );
	location.add( goButton );
	container.add( location );

	var buttons = new UI.Panel();
	container.add( buttons );

	// translate / rotate / scale

	var translate = new UI.Button( 'translate' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	buttons.add( translate );

	var rotate = new UI.Button( 'rotate' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'rotate' );

	} );
	buttons.add( rotate );

	var scale = new UI.Button( 'scale' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'scale' );

	} );
	buttons.add( scale );

	// grid

	var grid = new UI.Number( 25 ).onChange( update );
	grid.dom.style.width = '42px';
	//buttons.add( new UI.Text( 'Grid: ' ) );
	//buttons.add( grid );

	var snap = new UI.Checkbox( false ).onChange( update );
	//buttons.add( snap );
	//buttons.add( new UI.Text( 'snap' ) );

	var local = new UI.Checkbox( false ).onChange( update );
	//buttons.add( local );
	//buttons.add( new UI.Text( 'local' ) );


	container.init = function( addr ) {
		locationInput.setValue( addr );
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': locationInput.getValue() }, function( results, status ) {
            if (status == google.maps.GeocoderStatus.OK) {
                var coords = {
            		lat: results[0].geometry.location.lat(),
            		lng: results[0].geometry.location.lng()
            	};

            	// hack for demo...
            	coords.lat = 39.29533;
            	coords.lng = -76.74360;

            	editor.setLocation( coords );

            } else {
            	console.log( "Geocoding error. Status: " + status );
            }
        } );
	}

	function update() {

		signals.snapChanged.dispatch( snap.getValue() === true ? grid.getValue() : null );
		signals.spaceChanged.dispatch( local.getValue() === true ? "local" : "world" );

	}

	update();

	return container;

}