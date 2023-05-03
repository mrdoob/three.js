/* global QUnit */

import { Layers } from '../../../../src/core/Layers.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Layers', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Layers();
			assert.ok( object, 'Can instantiate a Layers.' );

		} );

		// PROPERTIES
		QUnit.todo( 'mask', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'set', ( assert ) => {

			const a = new Layers();

			for ( let i = 0; i < 31; i ++ ) {

				a.set( i );
				assert.strictEqual( a.mask, Math.pow( 2, i ), 'Mask has the expected value for channel: ' + i );

			}

		} );

		QUnit.test( 'enable', ( assert ) => {

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

		QUnit.todo( 'enableAll', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'toggle', ( assert ) => {

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

		QUnit.test( 'disable', ( assert ) => {

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

		QUnit.todo( 'disableAll', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'test', ( assert ) => {

			const a = new Layers();
			const b = new Layers();

			assert.ok( a.test( b ), 'Start out true' );

			a.set( 1 );
			assert.notOk( a.test( b ), 'Set channel 1 in a and fail the QUnit.test' );

			b.toggle( 1 );
			assert.ok( a.test( b ), 'Toggle channel 1 in b and pass again' );

		} );

		QUnit.test( 'isEnabled', ( assert ) => {

			const a = new Layers();

			a.enable( 1 );
			assert.ok( a.isEnabled( 1 ), 'Enable channel 1 and pass the QUnit.test' );

			a.enable( 2 );
			assert.ok( a.isEnabled( 2 ), 'Enable channel 2 and pass the QUnit.test' );

			a.toggle( 1 );
			assert.notOk( a.isEnabled( 1 ), 'Toggle channel 1 and fail the QUnit.test' );
			assert.ok( a.isEnabled( 2 ), 'Channel 2 still enabled and pass the QUnit.test' );

		} );

	} );

} );
