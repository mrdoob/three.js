module( "CmdSetValue" );

test( "Test CmdSetValue (Undo and Redo)", function(){

	var editor = new Editor();

	var valueBefore = 1.10;
	var valueAfter  = 2.20;

	var box   = aBox( 'A Box' );
	var light = aPointlight( 'A PointLight' );
	var cam   = aPerspectiveCamera( 'A PerspectiveCamera' );

	[ box, light, cam ].map( function( object ) {

		editor.execute( new CmdAddObject( object ) );

		ok( 0 == 0, "Testing object of type '" + object.type + "'");

		[ 'name', 'fov', 'near', 'far', 'intensity', 'distance', 'angle', 'exponent', 'decay' ].map( function( item ) {

			if( object[ item ] !== undefined ) {

				var cmd = new CmdSetValue( object, item, valueBefore );
				cmd.updatable = false;
				editor.execute( cmd );
				ok( object[ item ] == valueBefore, " OK, the attribute '" + item + "' is correct after first execute (expected: '" + valueBefore + "', actual: '" + object[ item ] + "')");

				var cmd = new CmdSetValue( object, item, valueAfter );
				cmd.updatable = false;
				editor.execute( cmd );
				ok( object[ item ] == valueAfter , " OK, the attribute '" + item + "' is correct after second execute (expected: '" + valueAfter + "', actual: '" + object[ item ] + "')");

				editor.undo();
				ok( object[ item ] == valueBefore, " OK, the attribute '" + item + "' is correct after undo (expected: '" + valueBefore + "', actual: '" + object[ item ] + "')");

				editor.redo();
				ok( object[ item ] == valueAfter , " OK, the attribute '" + item + "' is correct after redo (expected: '" + valueAfter + "', actual: '" + object[ item ] + "')");

			}

		});

	});




});