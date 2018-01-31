//
// Custom QUnit assertions.
//
/* global QUnit, SmartComparer */

QUnit.assert.success = function ( message ) {

	// Equivalent to assert( true, message );
	this.pushResult( {
		result: true,
		actual: undefined,
		expected: undefined,
		message: message
	} );

};

QUnit.assert.fail = function ( message ) {

	// Equivalent to assert( false, message );
	this.pushResult( {
		result: false,
		actual: undefined,
		expected: undefined,
		message: message
	} );

};

QUnit.assert.numEqual = function ( actual, expected, message ) {

	var diff = Math.abs( actual - expected );
	message = message || ( actual + " should be equal to " + expected );
	this.pushResult( {
		result: diff < 0.1,
		actual: actual,
		expected: expected,
		message: message
	} );

};

QUnit.assert.equalKey = function ( obj, ref, key ) {

	var actual = obj[ key ];
	var expected = ref[ key ];
	var message = actual + ' should be equal to ' + expected + ' for key "' + key + '"';
	this.pushResult( {
		result: actual == expected,
		actual: actual,
		expected: expected,
		message: message
	} );

};

QUnit.assert.smartEqual = function ( actual, expected, message ) {

	var cmp = new SmartComparer();

	var same = cmp.areEqual( actual, expected );
	var msg = cmp.getDiagnostic() || message;

	this.pushResult( {
		result: same,
		actual: actual,
		expected: expected,
		message: msg
	} );

};

//
//	GEOMETRY TEST HELPERS
//

function checkGeometryClone( geom ) {

	// Clone
	var copy = geom.clone();
	QUnit.assert.notEqual( copy.uuid, geom.uuid, "clone uuid should differ from original" );
	QUnit.assert.notEqual( copy.id, geom.id, "clone id should differ from original" );

	var excludedProperties = [ 'parameters', 'widthSegments', 'heightSegments', 'depthSegments' ];

	var differingProp = getDifferingProp( geom, copy, excludedProperties );
	QUnit.assert.ok( differingProp === undefined, 'properties are equal' );

	differingProp = getDifferingProp( copy, geom, excludedProperties );
	QUnit.assert.ok( differingProp === undefined, 'properties are equal' );

	// json round trip with clone
	checkGeometryJsonRoundtrip( copy );

}

function getDifferingProp( geometryA, geometryB, excludedProperties ) {

	excludedProperties = excludedProperties || [];

	var geometryKeys = Object.keys( geometryA );
	var cloneKeys = Object.keys( geometryB );

	var differingProp = undefined;

	for ( var i = 0, l = geometryKeys.length; i < l; i ++ ) {

		var key = geometryKeys[ i ];

		if ( excludedProperties.indexOf( key ) >= 0 ) continue;

		if ( cloneKeys.indexOf( key ) < 0 ) {

			differingProp = key;
			break;

		}

	}

	return differingProp;

}

// Compare json file with its source geometry.
function checkGeometryJsonWriting( geom, json ) {

	QUnit.assert.equal( json.metadata.version, "4.5", "check metadata version" );
	QUnit.assert.equalKey( geom, json, 'type' );
	QUnit.assert.equalKey( geom, json, 'uuid' );
	QUnit.assert.equal( json.id, undefined, "should not persist id" );

	var params = geom.parameters;
	if ( ! params ) {

		return;

	}

	// All parameters from geometry should be persisted.
	var keys = Object.keys( params );
	for ( var i = 0, l = keys.length; i < l; i ++ ) {

		QUnit.assert.equalKey( params, json, keys[ i ] );

	}

	// All parameters from json should be transfered to the geometry.
	// json is flat. Ignore first level json properties that are not parameters.
	var notParameters = [ "metadata", "uuid", "type" ];
	var keys = Object.keys( json );
	for ( var i = 0, l = keys.length; i < l; i ++ ) {

		var key = keys[ i ];
		if ( notParameters.indexOf( key ) === - 1 ) QUnit.assert.equalKey( params, json, key );

	}

}

