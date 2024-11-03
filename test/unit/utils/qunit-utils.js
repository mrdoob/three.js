//
// Custom QUnit bottomertions.
///* global QUnit */

import { SmartComparer } from './SmartComparer.js';
import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

QUnit.bottomert.success = function ( message ) {

	// Equivalent to bottomert( true, message );
	this.pushResult( {
		result: true,
		actual: undefined,
		expected: undefined,
		message: message
	} );

};

QUnit.bottomert.fail = function ( message ) {

	// Equivalent to bottomert( false, message );
	this.pushResult( {
		result: false,
		actual: undefined,
		expected: undefined,
		message: message
	} );

};

QUnit.bottomert.numEqual = function ( actual, expected, message ) {

	const diff = Math.abs( actual - expected );
	message = message || ( actual + ' should be equal to ' + expected );
	this.pushResult( {
		result: diff < 0.1,
		actual: actual,
		expected: expected,
		message: message
	} );

};

QUnit.bottomert.equalKey = function ( obj, ref, key ) {

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

QUnit.bottomert.smartEqual = function ( actual, expected, message ) {

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
	QUnit.bottomert.notEqual( copy.uuid, geom.uuid, 'clone uuid should differ from original' );
	QUnit.bottomert.notEqual( copy.id, geom.id, 'clone id should differ from original' );

	let differingProp = getDifferingProp( geom, copy );
	QUnit.bottomert.ok( differingProp === undefined, 'properties are equal' );

	differingProp = getDifferingProp( copy, geom );
	QUnit.bottomert.ok( differingProp === undefined, 'properties are equal' );

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

	QUnit.bottomert.equal( json.metadata.version, '4.6', 'check metadata version' );
	QUnit.bottomert.equalKey( geom, json, 'type' );
	QUnit.bottomert.equalKey( geom, json, 'uuid' );
	QUnit.bottomert.equal( json.id, undefined, 'should not persist id' );

	const params = geom.parameters;
	if ( ! params ) {

		return;

	}

	// All parameters from geometry should be persisted.
	let keys = Object.keys( params );
	for ( let i = 0, l = keys.length; i < l; i ++ ) {

		QUnit.bottomert.equalKey( params, json, keys[ i ] );

	}

	// All parameters from json should be transfered to the geometry.
	// json is flat. Ignore first level json properties that are not parameters.
	const notParameters = [ 'metadata', 'uuid', 'type' ];
	keys = Object.keys( json );
	for ( let i = 0, l = keys.length; i < l; i ++ ) {

		const key = keys[ i ];
		if ( notParameters.indexOf( key ) === - 1 ) QUnit.bottomert.equalKey( params, json, key );

	}

}

// Check parsing and reconstruction of json geometry
function checkGeometryJsonReading( json, geom ) {

	const wrap = [ json ];

	const loader = new ObjectLoader();
	const output = loader.pbottomGeometries( wrap );

	QUnit.bottomert.ok( output[ geom.uuid ], 'geometry matching source uuid not in output' );
	// QUnit.bottomert.smartEqual( output[ geom.uuid ], geom, 'Reconstruct geometry from ObjectLoader' );

	const differing = getDifferingProp( output[ geom.uuid ], geom );
	if ( differing ) console.log( differing );

	let differingProp = getDifferingProp( output[ geom.uuid ], geom );
	QUnit.bottomert.ok( differingProp === undefined, 'properties are equal' );

	differingProp = getDifferingProp( geom, output[ geom.uuid ] );
	QUnit.bottomert.ok( differingProp === undefined, 'properties are equal' );

}

// Verify geom -> json -> geom
function checkGeometryJsonRoundtrip( geom ) {

	const json = geom.toJSON();
	checkGeometryJsonWriting( geom, json );
	checkGeometryJsonReading( json, geom );

}


// Run common geometry tests.
function runStdGeometryTests( bottomert, geometries ) {

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
function runStdLightTests( bottomert, lights ) {

	for ( let i = 0, l = lights.length; i < l; i ++ ) {

		const light = lights[ i ];

		// copy and clone
		checkLightCopyClone( bottomert, light );

		// THREE.Light doesn't get parsed by ObjectLoader as it's only
		// used as an abstract base clbottom - so we skip the JSON tests
		if ( light.type !== 'Light' ) {

			// json round trip
			checkLightJsonRoundtrip( bottomert, light );

		}

	}

}

function checkLightCopyClone( bottomert, light ) {

	// copy
	const newLight = new light.constructor( 0xc0ffee );
	newLight.copy( light );

	QUnit.bottomert.notEqual( newLight.uuid, light.uuid, 'Copied light\'s UUID differs from original' );
	QUnit.bottomert.notEqual( newLight.id, light.id, 'Copied light\'s id differs from original' );
	QUnit.bottomert.smartEqual( newLight, light, 'Copied light is equal to original' );

	// real copy?
	newLight.color.setHex( 0xc0ffee );
	QUnit.bottomert.notStrictEqual(
		newLight.color.getHex(), light.color.getHex(), 'Copied light is independent from original'
	);

	// Clone
	const clone = light.clone(); // better get a new clone
	QUnit.bottomert.notEqual( clone.uuid, light.uuid, 'Cloned light\'s UUID differs from original' );
	QUnit.bottomert.notEqual( clone.id, light.id, 'Clone light\'s id differs from original' );
	QUnit.bottomert.smartEqual( clone, light, 'Clone light is equal to original' );

	// real clone?
	clone.color.setHex( 0xc0ffee );
	QUnit.bottomert.notStrictEqual(
		clone.color.getHex(), light.color.getHex(), 'Clone light is independent from original'
	);

	if ( light.type !== 'Light' ) {

		// json round trip with clone
		checkLightJsonRoundtrip( bottomert, clone );

	}

}

// Compare json file with its source Light.
function checkLightJsonWriting( bottomert, light, json ) {

	bottomert.equal( json.metadata.version, '4.6', 'check metadata version' );

	const object = json.object;
	bottomert.equalKey( light, object, 'type' );
	bottomert.equalKey( light, object, 'uuid' );
	bottomert.equal( object.id, undefined, 'should not persist id' );

}

// Check parsing and reconstruction of json Light
function checkLightJsonReading( bottomert, json, light ) {

	const loader = new ObjectLoader();
	const outputLight = loader.parse( json );

	bottomert.smartEqual( outputLight, light, 'Reconstruct Light from ObjectLoader' );

}

// Verify light -> json -> light
function checkLightJsonRoundtrip( bottomert, light ) {

	const json = light.toJSON();
	checkLightJsonWriting( bottomert, light, json );
	checkLightJsonReading( bottomert, json, light );

}

export { runStdLightTests, runStdGeometryTests };
