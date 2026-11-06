import { assert as vitestAssert, expect } from 'vitest';
import { SmartComparer } from './SmartComparer.js';
import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

// Compare copy data without distinguishing signed zero or identical instance methods.
expect.extend( {

	toEqualProperties( actual, expected ) {

		const pass = this.equals( actual, expected, [ ( a, b ) => {

			if ( a === 0 && b === 0 ) return true;
			if ( typeof a === 'function' && typeof b === 'function' ) return a.toString() === b.toString();
			if ( a !== null && b !== null && typeof a === 'object' && typeof b === 'object' && a.constructor !== b.constructor ) return false;

		} ], true );

		return { pass, actual, expected, message: () => 'Expected objects to have equal enumerable properties' };

	}

} );

const assert = {

	...vitestAssert,

	equalProperties( actual, expected, message ) {

		expect( actual, message ).toEqualProperties( expected );

	},

	numEqual( actual, expected, message ) {

		vitestAssert.isBelow( Math.abs( actual - expected ), 0.1, message );

	},

	equalKey( actual, expected, key ) {

		vitestAssert.equal( actual[ key ], expected[ key ], `Property "${ key }"` );

	},

	smartEqual( actual, expected, message ) {

		const comparer = new SmartComparer();
		const equal = comparer.areEqual( actual, expected );
		vitestAssert.isTrue( equal, comparer.getDiagnostic() || message );

	}

};

function checkGeometryClone( geom ) {

	// Clone
	const copy = geom.clone();
	assert.notEqual( copy.uuid, geom.uuid, 'clone uuid should differ from original' );
	assert.notEqual( copy.id, geom.id, 'clone id should differ from original' );

	let differingProp = getDifferingProp( geom, copy );
	assert.ok( differingProp === undefined, 'properties are equal' );

	differingProp = getDifferingProp( copy, geom );
	assert.ok( differingProp === undefined, 'properties are equal' );

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

	assert.equal( json.metadata.version, '4.7', 'check metadata version' );
	assert.equalKey( geom, json, 'type' );
	assert.equalKey( geom, json, 'uuid' );
	assert.equal( json.id, undefined, 'should not persist id' );

	const params = geom.parameters;
	if ( ! params ) {

		return;

	}

	// All parameters from geometry should be persisted.
	let keys = Object.keys( params );
	for ( let i = 0, l = keys.length; i < l; i ++ ) {

		assert.equalKey( params, json, keys[ i ] );

	}

	// All parameters from json should be transferred to the geometry.
	// json is flat. Ignore first level json properties that are not parameters.
	const notParameters = [ 'metadata', 'uuid', 'type', 'name' ];
	keys = Object.keys( json );
	for ( let i = 0, l = keys.length; i < l; i ++ ) {

		const key = keys[ i ];
		if ( notParameters.indexOf( key ) === - 1 ) assert.equalKey( params, json, key );

	}

}

// Check parsing and reconstruction of json geometry
function checkGeometryJsonReading( json, geom ) {

	const wrap = [ json ];

	const loader = new ObjectLoader();
	const output = loader.parseGeometries( wrap );

	assert.ok( output[ geom.uuid ], 'geometry matching source uuid not in output' );
	// assert.smartEqual( output[ geom.uuid ], geom, 'Reconstruct geometry from ObjectLoader' );

	const differing = getDifferingProp( output[ geom.uuid ], geom );
	if ( differing ) console.log( differing );

	let differingProp = getDifferingProp( output[ geom.uuid ], geom );
	assert.ok( differingProp === undefined, 'properties are equal' );

	differingProp = getDifferingProp( geom, output[ geom.uuid ] );
	assert.ok( differingProp === undefined, 'properties are equal' );

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
		checkLightCopyClone( light );

		// THREE.Light doesn't get parsed by ObjectLoader as it's only
		// used as an abstract base class - so we skip the JSON tests
		if ( light.type !== 'Light' ) {

			// json round trip
			checkLightJsonRoundtrip( light );

		}

	}

}

function checkLightCopyClone( light ) {

	// copy
	const newLight = new light.constructor( 0xc0ffee );
	newLight.copy( light );

	assert.notEqual( newLight.uuid, light.uuid, 'Copied light\'s UUID differs from original' );
	assert.notEqual( newLight.id, light.id, 'Copied light\'s id differs from original' );
	assert.smartEqual( newLight, light, 'Copied light is equal to original' );

	// real copy?
	newLight.color.setHex( 0xc0ffee );
	assert.notStrictEqual(
		newLight.color.getHex(), light.color.getHex(), 'Copied light is independent from original'
	);

	// Clone
	const clone = light.clone(); // better get a new clone
	assert.notEqual( clone.uuid, light.uuid, 'Cloned light\'s UUID differs from original' );
	assert.notEqual( clone.id, light.id, 'Clone light\'s id differs from original' );
	assert.smartEqual( clone, light, 'Clone light is equal to original' );

	// real clone?
	clone.color.setHex( 0xc0ffee );
	assert.notStrictEqual(
		clone.color.getHex(), light.color.getHex(), 'Clone light is independent from original'
	);

	if ( light.type !== 'Light' ) {

		// json round trip with clone
		checkLightJsonRoundtrip( clone );

	}

}

// Compare json file with its source Light.
function checkLightJsonWriting( light, json ) {

	assert.equal( json.metadata.version, '4.7', 'check metadata version' );

	const object = json.object;
	assert.equalKey( light, object, 'type' );
	assert.equalKey( light, object, 'uuid' );
	assert.equal( object.id, undefined, 'should not persist id' );

}

// Check parsing and reconstruction of json Light
function checkLightJsonReading( json, light ) {

	const loader = new ObjectLoader();
	const outputLight = loader.parse( json );

	assert.smartEqual( outputLight, light, 'Reconstruct Light from ObjectLoader' );

}

// Verify light -> json -> light
function checkLightJsonRoundtrip( light ) {

	const json = light.toJSON();
	checkLightJsonWriting( light, json );
	checkLightJsonReading( json, light );

}

export { assert, runStdLightTests, runStdGeometryTests };
