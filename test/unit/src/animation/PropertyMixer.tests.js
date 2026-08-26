import { PropertyMixer } from '../../../../src/animation/PropertyMixer.js';

// Minimal stand-in for a PropertyBinding: PropertyMixer only ever calls
// getValue()/setValue() on it, so the real binding (and a scene graph to bind
// to) is not needed here.
class MockBinding {

	constructor( values ) {

		this.values = values.slice();
		this.setValueCalls = 0;

	}

	getValue( array, offset ) {

		for ( let i = 0; i < this.values.length; i ++ ) {

			array[ offset + i ] = this.values[ i ];

		}

	}

	setValue( array, offset ) {

		this.setValueCalls ++;

		for ( let i = 0; i < this.values.length; i ++ ) {

			this.values[ i ] = array[ offset + i ];

		}

	}

}

// Buffer layout is [ incoming | accu0 | accu1 | orig | add | (work) ], so the
// incoming region always starts at 0 and region N starts at N * valueSize.
function writeIncoming( mixer, values ) {

	for ( let i = 0; i < values.length; i ++ ) {

		mixer.buffer[ i ] = values[ i ];

	}

}

function readRegion( mixer, regionIndex ) {

	const stride = mixer.valueSize;
	const offset = regionIndex * stride;

	return Array.from( mixer.buffer.slice( offset, offset + stride ) );

}

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'PropertyMixer', () => {

		// INSTANCING
		QUnit.test( 'Instancing - stores the constructor arguments', ( assert ) => {

			const binding = new MockBinding( [ 0, 0, 0 ] );
			const mixer = new PropertyMixer( binding, 'vector', 3 );

			assert.strictEqual( mixer.binding, binding, 'the binding is kept' );
			assert.strictEqual( mixer.valueSize, 3, 'the value size is kept' );

		} );

		QUnit.test( 'Instancing - starts with zeroed weights and counts', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 0 ] ), 'number', 1 );

			assert.strictEqual( mixer.cumulativeWeight, 0, 'cumulativeWeight starts at 0' );
			assert.strictEqual( mixer.cumulativeWeightAdditive, 0, 'cumulativeWeightAdditive starts at 0' );
			assert.strictEqual( mixer.useCount, 0, 'useCount starts at 0' );
			assert.strictEqual( mixer.referenceCount, 0, 'referenceCount starts at 0' );

		} );

		QUnit.test( 'Instancing - allocates a five-region Float64Array for numeric types', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 0, 0, 0 ] ), 'vector', 3 );

			assert.ok( mixer.buffer instanceof Float64Array, 'numeric types use a Float64Array' );
			assert.strictEqual( mixer.buffer.length, 3 * 5, 'incoming, accu0, accu1, orig and add regions are allocated' );

		} );

		QUnit.test( 'Instancing - allocates an extra work region for quaternion types', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 0, 0, 0, 1 ] ), 'quaternion', 4 );

			assert.ok( mixer.buffer instanceof Float64Array, 'quaternion types use a Float64Array' );
			assert.strictEqual( mixer.buffer.length, 4 * 6, 'a sixth region is allocated for intermediate results' );
			assert.strictEqual( mixer._workIndex, 5, 'the work region is the last one' );

		} );

		QUnit.test( 'Instancing - allocates a plain Array for non-numeric types', ( assert ) => {

			// Booleans and strings cannot live in a typed array.
			for ( const typeName of [ 'bool', 'string' ] ) {

				const mixer = new PropertyMixer( new MockBinding( [ 0 ] ), typeName, 1 );

				assert.ok( Array.isArray( mixer.buffer ), `${ typeName } uses a plain Array` );
				assert.strictEqual( mixer.buffer.length, 5, `${ typeName } allocates five regions` );

			}

		} );

		// saveOriginalState
		QUnit.test( 'saveOriginalState - copies the bound value into the orig and both accu regions', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 1, 2, 3 ] ), 'vector', 3 );

			mixer.saveOriginalState();

			assert.deepEqual( readRegion( mixer, 3 ), [ 1, 2, 3 ], 'orig holds the bound value' );
			assert.deepEqual( readRegion( mixer, 1 ), [ 1, 2, 3 ], 'accu0 is primed with the bound value' );
			assert.deepEqual( readRegion( mixer, 2 ), [ 1, 2, 3 ], 'accu1 is primed with the bound value' );

		} );

		QUnit.test( 'saveOriginalState - resets the additive region to the numeric identity', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 1, 2, 3 ] ), 'vector', 3 );

			mixer.saveOriginalState();

			assert.deepEqual( readRegion( mixer, 4 ), [ 0, 0, 0 ], 'the additive identity for numbers is zero' );

		} );

		QUnit.test( 'saveOriginalState - resets the additive region to the quaternion identity', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 0, 0.7071, 0, 0.7071 ] ), 'quaternion', 4 );

			mixer.saveOriginalState();

			assert.deepEqual( readRegion( mixer, 4 ), [ 0, 0, 0, 1 ], 'the additive identity for quaternions is (0, 0, 0, 1)' );

		} );

		QUnit.test( 'saveOriginalState - uses the original value as the identity for non-numeric types', ( assert ) => {

			// There is no meaningful "zero" for a bool, so the original value
			// stands in as the additive identity.
			const mixer = new PropertyMixer( new MockBinding( [ true ] ), 'bool', 1 );

			mixer.saveOriginalState();

			assert.deepEqual( readRegion( mixer, 4 ), [ true ], 'the additive region mirrors the original value' );

		} );

		QUnit.test( 'saveOriginalState - clears the accumulated weights', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 0 ] ), 'number', 1 );

			mixer.cumulativeWeight = 0.5;
			mixer.cumulativeWeightAdditive = 0.25;

			mixer.saveOriginalState();

			assert.strictEqual( mixer.cumulativeWeight, 0, 'cumulativeWeight is reset' );
			assert.strictEqual( mixer.cumulativeWeightAdditive, 0, 'cumulativeWeightAdditive is reset' );

		} );

		// restoreOriginalState
		QUnit.test( 'restoreOriginalState - writes the saved value back to the binding', ( assert ) => {

			const binding = new MockBinding( [ 1, 2, 3 ] );
			const mixer = new PropertyMixer( binding, 'vector', 3 );

			mixer.saveOriginalState();

			binding.values = [ 9, 9, 9 ];
			mixer.restoreOriginalState();

			assert.deepEqual( binding.values, [ 1, 2, 3 ], 'the binding is returned to its saved state' );

		} );

		// accumulate
		QUnit.test( 'accumulate - the first contribution is copied in unweighted', ( assert ) => {

			// With no accumulated weight yet there is nothing to blend against,
			// so the incoming value is taken verbatim and the weight is recorded
			// for the eventual blend against the original in apply().
			const mixer = new PropertyMixer( new MockBinding( [ 0, 0, 0 ] ), 'vector', 3 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 10, 20, 30 ] );
			mixer.accumulate( 0, 0.25 );

			assert.deepEqual( readRegion( mixer, 1 ), [ 10, 20, 30 ], 'accu0 holds the incoming value, not a scaled one' );
			assert.strictEqual( mixer.cumulativeWeight, 0.25, 'the weight is recorded' );

		} );

		QUnit.test( 'accumulate - blends further contributions by relative weight', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 0, 0, 0 ] ), 'vector', 3 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 10, 20, 30 ] );
			mixer.accumulate( 0, 1 );

			writeIncoming( mixer, [ 0, 0, 0 ] );
			mixer.accumulate( 0, 1 );

			assert.deepEqual( readRegion( mixer, 1 ), [ 5, 10, 15 ], 'two equal weights average the contributions' );
			assert.strictEqual( mixer.cumulativeWeight, 2, 'the weights add up' );

		} );

		QUnit.test( 'accumulate - respects unequal weights', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 0 ] ), 'number', 1 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 0 ] );
			mixer.accumulate( 0, 3 );

			writeIncoming( mixer, [ 100 ] );
			mixer.accumulate( 0, 1 );

			// mix = 1 / 4, so the result is 0 * 0.75 + 100 * 0.25.
			assert.numEqual( readRegion( mixer, 1 )[ 0 ], 25, 'the lighter contribution pulls proportionally less' );

		} );

		QUnit.test( 'accumulate - keeps the two accu regions independent', ( assert ) => {

			// The mixer interleaves accu0 and accu1 across frames so apply() can
			// detect changes; writing one must never disturb the other.
			const mixer = new PropertyMixer( new MockBinding( [ 0 ] ), 'number', 1 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 7 ] );
			mixer.accumulate( 1, 1 );

			assert.deepEqual( readRegion( mixer, 2 ), [ 7 ], 'accu1 received the value' );
			assert.deepEqual( readRegion( mixer, 1 ), [ 0 ], 'accu0 is untouched' );

		} );

		QUnit.test( 'accumulate - picks the heavier value for non-numeric types', ( assert ) => {

			// Booleans cannot be interpolated, so the mixer selects rather than
			// blends: the incoming value only wins if it is at least half the
			// accumulated weight.
			const heavierIncoming = new PropertyMixer( new MockBinding( [ true ] ), 'bool', 1 );
			heavierIncoming.saveOriginalState();
			writeIncoming( heavierIncoming, [ true ] );
			heavierIncoming.accumulate( 0, 1 );
			writeIncoming( heavierIncoming, [ false ] );
			heavierIncoming.accumulate( 0, 1 );

			assert.deepEqual( readRegion( heavierIncoming, 1 ), [ false ], 'an equal weight (mix = 0.5) lets the incoming value win' );

			const lighterIncoming = new PropertyMixer( new MockBinding( [ true ] ), 'bool', 1 );
			lighterIncoming.saveOriginalState();
			writeIncoming( lighterIncoming, [ true ] );
			lighterIncoming.accumulate( 0, 1 );
			writeIncoming( lighterIncoming, [ false ] );
			lighterIncoming.accumulate( 0, 0.5 );

			assert.deepEqual( readRegion( lighterIncoming, 1 ), [ true ], 'a lighter weight (mix < 0.5) keeps the accumulated value' );

		} );

		// accumulateAdditive
		QUnit.test( 'accumulateAdditive - adds weighted contributions to the additive region', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 1, 2, 3 ] ), 'vector', 3 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 10, 10, 10 ] );
			mixer.accumulateAdditive( 0.5 );

			assert.deepEqual( readRegion( mixer, 4 ), [ 5, 5, 5 ], 'the contribution is scaled by its weight' );
			assert.strictEqual( mixer.cumulativeWeightAdditive, 0.5, 'the additive weight is recorded' );

		} );

		QUnit.test( 'accumulateAdditive - accumulates rather than replaces', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 0, 0, 0 ] ), 'vector', 3 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 10, 10, 10 ] );
			mixer.accumulateAdditive( 0.5 );
			mixer.accumulateAdditive( 0.5 );

			assert.deepEqual( readRegion( mixer, 4 ), [ 10, 10, 10 ], 'the two contributions sum' );
			assert.strictEqual( mixer.cumulativeWeightAdditive, 1, 'the additive weights add up' );

		} );

		QUnit.test( 'accumulateAdditive - resets to the identity on the first contribution', ( assert ) => {

			// apply() zeroes cumulativeWeightAdditive, so the next accumulation
			// has to discard whatever the previous frame left in the region
			// instead of adding to it.
			const mixer = new PropertyMixer( new MockBinding( [ 0 ] ), 'number', 1 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 10 ] );
			mixer.accumulateAdditive( 1 );
			mixer.apply( 0 );

			writeIncoming( mixer, [ 10 ] );
			mixer.accumulateAdditive( 1 );

			assert.deepEqual( readRegion( mixer, 4 ), [ 10 ], 'the stale value from the previous frame is discarded' );

		} );

		// apply
		QUnit.test( 'apply - writes a fully weighted result straight to the binding', ( assert ) => {

			const binding = new MockBinding( [ 0, 0, 0 ] );
			const mixer = new PropertyMixer( binding, 'vector', 3 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 10, 20, 30 ] );
			mixer.accumulate( 0, 1 );
			mixer.apply( 0 );

			assert.deepEqual( binding.values, [ 10, 20, 30 ], 'a weight of 1 leaves the original out of the blend' );

		} );

		QUnit.test( 'apply - blends the remaining weight against the original value', ( assert ) => {

			const binding = new MockBinding( [ 0, 0, 0 ] );
			const mixer = new PropertyMixer( binding, 'vector', 3 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 10, 20, 30 ] );
			mixer.accumulate( 0, 0.25 );
			mixer.apply( 0 );

			// 25% of the animated value, 75% of the original (0, 0, 0).
			assert.deepEqual( binding.values, [ 2.5, 5, 7.5 ], 'the unfilled weight is taken from the original' );

		} );

		QUnit.test( 'apply - folds the additive region into the result', ( assert ) => {

			const binding = new MockBinding( [ 0, 0, 0 ] );
			const mixer = new PropertyMixer( binding, 'vector', 3 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 10, 10, 10 ] );
			mixer.accumulate( 0, 1 );

			writeIncoming( mixer, [ 10, 10, 10 ] );
			mixer.accumulateAdditive( 0.5 );

			mixer.apply( 0 );

			assert.deepEqual( binding.values, [ 15, 15, 15 ], 'the additive contribution is added on top' );

		} );

		QUnit.test( 'apply - resets both weights', ( assert ) => {

			const mixer = new PropertyMixer( new MockBinding( [ 0 ] ), 'number', 1 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 1 ] );
			mixer.accumulate( 0, 1 );
			mixer.accumulateAdditive( 1 );

			mixer.apply( 0 );

			assert.strictEqual( mixer.cumulativeWeight, 0, 'cumulativeWeight is cleared for the next frame' );
			assert.strictEqual( mixer.cumulativeWeightAdditive, 0, 'cumulativeWeightAdditive is cleared for the next frame' );

		} );

		QUnit.test( 'apply - leaves the binding alone when nothing changed', ( assert ) => {

			// Both accus start at the original value, so applying the original
			// back must not touch the scene graph.
			const binding = new MockBinding( [ 5, 5, 5 ] );
			const mixer = new PropertyMixer( binding, 'vector', 3 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 5, 5, 5 ] );
			mixer.accumulate( 0, 1 );
			mixer.apply( 0 );

			assert.strictEqual( binding.setValueCalls, 0, 'setValue is not called when the accus agree' );

		} );

		QUnit.test( 'apply - writes to the binding when the accus disagree', ( assert ) => {

			const binding = new MockBinding( [ 5, 5, 5 ] );
			const mixer = new PropertyMixer( binding, 'vector', 3 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 6, 5, 5 ] );
			mixer.accumulate( 0, 1 );
			mixer.apply( 0 );

			assert.strictEqual( binding.setValueCalls, 1, 'a single differing component is enough to trigger a write' );
			assert.deepEqual( binding.values, [ 6, 5, 5 ], 'the new value reaches the binding' );

		} );

		QUnit.test( 'apply - reads from the accu region it was given', ( assert ) => {

			const binding = new MockBinding( [ 0 ] );
			const mixer = new PropertyMixer( binding, 'number', 1 );
			mixer.saveOriginalState();

			writeIncoming( mixer, [ 42 ] );
			mixer.accumulate( 1, 1 );
			mixer.apply( 1 );

			assert.deepEqual( binding.values, [ 42 ], 'accumulating and applying accu1 works the same as accu0' );

		} );

	} );

} );