// Check parsing and reconstruction of json geometry
function checkGeometryJsonReading( json, geom ) {

	var wrap = [ json ];

	var loader = new THREE.ObjectLoader();
	var output = loader.parseGeometries( wrap );

	QUnit.assert.ok( output[ geom.uuid ], 'geometry matching source uuid not in output' );
	// QUnit.assert.smartEqual( output[ geom.uuid ], geom, 'Reconstruct geometry from ObjectLoader' );

	var differing = getDifferingProp( output[ geom.uuid ], geom, [ 'bones' ] );
	if ( differing ) console.log( differing );

	var excludedProperties = [ 'bones' ];

	var differingProp = getDifferingProp( output[ geom.uuid ], geom, excludedProperties );
	QUnit.assert.ok( differingProp === undefined, 'properties are equal' );

	differingProp = getDifferingProp( geom, output[ geom.uuid ], excludedProperties );
	QUnit.assert.ok( differingProp === undefined, 'properties are equal' );

}

// Verify geom -> json -> geom
function checkGeometryJsonRoundtrip( geom ) {

	var json = geom.toJSON();
	checkGeometryJsonWriting( geom, json );
	checkGeometryJsonReading( json, geom );

}

// Look for undefined and NaN values in numerical fieds.
function checkFinite( geom ) {

	var allVerticesAreFinite = true;

	var vertices = geom.vertices || [];

	for ( var i = 0, l = vertices.length; i < l; i ++ ) {

		var v = geom.vertices[ i ];

		if ( ! ( isFinite( v.x ) || isFinite( v.y ) || isFinite( v.z ) ) ) {

			allVerticesAreFinite = false;
			break;

		}

	}

	// TODO Buffers, normal, etc.

	QUnit.assert.ok( allVerticesAreFinite, "contains only finite coordinates" );

}

// Run common geometry tests.
function runStdGeometryTests( assert, geometries ) {

	for ( var i = 0, l = geometries.length; i < l; i ++ ) {

		var geom = geometries[ i ];

		checkFinite( geom );

		// Clone
		checkGeometryClone( geom );

		// json round trip
		checkGeometryJsonRoundtrip( geom );

	}

}

//
//	LIGHT TEST HELPERS
//

// Run common light tests.
function runStdLightTests( assert, lights ) {

	for ( var i = 0, l = lights.length; i < l; i ++ ) {

		var light = lights[ i ];

		// copy and clone
		checkLightCopyClone( assert, light );

		// THREE.Light doesn't get parsed by ObjectLoader as it's only
		// used as an abstract base class - so we skip the JSON tests
		if ( light.type !== "Light" ) {

			// json round trip
			checkLightJsonRoundtrip( assert, light );

		}

	}

}

function checkLightCopyClone( assert, light ) {

	// copy
	var newLight = new light.constructor( 0xc0ffee );
	newLight.copy( light );

	QUnit.assert.notEqual( newLight.uuid, light.uuid, "Copied light's UUID differs from original" );
	QUnit.assert.notEqual( newLight.id, light.id, "Copied light's id differs from original" );
	QUnit.assert.smartEqual( newLight, light, "Copied light is equal to original" );

	// real copy?
	newLight.color.setHex( 0xc0ffee );
	QUnit.assert.notStrictEqual(
		newLight.color.getHex(), light.color.getHex(), "Copied light is independent from original"
	);

	// Clone
	var clone = light.clone(); // better get a new var
	QUnit.assert.notEqual( clone.uuid, light.uuid, "Cloned light's UUID differs from original" );
	QUnit.assert.notEqual( clone.id, light.id, "Clone light's id differs from original" );
	QUnit.assert.smartEqual( clone, light, "Clone light is equal to original" );

	// real clone?
	clone.color.setHex( 0xc0ffee );
	QUnit.assert.notStrictEqual(
		clone.color.getHex(), light.color.getHex(), "Clone light is independent from original"
	);

	if ( light.type !== "Light" ) {

		// json round trip with clone
		checkLightJsonRoundtrip( assert, clone );

	}

}

// Compare json file with its source Light.
function checkLightJsonWriting( assert, light, json ) {

	assert.equal( json.metadata.version, "4.5", "check metadata version" );

	var object = json.object;
	assert.equalKey( light, object, 'type' );
	assert.equalKey( light, object, 'uuid' );
	assert.equal( object.id, undefined, "should not persist id" );

}

// Check parsing and reconstruction of json Light
function checkLightJsonReading( assert, json, light ) {

	var loader = new THREE.ObjectLoader();
	var outputLight = loader.parse( json );

	assert.smartEqual( outputLight, light, 'Reconstruct Light from ObjectLoader' );

}

// Verify light -> json -> light
function checkLightJsonRoundtrip( assert, light ) {

	var json = light.toJSON();
	checkLightJsonWriting( assert, light, json );
	checkLightJsonReading( assert, json, light );

}
