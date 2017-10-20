/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

QUnit.module( "SetScriptValueCommand" );

QUnit.test( "Test SetScriptValueCommand for source (Undo and Redo)", function( assert ) {


	// setup
	var editor = new Editor();
	var box    = aBox( "The scripted box" );
	var cmd = new AddObjectCommand( box );
	cmd.updatable = false;
	editor.execute( cmd );

	var translateScript = { name: "Translate", source: "function( update ) {}" };
	cmd = new AddScriptCommand( box, translateScript );
	cmd.updatable = false;
	editor.execute( cmd );


	var testSourceData = [

		{ name: "Translate", source: "function update( event ) { this.position.x = this.position.x + 1; }" },
		{ name: "Translate", source: "function update( event ) { this.position.y = this.position.y + 1; }" },
		{ name: "Translate", source: "function update( event ) { this.position.z = this.position.z + 1; }" }

	];


	// test source

	testSourceData.map( function( script ) {

		var cmd = new SetScriptValueCommand( box, translateScript, 'source', script.source, 0 );
		cmd.updatable = false;
		editor.execute( cmd );

	} );

	var length = testSourceData.length;
	assert.ok( editor.scripts[ box.uuid ][ 0 ][ 'source' ] == testSourceData[ length - 1 ].source,
		"OK, 'source' was set correctly to the last value (expected: '" + testSourceData[ length - 1 ].source + "', actual: '" + editor.scripts[ box.uuid ][ 0 ][ 'source' ] + "')" );

	editor.undo();
	assert.ok( editor.scripts[ box.uuid ][ 0 ][ 'source' ] == testSourceData[ length - 2 ].source,
		"OK, 'source' was set correctly to the second to the last value after undo (expected: '" + testSourceData[ length - 2 ].source + "', actual: '" + editor.scripts[ box.uuid ][ 0 ][ 'source' ] + "')" );

	editor.redo();
	assert.ok( editor.scripts[ box.uuid ][ 0 ][ 'source' ] == testSourceData[ length - 1 ].source,
		"OK, 'source' was set correctly to the last value again after redo (expected: '" + testSourceData[ length - 1 ].source + "', actual: '" + editor.scripts[ box.uuid ][ 0 ][ 'source' ]	 + "')" );


	var names = [ "X Script", "Y Script", "Z Script" ];

	names.map( function( name ) {

		cmd = new SetScriptValueCommand( box, translateScript, 'name', name );
		cmd.updatable = false;
		editor.execute( cmd );

	} );

	var scriptName = editor.scripts[ box.uuid ][ 0 ][ "name" ];
	assert.ok( scriptName == names[ names.length - 1 ], "OK, the script name corresponds to the last script name that was assigned" );

	editor.undo();
	scriptName = editor.scripts[ box.uuid ][ 0 ][ "name" ];
	assert.ok( scriptName == names[ names.length - 2 ], "OK, the script name corresponds to the second last script name that was assigned" );

	editor.redo();
	scriptName = editor.scripts[ box.uuid ][ 0 ][ "name" ];
	assert.ok( scriptName == names[ names.length - 1 ], "OK, the script name corresponds to the last script name that was assigned, again" );

} );
