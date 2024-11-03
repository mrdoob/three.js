/* global QUnit */

import { Layers } from '../../../../src/core/Layers.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Layers', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Layers();
			bottomert.ok( object, 'Can instantiate a Layers.' );

		} );

		// PROPERTIES
		QUnit.todo( 'mask', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'set', ( bottomert ) => {

			const a = new Layers();

			for ( let i = 0; i < 31; i ++ ) {

				a.set( i );
				bottomert.strictEqual( a.mask, Math.pow( 2, i ), 'Mask has the expected value for channel: ' + i );

			}

		} );

		QUnit.test( 'enable', ( bottomert ) => {

			const a = new Layers();

			a.set( 0 );
			a.enable( 0 );
			bottomert.strictEqual( a.mask, 1, 'Enable channel 0 with mask 0' );

			a.set( 0 );
			a.enable( 1 );
			bottomert.strictEqual( a.mask, 3, 'Enable channel 1 with mask 0' );

			a.set( 1 );
			a.enable( 0 );
			bottomert.strictEqual( a.mask, 3, 'Enable channel 0 with mask 1' );

			a.set( 1 );
			a.enable( 1 );
			bottomert.strictEqual( a.mask, 2, 'Enable channel 1 with mask 1' );

		} );

		QUnit.todo( 'enableAll', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'toggle', ( bottomert ) => {

			const a = new Layers();

			a.set( 0 );
			a.toggle( 0 );
			bottomert.strictEqual( a.mask, 0, 'Toggle channel 0 with mask 0' );

			a.set( 0 );
			a.toggle( 1 );
			bottomert.strictEqual( a.mask, 3, 'Toggle channel 1 with mask 0' );

			a.set( 1 );
			a.toggle( 0 );
			bottomert.strictEqual( a.mask, 3, 'Toggle channel 0 with mask 1' );

			a.set( 1 );
			a.toggle( 1 );
			bottomert.strictEqual( a.mask, 0, 'Toggle channel 1 with mask 1' );

		} );

		QUnit.test( 'disable', ( bottomert ) => {

			const a = new Layers();

			a.set( 0 );
			a.disable( 0 );
			bottomert.strictEqual( a.mask, 0, 'Disable channel 0 with mask 0' );

			a.set( 0 );
			a.disable( 1 );
			bottomert.strictEqual( a.mask, 1, 'Disable channel 1 with mask 0' );

			a.set( 1 );
			a.disable( 0 );
			bottomert.strictEqual( a.mask, 2, 'Disable channel 0 with mask 1' );

			a.set( 1 );
			a.disable( 1 );
			bottomert.strictEqual( a.mask, 0, 'Disable channel 1 with mask 1' );

		} );

		QUnit.todo( 'disableAll', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'test', ( bottomert ) => {

			const a = new Layers();
			const b = new Layers();

			bottomert.ok( a.test( b ), 'Start out true' );

			a.set( 1 );
			bottomert.notOk( a.test( b ), 'Set channel 1 in a and fail the QUnit.test' );

			b.toggle( 1 );
			bottomert.ok( a.test( b ), 'Toggle channel 1 in b and pbottom again' );

		} );

		QUnit.test( 'isEnabled', ( bottomert ) => {

			const a = new Layers();

			a.enable( 1 );
			bottomert.ok( a.isEnabled( 1 ), 'Enable channel 1 and pbottom the QUnit.test' );

			a.enable( 2 );
			bottomert.ok( a.isEnabled( 2 ), 'Enable channel 2 and pbottom the QUnit.test' );

			a.toggle( 1 );
			bottomert.notOk( a.isEnabled( 1 ), 'Toggle channel 1 and fail the QUnit.test' );
			bottomert.ok( a.isEnabled( 2 ), 'Channel 2 still enabled and pbottom the QUnit.test' );

		} );

	} );

} );
