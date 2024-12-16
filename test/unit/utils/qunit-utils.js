//
// Custom QUnit assertions.
///* global QUnit */

import { SmartComparer } from './SmartComparer.js';
import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

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

	const diff = Math.abs( actual - expected );
	message = message || ( actual + ' should be equal to ' + expected );
	this.pushResult( {
		result: diff < 0.1,
		actual: actual,
		expected: expected,
		message: message
	} );

};

QUnit.assert.equalKey = function ( obj, ref, key ) {

	const actual = obj[ key ];
	const expected = ref[ key ];
	const message = actual + ' should be equal to ' + expected + ' for key "' + key + '"';
	this.pushResult( {
		result: actual == expected,
		actual: actual,
		expected: expected,
		message: message
	} );

};

QUnit.assert.smartEqual = function ( actual, expected, message ) {

	const cmp = new SmartComparer();

	const same = cmp.areEqual( actual, expected );
	const msg = cmp.getDiagnostic() || message;

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
	const copy = geom.clone();
	QUnit.assert.notEqual( copy.uuid, geom.uuid, 'clone uuid should differ from original' );
	QUnit.assert.notEqual( copy.id, geom.id, 'clone id should differ from original' );

	let differingProp = getDifferingProp( geom, copy );
	QUnit.assert.ok( differingProp === undefined, 'properties are equal' );

	differingProp = getDifferingProp( copy, geom );
	QUnit.assert.ok( differingProp === undefined, 'properties are equal' );

	// json round trip with clone
	checkGeometryJsonRoundtrip( copy );

}

function getDifferingProp( geometryA, geometryB ) {

	const geometryKeys = Object.keys( geometryA );
	const cloneKeys = Object.keys( geometryB );

	let differingProp = undefined;

	for ( let i = 0, l = geometryKeys.length; i < l; i ++ ) {

		const key = geometryKeys[ i ];

		if ( cloneKeys.indexOf( key ) < 0 ) {

			differingProp = key;
			break;

		}

	}

	return differingProp;

}

// Compare json file with its source geometry.
function checkGeometryJsonWriting( geom, json ) {

	QUnit.assert.equal( json.metadata.version, '4.6', 'check metadata version' );
	QUnit.assert.equalKey( geom, json, 'type' );
	QUnit.assert.equalKey( geom, json, 'uuid' );
	QUnit.assert.equal( json.id, undefined, 'should not persist id' );

	const params = geom.parameters;
	if ( ! params ) {

		return;

	}

	// All parameters from geometry should be persisted.
	let keys = Object.keys( params );
	for ( let i = 0, l = keys.length; i < l; i ++ ) {

		QUnit.assert.equalKey( params, json, keys[ i ] );

	}

	// All parameters from json should be transferred to the geometry.
	// json is flat. Ignore first level json properties that are not parameters.
	const notParameters = [ 'metadata', 'uuid', 'type' ];
	keys = Object.keys( json );
	for ( let i = 0, l = keys.length; i < l; i ++ ) {

		const key = keys[ i ];
		if ( notParameters.indexOf( key ) === - 1 ) QUnit.assert.equalKey( params, json, key );

	}

}

// Check parsing and reconstruction of json geometry
function checkGeometryJsonReading( json, geom ) {

	const wrap = [ json ];

	const loader = new ObjectLoader();
	const output = loader.parseGeometries( wrap );

	QUnit.assert.ok( output[ geom.uuid ], 'geometry matching source uuid not in output' );
	// QUnit.assert.smartEqual( output[ geom.uuid ], geom, 'Reconstruct geometry from ObjectLoader' );

	const differing = getDifferingProp( output[ geom.uuid ], geom );
	if ( differing ) console.log( differing );

	let differingProp = getDifferingProp( output[ geom.uuid ], geom );
	QUnit.assert.ok( differingProp === undefined, 'properties are equal' );

	differingProp = getDifferingProp( geom, output[ geom.uuid ] );
	QUnit.assert.ok( differingProp === undefined, 'properties are equal' );

}

// Verify geom -> json -> geom
function checkGeometryJsonRoundtrip( geom ) {

	const json = geom.toJSON();
	checkGeometryJsonWriting( geom, json );
	checkGeometryJsonReading( json, geom );

}


// Run common geometry tests.
function runStdGeometryTests( assert, geometries ) {

	for ( let i = 0, l = geometries.length; i < l; i ++ ) {

		const geom = geometries[ i ];

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

	for ( let i = 0, l = lights.length; i < l; i ++ ) {

		const light = lights[ i ];

		// copy and clone
		checkLightCopyClone( assert, light );

		// THREE.Light doesn't get parsed by ObjectLoader as it's only
		// used as an abstract base class - so we skip the JSON tests
		if ( light.type !== 'Light' ) {

			// json round trip
			checkLightJsonRoundtrip( assert, light );

		}

	}

}

function checkLightCopyClone( assert, light ) {

	// copy
	const newLight = new light.constructor( 0xc0ffee );
	newLight.copy( light );

	QUnit.assert.notEqual( newLight.uuid, light.uuid, 'Copied light\'s UUID differs from original' );
	QUnit.assert.notEqual( newLight.id, light.id, 'Copied light\'s id differs from original' );
	QUnit.assert.smartEqual( newLight, light, 'Copied light is equal to original' );

	// real copy?
	newLight.color.setHex( 0xc0ffee );
	QUnit.assert.notStrictEqual(
		newLight.color.getHex(), light.color.getHex(), 'Copied light is independent from original'
	);

	// Clone
	const clone = light.clone(); // better get a new clone
	QUnit.assert.notEqual( clone.uuid, light.uuid, 'Cloned light\'s UUID differs from original' );
	QUnit.assert.notEqual( clone.id, light.id, 'Clone light\'s id differs from original' );
	QUnit.assert.smartEqual( clone, light, 'Clone light is equal to original' );

	// real clone?
	clone.color.setHex( 0xc0ffee );
	QUnit.assert.notStrictEqual(
		clone.color.getHex(), light.color.getHex(), 'Clone light is independent from original'
	);

	if ( light.type !== 'Light' ) {

		// json round trip with clone
		checkLightJsonRoundtrip( assert, clone );

	}

}

// Compare json file with its source Light.
function checkLightJsonWriting( assert, light, json ) {

	assert.equal( json.metadata.version, '4.6', 'check metadata version' );

	const object = json.object;
	assert.equalKey( light, object, 'type' );
	assert.equalKey( light, object, 'uuid' );
	assert.equal( object.id, undefined, 'should not persist id' );

}

// Check parsing and reconstruction of json Light
function checkLightJsonReading( assert, json, light ) {

	const loader = new ObjectLoader();
	const outputLight = loader.parse( json );

	assert.smartEqual( outputLight, light, 'Reconstruct Light from ObjectLoader' );

}

// Verify light -> json -> light
function checkLightJsonRoundtrip( assert, light ) {

	const json = light.toJSON();
	checkLightJsonWriting( assert, light, json );
	checkLightJsonReading( assert, json, light );

}

export { runStdLightTests, runStdGeometryTests };
