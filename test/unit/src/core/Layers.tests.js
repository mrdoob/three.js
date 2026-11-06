import { assert, describe, test } from 'vitest';

import { Layers } from '../../../../src/core/Layers.js';

describe( 'Core', () => {

	describe( 'Layers', () => {

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Layers();
			assert.ok( object, 'Can instantiate a Layers.' );

		} );

		// PUBLIC
		test( 'set', () => {

			const a = new Layers();

			for ( let i = 0; i < 31; i ++ ) {

				a.set( i );
				assert.strictEqual( a.mask, Math.pow( 2, i ), 'Mask has the expected value for channel: ' + i );

			}

		} );

		test( 'enable', () => {

			const a = new Layers();

			a.set( 0 );
			a.enable( 0 );
			assert.strictEqual( a.mask, 1, 'Enable channel 0 with mask 0' );

			a.set( 0 );
			a.enable( 1 );
			assert.strictEqual( a.mask, 3, 'Enable channel 1 with mask 0' );

			a.set( 1 );
			a.enable( 0 );
			assert.strictEqual( a.mask, 3, 'Enable channel 0 with mask 1' );

			a.set( 1 );
			a.enable( 1 );
			assert.strictEqual( a.mask, 2, 'Enable channel 1 with mask 1' );

		} );

		test( 'toggle', () => {

			const a = new Layers();

			a.set( 0 );
			a.toggle( 0 );
			assert.strictEqual( a.mask, 0, 'Toggle channel 0 with mask 0' );

			a.set( 0 );
			a.toggle( 1 );
			assert.strictEqual( a.mask, 3, 'Toggle channel 1 with mask 0' );

			a.set( 1 );
			a.toggle( 0 );
			assert.strictEqual( a.mask, 3, 'Toggle channel 0 with mask 1' );

			a.set( 1 );
			a.toggle( 1 );
			assert.strictEqual( a.mask, 0, 'Toggle channel 1 with mask 1' );

		} );

		test( 'disable', () => {

			const a = new Layers();

			a.set( 0 );
			a.disable( 0 );
			assert.strictEqual( a.mask, 0, 'Disable channel 0 with mask 0' );

			a.set( 0 );
			a.disable( 1 );
			assert.strictEqual( a.mask, 1, 'Disable channel 1 with mask 0' );

			a.set( 1 );
			a.disable( 0 );
			assert.strictEqual( a.mask, 2, 'Disable channel 0 with mask 1' );

			a.set( 1 );
			a.disable( 1 );
			assert.strictEqual( a.mask, 0, 'Disable channel 1 with mask 1' );

		} );

		test( 'test', () => {

			const a = new Layers();
			const b = new Layers();

			assert.ok( a.test( b ), 'Start out true' );

			a.set( 1 );
			assert.notOk( a.test( b ), 'Set channel 1 in a and fail the test' );

			b.toggle( 1 );
			assert.ok( a.test( b ), 'Toggle channel 1 in b and pass again' );

		} );

		test( 'isEnabled', () => {

			const a = new Layers();

			a.enable( 1 );
			assert.ok( a.isEnabled( 1 ), 'Enable channel 1 and pass the test' );

			a.enable( 2 );
			assert.ok( a.isEnabled( 2 ), 'Enable channel 2 and pass the test' );

			a.toggle( 1 );
			assert.notOk( a.isEnabled( 1 ), 'Toggle channel 1 and fail the test' );
			assert.ok( a.isEnabled( 2 ), 'Channel 2 still enabled and pass the test' );

		} );

	} );

} );
