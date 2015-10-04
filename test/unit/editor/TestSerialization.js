module( "Serialization" );

test( "Test Serialization (simple)", function() {

	// setup
	var editor = new Editor();

	var addObject = function () {

		// setup
		var box = aBox( 'The Box' );

		// Test Add
		var cmd = new CmdAddObject( box );
		cmd.updatable = false;

		editor.execute( cmd );

	};

	var addScript = function () {

		// setup
		var box = aBox( 'The Box' );

		// Test Add

		var cmd = new CmdAddObject( box );
		editor.execute( cmd );

		var cmd = new CmdAddScript( box, { "name":"test","source":"console.log(\"hello world\");" } );
		cmd.updatable = false;

		editor.execute( cmd );

	};

	var moveObject = function () {

		// create some objects
		var anakinsName = 'Anakin Skywalker';
		var lukesName   = 'Luke Skywalker';
		var anakinSkywalker = aSphere( anakinsName );
		var lukeSkywalker   = aBox( lukesName );

		editor.execute( new CmdAddObject( anakinSkywalker ) );
		editor.execute( new CmdAddObject( lukeSkywalker ) );

		// Tell Luke, Anakin is his father
		editor.execute( new CmdMoveObject( lukeSkywalker, anakinSkywalker ) );

	};

	var setups = [ addObject, addScript, moveObject ];

	// Forward tests

	for ( var i = 0; i < setups.length ; i++ ) {

		setups[i]();

		// Check for correct serialization

		editor.history.goToState( 0 );
		editor.history.goToState( 1000 );

		var history = JSON.stringify( editor.history.toJSON() );

		editor.history.clear();

		editor.history.fromJSON( JSON.parse( history ) );

		editor.history.goToState( 0 );
		editor.history.goToState( 1000 );

		var history2 = JSON.stringify( editor.history.toJSON() );

		ok( history == history2 , "OK, forward serializing was successful " );

		editor.clear();

	}

	// Backward tests

	for (var i = 0; i < setups.length ; i++ ) {

		setups[i]();

		editor.history.goToState( 0 );

		var history = JSON.stringify( editor.history.toJSON() );

		editor.history.clear();

		editor.history.fromJSON( JSON.parse( history ) );

		editor.history.goToState( 1000 );
		editor.history.goToState( 0 );

		var history2 = JSON.stringify( editor.history.toJSON() );

		ok( history == history2 , "OK, backward serializing was successful " );

		editor.clear();

	}

});