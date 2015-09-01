module( "CmdToggleBoolean" );

test( "Test CmdToggleBoolean (Undo and Redo)", function(){

	var editor = new Editor();

	var box   = aBox( 'A Box' );
	var light = aPointlight( 'A PointLight' );
	var cam   = aPerspectiveCamera( 'A PerspectiveCamera' );

	[ box, light, cam ].map( function( object ) {

		editor.execute( new CmdAddObject( object) );
		ok( 0 == 0, "Testing object of type '" + object.type + "'" );

		[ 'visible' ].map( function( item ) {

			if( object[ item ] !== undefined ) {

				var beforeState =  object[ item ];
				var afterState  = !object[ item ];
				ok( 0 == 0, " Initial state of '" + item  + "' is '" + object[ item ] + "'" );

				var cmd = new CmdToggleBoolean( object, item );
				cmd.updatable = false;
				editor.execute( cmd );
				ok( object[ item ] == afterState , " OK, toggling boolean of '" + item + "' has been executed (expected: '" + afterState + "', actual: '" + object[ item ] + "')" );

				editor.undo();
				ok( object[ item ] == beforeState, " OK, toggling boolean of '" + item + "' has been undone (expected: '" + beforeState + "', actual: '" + object[ item ] + "')" );

				editor.redo();
				ok( object[ item ] == afterState , " OK, toggling boolean of '" + item + "' has been redone (expected: '" + afterState + "', actual: '" + object[ item ] + "')" );

			}

		});
	});

});