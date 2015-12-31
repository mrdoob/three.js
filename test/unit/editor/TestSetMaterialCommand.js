/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

module( "SetMaterialCommand" );

test( "Test for SetMaterialCommand (Undo and Redo)", function() {

	// setup
	var editor = new Editor();
	var box = aBox( 'Material girl in a material world' );
	var cmd = new AddObjectCommand( box );
	cmd.updatable = false;
	editor.execute( cmd );

	materialClasses = [

		'LineBasicMaterial',
		'LineDashedMaterial',
		'MeshBasicMaterial',
		'MeshDepthMaterial',
		'MeshLambertMaterial',
		'MeshNormalMaterial',
		'MeshPhongMaterial',
		'ShaderMaterial',
		'SpriteMaterial'

	];

	materialClasses.map( function( materialClass ) {

		material = new THREE[ materialClass ]();
		editor.execute( new SetMaterialCommand( box, material ) );

	} );

	var i = materialClasses.length - 1;

	// initial test
	ok( box.material.type == materialClasses[ i ],
		"OK, initial material type was set correctly (expected: '" + materialClasses[ i ] + "', actual: '" + box.material.type + "')" );



	// test undos
	while ( i > 0 ) {

		editor.undo();
		-- i;
		ok( box.material.type == materialClasses[ i ],
			"OK, material type was set correctly after undo (expected: '" + materialClasses[ i ] + "', actual: '" + box.material.type + "')" );

	}

	// test redos
	while ( i < materialClasses.length - 1 ) {

		editor.redo();
		++ i;
		ok( box.material.type == materialClasses[ i ],
			"OK, material type was set correctly after redo (expected: '" + materialClasses[ i ] + "', actual: '" + box.material.type + "')" );

	}

} );
