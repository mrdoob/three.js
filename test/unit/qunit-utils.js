//
// Custom QUnit assertions.
//

QUnit.assert.success = function( message ) {

	// Equivalent to assert( true, message );
	QUnit.assert.push( true, undefined, undefined, message );

};

QUnit.assert.fail = function( message ) {

	// Equivalent to assert( false, message );
	QUnit.assert.push( false, undefined, undefined, message );

};

QUnit.assert.numEqual = function( actual, expected, message ) {

	var diff = Math.abs(actual - expected);
	message = message || ( actual + " should be equal to " + expected );
	QUnit.assert.push( diff < 0.1, actual, expected, message );

};

QUnit.assert.equalKey = function( obj, ref, key ) {

	var actual = obj[key];
	var expected = ref[key];
	var message = actual + ' should be equal to ' + expected + ' for key "' + key + '"';
	QUnit.assert.push( actual == expected, actual, expected, message );

};

QUnit.assert.smartEqual = function( actual, expected, message ) {

	var cmp = new SmartComparer();

	var same = cmp.areEqual(actual, expected);
	var msg = cmp.getDiagnostic() || message;

	QUnit.assert.push( same, actual, expected, msg );

};



//
//	GEOMETRY TEST HELPERS
//

function checkGeometryClone( geom ) {

	// Clone
	var copy = geom.clone();
	QUnit.assert.notEqual( copy.uuid, geom.uuid, "clone uuid should differ from original" );
	QUnit.assert.notEqual( copy.id, geom.id, "clone id should differ from original" );
	QUnit.assert.smartEqual( copy, geom, "clone is equal to original" );


	// json round trip with clone
	checkGeometryJsonRoundtrip( copy );

}

// Compare json file with its source geometry.
function checkGeometryJsonWriting( geom, json ) {

	QUnit.assert.equal( json.metadata.version, "4.4", "check metadata version" );
	QUnit.assert.equalKey( geom, json, 'type' );
	QUnit.assert.equalKey( geom, json, 'uuid' );
	QUnit.assert.equal( json.id, undefined, "should not persist id" );

	// All parameters from geometry should be persisted.
	_.forOwn( geom.parameters, function ( val, key ) {

		QUnit.assert.equalKey( geom.parameters, json, key );

	});

	// All parameters from json should be transfered to the geometry.
	// json is flat. Ignore first level json properties that are not parameters.
	var notParameters = [ "metadata", "uuid", "type" ];
	_.forOwn( json, function ( val, key ) {

		if ( notParameters.indexOf( key) === -1 ) QUnit.assert.equalKey( geom.parameters, json, key );

	});

}

// Check parsing and reconstruction of json geometry
function checkGeometryJsonReading( json, geom ) {

	var wrap = [ json ];

	var loader = new THREE.ObjectLoader();
	var output = loader.parseGeometries( wrap );

	QUnit.assert.ok( output[geom.uuid], 'geometry matching source uuid not in output' );
	QUnit.assert.smartEqual( output[geom.uuid], geom, 'Reconstruct geometry from ObjectLoader' );

}

// Verify geom -> json -> geom
function checkGeometryJsonRoundtrip( geom ) {

	var json = geom.toJSON();
	checkGeometryJsonWriting( geom, json );
	checkGeometryJsonReading( json, geom );

}

// Look for undefined and NaN values in numerical fieds.
function checkFinite( geom ) {

	var isNotFinite = _.any( geom.vertices, function ( v ) {

		return ! ( _.isFinite( v.x ) || _.isFinite( v.y ) || _.isFinite( v.z ) );

	});

	// TODO Buffers, normal, etc.

	QUnit.assert.ok( isNotFinite === false, "contains non-finite coordinates" );

}

// Run common geometry tests.
function runStdGeometryTests( assert, geometries ) {

	_.each( geometries, function( geom ) {

		checkFinite( geom );

		// Clone
		checkGeometryClone( geom );

		// json round trip
		checkGeometryJsonRoundtrip( geom );

	});

}




//
//	LIGHT TEST HELPERS
//

// Run common light tests.
function runStdLightTests( assert, lights ) {

	_.each( lights, function( light ) {

		// Clone
		checkLightClone( light );

		// json round trip
		checkLightJsonRoundtrip( light );

	});

}


function checkLightClone( light ) {

	// Clone
	var copy = light.clone();
	QUnit.assert.notEqual( copy.uuid, light.uuid, "clone uuid should differ from original" );
	QUnit.assert.notEqual( copy.id, light.id, "clone id should differ from original" );
	QUnit.assert.smartEqual( copy, light, "clone is equal to original" );


	// json round trip with clone
	checkLightJsonRoundtrip( copy );

}

// Compare json file with its source Light.
function checkLightJsonWriting( light, json ) {

	QUnit.assert.equal( json.metadata.version, "4.4", "check metadata version" );
	QUnit.assert.equalKey( light, json, 'type' );
	QUnit.assert.equalKey( light, json, 'uuid' );
	QUnit.assert.equal( json.id, undefined, "should not persist id" );

}

// Check parsing and reconstruction of json Light
function checkLightJsonReading( json, light ) {

	var loader = new THREE.ObjectLoader();
	var outputLight = loader.parse( json );

	QUnit.assert.smartEqual( outputLight, light, 'Reconstruct Light from ObjectLoader' );

}

// Verify light -> json -> light
function checkLightJsonRoundtrip( light ) {

	var json = light.toJSON();
	checkLightJsonWriting( light, json.object );
	checkLightJsonReading( json, light );

}

