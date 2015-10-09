module( "Serialization" );

asyncTest( "Test Serialization", function() {

	// setup
	var editor = new Editor();
	editor.storage.init( function () {

		performTests();
		start(); // continue running other tests

	} );

	var green   = 12581843; // bffbd3

	var addObject = function () {

		// setup
		var box = aBox( 'The Box' );

		// Test Add
		var cmd = new CmdAddObject( box );
		cmd.updatable = false;

		editor.execute( cmd );

		return "addObject";
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

		return "addScript";

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

		return "moveObject";
	};

	var removeScript = function () {

		var box = aBox( 'Box with no script' );
		editor.execute( new CmdAddObject( box ) );

		var script = { "name":"test","source":"console.log(\"hello world\");" } ;
		var cmd = new CmdAddScript( box, script );
		cmd.updatable = false;

		editor.execute( cmd );

		cmd = new CmdRemoveScript( box, script );
		editor.execute( cmd );

		return "removeScript";
	};

	var setColor = function () {

		var pointLight = aPointlight( "The light Light" );

		editor.execute( new CmdAddObject( pointLight ) );
		var cmd = new CmdSetColor( pointLight, 'color', green );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setColor";
	};

	var setGeometry = function () {

		var box = aBox( 'Guinea Pig' ); // default ( 100, 100, 100, 1, 1, 1 )
		var boxGeometry = { geometry: { parameters: { width: 200, height: 201, depth: 202, widthSegments: 2, heightSegments: 3, depthSegments: 4 } } };

		editor.execute( new CmdAddObject( box ) );

		var cmd = new CmdSetGeometry( box, getGeometry( "BoxGeometry", boxGeometry ) );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setGeometry";
	};

	var setGeometryValue = function() {

		var box = aBox( 'Geometry Value Box' );
		editor.execute( new CmdAddObject( box ) );

		cmd = new CmdSetGeometryValue( box, 'uuid', THREE.Math.generateUUID() );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setGeometryValue";
	};

	var setMaterial = function () {

		var sphere = aSphere( 'The Sun' );
		editor.execute( new CmdAddObject( sphere ) );

		var material = new THREE[ 'MeshPhongMaterial' ]();
		var cmd = new CmdSetMaterial( sphere, material );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setMaterial";
	};

	var setMaterialColor = function () {

		var box = aBox( 'Box with colored material' );
		editor.execute( new CmdAddObject( box ) );

		var cmd = new CmdSetMaterialColor( box, 'color', green );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setMaterialColor";
	};

	var setMaterialMap = function () {

		var sphere = aSphere( 'Sphere with texture' );
		editor.execute( new CmdAddObject( sphere ) );

		// dirt.png
		var data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDMjYxMEI4MzVENDMxMUU1OTdEQUY4QkNGNUVENjg4MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDMjYxMEI4NDVENDMxMUU1OTdEQUY4QkNGNUVENjg4MyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkMyNjEwQjgxNUQ0MzExRTU5N0RBRjhCQ0Y1RUQ2ODgzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkMyNjEwQjgyNUQ0MzExRTU5N0RBRjhCQ0Y1RUQ2ODgzIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+txizaQAAABVQTFRFh4eHbGxsdFhEWT0puYVclmxKeVU6ppwr+AAAAHtJREFUeNosjgEWBCEIQplFuP+RB5h9lZn2EZxkLzC3D1YSgSlmk7i0ctzDZNBz/VSoX1KwjlFI8WmA2R7JqUa0LJJcd1rLNWRRaMyi+3Y16qMKHhdE48XLsDyHKJ0nSMazY1fxHyriXxV584tmEedcfGNrA/5cmK8AAwCT9ATehDDyzwAAAABJRU5ErkJggg==';
		var img = new Image();
		img.src = data;

		var texture = new THREE.Texture( img, 'map' );
		texture.sourceFile = 'dirt.png';

		var cmd = new CmdSetMaterialMap( sphere, 'map', texture );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setMaterialMap";
	};

	var setMaterialValue = function () {

		var box = aBox( 'Box with values' );
		editor.execute( new CmdAddObject( box ) );

		var cmd = new CmdSetMaterialValue( box, 'name', 'Bravo' );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setMaterialValue";
	};

	var setPosition = function () {

		var sphere = aSphere( 'Sphere with position' );
		editor.execute( new CmdAddObject( sphere ) );

		var newPosition = new THREE.Vector3( 101, 202, 303 );
		var cmd = new CmdSetPosition( sphere, newPosition );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setPosition";
	};

	var setRotation = function () {

		var box = aBox( 'Box with rotation' );
		editor.execute( new CmdAddObject( box ) );

		var newRotation = new THREE.Euler( 0.3, -1.7, 2 );
		var cmd = new CmdSetRotation( box, newRotation );
		cmd.updatable = false;
		editor.execute ( cmd );

		return "setRotation";

	};

	var setScale = function () {

		var sphere = aSphere( 'Sphere with scale' );
		editor.execute( new CmdAddObject( sphere) );

		var newScale = new THREE.Vector3( 1.2, 3.3, 4.6 );
		var cmd = new CmdSetScale( sphere, newScale );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setScale";
	};

	var setScriptValue = function () {

		var box = aBox( 'Box with script' );
		editor.execute( new CmdAddObject( box ) );
		var script = { name: "Alert", source: "alert( null );" };
		editor.execute( new CmdAddScript( box, script ) );

		var newScript = { name: "Console", source: "console.log( null );" };
		var cmd = new CmdSetScriptValue( box, script, 'source', newScript.source , 0 );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setScriptValue";

	};

	var setUuid = function () {

		var sphere = aSphere( 'Sphere with UUID' );
		editor.execute( new CmdAddObject( sphere ) );

		var cmd = new CmdSetUuid( sphere, THREE.Math.generateUUID() );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setUuid";
	};

	var setValue = function () {

		var box = aBox( 'Box with value' );
		editor.execute( new CmdAddObject( box ) );

		var cmd = new CmdSetValue( box, 'intensity', 2.3 );
		cmd.updatable = false;
		editor.execute( cmd );

		return "setValue";
	};

	var setups = [
		addObject,
		addScript,
		moveObject,
		removeScript,
		setColor,
		setGeometry,
		setGeometryValue,
		setMaterial,
		setMaterialColor,
		setMaterialMap,
		setMaterialValue,
		setPosition,
		setRotation,
		setScale,
		setScriptValue,
		setUuid,
		setValue
	];

	function performTests() {

		// Forward tests

		for ( var i = 0; i < setups.length ; i++ ) {

			var name = setups[i]();

			// Check for correct serialization

			editor.history.goToState( 0 );
			editor.history.goToState( 1000 );

			var history = JSON.stringify( editor.history.toJSON() );

			editor.history.clear();

			editor.history.fromJSON( JSON.parse( history ) );

			editor.history.goToState( 0 );
			editor.history.goToState( 1000 );

			var history2 = JSON.stringify( editor.history.toJSON() );

			ok( history == history2 , "OK, forward serializing was successful for " + name );

			editor.clear();

		}

		// Backward tests

		for (var i = 0; i < setups.length ; i++ ) {

			var name = setups[i]();

			editor.history.goToState( 0 );

			var history = JSON.stringify( editor.history.toJSON() );

			editor.history.clear();

			editor.history.fromJSON( JSON.parse( history ) );

			editor.history.goToState( 1000 );
			editor.history.goToState( 0 );

			var history2 = JSON.stringify( editor.history.toJSON() );

			ok( history == history2 , "OK, backward serializing was successful for " + name );

			editor.clear();

		}

	}

});